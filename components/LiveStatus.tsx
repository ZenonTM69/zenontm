"use client";
import { useEffect, useState } from "react";
import type { SpotifyTrack } from "@/lib/spotify";
import { Equalizer } from "./SpotifyCard";

// One honest line under the title: what's actually playing on Spotify right now.
// When nothing is playing it says when Zenon was last listening, and to what ("last seen").
// Shows nothing at all if Spotify isn't connected.
type Res = { state: string; playing?: boolean; isPlaying?: boolean; track?: SpotifyTrack };
type Last = { track: SpotifyTrack; playedAt: string };

function ago(iso: string) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 90) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr${h === 1 ? "" : "s"} ago`;
  const d = Math.round(h / 24);
  return d === 1 ? "yesterday" : `${d} days ago`;
}

export default function LiveStatus() {
  const [now, setNow] = useState<Res | null>(null);
  const [last, setLast] = useState<Last | null>(null);
  const [, tick] = useState(0);

  useEffect(() => {
    const load = () =>
      fetch("/api/spotify/now-playing")
        .then((r) => r.json() as Promise<Res>)
        .then((d) => {
          setNow(d);
          // share the song with the stickers so they don't ask Spotify again
          window.dispatchEvent(new CustomEvent("zt-nowplaying", { detail: d }));
          // nothing playing? find out what the last song was
          if (d.state === "ok" && !d.playing) {
            fetch("/api/spotify/recent")
              .then((r) => r.json() as Promise<{ state: string; items?: Last[] }>)
              .then((rec) => setLast(rec.state === "ok" && rec.items?.[0] ? rec.items[0] : null))
              .catch(() => {});
          }
          tick((n) => n + 1); // refresh the "12 min ago" text
        })
        .catch(() => setNow(null));
    load();
    const id = setInterval(() => !document.hidden && load(), 30_000);
    return () => clearInterval(id);
  }, []);

  if (!now || now.state !== "ok") return null;

  if (now.playing && now.track) {
    return (
      <a href="#music" className="live-status">
        <Equalizer playing={Boolean(now.isPlaying)} />
        <span className="ls-label">{now.isPlaying ? "Listening to" : "Paused on"}</span>
        <strong>{now.track.title}</strong>
        <span className="ls-artist">{now.track.artists}</span>
      </a>
    );
  }
  if (last) {
    return (
      <a href="#music" className="live-status live-status-off" title={new Date(last.playedAt).toLocaleString()}>
        <span className="ls-dot" />
        <span className="ls-label">Last seen {ago(last.playedAt)} ·</span>
        <strong>{last.track.title}</strong>
        <span className="ls-artist">{last.track.artists}</span>
      </a>
    );
  }
  return (
    <a href="#music" className="live-status live-status-off">
      <span className="ls-dot" /> Not listening right now
    </a>
  );
}
