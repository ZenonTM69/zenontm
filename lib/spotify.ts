// ============================================================
//  Spotify connection (SERVER ONLY – never imported by browser code).
//  Uses Spotify's official Web API with the Authorization Code flow.
//
//  Secret settings it needs (set in Vercel → Settings → Environment Variables):
//    SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN
//  See README for how to get them.
//
//  Scopes requested (read-only, nothing can be changed on your account):
//    user-read-currently-playing, user-read-recently-played, user-top-read
// ============================================================

import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const API = "https://api.spotify.com/v1";

export const SPOTIFY_SCOPES = [
  "user-read-currently-playing",
  "user-read-recently-played",
  "user-top-read",
];

export type SpotifyState = "ok" | "not_connected" | "reconnect" | "busy" | "error";

export class SpotifyError extends Error {
  // until = when Spotify says we may ask again (only for "busy")
  constructor(public state: Exclude<SpotifyState, "ok">, public until?: number) {
    super(state);
  }
}

export type SpotifyTrack = {
  id: string;
  title: string;
  artists: string;
  album: string;
  image: string | null; // large cover (~640px)
  thumb: string | null; // small cover (~64–300px)
  url: string | null; // opens the song in Spotify
  durationMs: number;
};

export type SpotifyArtist = {
  id: string;
  name: string;
  image: string | null;
  url: string | null;
  genres: string[];
};

export type TimeRange = "short_term" | "medium_term" | "long_term";
export const TIME_RANGES: TimeRange[] = ["short_term", "medium_term", "long_term"];

// ---------- credentials ----------

function creds() {
  return {
    id: process.env.SPOTIFY_CLIENT_ID ?? "",
    secret: process.env.SPOTIFY_CLIENT_SECRET ?? "",
    refresh: process.env.SPOTIFY_REFRESH_TOKEN ?? "",
  };
}

export function basicAuthHeader() {
  const { id, secret } = creds();
  return "Basic " + Buffer.from(`${id}:${secret}`).toString("base64");
}

export function appConfigured() {
  const { id, secret } = creds();
  return Boolean(id && secret);
}

export function spotifyConfigured() {
  const { id, secret, refresh } = creds();
  return Boolean(id && secret && refresh);
}

// The address Spotify sends you back to after you approve access.
// Must match EXACTLY what is saved in your Spotify app's "Redirect URIs".
// Uses the address the visitor actually typed (the Host header), because the
// server's own idea of its name can differ (e.g. "localhost" vs "127.0.0.1").
export function redirectUri(request: Request) {
  if (process.env.SPOTIFY_REDIRECT_URI) return process.env.SPOTIFY_REDIRECT_URI;
  const url = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? url.host;
  const proto = request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  return `${proto}://${host}/api/spotify/callback`;
}

// ---------- access token (1 hour, kept in memory) ----------

let cached: { token: string; expiresAt: number } | null = null;

async function accessToken(): Promise<string> {
  if (!spotifyConfigured()) throw new SpotifyError("not_connected");
  if (cached && Date.now() < cached.expiresAt - 60_000) return cached.token;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: creds().refresh }),
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as {
    access_token?: string;
    expires_in?: number;
    refresh_token?: string;
    error?: string;
  };

  if (!res.ok || !data.access_token) {
    // invalid_grant = the saved refresh token expired (6 months) or was revoked.
    if (data.error === "invalid_grant") {
      console.warn("Spotify: refresh token expired or revoked. Reconnect at /api/spotify/login.");
      throw new SpotifyError("reconnect");
    }
    console.warn(`Spotify token request failed (HTTP ${res.status}).`);
    throw new SpotifyError("error");
  }

  if (data.refresh_token && data.refresh_token !== creds().refresh) {
    console.warn("Spotify returned a NEW refresh token. If the music section stops working, reconnect at /api/spotify/login.");
  }

  cached = { token: data.access_token, expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000 };
  return cached.token;
}

// If Spotify says "too many requests" (HTTP 429) it also says how long to wait.
// We obey that and don't ask again until the wait is over – asking anyway makes the wait longer.
// The wait is also saved to a small temporary file, so a restart of the site doesn't forget it
// and accidentally ask again (which could make Spotify's wait even longer).
const BLOCK_FILE = join(tmpdir(), "zenontm-spotify-wait.json");
const blockedUntil = new Map<string, number>();
try {
  const saved = JSON.parse(readFileSync(BLOCK_FILE, "utf8")) as Record<string, number>;
  for (const [k, v] of Object.entries(saved)) if (v > Date.now()) blockedUntil.set(k, v);
} catch {}
function saveBlocks() {
  try {
    writeFileSync(BLOCK_FILE, JSON.stringify(Object.fromEntries(blockedUntil)));
  } catch {}
}

// Spotify's limit is for the whole app (all endpoints together, and the live site and a
// local test copy share it), so one "slow down" pauses EVERY request, not just that one.
const ALL = "*";

async function spotifyGet<T>(path: string, retry = true): Promise<T | null> {
  const endpoint = path.split("?")[0];
  const until = Math.max(blockedUntil.get(ALL) ?? 0, blockedUntil.get(endpoint) ?? 0);
  if (until > Date.now()) throw new SpotifyError("busy", until);
  const token = await accessToken();
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (res.status === 204) return null; // e.g. nothing playing
  if (res.status === 401 && retry) {
    cached = null;
    return spotifyGet<T>(path, false);
  }
  if (res.status === 429) {
    const wait = Number(res.headers.get("retry-after")) || 60;
    const until = Date.now() + wait * 1000;
    blockedUntil.set(ALL, until);
    saveBlocks();
    console.warn(`Spotify asked us to slow down on ${endpoint} for ${Math.round(wait / 60)} min.`);
    throw new SpotifyError("busy", until);
  }
  if (!res.ok) {
    console.warn(`Spotify request ${endpoint} failed (HTTP ${res.status}).`);
    throw new SpotifyError("error");
  }
  return (await res.json()) as T;
}

