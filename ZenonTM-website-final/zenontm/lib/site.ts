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
  intro:
    "Welcome to my corner of the internet. I make content, collect songs I can't stop replaying, and chase late-night ideas. Have a look around: what I'm listening to, what I love, and where to find me.",
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

export type Track = {
  title: string;
  artist: string;
  album: string;
  durationSec: number;
  hue: number; // colour used for the placeholder album art
  playedAgo?: string;
};

// DEMO music data. A future step swaps this for your real Spotify activity.
export const demoQueue: Track[] = [
  { title: "Neon Skyline", artist: "Aurora Vale", album: "Midnight Static", durationSec: 214, hue: 265 },
  { title: "Afterglow Drive", artist: "Kairo Lane", album: "Velvet Circuits", durationSec: 187, hue: 215 },
  { title: "Glass Rooms", artist: "Mira Solenne", album: "Lowlight", durationSec: 242, hue: 295 },
  { title: "Cobalt", artist: "Nyx Orchard", album: "Deep Field", durationSec: 228, hue: 235 },
];

export const recentlyPlayed: Track[] = [
  { title: "Static Bloom", artist: "Aurora Vale", album: "Midnight Static", durationSec: 201, hue: 250, playedAgo: "4 min ago" },
  { title: "Run It Back", artist: "The Hollow Kids", album: "Night Shift", durationSec: 176, hue: 200, playedAgo: "12 min ago" },
  { title: "Paper Moons", artist: "Delta Hush", album: "Soft Focus", durationSec: 165, hue: 280, playedAgo: "26 min ago" },
  { title: "Glass Rooms", artist: "Mira Solenne", album: "Lowlight", durationSec: 242, hue: 295, playedAgo: "41 min ago" },
  { title: "Afterglow Drive", artist: "Kairo Lane", album: "Velvet Circuits", durationSec: 187, hue: 215, playedAgo: "1 hr ago" },
];

export const favouriteArtists = [
  { name: "Aurora Vale", genre: "Synth-pop", hue: 265 },
  { name: "Kairo Lane", genre: "Alt R&B", hue: 215 },
  { name: "Mira Solenne", genre: "Dream pop", hue: 295 },
  { name: "The Hollow Kids", genre: "Indie rock", hue: 195 },
  { name: "Nyx Orchard", genre: "Electronic", hue: 240 },
  { name: "Delta Hush", genre: "Lo-fi", hue: 275 },
];

export const favouriteTracks = [
  { title: "Neon Skyline", artist: "Aurora Vale", plays: "1.2k" },
  { title: "Afterglow Drive", artist: "Kairo Lane", plays: "980" },
  { title: "Glass Rooms", artist: "Mira Solenne", plays: "864" },
  { title: "Cobalt", artist: "Nyx Orchard", plays: "702" },
  { title: "Paper Moons", artist: "Delta Hush", plays: "655" },
];

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
  { href: "#favourites", label: "Favourites" },
  { href: "#gallery", label: "Gallery" },
  { href: "#connect", label: "Connect" },
];
