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

Open **`lib/site.ts`**. Your name, status line, the animated words under your name (`roles`), stats, social links, favourite artists/tracks and gallery captions are all there as simple text. Replace the placeholders, save, and the page updates.

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

## Spotify (future step)

The Spotify card currently shows **demo data**. When you're ready we'll create a Spotify developer app and store the keys in `.env.local` (locally) and in Vercel's **Environment Variables** – never in the code. See `.env.example` for the names.
