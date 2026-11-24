// ============================================================
//  ✏️  EDIT THIS FILE to change the text on your website.
//  Everything here is PLACEHOLDER content – replace it with your own.
//  You never need to touch the other code files just to change words.
// ============================================================

export const profile = {
  name: "ZenonTM",
  handle: "@zenontm",
  status: "Online · probably listening to music",
  // The animated line under your name cycles through these:
  roles: ["Content creator", "Music obsessive", "Night owl", "Idea collector"],
  location: "Somewhere on Earth",
  avatar: "/avatar.svg", // put your photo in /public (e.g. me.jpg) and change this to "/me.jpg"
  domain: "zenontm.meme",
  // Small fun facts shown in the hero. Change or remove freely.
  stats: [
    { value: "24/7", label: "music on" },
    { value: "120+", label: "playlists" },
    { value: "∞", label: "late nights" },
  ],
};

export type Social = {
  name: string;
  handle: string;
  url: string;
  icon: "instagram" | "tiktok" | "snapchat" | "youtube" | "discord";
  copy?: boolean; // true = clicking copies the handle instead of opening a link (handy for Discord)
  // Follower count shown on the card, typed exactly how you want it to look, e.g. "1,204" or "12.4k".
  // Leave it as "" to hide it. Update it by hand whenever you like.
  followers?: string;
  followersLabel?: string; // e.g. "followers" or "subscribers"
};

export const socials: Social[] = [
  {
    // Instagram updates automatically once set up (see README). This number is only
    // the backup shown if the automatic count isn't working.
    name: "Instagram", handle: "@zenontm", url: "https://www.instagram.com/zenontm/", icon: "instagram",
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
  {
    name: "Snapchat", handle: "ZenonTM", url: "https://www.snapchat.com/add/ZenonTM", icon: "snapchat",
    followers: "", followersLabel: "subscribers",
  },
  // Discord doesn't have follower counts, so there's no number here.
  { name: "Discord", handle: "zenontm", url: "https://discord.com/", icon: "discord", copy: true },
];

// Music: everything in the music section now comes LIVE from your Spotify
// (see lib/spotify.ts and the README). There is no fake music data any more.

// Gallery: put photos in /public/gallery and add `src: "/gallery/yourphoto.jpg"`.
// Without `src`, a colourful placeholder is shown. The first photo is shown bigger.
export type Photo = { caption: string; hue: number; src?: string };
export const gallery: Photo[] = [
  { caption: "City lights", hue: 265 },
  { caption: "Studio session", hue: 215 },
  { caption: "Golden hour", hue: 300 },
  { caption: "Road trip", hue: 200 },
  { caption: "Late night ideas", hue: 250 },
  { caption: "Festival season", hue: 280 },
  { caption: "Rooftop", hue: 225 },
];

export const navLinks = [
  { href: "#home", label: "Home" },
  { href: "#music", label: "Music" },
  { href: "#top", label: "Top" },
  { href: "#gallery", label: "Gallery" },
  { href: "#connect", label: "Connect" },
];
