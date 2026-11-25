"use client";
import DitherCover from "./DitherCover";

// A wall of album covers from my real top tracks (last 6 months).
// Each cover is lime pixel-art that develops when it scrolls into view and flips to the
// real colour cover when you hover it (or tap it on a phone).

export type WallItem = { key: string; image: string; album: string; artists: string; url: string | null };

export default function AlbumWall({ items }: { items: WallItem[] }) {
  return (
    <ul className="wall" aria-label="Album covers from my top tracks">
      {items.map((it, i) => (
        <li key={it.key} style={{ ["--i" as string]: i }}>
          <a href={it.url ?? undefined} target="_blank" rel="noopener noreferrer" className="wall-tile" aria-label={`${it.album} by ${it.artists} (opens Spotify)`}>
            <DitherCover src={it.image} size={0} alt={`${it.album} cover`} playing={false} still className="wall-cover" />
            <span className="wall-label">
              <b>{it.album}</b>
              <span>{it.artists}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
