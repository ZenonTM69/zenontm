import type { Metadata, Viewport } from "next";
import "./globals.css";

// Fonts: Helvetica, from visitors' own devices (see --font-* in globals.css).

export const metadata: Metadata = {
  title: "ZenonTM",
  description: "ZenonTM – music, photos and where to find me.",
  metadataBase: new URL("https://zenontm.meme"),
  openGraph: {
    title: "ZenonTM",
    description: "Music, photos and where to find me.",
    url: "https://zenontm.meme",
    siteName: "ZenonTM",
    type: "website",
    images: [{ url: "/zenontm-logo.svg", width: 1024, height: 1024, alt: "ZenonTM logo" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#05050a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
