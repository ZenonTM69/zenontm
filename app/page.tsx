import Background from "@/components/Background";
import Navbar from "@/components/Navbar";
import Clock from "@/components/Clock";
import Reveal from "@/components/Reveal";
import SpotifyCard from "@/components/SpotifyCard";
import TopCharts from "@/components/TopCharts";
import Gallery from "@/components/Gallery";
import SocialCard from "@/components/SocialCard";
import SocialBar from "@/components/SocialBar";
import HeroTitle from "@/components/HeroTitle";
import LiveStatus from "@/components/LiveStatus";
import Logo from "@/components/Logo";
import Icon from "@/components/Icons";
import { profile, socials as baseSocials, gallery } from "@/lib/site";
import { getInstagramFollowers, formatCount } from "@/lib/instagram";
import { getTopArtists, spotifyConfigured } from "@/lib/spotify";

// Rebuild this page in the background at most once an hour (keeps counts and the artist banner fresh).
export const revalidate = 3600;

// Section heading: a heading and an optional short line under it.
function SectionHead({ title, text }: { title: string; text?: string }) {
  return (
    <Reveal>
      <div className="section-head">
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
  const [igFollowers, artists] = await Promise.all([getInstagramFollowers(), bannerArtists()]);
  // Instagram's number is only ever shown when it really came from Instagram (marked "live").
  const socials = baseSocials.map((s) =>
    s.icon === "instagram" && igFollowers !== null ? { ...s, followers: formatCount(igFollowers), live: true } : s
  );

  return (
    <>
      <Background />
      <Navbar />

      <main>
        {/* ================= HOME ================= */}
        <section id="home" className="hero">
          <Reveal>
            <div className="hero-meta">
              <span className="hm-label">{profile.domain}</span>
              <Clock />
              {profile.location && <span className="hm-label">{profile.location}</span>}
            </div>
          </Reveal>

          <Reveal delay={80}>
            <HeroTitle photo={profile.heroPhoto} photoAlt={profile.heroPhotoAlt} />
          </Reveal>

          <Reveal delay={200}>
            <div className="hero-foot">
              <LiveStatus />
              <SocialBar socials={socials} />
            </div>
          </Reveal>
        </section>

        {/* Scrolling banner of my real top artists (only shown when Spotify is connected) */}
        {artists.length > 0 && (
          <div className="marquee" aria-hidden="true">
            <div className="marquee-track">
              {[...artists, ...artists].map((name, i) => (
                <span key={i}>
                  {name} <i>/</i>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ================= MUSIC ================= */}
        <section id="music" className="section">
          <SectionHead title="Listening now" text="Live from my Spotify." />
          <Reveal>
            <SpotifyCard />
          </Reveal>
        </section>

        {/* ================= TOP ================= */}
        <section id="top" className="section">
          <SectionHead title="My top music" text="Switch the time period to compare." />
          <Reveal>
            <TopCharts />
          </Reveal>
        </section>

        {/* ================= PHOTOS ================= */}
        <section id="gallery" className="section">
          <SectionHead title="Photos" />
          <Reveal className="reveal-wipe">
            <Gallery photos={gallery} />
          </Reveal>
        </section>

        {/* ================= SOCIALS ================= */}
        <section id="connect" className="section">
          <SectionHead title="Where to find me" text="Tap to open. The copy button copies my username." />
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
          <a href="#home" className="footer-logo" aria-label="Back to the top">
            <Logo size={40} />
            <span>{profile.name}</span>
          </a>
          <p>
            © {new Date().getFullYear()} · {profile.domain}
          </p>
          <a href="#home" className="to-top" aria-label="Back to top">
            <Icon name="up" size={18} />
          </a>
        </div>
      </footer>
    </>
  );
}
