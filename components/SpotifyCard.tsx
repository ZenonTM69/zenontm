"use client";
import { useCallback, useEffect, useState } from "react";
import type { SpotifyTrack } from "@/lib/spotify";
import Icon from "./Icons";
import DitherCover from "./DitherCover";
import ScratchVinyl from "./ScratchVinyl";

// Live "Now playing" + "Recently played", using REAL data from your Spotify
// (through this site's own /api/spotify/... routes, so no secrets reach the browser).
// When Spotify isn't connected it says so – it never shows made-up songs.

type NowPlayingRes = {
  state: "ok" | "not_connected" | "reconnect" | "busy" | "error";
  playing?: boolean;
  isPlaying?: boolean;
  progressMs?: number;
  track?: SpotifyTrack;
  retryAt?: string;
};
type RecentItem = { track: SpotifyTrack; playedAt: string };
type RecentRes = { state: NowPlayingRes["state"]; items: RecentItem[]; retryAt?: string };

// "around 22:55" in the visitor's own time
export function backAround(retryAt?: string) {
  if (!retryAt) return "";
  const d = new Date(retryAt);
  if (isNaN(d.getTime()) || d.getTime() < Date.now()) return "";
  return ` It'll be back around ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`;
}

const fmt = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export function timeAgo(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} hr ago`;
  const d = Math.floor(s / 86400);
  return d === 1 ? "yesterday" : `${d} days ago`;
}

export function Cover({ src, size, alt, className = "" }: { src: string | null; size: number; alt: string; className?: string }) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} width={size} height={size} className={`art art-img ${className}`} style={{ width: size, height: size }} loading="lazy" />
  ) : (
    <div className={`art art-empty ${className}`} style={{ width: size, height: size }} aria-label={alt} role="img">
      <Icon name="spotify" size={Math.round(size * 0.35)} />
    </div>
  );
}

export function Equalizer({ playing }: { playing: boolean }) {
  return (
    <span className={`eq ${playing ? "eq-on" : ""}`} aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}

export function Offline({ state, retryAt }: { state: NowPlayingRes["state"]; retryAt?: string }) {
  return (
    <div className="glass spot offline">
      <span className="offline-icon">
        <Icon name="spotify" size={30} />
      </span>
      <div>
        <h3>{state === "not_connected" ? "Spotify isn't connected yet" : "Live Spotify data is unavailable right now"}</h3>
        <p>
          {state === "not_connected"
            ? "Real listening activity will appear here once it's set up."
            : state === "busy"
            ? "Spotify has asked the site to wait a bit before checking again." + (backAround(retryAt) || " It'll be back on its own.")
            : "Please check back a little later."}
        </p>
      </div>
    </div>
  );
}

export default function SpotifyCard() {
  const [now, setNow] = useState<NowPlayingRes | null>(null);
  const [recent, setRecent] = useState<RecentRes | null>(null);
  const [progress, setProgress] = useState(0);

  const loadNow = useCallback(async () => {
    try {
      const d = (await (await fetch("/api/spotify/now-playing")).json()) as NowPlayingRes;
      setNow(d);
      setProgress(d.progressMs ?? 0);
    } catch {
      setNow({ state: "error" });
    }
  }, []);

  const loadRecent = useCallback(async () => {
    try {
      setRecent((await (await fetch("/api/spotify/recent")).json()) as RecentRes);
    } catch {
      setRecent({ state: "error", items: [] });
    }
  }, []);

  // Check Spotify every 15 s (recent list every 60 s), only while the tab is visible.
  useEffect(() => {
    loadNow();
    loadRecent();
    const a = setInterval(() => !document.hidden && loadNow(), 15_000);
    const b = setInterval(() => !document.hidden && loadRecent(), 60_000);
    const onVisible = () => !document.hidden && (loadNow(), loadRecent());
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(a);
      clearInterval(b);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [loadNow, loadRecent]);

  // Move the progress bar smoothly between checks.
  const duration = now?.track?.durationMs ?? 0;
  const ticking = Boolean(now?.playing && now.isPlaying);
  useEffect(() => {
    if (!ticking) return;
    const id = setInterval(() => {
      setProgress((p) => {
        if (p + 1000 >= duration) {
          loadNow(); // song probably ended – ask what's next
          return duration;
        }
        return p + 1000;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [ticking, duration, loadNow]);

  if (!now) return <div className="spotify-grid"><div className="glass skeleton player-skel" /><div className="glass skeleton recent-skel" /></div>;
  if (now.state !== "ok") return <Offline state={now.state} retryAt={now.retryAt} />;

  const track = now.playing ? now.track! : recent?.items[0]?.track;
  const isLive = Boolean(now.playing);
  const pct = duration ? Math.min(100, (progress / duration) * 100) : 0;

  return (
    <div className="spotify-grid">
      <article className="glass spot player">
        {track?.image && <div className="player-backdrop" style={{ backgroundImage: `url(${track.image})` }} />}
        <div className="player-head">
          <span className={`live ${isLive ? "" : "live-off"}`}>
            <Icon name="spotify" size={18} />
            {isLive ? (now.isPlaying ? "Now playing" : "Paused") : "Not listening right now"}
            {isLive && <Equalizer playing={Boolean(now.isPlaying)} />}
          </span>
          {!isLive && recent?.items[0] && <span className="chip">Last played {timeAgo(recent.items[0].playedAt)}</span>}
        </div>

        {track ? (
          <div className="player-body">
            <div className={`vinyl-wrap ${ticking ? "is-playing" : ""}`}>
              <ScratchVinyl label={track.image ? `center / cover url(${track.image})` : "var(--grad)"} />
              {track.image ? (
                <DitherCover src={track.image} size={200} alt={`${track.album} cover`} playing={Boolean(isLive && now.isPlaying)} className="cover" key={track.id} />
              ) : (
                <Cover src={null} size={200} alt={`${track.album} cover`} className="cover" />
              )}
            </div>

            <div className="player-info">
              <p className="player-album">{track.album}</p>
              <h3 className="player-title" key={track.id}>
                {track.title}
              </h3>
              <p className="player-artist">{track.artists}</p>

              {isLive && (
                <>
                  <div className="progress" role="progressbar" aria-label="Song progress" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="times">
                    <span>{fmt(progress)}</span>
                    <span>{fmt(duration)}</span>
                  </div>
                </>
              )}

              {track.url && (
                <a className="btn btn-spotify" href={track.url} target="_blank" rel="noopener noreferrer">
                  <Icon name="spotify" size={18} /> Open in Spotify
                </a>
              )}
            </div>
          </div>
        ) : (
          <p className="player-empty">{recent && recent.state !== "ok" ? "Nothing playing right now." : "Nothing played recently."}</p>
        )}
      </article>

      <article className="glass spot recent">
        <div className="card-head">
          <h3>Recently played</h3>
          <span className="chip">Spotify</span>
        </div>
        {!recent ? (
          <div className="skeleton-lines">{Array.from({ length: 6 }, (_, i) => <span key={i} />)}</div>
        ) : recent.state !== "ok" ? (
          <p className="recent-note">
            {recent.state === "busy"
              ? "Spotify has paused this list for a while." + (backAround(recent.retryAt) || " It'll be back on its own.")
              : "Recent plays can't be loaded right now."}
          </p>
        ) : recent.items.length === 0 ? (
          <p className="recent-note">No recent plays to show.</p>
        ) : (
          <ul className="recent-list">
            {recent.items.slice(0, 12).map(({ track: t, playedAt }) => (
              <li key={playedAt}>
                <a className="recent-item" href={t.url ?? undefined} target="_blank" rel="noopener noreferrer">
                  <Cover src={t.thumb} size={48} alt={`${t.album} cover`} />
                  <div className="recent-text">
                    <strong>{t.title}</strong>
                    <span>{t.artists}</span>
                  </div>
                  <span className="recent-time">{timeAgo(playedAt)}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </article>
    </div>
  );
}