// ---------- shaping Spotify's data into what the site needs ----------

type RawImage = { url: string; width?: number | null };
type RawTrack = {
  id: string;
  name: string;
  duration_ms: number;
  artists?: { name: string }[];
  album?: { name: string; images?: RawImage[] };
  external_urls?: { spotify?: string };
};
type RawArtist = {
  id: string;
  name: string;
  images?: RawImage[];
  genres?: string[];
  external_urls?: { spotify?: string };
};

function pickImages(images?: RawImage[]) {
  if (!images?.length) return { large: null, small: null };
  const sorted = [...images].sort((a, b) => (b.width ?? 0) - (a.width ?? 0));
  const small = [...sorted].reverse().find((i) => (i.width ?? 0) >= 120) ?? sorted[sorted.length - 1];
  return { large: sorted[0].url, small: small.url };
}

function toTrack(t: RawTrack): SpotifyTrack {
  const img = pickImages(t.album?.images);
  return {
    id: t.id,
    title: t.name,
    artists: (t.artists ?? []).map((a) => a.name).join(", "),
    album: t.album?.name ?? "",
    image: img.large,
    thumb: img.small,
    url: t.external_urls?.spotify ?? null,
    durationMs: t.duration_ms,
  };
}

function toArtist(a: RawArtist): SpotifyArtist {
  const img = pickImages(a.images);
  return {
    id: a.id,
    name: a.name,
    image: img.small ?? img.large,
    url: a.external_urls?.spotify ?? null,
    genres: a.genres ?? [],
  };
}

// ---------- the three things the site reads ----------

export type NowPlaying =
  | { playing: false }
  | { playing: true; isPlaying: boolean; progressMs: number; track: SpotifyTrack };

// While testing on your own computer, remember answers longer: the local copy uses the same
// Spotify quota as the live site, and a dev server reloads a lot.
const DEV = process.env.NODE_ENV !== "production";

export async function getNowPlaying(): Promise<NowPlaying> {
  // one answer per 10 s per server (30 s locally), however many visitors are asking
  return remember("now", DEV ? 30_000 : 10_000, loadNowPlaying);
}
async function loadNowPlaying(): Promise<NowPlaying> {
  const data = await spotifyGet<{
    is_playing: boolean;
    progress_ms: number | null;
    currently_playing_type?: string;
    item: RawTrack | null;
  }>("/me/player/currently-playing");
  // Only songs are shown (podcasts/ads come back without a track).
  if (!data || !data.item || data.currently_playing_type !== "track") return { playing: false };
  return {
    playing: true,
    isPlaying: data.is_playing,
    progressMs: data.progress_ms ?? 0,
    track: toTrack(data.item),
  };
}

// Keeps answers that change slowly in memory, so repeat visits don't ask Spotify again.
// If Spotify is unavailable, the last real answer is shown instead of nothing.
const memo = new Map<string, { at: number; value: unknown }>();
async function remember<T>(key: string, maxAgeMs: number, load: () => Promise<T>): Promise<T> {
  const hit = memo.get(key);
  if (hit && Date.now() - hit.at < maxAgeMs) return hit.value as T;
  try {
    const value = await load();
    memo.set(key, { at: Date.now(), value });
    return value;
  } catch (err) {
    if (hit) return hit.value as T;
    throw err;
  }
}

export async function getRecentlyPlayed(limit = 20) {
  return remember(`recent:${limit}`, DEV ? 300_000 : 60_000, () => loadRecentlyPlayed(limit));
}
async function loadRecentlyPlayed(limit: number) {
  const data = await spotifyGet<{ items: { track: RawTrack; played_at: string }[] }>(
    `/me/player/recently-played?limit=${Math.min(Math.max(limit, 1), 50)}`
  );
  return (data?.items ?? []).map((i) => ({ track: toTrack(i.track), playedAt: i.played_at }));
}

const HOUR = 3_600_000;
export async function getTopTracks(range: TimeRange, limit = 10) {
  return remember(`tracks:${range}:${limit}`, HOUR, () => loadTopTracks(range, limit));
}
async function loadTopTracks(range: TimeRange, limit: number) {
  const data = await spotifyGet<{ items: RawTrack[] }>(`/me/top/tracks?time_range=${range}&limit=${limit}`);
  return (data?.items ?? []).map(toTrack);
}

export async function getTopArtists(range: TimeRange, limit = 10) {
  return remember(`artists:${range}:${limit}`, HOUR, () => loadTopArtists(range, limit));
}
async function loadTopArtists(range: TimeRange, limit: number) {
  const data = await spotifyGet<{ items: RawArtist[] }>(`/me/top/artists?time_range=${range}&limit=${limit}`);
  return (data?.items ?? []).map(toArtist);
}

export function stateOf(err: unknown): Exclude<SpotifyState, "ok"> {
  return err instanceof SpotifyError ? err.state : "error";
}

/** Extra info for an error reply: when Spotify said we can try again (ISO time), if known. */
export function errorInfo(err: unknown) {
  const state = stateOf(err);
  const until = err instanceof SpotifyError ? err.until : undefined;
  return until ? { state, retryAt: new Date(until).toISOString() } : { state };
}
/** How long Vercel may cache an error reply: until Spotify's wait ends (max 1 hour), else 30 s. */
export function errorCacheSeconds(err: unknown) {
  const until = err instanceof SpotifyError ? err.until : undefined;
  return until ? Math.max(30, Math.min(3600, Math.round((until - Date.now()) / 1000))) : 30;
}
