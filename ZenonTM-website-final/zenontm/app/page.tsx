import Background from "@/components/Background";
import Navbar from "@/components/Navbar";
import Clock from "@/components/Clock";
import Reveal from "@/components/Reveal";
import SpotifyCard from "@/components/SpotifyCard";
import Gallery from "@/components/Gallery";
import SocialCard from "@/components/SocialCard";
import Typewriter from "@/components/Typewriter";
import Icon from "@/components/Icons";
import { profile, socials as baseSocials, favouriteArtists, favouriteTracks, gallery } from "@/lib/site";
import { getInstagramFollowers, formatCount } from "@/lib/instagram";

// Rebuild this page in the background at most once an hour (keeps follower counts fresh).
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

export default async function Home() {
  // Live Instagram count if it's set up; otherwise the number typed in lib/site.ts.
  const igFollowers = await getInstagramFollowers();
  const socials = baseSocials.map((s) =>
    s.icon === "instagram" && igFollowers !== null ? { ...s, followers: formatCount(igFollowers) } : s
  );

  const maxPlays = parseFloat(favouriteTracks[0].plays) * (favouriteTracks[0].plays.endsWith("k") ? 1000 : 1);
  const plays = (p: string) => parseFloat(p) * (p.endsWith("k") ? 1000 : 1);

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
              <p className="intro">{profile.intro}</p>
            </Reveal>
            <Reveal delay={320}>
              <div className="hero-actions">
                <a href="#music" className="btn btn-primary">
                  What I&apos;m playing <Icon name="arrow" size={18} />
                </a>
                <a href="#connect" className="btn btn-ghost">
                  Find me online
                </a>
              </div>
            </Reveal>
            <Reveal delay={400}>
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

        {/* Scrolling artist banner */}
        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {[...favouriteArtists, ...favouriteArtists].map((a, i) => (
              <span key={i}>
                {a.name} <i>✦</i>
              </span>
            ))}
          </div>
        </div>

        {/* ================= MUSIC ================= */}
        <section id="music" className="section">
          <SectionHead index="01" eyebrow="Spotify" title="On repeat" text="What's playing right now and what played before it." />
          <Reveal>
            <SpotifyCard />
          </Reveal>
        </section>

        {/* ================= FAVOURITES ================= */}
        <section id="favourites" className="section">
          <SectionHead index="02" eyebrow="Taste" title="Favourite artists & tracks" text="The ones that never leave my rotation." />
          <div className="fav-layout">
            <div className="fav-grid">
              {favouriteArtists.map((a, i) => (
                <Reveal key={a.name} delay={i * 60}>
                  <div className="glass spot tilt artist">
                    <div
                      className="artist-orb"
                      style={{
                        background: `radial-gradient(circle at 30% 28%, hsl(${a.hue} 95% 72%), hsl(${a.hue + 45} 90% 38%) 70%)`,
                        boxShadow: `0 0 40px hsl(${a.hue} 90% 60% / .35)`,
                      }}
                    >
                      {a.name.charAt(0)}
                    </div>
                    <strong>{a.name}</strong>
                    <span>{a.genre}</span>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={120}>
              <div className="glass spot top-tracks">
                <div className="card-head">
                  <h3>Top tracks</h3>
                  <span className="chip">All time</span>
                </div>
                <ol>
                  {favouriteTracks.map((t, i) => (
                    <li key={t.title}>
                      <span className="rank">{String(i + 1).padStart(2, "0")}</span>
                      <div className="tt-text">
                        <strong>{t.title}</strong>
                        <span>{t.artist}</span>
                        <span className="tt-bar">
                          <span style={{ width: `${(plays(t.plays) / maxPlays) * 100}%` }} />
                        </span>
                      </div>
                      <span className="tt-plays">{t.plays}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>
          </div>
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
