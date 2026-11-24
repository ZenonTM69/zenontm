// Keeps your Instagram access token alive.
// Instagram tokens expire after about 60 days unless they are refreshed.
// Vercel runs this automatically once a week (see vercel.json).
// It is protected by CRON_SECRET so random visitors can't trigger it.

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) {
    return Response.json({ ok: false, error: "INSTAGRAM_ACCESS_TOKEN is not set" }, { status: 400 });
  }

  const res = await fetch(
    `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(token)}`,
    { cache: "no-store" }
  );
  const data = (await res.json().catch(() => ({}))) as { access_token?: string; expires_in?: number };

  if (!res.ok || !data.access_token) {
    console.error(`Instagram token refresh failed (HTTP ${res.status}).`);
    return Response.json({ ok: false, error: "refresh failed" }, { status: 502 });
  }

  // If Instagram ever hands back a different token, the saved one on Vercel must be replaced by hand.
  const changed = data.access_token !== token;
  if (changed) {
    console.warn("Instagram returned a NEW token. Update INSTAGRAM_ACCESS_TOKEN in Vercel settings.");
  }
  const days = data.expires_in ? Math.round(data.expires_in / 86400) : null;
  return Response.json({ ok: true, expiresInDays: days, tokenChanged: changed });
}
