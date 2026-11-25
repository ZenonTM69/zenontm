"use client";
import { useEffect, useState } from "react";
import type { SpotifyArtist, SpotifyTrack, TimeRange } from "@/lib/spotify";
import { Cover, Offline } from "./SpotifyCard";

// Your real top tracks/artists from Spotify, with time-period tabs.
// Spotify only offers these three periods. "All time" will be added
// later if stats.fm can be connected.
const RANGES: { id: TimeRange; label: string }[] = [
  { id: "short_term", label: "4 weeks" },
  { id: "medium_term", label: "6 months" },
  { id: "long_term", label: "Last year" },
];
const KINDS = [
  { id: "tracks", label: "Tracks" },
  { id: "artists", label: "Artists" },
] as const;
type Kind = (typeof KINDS)[number]["id"];

type TopRes = {
  state: "ok" | "not_connected" | "reconnect" | "busy" | "error";
  retryAt?: string;
  items: (SpotifyTrack | SpotifyArtist)[];
};

function Tabs<T extends string>({ value, options, onChange, label }: { value: T; options: readonly { id: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  const i = options.findIndex((o) => o.id === value);
  return (
    <div className="tabs" role="tablist" aria-label={label} style={{ ["--n" as string]: options.length, ["--i" as string]: i }}>
      <span className="tabs-pill" aria-hidden="true" />
      {options.map((o) => (
        <button key={o.id} role="tab" aria-selected={o.id === value} className={o.id === value ? "on" : ""} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function TopCharts() {
  const [range, setRange] = useState<TimeRange>("short_term");
  const [kind, setKind] = useState<Kind>("tracks");
  const [cache, setCache] = useState<Record<string, TopRes>>({});
  const key = `${kind}:${range}`;
  const data = cache[key];

  useEffect(() => {
    if (cache[key]) return;
    let alive = true;
    fetch(`/api/spotify/top?type=${kind}&range=${range}`)
      .then((r) => r.json() as Promise<TopRes>)
      .catch((): TopRes => ({ state: "error", items: [] }))
      .then((d) => alive && setCache((c) => ({ ...c, [key]: d })));
    return () => {
      alive = false;
    };
  }, [key, kind, range, cache]);

  if (data && data.state !== "ok") return <Offline state={data.state} retryAt={data.retryAt} />;

  return (
    <div className="glass spot charts">
      <div className="charts-head">
        <Tabs label="Show" value={kind} options={KINDS} onChange={setKind} />
        <Tabs label="Time period" value={range} options={RANGES} onChange={setRange} />
      </div>

      {!data ? (
        <div className={kind === "artists" ? "artist-grid" : "chart-list"}>
          {Array.from({ length: kind === "artists" ? 10 : 10 }, (_, i) => (
            <div key={i} className={kind === "artists" ? "skeleton artist-skel" : "skeleton row-skel"} />
          ))}
        </div>
      ) : data.items.length === 0 ? (
        <p className="charts-empty">Not enough listening in this period yet.</p>
      ) : kind === "tracks" ? (
        <ol className="chart-list" key={key}>
          {(data.items as SpotifyTrack[]).map((t, i) => (
            <li key={t.id} style={{ animationDelay: `${i * 40}ms` }}>
              <a href={t.url ?? undefined} target="_blank" rel="noopener noreferrer" className="chart-row">
                <span className="rank">{String(i + 1).padStart(2, "0")}</span>
                <Cover src={t.thumb} size={52} alt={`${t.album} cover`} />
                <span className="chart-text">
                  <strong>{t.title}</strong>
                  <span>{t.artists}</span>
                </span>
                <span className="chart-album">{t.album}</span>
              </a>
            </li>
          ))}
        </ol>
      ) : (
        <ol className="artist-grid" key={key}>
          {(data.items as SpotifyArtist[]).map((a, i) => (
            <li key={a.id} style={{ animationDelay: `${i * 40}ms` }}>
              <a href={a.url ?? undefined} target="_blank" rel="noopener noreferrer" className="tilt artist-card">
                <span className="artist-rank">#{i + 1}</span>
                {a.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.image} alt={a.name} className="artist-photo" loading="lazy" />
                ) : (
                  <span className="artist-photo artist-photo-empty">{a.name.charAt(0)}</span>
                )}
                <strong>{a.name}</strong>
                {a.genres[0] && <span>{a.genres[0]}</span>}
              </a>
            </li>
          ))}
        </ol>
      )}

      <p className="charts-note">
        From Spotify. &ldquo;Last year&rdquo; is Spotify&apos;s longest period (about 12 months).
      </p>
    </div>
  );
}
