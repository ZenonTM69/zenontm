import { NextResponse } from "next/server";
import { appConfigured, redirectUri, SPOTIFY_SCOPES } from "@/lib/spotify";

export const dynamic = "force-dynamic";

// STEP 1 of connecting Spotify (only you use this, about every 6 months).
// Visit:  https://zenontm.meme/api/spotify/login?key=YOUR_SPOTIFY_ADMIN_KEY
// The key stops anyone else from connecting THEIR Spotify to your website.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const adminKey = process.env.SPOTIFY_ADMIN_KEY;

  if (!adminKey || url.searchParams.get("key") !== adminKey) {
    return new Response("Not allowed. Add ?key=YOUR_SPOTIFY_ADMIN_KEY to the address.", { status: 401 });
  }
  if (!appConfigured()) {
    return new Response("SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET are not set yet.", { status: 400 });
  }

  // Random value checked on the way back, so the reply can't be faked.
  const state = crypto.randomUUID();
  const auth = new URL("https://accounts.spotify.com/authorize");
  auth.search = new URLSearchParams({
    response_type: "code",
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    scope: SPOTIFY_SCOPES.join(" "),
    redirect_uri: redirectUri(request),
    state,
    show_dialog: "true",
  }).toString();

  const res = NextResponse.redirect(auth.toString());
  res.cookies.set("spotify_auth_state", state, {
    httpOnly: true,
    secure: url.protocol === "https:",
    sameSite: "lax",
    path: "/api/spotify",
    maxAge: 600,
  });
  res.headers.set("Cache-Control", "no-store");
  return res;
}
