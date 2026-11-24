import { cookies } from "next/headers";
import { basicAuthHeader, redirectUri } from "@/lib/spotify";

export const dynamic = "force-dynamic";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function page(title: string, body: string, status = 200) {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>${esc(title)}</title>
<style>
  body{margin:0;min-height:100vh;display:grid;place-items:center;background:#05050a;color:#eeedff;font:16px/1.6 system-ui,sans-serif;padding:20px}
  main{max-width:620px;width:100%;background:#0f0f1c;border:1px solid #2a2a40;border-radius:20px;padding:28px}
  h1{margin:0 0 10px;font-size:1.4rem} ol{padding-left:20px} code{background:#1c1c2e;padding:2px 6px;border-radius:6px}
  textarea{width:100%;min-height:110px;box-sizing:border-box;background:#05050a;color:#a7f3d0;border:1px solid #2a2a40;border-radius:12px;padding:12px;font:13px/1.5 monospace}
  button{margin-top:10px;padding:10px 18px;border:0;border-radius:999px;background:linear-gradient(90deg,#8b5cf6,#3b82f6);color:#fff;font-weight:600;cursor:pointer}
  .warn{color:#fca5a5}
</style></head><body><main>${body}</main></body></html>`;
  return new Response(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
  });
}

// STEP 2 of connecting Spotify. Spotify sends you here after you click "Agree".
// This page shows your refresh token ONCE so you can paste it into Vercel.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const jar = cookies();
  const expected = jar.get("spotify_auth_state")?.value;
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) return page("Not connected", `<h1>Not connected</h1><p>Spotify said: <code>${esc(error)}</code>. You can try again.</p>`, 400);
  if (!code || !state || !expected || state !== expected) {
    return page(
      "Link expired",
      `<h1>This link expired or was opened twice</h1><p>Start again from <code>/api/spotify/login?key=…</code></p>`,
      400
    );
  }
  jar.delete({ name: "spotify_auth_state", path: "/api/spotify" });

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { Authorization: basicAuthHeader(), "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: redirectUri(request) }),
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as { refresh_token?: string; error?: string };

  if (!res.ok || !data.refresh_token) {
    return page(
      "Something went wrong",
      `<h1>Spotify didn't hand over access</h1><p>Error: <code>${esc(data.error ?? `HTTP ${res.status}`)}</code></p>
       <p>Usually this means the Client Secret in Vercel is wrong, or the Redirect URI in your Spotify app doesn't exactly match <code>${esc(redirectUri(request))}</code>.</p>`,
      502
    );
  }

  return page(
    "Spotify connected",
    `<h1>✅ Spotify approved access</h1>
     <p>Last step: save this code in Vercel so your site can use it.</p>
     <textarea id="t" readonly>${esc(data.refresh_token)}</textarea>
     <button onclick="navigator.clipboard.writeText(document.getElementById('t').value);this.textContent='Copied!'">Copy code</button>
     <ol>
       <li>Vercel → your project → <b>Settings → Environment Variables</b></li>
       <li>Name: <code>SPOTIFY_REFRESH_TOKEN</code>, Value: paste the code. Save. (If it already exists, edit it.)</li>
       <li><b>Deployments</b> → ⋯ on the newest one → <b>Redeploy</b></li>
     </ol>
     <p class="warn">Treat this code like a password: don't share it, screenshot it or post it. Close this tab when done.</p>
     <p>This connection lasts about 6 months. Spotify's rules don't allow it to be extended, so you'll repeat these steps then.</p>`
  );
}
