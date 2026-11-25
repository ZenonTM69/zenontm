// Reads your Instagram follower count using the official Instagram API.
// This code only ever runs on the server (Vercel), so your access token is
// never sent to visitors' browsers.
//
// It needs one secret setting: INSTAGRAM_ACCESS_TOKEN (see README).
// Without it, or if Instagram is unreachable, it returns null and the site
// simply shows the number you typed in lib/site.ts instead.

const API = "https://graph.instagram.com";

export async function getInstagramFollowers(): Promise<number | null> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) return null;

  try {
    // Request format as documented by Meta ("Instagram API with Instagram Login", permission instagram_business_basic).
    const res = await fetch(`${API}/v27.0/me?fields=username,followers_count&access_token=${encodeURIComponent(token)}`, {
      // Ask Instagram at most once an hour; visitors in between get the saved number.
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      console.warn(`Instagram follower fetch failed (HTTP ${res.status}). Showing the fallback number.`);
      return null;
    }
    const data = (await res.json()) as { followers_count?: number };
    return typeof data.followers_count === "number" ? data.followers_count : null;
  } catch {
    console.warn("Instagram follower fetch failed (network). Showing the fallback number.");
    return null;
  }
}

// 950 -> "950", 8031 -> "8,031", 12400 -> "12.4k", 1250000 -> "1.25M"
export function formatCount(n: number): string {
  if (n < 10_000) return n.toLocaleString("en-US");
  if (n < 1_000_000) return `${+(n / 1000).toFixed(n < 100_000 ? 1 : 0)}k`;
  return `${+(n / 1_000_000).toFixed(2)}M`;
}
