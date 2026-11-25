"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Logo from "./Logo";

// Stickers on the first screen that visitors can grab, throw and bounce off the edges.
// Pure decoration (hidden from screen readers). The "now playing" sticker only appears
// when Spotify really says a song is playing – it reuses the data LiveStatus already loads.

type NowPlaying = { playing?: boolean; isPlaying?: boolean; track?: { title: string; artists: string } };

type Body = { x: number; y: number; vx: number; vy: number; rot: number; vr: number; w: number; h: number };

const Star = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%">
    <path d="M50 3l13 31 33 3-25 22 8 33-29-18-29 18 8-33L4 37l33-3z" style={{ fill: "var(--acid)" }} stroke="#0a0a0a" strokeWidth="4" strokeLinejoin="round" />
  </svg>
);
const Smiley = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%">
    <circle cx="50" cy="50" r="46" fill="#f2f2f0" stroke="#0a0a0a" strokeWidth="4" />
    <circle cx="35" cy="40" r="6" fill="#0a0a0a" />
    <circle cx="65" cy="40" r="6" fill="#0a0a0a" />
    <path d="M28 60q22 22 44 0" fill="none" stroke="#0a0a0a" strokeWidth="6" strokeLinecap="round" />
  </svg>
);
const Bolt = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%">
    <path d="M58 4L16 58h28l-8 38 46-56H54z" style={{ fill: "var(--acid)" }} stroke="#0a0a0a" strokeWidth="4" strokeLinejoin="round" />
  </svg>
);
const Arrow = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%">
    <rect x="4" y="4" width="92" height="92" fill="#0a0a0a" stroke="#f2f2f0" strokeWidth="5" />
    <path d="M30 70L70 30M40 30h30v30" fill="none" style={{ stroke: "var(--acid)" }} strokeWidth="9" strokeLinecap="square" />
  </svg>
);

// Cut-out photo stickers (files live in /public/stickers)
const Pic = ({ src, w, h }: { src: string; w: number; h: number }) => (
  // width/height give the right shape before the picture has loaded
  // eslint-disable-next-line @next/next/no-img-element
  <img src={src} alt="" width={w} height={h} draggable={false} />
);

type Def = { id: string; at: [number, number]; atPhone: [number, number]; rot: number; cls: string; node: ReactNode; phone?: boolean };

const DEFS: Def[] = [
  { id: "logo", at: [0.27, 0.62], atPhone: [0.04, 0.3], rot: -12, cls: "stk-logo", node: <Logo size={64} tile />, phone: true },
  { id: "name", at: [0.97, 0.02], atPhone: [0.98, 0.0], rot: 6, cls: "stk-name", node: <span>ZENON™</span>, phone: true },
  { id: "star", at: [0.04, 0.04], atPhone: [0.0, 0.0], rot: 14, cls: "stk-shape", node: <Star />, phone: true },
  { id: "smile", at: [0.93, 0.36], atPhone: [0.34, 0.35], rot: -10, cls: "stk-shape", node: <Smiley />, phone: true },
  { id: "bolt", at: [0.3, 0.0], atPhone: [0, 0], rot: -6, cls: "stk-shape", node: <Bolt /> },
  { id: "arrow", at: [0.84, 0.74], atPhone: [0, 0], rot: 10, cls: "stk-shape stk-small", node: <Arrow /> },
  { id: "fred", at: [0.0, 0.72], atPhone: [0.29, 0.0], rot: -7, cls: "stk-photo stk-fred", node: <Pic src="/stickers/fred.webp" w={742} h={420} />, phone: true },
  { id: "sam", at: [1.0, 0.72], atPhone: [0, 0], rot: 6, cls: "stk-photo stk-sam", node: <Pic src="/stickers/sam.webp" w={560} h={313} /> },
  { id: "cat", at: [0.13, 0.0], atPhone: [0.62, 0.0], rot: 9, cls: "stk-photo stk-cat", node: <Pic src="/stickers/cat.webp" w={318} h={440} />, phone: true },
  { id: "brain", at: [0.8, 0.0], atPhone: [0, 0], rot: -5, cls: "stk-photo stk-brain", node: <Pic src="/stickers/brain.webp" w={440} h={304} /> },
];

