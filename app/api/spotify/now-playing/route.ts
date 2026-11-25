import { getNowPlaying, errorInfo, errorCacheSeconds } from "@/lib/spotify";

export const dynamic = "force-dynamic";

// What's playing right now. Vercel's cache shares one answer between all
// visitors for 10 seconds, so Spotify is asked at most ~6 times a minute.
export async function GET() {
  try {
    const now = await getNowPlaying();
    return Response.json(
      { state: "ok", ...now },
      { headers: { "Cache-Control": "public, s-maxage=10, stale-while-revalidate=20" } }
    );
  } catch (err) {
    return Response.json(errorInfo(err), { headers: { "Cache-Control": `public, s-maxage=${errorCacheSeconds(err)}` } });
  }
}
