// "My music taste" – a gig-flyer style poster made from REAL Spotify data:
// the genres of my top 50 artists (last 6 months), biggest = most common.
// If Spotify doesn't give genres, it shows my top artists instead (and says so).

export default function TastePoster({ rows, mode }: { rows: string[]; mode: "genres" | "artists" }) {
  if (!rows.length) return null;
  return (
    <figure className="poster">
      <span className="poster-tape poster-tape-l" aria-hidden="true" />
      <span className="poster-tape poster-tape-r" aria-hidden="true" />
      <figcaption className="poster-top">
        <span>ZENONTM PRESENTS</span>
        <span>{new Date().getFullYear()}</span>
      </figcaption>
      <ol className="poster-rows">
        {rows.map((r, i) => (
          <li key={r} style={{ ["--i" as string]: i }} className={i === 0 ? "is-top" : ""}>
            {r}
          </li>
        ))}
      </ol>
      <p className="poster-foot">
        {mode === "genres" ? "Genres of my top 50 artists" : "My top artists"} · last 6 months · live from Spotify
      </p>
    </figure>
  );
}

// Counts genres across artists and returns the most common ones.
export function topGenres(artists: { genres: string[] }[], n = 8) {
  const counts = new Map<string, number>();
  artists.forEach((a, i) =>
    a.genres.forEach((g) => counts.set(g, (counts.get(g) ?? 0) + 1 + (50 - i) / 500)) // small boost for higher-ranked artists
  );
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([g]) => g);
}
