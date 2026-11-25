"use client";
import { useEffect, useState } from "react";
import type { SpotifyTrack } from "@/lib/spotify";
import { Equalizer } from "./SpotifyCard";

// One honest line under the title: what's actually playing on Spotify right now.
// Shows nothing at all if Spotify isn't connected.
type Res = { state: string; playing?: boolean; isPlaying?: boolean; track?: SpotifyTrack };

export default function LiveStatus() {
  const [now, setNow] = useState<Res | null>(null);

  useEffect(() => {
    const load = () =>
      fetch("/api/spotify/now-playing")
        .then((r) => r.json() as Promise<Res>)
        .then(setNow)
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
  return (
    <a href="#music" className="live-status live-status-off">
      <span className="ls-dot" /> Not listening right now
    </a>
  );
}
