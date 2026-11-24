import Background from "@/components/Background";
import Navbar from "@/components/Navbar";
import Clock from "@/components/Clock";
import Reveal from "@/components/Reveal";
import SpotifyCard from "@/components/SpotifyCard";
import TopCharts from "@/components/TopCharts";
import Gallery from "@/components/Gallery";
import SocialCard from "@/components/SocialCard";
import Typewriter from "@/components/Typewriter";
import Icon from "@/components/Icons";
import { profile, socials as baseSocials, gallery } from "@/lib/site";
import { getInstagramFollowers, formatCount } from "@/lib/instagram";
import { getTopArtists, spotifyConfigured } from "@/lib/spotify";

// Rebuild this page in the background at most once an hour (keeps counts and the artist banner fresh).
export const revalidate = 3600;

function SectionHead({ index, eyebrow, title, text }: { index: string; eyebrow: string; title: string; text?: string }) {
  return (
    <Reveal>
      <div className="section-head">
        <span className="eyebrow">
          <b>{index}</b> {eyebrow}
        </span>
        <h2>{title}</h2>
        {text && <p>{text}</p>}
      </div>
    </Reveal>
  );
}

// Real top artists (last 6 months) for the scrolling banner. Empty = banner hidden.
async function bannerArtists(): Promise<string[]> {
  if (!spotifyConfigured()) return [];
  try {
    return (await getTopArtists("medium_term", 12)).map((a) => a.name);
  } catch {
    return [];
  }
}

export default async function Home() {
  // Live Instagram count if it's set up; otherwise the number typed in lib/site.ts.
  const [igFollowers, artists] = await Promise.all([getInstagramFollowers(), bannerArtists()]);
  const socials = baseSocials.map((s) =>
    s.icon === "instagram" && igFollowers !== null ? { ...s, followers: formatCount(igFollowers) } : s
  );

  return (
    <>
      <Background />
      <Navbar />

      <main>
        {/* ================= HOME ================= */}
        <section id="home" className="hero">
          <div className="hero-copy">
            <Reveal>
              <span className="status-pill">
                <span className="pulse" /> {profile.status}
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="display">
                <span className="gradient-text">{profile.name}</span>
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="roles">
                <Typewriter words={profile.roles} />
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="hero-actions">
                <a href="#music" className="btn btn-primary">
                  What I&apos;m playing <Icon name="arrow" size={18} />
                </a>
                <a href="#connect" className="btn btn-ghost">
                  Find me online
                </a>
              </div>
            </Reveal>
            <Reveal delay={320}>
              <dl className="stats">
                {profile.stats.map((s) => (
                  <div key={s.label}>
                    <dt>{s.label}</dt>
                    <dd>{s.value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          <Reveal delay={200} className="hero-card-wrap">
            <aside className="glass spot tilt hero-card">
              <div className="avatar-wrap">
                <div className="avatar-ring" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={profile.avatar} alt={`${profile.name}'s profile picture`} className="avatar" />
                <span className="avatar-online" title="Online" />
              </div>
              <p className="hero-card-name">{profile.name}</p>
              <p className="hero-card-meta">
                {profile.handle} · <Icon name="pin" size={14} /> {profile.location}
              </p>
              <div className="divider" />
              <Clock />
              <div className="divider" />
              <div className="mini-socials">
                {socials.map((s) => (
                  <a key={s.name} href={s.copy ? "#connect" : s.url} target={s.copy ? undefined : "_blank"} rel="noopener noreferrer" aria-label={s.name} className={`brand-${s.icon}`}>
                    <Icon name={s.icon} size={18} />
                  </a>
                ))}
              </div>
            </aside>
          </Reveal>

          <a href="#music" className="scroll-cue" aria-label="Scroll down">
            <span />
          </a>
        </section>

        {/* Scrolling banner of my real top artists (only shown when Spotify is connected) */}
        {artists.length > 0 && (
          <div className="marquee" aria-hidden="true">
            <div className="marquee-track">
              {[...artists, ...artists].map((name, i) => (
                <span key={i}>
                  {name} <i>✦</i>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ================= MUSIC ================= */}
        <section id="music" className="section">
          <SectionHead index="01" eyebrow="Spotify" title="Listening now" text="Live from my Spotify, updated every few seconds." />
          <Reveal>
            <SpotifyCard />
          </Reveal>
        </section>

        {/* ================= TOP ================= */}
        <section id="top" className="section">
          <SectionHead index="02" eyebrow="Taste" title="My top music" text="What I've had on repeat. Switch the time period to compare." />
          <Reveal>
            <TopCharts />
          </Reveal>
        </section>

        {/* ================= GALLERY ================= */}
        <section id="gallery" className="section">
          <SectionHead index="03" eyebrow="Moments" title="Photo gallery" text="Tap any photo to view it full-screen." />
          <Reveal>
            <Gallery photos={gallery} />
          </Reveal>
        </section>

        {/* ================= CONNECT ================= */}
        <section id="connect" className="section">
          <SectionHead index="04" eyebrow="Socials" title="Let's connect" text="Follow along, or say hi wherever you hang out." />
          <div className="socials">
            {socials.map((s, i) => (
              <Reveal key={s.name} delay={i * 60}>
                <SocialCard s={s} />
              </Reveal>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <p className="footer-logo gradient-text">{profile.name}</p>
          <p>
            © {new Date().getFullYear()} {profile.name} · {profile.domain}
          </p>
          <a href="#home" className="to-top" aria-label="Back to top">
            <Icon name="up" size={18} />
          </a>
        </div>
      </footer>
    </>
  );
}
