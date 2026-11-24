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

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const API = "https://api.spotify.com/v1";

export const SPOTIFY_SCOPES = [
  "user-read-currently-playing",
  "user-read-recently-played",
  "user-top-read",
];

export type SpotifyState = "ok" | "not_connected" | "reconnect" | "error";

export class SpotifyError extends Error {
  constructor(public state: Exclude<SpotifyState, "ok">) {
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

async function spotifyGet<T>(path: string, retry = true): Promise<T | null> {
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
  if (!res.ok) {
    console.warn(`Spotify request ${path.split("?")[0]} failed (HTTP ${res.status}).`);
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

export async function getNowPlaying(): Promise<NowPlaying> {
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

export async function getRecentlyPlayed(limit = 20) {
  const data = await spotifyGet<{ items: { track: RawTrack; played_at: string }[] }>(
    `/me/player/recently-played?limit=${Math.min(Math.max(limit, 1), 50)}`
  );
  return (data?.items ?? []).map((i) => ({ track: toTrack(i.track), playedAt: i.played_at }));
}

export async function getTopTracks(range: TimeRange, limit = 10) {
  const data = await spotifyGet<{ items: RawTrack[] }>(`/me/top/tracks?time_range=${range}&limit=${limit}`);
  return (data?.items ?? []).map(toTrack);
}

export async function getTopArtists(range: TimeRange, limit = 10) {
  const data = await spotifyGet<{ items: RawArtist[] }>(`/me/top/artists?time_range=${range}&limit=${limit}`);
  return (data?.items ?? []).map(toArtist);
}

export function stateOf(err: unknown): Exclude<SpotifyState, "ok"> {
  return err instanceof SpotifyError ? err.state : "error";
}
