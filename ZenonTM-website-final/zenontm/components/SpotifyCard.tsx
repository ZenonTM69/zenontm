"use client";
import { useEffect, useState } from "react";
import { demoQueue, recentlyPlayed, type Track } from "@/lib/site";
import Icon from "./Icons";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const artBg = (hue: number) =>
  `linear-gradient(135deg, hsl(${hue} 85% 60%), hsl(${hue + 55} 90% 42%))`;

// Placeholder album art built from colour. Real covers arrive with Spotify later.
export function Art({ track, size, className = "" }: { track: Track; size: number; className?: string }) {
  return (
    <div className={`art ${className}`} style={{ width: size, height: size, background: artBg(track.hue) }}>
      <svg viewBox="0 0 24 24" width={size * 0.32} height={size * 0.32} aria-hidden="true">
        <path fill="rgba(255,255,255,.85)" d="M9 18V6l11-2v12M9 18a3 3 0 1 1-3-3 3 3 0 0 1 3 3zm11-2a3 3 0 1 1-3-3 3 3 0 0 1 3 3z" />
      </svg>
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

/**
 * DEMO music player. Play/pause and skip work, using the fake tracks in lib/site.ts.
 * FUTURE STEP: fetch real "now playing" + "recently played" from the Spotify API
 * through a server route, so no secret keys ever reach the browser.
 */
export default function SpotifyCard() {
  const [index, setIndex] = useState(0);
  const [elapsed, setElapsed] = useState(62);
  const [playing, setPlaying] = useState(true);
  const track = demoQueue[index];

  const go = (dir: 1 | -1) => {
    setIndex((i) => (i + dir + demoQueue.length) % demoQueue.length);
    setElapsed(0);
  };

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setElapsed((e) => {
        if (e + 1 >= track.durationSec) {
          setIndex((i) => (i + 1) % demoQueue.length);
          return 0;
        }
        return e + 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [playing, track.durationSec]);

  const pct = (elapsed / track.durationSec) * 100;

  return (
    <div className="spotify-grid">
      <article className="glass spot player" style={{ ["--hue" as string]: track.hue }}>
        <div className="player-backdrop" style={{ background: artBg(track.hue) }} />
        <div className="player-head">
          <span className="live">
            <Icon name="spotify" size={18} />
            {playing ? "Now playing" : "Paused"}
            <Equalizer playing={playing} />
          </span>
          <span className="chip">Demo</span>
        </div>

        <div className="player-body">
          <div className={`vinyl-wrap ${playing ? "is-playing" : ""}`}>
            <div className="vinyl" style={{ ["--label" as string]: artBg(track.hue) }} />
            <Art track={track} size={200} className="cover" key={track.title} />
          </div>

          <div className="player-info">
            <p className="player-album">{track.album}</p>
            <h3 className="player-title" key={track.title}>
              {track.title}
            </h3>
            <p className="player-artist">{track.artist}</p>

            <div
              className="progress"
              role="progressbar"
              aria-label="Song progress"
              aria-valuenow={Math.round(pct)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="times">
              <span>{fmt(elapsed)}</span>
              <span>{fmt(track.durationSec)}</span>
            </div>

            <div className="controls">
              <button className="ctrl" onClick={() => go(-1)} aria-label="Previous track">
                <Icon name="prev" size={20} />
              </button>
              <button className="ctrl ctrl-main" onClick={() => setPlaying(!playing)} aria-label={playing ? "Pause" : "Play"}>
                <Icon name={playing ? "pause" : "play"} size={24} />
              </button>
              <button className="ctrl" onClick={() => go(1)} aria-label="Next track">
                <Icon name="next" size={20} />
              </button>
            </div>
          </div>
        </div>
      </article>

      <article className="glass spot recent">
        <div className="card-head">
          <h3>Recently played</h3>
          <span className="chip">Demo</span>
        </div>
        <ul>
          {recentlyPlayed.map((t) => (
            <li key={t.title + t.playedAgo} className="recent-item">
              <Art track={t} size={48} />
              <div className="recent-text">
                <strong>{t.title}</strong>
                <span>{t.artist}</span>
              </div>
              <span className="recent-time">{t.playedAgo}</span>
            </li>
          ))}
        </ul>
        <p className="recent-note">Connect Spotify later to show your real listening.</p>
      </article>
    </div>
  );
}
