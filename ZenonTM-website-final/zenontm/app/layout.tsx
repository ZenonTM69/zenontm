import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

// Fonts are downloaded at build time and served from your own site (fast + private).
const inter = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  title: "ZenonTM",
  description: "ZenonTM's personal site: music, favourites, photos and socials.",
  metadataBase: new URL("https://zenontm.meme"),
  openGraph: {
    title: "ZenonTM",
    description: "Music, favourites, photos and socials.",
    url: "https://zenontm.meme",
    siteName: "ZenonTM",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#05050a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${grotesk.variable}`}>
      <body>{children}</body>
    </html>
  );
}
