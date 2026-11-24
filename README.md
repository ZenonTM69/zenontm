# ZenonTM – personal website

A dark, glassy, animated personal site built with **Next.js** (a popular web framework) and ready for **Vercel** hosting. Intended domain: **zenontm.meme**.

## Preview it on your computer

1. Install **Node.js** (the LTS version) from https://nodejs.org if you don't have it.
2. Open a terminal in this folder and run:
   ```
   npm install
   npm run dev
   ```
3. Open http://localhost:3000 in your browser. Edits you save appear instantly. Press `Ctrl + C` in the terminal to stop.

## Change the content (no coding needed)

Open **`lib/site.ts`**. Your name, status line, the animated words under your name (`roles`), stats, social links and gallery captions are all there (music comes live from Spotify) as simple text. Replace the placeholders, save, and the page updates.

- **Profile picture:** put your image in the `public` folder (e.g. `public/me.jpg`) and set `avatar: "/me.jpg"` in `lib/site.ts`.
- **Gallery photos:** put images in `public/gallery/` and add `src: "/gallery/photo1.jpg"` to an item. The grid is arranged for 7 photos.
- **Discord:** clicking the Discord card copies your username (Discord has no simple profile links). Set `copy: false` and a server invite `url` if you'd rather link a server.
- **Colours:** the top of `app/globals.css`.

## What's where (for the curious)

| File | What it does |
| --- | --- |
| `lib/site.ts` | All your text and links |
| `app/page.tsx` | The page layout, section by section |
| `app/globals.css` | All colours, spacing and animations |
| `components/` | The interactive pieces: nav bar, clock, music player, gallery, social cards, background effects |

## Save it to GitHub

1. Create a free account at https://github.com, click **New repository**, name it `zenontm`, leave it empty (no README), and create it.
2. In a terminal in this folder:
   ```
   git init
   git add .
   git commit -m "Initial ZenonTM website"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/zenontm.git
   git push -u origin main
   ```
   (Replace `YOUR-USERNAME`.) Secrets are safe: `.gitignore` keeps `.env.local` and `node_modules` out.

## Put it online with Vercel

1. Sign up at https://vercel.com using your GitHub account.
2. **Add New → Project**, pick the `zenontm` repo, press **Deploy** (default settings are right).
3. In the project's **Settings → Domains**, add `zenontm.meme` and follow the DNS instructions Vercel shows at your domain registrar.

## Automatic Instagram follower count

The Instagram card can show your real follower count, checked about once an hour. Until this is set up, it shows the backup number in `lib/site.ts` (or nothing, if that's empty). Do this **after** the site is on Vercel.

Meta changes its screens often, so button names may differ slightly from below.

1. **Make your Instagram a Creator account** (free, you can switch back): Instagram app → Settings → *Account type and tools* → *Switch to professional account* → Creator.
2. **Create a Meta developer app:** go to https://developers.facebook.com, log in, choose *My Apps → Create app*. Pick the use case about **managing content/messaging on Instagram** (it uses "Instagram API with Instagram Login"), and type **Business** if asked.
3. **Get your token:** in the app, open *Instagram → API setup with Instagram login* → *Generate access tokens* → *Add account*, log in as @zenontm, then click *Generate token* and copy it. Treat it like a password.
4. **Give it to Vercel:** your project → *Settings → Environment Variables*, add:
   - `INSTAGRAM_ACCESS_TOKEN` = the token you copied
   - `CRON_SECRET` = any long random password you make up (protects the weekly refresh)
   Then *Deployments → ⋯ → Redeploy*.

**Keeping it working:** tokens last ~60 days. Vercel automatically calls `/api/instagram/refresh` every Monday to extend it (set in `vercel.json`). If it ever stops working, the card quietly falls back to your backup number; just generate a new token (step 3) and replace it in Vercel.

**Testing on your computer (optional):** copy `.env.example` to `.env.local`, paste the token after `INSTAGRAM_ACCESS_TOKEN=`, and run `npm run dev`. `.env.local` is never uploaded to GitHub.

## Spotify (live music section)

The music section shows your **real** Spotify activity: what's playing now (with progress and an "Open in Spotify" button), your recently played songs, and your top tracks and artists for the last 4 weeks, 6 months or year. Until it's connected it says "Spotify isn't connected yet". It never shows made-up songs.

**You need:** a Spotify **Premium** account. Spotify requires Premium for personal apps; if Premium lapses, the section stops working.

Do this **after** the site is live on Vercel at zenontm.meme.

1. **Create the Spotify app.** Go to https://developer.spotify.com/dashboard, log in, click **Create app**:
   - App name: `ZenonTM website`; description: `Shows my listening on my site`
   - Redirect URI: `https://zenontm.meme/api/spotify/callback` (type it exactly, then click **Add**)
   - Tick **Web API**, accept the terms, click **Save**.
2. **Copy the two keys.** In the app's **Settings**, copy the **Client ID**, then click *View client secret* and copy the **Client Secret**.
3. **Add them to Vercel** (project → *Settings → Environment Variables*):
   - `SPOTIFY_CLIENT_ID` = Client ID
   - `SPOTIFY_CLIENT_SECRET` = Client Secret
   - `SPOTIFY_ADMIN_KEY` = a long password you make up (only you use it, in step 4)
   Then *Deployments → ⋯ → Redeploy*.
4. **Connect your account.** Visit `https://zenontm.meme/api/spotify/login?key=YOUR_ADMIN_KEY`, click **Agree** on Spotify's page. You'll land on a page showing a code. Copy it.
5. **Save the code in Vercel** as `SPOTIFY_REFRESH_TOKEN`, then **Redeploy** again. Done – the music section is live.

**Every ~6 months** Spotify's connection expires (their rule; it can't be extended). The section will say Spotify data is unavailable. Repeat steps 4–5 (2 minutes).

The site only asks for read-only permission to: what's playing now, recently played, and your top items. It can't control playback or change anything on your account. Visitors never log in to Spotify.

**Testing on your computer (optional):** Spotify doesn't allow `localhost`. Add a second Redirect URI `http://127.0.0.1:3000/api/spotify/callback` in your Spotify app, put the same values in `.env.local`, run `npm run dev`, and open `http://127.0.0.1:3000` (not localhost).
