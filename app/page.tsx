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
import IntroSound from "@/components/IntroSound";
import Stickers from "@/components/Stickers";
import BigTitle from "@/components/BigTitle";
import Magnetic from "@/components/Magnetic";
import EasterEgg from "@/components/EasterEgg";
import Preloader from "@/components/Preloader";
import HeroDepth from "@/components/HeroDepth";
import ClickBurst from "@/components/ClickBurst";
import SmartCursor from "@/components/SmartCursor";
import HoverSounds from "@/components/HoverSounds";
import Tools from "@/components/Tools";
import DrinkChase from "@/components/DrinkChase";
import Icon from "@/components/Icons";
import { profile, socials as baseSocials, gallery, drink } from "@/lib/site";
import { getInstagramFollowers, formatCount } from "@/lib/instagram";
import { getTopArtists, getTopTracks, spotifyConfigured, type SpotifyArtist, type SpotifyTrack } from "@/lib/spotify";
import AlbumWall, { type WallItem } from "@/components/AlbumWall";
import TastePoster, { topGenres } from "@/components/TastePoster";

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

// Real top artists + tracks (last 6 months), fetched at most once an hour.
// Used for the scrolling banner, the taste poster and the album wall. Empty = those parts hide.
async function topMusic(): Promise<{ artists: SpotifyArtist[]; tracks: SpotifyTrack[] }> {
  if (!spotifyConfigured()) return { artists: [], tracks: [] };
  const [artists, tracks] = await Promise.all([
    getTopArtists("medium_term", 50).catch(() => [] as SpotifyArtist[]),
    getTopTracks("medium_term", 50).catch(() => [] as SpotifyTrack[]),
  ]);
  return { artists, tracks };
}

export default async function Home() {
  const [igFollowers, top] = await Promise.all([getInstagramFollowers(), topMusic()]);
  const artists = top.artists.slice(0, 12).map((a) => a.name);
  // Taste poster: most common genres, or top artist names if Spotify gives no genres
  const genres = topGenres(top.artists);
  const posterMode = genres.length >= 3 ? "genres" : "artists";
  const posterRows = posterMode === "genres" ? genres : top.artists.slice(0, 8).map((a) => a.name);
  // Album wall: one tile per album (no repeats), up to 20
  const seen = new Set<string>();
  const wall: WallItem[] = [];
  for (const t of top.tracks) {
    const img = t.thumb ?? t.image;
    if (!img || seen.has(t.album + img)) continue;
    seen.add(t.album + img);
    wall.push({ key: t.id, image: img, album: t.album, artists: t.artists, url: t.url });
    if (wall.length === 20) break;
  }
  // Instagram's number is only ever shown when it really came from Instagram (marked "live").
  const socials = baseSocials.map((s) =>
    s.icon === "instagram" && igFollowers !== null ? { ...s, followers: formatCount(igFollowers), live: true } : s
  );

  return (
    <>
      <Preloader />
      {/* Without JavaScript: no loading screen, and nothing waits for it */}
      <noscript>
        <style>{".preloader{display:none!important}*{animation-play-state:running!important}"}</style>
      </noscript>
      <Background />
      <Navbar />
      <IntroSound />
      <Magnetic />
      <EasterEgg />
      <HeroDepth />
      <ClickBurst />
      <HoverSounds />
      <Tools />
      <DrinkChase />
      <SmartCursor />

      <main>
        {/* ================= HOME ================= */}
        <section id="home" className="hero">
          {/* The opening plays once on load (pure CSS, see "OPENING" in globals.css) */}
          <div className="hero-block">
            <div className="hero-meta intro-meta">
              <span className="hm-label">{profile.domain}</span>
              <Clock />
              {profile.location && <span className="hm-label">{profile.location}</span>}
            </div>
          </div>

          <div className="hero-block hero-block-title">
            <HeroTitle photo={profile.heroPhoto} photoAlt={profile.heroPhotoAlt} />
          </div>

          <div className="hero-block">
            <div className="hero-foot">
              {profile.status && (
                <p className="status-line">
                  <span>CURRENTLY</span> {profile.status}
                </p>
              )}
              <LiveStatus />
              <SocialBar socials={socials} />
            </div>
          </div>

          <Stickers />

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

        {/* ================= BUY ME A DRINK ================= */}
        <section id="drink" className="section">
          <Reveal>
            <div className="drink glass">
              <div className="drink-cup" aria-hidden="true">
                <Icon name="glass" size={44} />
                <i /><i /><i /><i />
              </div>
              <div className="drink-text">
                <h2>Buy me a drink</h2>
                <p>If you've enjoyed anything here, you can buy me a drink. Completely optional, and thank you.</p>
              </div>
              <a className="revolut-btn" href={drink.url} target="_blank" rel="noopener noreferrer" aria-label={`Buy me a drink: send ${drink.amountLabel} on Revolut (opens in a new tab)`}>
                <span className="rv-badge">
                  <Icon name="revolut" size={19} />
                </span>
                <span className="rv-text">
                  <strong>Send with Revolut</strong>
                  <small>{drink.amountLabel} · opens Revolut</small>
                </span>
                <span className="rv-go">
                  <Icon name="out" size={16} />
                </span>
              </a>
            </div>
          </Reveal>
        </section>

        {/* ================= TOP ================= */}
        <section id="top" className="section">
          <SectionHead title="My top music" text="Switch the time period to compare." />
          <Reveal>
            <TopCharts />
          </Reveal>
        </section>

        {/* ================= TASTE (poster + album wall) ================= */}
        {(posterRows.length > 0 || wall.length > 0) && (
          <section id="taste" className="section">
            <SectionHead title="My music taste" text="Made live from my Spotify. Hover the covers." />
            <div className="taste-grid">
              <Reveal>
                <TastePoster rows={posterRows} mode={posterMode} />
              </Reveal>
              <Reveal delay={120}>
                <AlbumWall items={wall} />
              </Reveal>
            </div>
          </section>
        )}

        {/* ================= GALLERY (photos + videos) ================= */}
        <section id="gallery" className="section">
          <SectionHead title="Gallery" />
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
        <BigTitle />
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
