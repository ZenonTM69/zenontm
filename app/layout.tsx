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
    // The picture shown when the link is shared (Instagram DMs, Discord, iMessage, WhatsApp…)
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ZenonTM – music, photos and me" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ZenonTM",
    description: "Music, photos and where to find me.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Apply the visitor's chosen site colour (colour picker) before the page shows, so it never flashes lime */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var c=localStorage.getItem("zt-accent");if(c&&/^#[0-9a-f]{6}$/i.test(c))document.documentElement.style.setProperty("--acid",c)}catch(e){}`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