export default function Stickers() {
  const box = useRef<HTMLDivElement>(null);
  const els = useRef<Record<string, HTMLDivElement | null>>({});
  const bodies = useRef<Record<string, Body>>({});
  const [ready, setReady] = useState(false);
  const [phone, setPhone] = useState(false);
  const [np, setNp] = useState<NowPlaying | null>(null);
  const kick = useRef<() => void>(() => {});

  // Live song from LiveStatus (no extra Spotify requests)
  useEffect(() => {
    const on = (e: Event) => setNp((e as CustomEvent<NowPlaying>).detail);
    window.addEventListener("zt-nowplaying", on);
    return () => window.removeEventListener("zt-nowplaying", on);
  }, []);
  const song = np?.playing && np.track ? np.track : null;

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const isPhone = window.matchMedia("(max-width: 760px)").matches;
    setPhone(isPhone);
    let raf = 0;
    let last = performance.now();
    let dragging: string | null = null;

    const place = () => {
      const W = el.clientWidth, H = el.clientHeight;
      Object.entries(els.current).forEach(([id, node]) => {
        if (!node) return;
        const def = DEFS.find((d) => d.id === id);
        const b = bodies.current[id];
        const w = node.offsetWidth, h = node.offsetHeight;
        if (!b) {
          const at = def ? (isPhone ? def.atPhone : def.at) : isPhone ? [0.5, 0.02] : [0.42, 0.06];
          bodies.current[id] = { x: at[0] * (W - w), y: at[1] * (H - h), vx: 0, vy: 0, rot: def?.rot ?? -4, vr: 0, w, h };
        } else {
          b.w = w;
          b.h = h;
          b.x = Math.min(Math.max(0, b.x), W - w);
          b.y = Math.min(Math.max(0, b.y), H - h);
        }
        paint(id);
      });
    };
    const paint = (id: string) => {
      const b = bodies.current[id], node = els.current[id];
      if (b && node) node.style.transform = `translate3d(${b.x}px, ${b.y}px, 0) rotate(${b.rot}deg)`;
    };

    const step = (now: number) => {
      const dt = Math.min(32, now - last) / 16.67;
      last = now;
      const W = el.clientWidth, H = el.clientHeight;
      let moving = false;
      for (const [id, b] of Object.entries(bodies.current)) {
        if (id === dragging) continue;
        if (Math.abs(b.vx) + Math.abs(b.vy) + Math.abs(b.vr) < 0.05) continue;
        moving = true;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.rot += b.vr * dt;
        const f = Math.pow(0.955, dt);
        b.vx *= f;
        b.vy *= f;
        b.vr *= Math.pow(0.93, dt);
        // bounce off the edges of the first screen
        if (b.x < 0) { b.x = 0; b.vx = Math.abs(b.vx) * 0.72; b.vr += b.vy * 0.2; }
        if (b.x > W - b.w) { b.x = W - b.w; b.vx = -Math.abs(b.vx) * 0.72; b.vr -= b.vy * 0.2; }
        if (b.y < 0) { b.y = 0; b.vy = Math.abs(b.vy) * 0.72; b.vr -= b.vx * 0.2; }
        if (b.y > H - b.h) { b.y = H - b.h; b.vy = -Math.abs(b.vy) * 0.72; b.vr += b.vx * 0.2; }
        paint(id);
      }
      raf = moving || dragging ? requestAnimationFrame(step) : 0;
    };
    const run = () => {
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(step);
      }
    };
    kick.current = run;

    // Grabbing and throwing
    const down = (e: PointerEvent) => {
      const target = (e.target as HTMLElement).closest<HTMLElement>("[data-stk]");
      if (!target) return;
      const id = target.dataset.stk!;
      const b = bodies.current[id];
      if (!b) return;
      e.preventDefault();
      target.setPointerCapture(e.pointerId);
      target.classList.add("is-grabbed");
      target.style.zIndex = String(10 + Date.now() % 1000);
      dragging = id;
      const r = el.getBoundingClientRect();
      const ox = e.clientX - r.left - b.x, oy = e.clientY - r.top - b.y;
      let px = e.clientX, py = e.clientY, pt = performance.now();
      b.vx = b.vy = 0;
      const move = (ev: PointerEvent) => {
        const W = el.clientWidth, H = el.clientHeight;
        b.x = Math.min(Math.max(0, ev.clientX - r.left - ox), W - b.w);
        b.y = Math.min(Math.max(0, ev.clientY - r.top - oy), H - b.h);
        const t = performance.now(), d = Math.max(1, t - pt) / 16.67;
        b.vx = b.vx * 0.4 + ((ev.clientX - px) / d) * 0.6;
        b.vy = b.vy * 0.4 + ((ev.clientY - py) / d) * 0.6;
        b.rot += (ev.clientX - px) * 0.08;
        px = ev.clientX; py = ev.clientY; pt = t;
        paint(id);
      };
      const up = () => {
        target.classList.remove("is-grabbed");
        target.removeEventListener("pointermove", move);
        target.removeEventListener("pointerup", up);
        target.removeEventListener("pointercancel", up);
        if (performance.now() - pt > 80) b.vx = b.vy = 0; // let go without moving = just drop it
        b.vr = b.vx * 0.35;
        dragging = null;
        run();
      };
      target.addEventListener("pointermove", move);
      target.addEventListener("pointerup", up);
      target.addEventListener("pointercancel", up);
      run();
    };

    // Secret mode (see EasterEgg.tsx): everything gets flung around
    const blast = () => {
      Object.values(bodies.current).forEach((b) => {
        b.vx = (Math.random() - 0.5) * 70;
        b.vy = (Math.random() - 0.5) * 70;
        b.vr = (Math.random() - 0.5) * 40;
      });
      run();
    };

    place();
    setReady(true);
    const ro = new ResizeObserver(place);
    ro.observe(el);
    el.addEventListener("pointerdown", down);
    window.addEventListener("zt-secret", blast);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("zt-secret", blast);
    };
  }, []);

  // Position the now-playing sticker when it first appears
  useEffect(() => {
    const el = box.current, node = els.current.song;
    if (!el || !node || !song) return;
    const W = el.clientWidth, H = el.clientHeight;
    const w = node.offsetWidth, h = node.offsetHeight;
    const b = (bodies.current.song ??= { x: 0.03 * (W - w), y: 0.42 * (H - h), vx: 0, vy: 0, rot: -5, vr: 0, w, h });
    b.w = w;
    b.h = h;
    node.style.transform = `translate3d(${b.x}px, ${b.y}px, 0) rotate(${b.rot}deg)`;
  }, [song, phone]);

  const shown = DEFS.filter((d) => !phone || d.phone);

  return (
    <div ref={box} className={`stickers ${ready ? "is-ready" : ""}`} aria-hidden="true">
      {shown.map((d, i) => (
        <div key={d.id} data-stk={d.id} ref={(n) => { els.current[d.id] = n; }} className="stk" style={{ ["--d" as string]: `${1.7 + i * 0.12}s` }}>
          <div className={`stk-in ${d.cls}`}>{d.node}</div>
        </div>
      ))}
      {song && !phone ? (
        <div data-stk="song" ref={(n) => { els.current.song = n; }} className="stk" style={{ ["--d" as string]: "2.4s" }}>
          <div className="stk-in stk-song">
            <small>{np?.isPlaying ? "♪ NOW PLAYING" : "❚❚ PAUSED"}</small>
            <b>{song.title}</b>
            <span>{song.artists}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
