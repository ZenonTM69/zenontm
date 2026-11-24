import { getRecentlyPlayed, stateOf } from "@/lib/spotify";

export const dynamic = "force-dynamic";

// Last 20 songs played (Spotify allows up to 50). Cached for 1 minute.
export async function GET() {
  try {
    const items = await getRecentlyPlayed(20);
    return Response.json(
      { state: "ok", items },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } }
    );
  } catch (err) {
    return Response.json({ state: stateOf(err), items: [] }, { headers: { "Cache-Control": "public, s-maxage=30" } });
  }
}
