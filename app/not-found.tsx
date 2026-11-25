import Link from "next/link";

// Shown when someone visits a page that doesn't exist (e.g. zenontm.meme/whatever).
export const metadata = { title: "Lost · ZenonTM" };

export default function NotFound() {
  return (
    <main className="nf">
      <p className="nf-tag">ERROR · PAGE NOT FOUND</p>
      <h1 className="nf-big" aria-label="404">
        {"404".split("").map((c, i) => (
          <span key={i} style={{ ["--i" as string]: i }}>
            {c}
          </span>
        ))}
      </h1>
      <p className="nf-text">This page wandered off. It&apos;s probably listening to music somewhere.</p>
      <Link href="/" className="nf-home">
        Take me home ↗
      </Link>
      <span className="nf-sticker" aria-hidden="true">
        LOST™
      </span>
    </main>
  );
}
