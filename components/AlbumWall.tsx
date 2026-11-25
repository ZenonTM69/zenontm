// A wall of album covers from my real top tracks (last 6 months).
// Shows the real covers (no pixel effect); hovering one lifts it and shows the album name.

export type WallItem = { key: string; image: string; album: string; artists: string; url: string | null };

export default function AlbumWall({ items }: { items: WallItem[] }) {
  return (
    <ul className="wall" aria-label="Album covers from my top tracks">
      {items.map((it, i) => (
        <li key={it.key} style={{ ["--i" as string]: i }}>
          <a href={it.url ?? undefined} target="_blank" rel="noopener noreferrer" className="wall-tile" aria-label={`${it.album} by ${it.artists} (opens Spotify)`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={it.image} alt="" loading="lazy" decoding="async" className="wall-cover" />
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
