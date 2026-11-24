import { getTopArtists, getTopTracks, stateOf, TIME_RANGES, type TimeRange } from "@/lib/spotify";

export const dynamic = "force-dynamic";

// Top tracks or artists for one time period. These change slowly: cached for 1 hour.
//   /api/spotify/top?type=tracks&range=short_term   (≈ last 4 weeks)
//   /api/spotify/top?type=artists&range=medium_term (≈ last 6 months)
//   range=long_term                                  (≈ last year)
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const type = params.get("type") === "artists" ? "artists" : "tracks";
  const rangeParam = params.get("range") as TimeRange;
  const range: TimeRange = TIME_RANGES.includes(rangeParam) ? rangeParam : "short_term";

  try {
    const items = type === "artists" ? await getTopArtists(range, 10) : await getTopTracks(range, 10);
    return Response.json(
      { state: "ok", type, range, items },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" } }
    );
  } catch (err) {
    return Response.json(
      { state: stateOf(err), type, range, items: [] },
      { headers: { "Cache-Control": "public, s-maxage=60" } }
    );
  }
}
