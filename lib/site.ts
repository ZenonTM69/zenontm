// ============================================================
//  ✏️  EDIT THIS FILE to change the text on your website.
//  You never need to touch the other code files just to change words.
//  Text is kept deliberately short – the music and photos say the rest.
// ============================================================

export const profile = {
  name: "ZenonTM",
  handle: "@zenontm",
  domain: "zenontm.meme",
  // The photo that overlaps the big ZENONTM title on the homepage.
  // Put your photo in /public (e.g. /public/me.jpg) and change this to "/me.jpg".
  // A tall (portrait) photo works best.
  // A photo with its background removed (transparent) looks best.
  heroPhoto: "/hero-photo.webp",
  heroPhotoAlt: "Portrait photo", // a short description of the photo, for screen readers
  // Optional: a place name shown small in the hero. Leave "" to hide it.
  location: "",
  // Optional: a short line about what you are up to right now, shown under the big title
  // as "CURRENTLY: …". Example: "revising for exams". Leave "" to hide it.
  status: "GOONING IT CRAZY STYLE",
};

export type Social = {
  name: string;
  handle: string;
  url: string;
  icon: "instagram" | "tiktok" | "snapchat" | "youtube" | "discord" | "x";
  copy?: boolean; // true = clicking copies the handle instead of opening a link (handy for Discord)
  // Follower count shown on the card, typed exactly how you want it to look, e.g. "1,204" or "12.4k".
  // Leave it as "" to hide it. Update it by hand whenever you like.
  followers?: string;
  followersLabel?: string; // e.g. "followers" or "subscribers"
  live?: boolean; // set automatically when the number comes live from Instagram – don't set by hand
};

export const socials: Social[] = [
  {
    // Instagram updates automatically once set up (see README). This number is only
    // the backup shown if the automatic count isn't working.
    name: "Instagram", handle: "@zenontm", url: "https://www.instagram.com/zenontm/", icon: "instagram",
    followers: "", followersLabel: "followers",
  },
  {
    name: "Snapchat", handle: "ZenonTM", url: "https://www.snapchat.com/add/ZenonTM", icon: "snapchat",
    followers: "", followersLabel: "subscribers",
  },
  // Discord doesn't have follower counts, so there's no number here.
  { name: "Discord", handle: "zenontm", url: "https://discord.com/", icon: "discord", copy: true },
  {
    name: "X", handle: "@ZenonTM", url: "https://x.com/ZenonTM", icon: "x",
    followers: "", followersLabel: "followers",
  },
  {
    name: "TikTok", handle: "@zenontm", url: "https://www.tiktok.com/@zenontm", icon: "tiktok",
    followers: "", followersLabel: "followers",
  },
  {
    name: "YouTube", handle: "@zenontm2491", url: "https://www.youtube.com/@zenontm2491", icon: "youtube",
    followers: "", followersLabel: "subscribers",
  },
];

// "Buy me a drink" section. The link opens Revolut with £10 (amount=1000 pence) and a note filled in.
export const drink = {
  url: "https://revolut.me/zenontm?currency=GBP&amount=1000&note=Buy%20me%20a%20drink",
  amountLabel: "£10",
};

// Music: everything in the music section now comes LIVE from your Spotify
// (see lib/spotify.ts and the README). There is no fake music data any more.

// Gallery: YOUR photos only. Put them in /public/gallery and add one line each, e.g.
//   { src: "/gallery/beach.jpg", caption: "Beach, June" },
// Any number works – the layout adapts. Caption is optional. Newest first looks nice.
// While this list is empty, the gallery shows a small "photos soon" note.
export type Photo = { src: string; caption?: string };
export const gallery: Photo[] = [];

export const navLinks = [
  { href: "#home", label: "Home" },
  { href: "#music", label: "Music" },
  { href: "#top", label: "Top" },
  { href: "#gallery", label: "Photos" },
  { href: "#connect", label: "Socials" },
];
