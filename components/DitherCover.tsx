"use client";
import { useEffect, useRef, useState } from "react";

// The now-playing album cover, redrawn as chunky black + lime "dithered" pixel art.
// - When the song changes, the picture "develops" out of the black.
// - While music is playing, the pattern gently pulses.
// - Move the mouse over it (or tap it on a phone) to see the real colour cover through a lens.
// If the picture can't be processed for any reason, the normal cover simply shows instead.

const RES = 84; // how many "pixels" across – lower = chunkier
const DARK = [10, 10, 10];
// The highlight colour follows the site accent (it changes with the colour picker)
function accentRGB(): number[] {
  const v = getComputedStyle(document.documentElement).getPropertyValue("--acid").trim();
  const m = /^#?([0-9a-f]{6})$/i.exec(v);
  if (!m) return [200, 255, 46];
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// 8×8 Bayer matrix: the classic ordered-dither pattern
const BAYER = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22,
  3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21,
].map((v) => (v + 0.5) / 64);

export default function DitherCover({
  src,
  size,
  alt,
  playing,
  still = false,
  className = "",
}: {
  src: string;
  size: number; // 0 = fill the parent (square)
  alt: string;
  playing: boolean;
  still?: boolean; // true = no pulsing; stops animating once developed (used for the album wall)
  className?: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ok, setOk] = useState(false);
  const [open, setOpen] = useState(false); // tapped open on touch screens
  const playingRef = useRef(playing);
  playingRef.current = playing;

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    setOk(false);
    let lum: Float32Array | null = null;
    let raf = 0;
    let stopped = false;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const out = ctx.createImageData(RES, RES);
    let ACID = accentRGB();
    let lastBias = 0;

    const draw = (bias: number) => {
      if (!lum) return;
      lastBias = bias;
      const d = out.data;
      for (let y = 0; y < RES; y++) {
        for (let x = 0; x < RES; x++) {
          const i = y * RES + x;
          const on = lum[i] + bias > BAYER[(y & 7) * 8 + (x & 7)];
          const col = on ? ACID : DARK;
          d[i * 4] = col[0];
          d[i * 4 + 1] = col[1];
          d[i * 4 + 2] = col[2];
          d[i * 4 + 3] = 255;
        }
      }
      ctx.putImageData(out, 0, 0);
    };

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (stopped) return;
      try {
        ctx.drawImage(img, 0, 0, RES, RES);
        const px = ctx.getImageData(0, 0, RES, RES).data;
        lum = new Float32Array(RES * RES);
        for (let i = 0; i < RES * RES; i++) {
          // brightness, with a little contrast boost so covers read well in two colours
          const l = (0.2126 * px[i * 4] + 0.7152 * px[i * 4 + 1] + 0.0722 * px[i * 4 + 2]) / 255;
          lum[i] = Math.min(1, Math.max(0, (l - 0.5) * 1.35 + 0.5));
        }
      } catch {
        return; // picture couldn't be read – the normal cover stays visible
      }
      setOk(true);
      if (calm) return draw(0);
      draw(-1); // start fully dark, then develop once it is on screen
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        begin();
      }, { threshold: 0.2 });
      if (wrap.current) io.observe(wrap.current);
      cleanupIO = () => io.disconnect();
    };
    let cleanupIO = () => {};

    // "Develop" in from black, then pulse while playing (redrawn ~15 times a second)
    const begin = () => {
      const start = performance.now();
      let last = 0;
      let settled = false;
      const tick = (now: number) => {
        if (stopped) return;
        raf = requestAnimationFrame(tick);
        if (now - last < 66) return;
        last = now;
        const t = (now - start) / 900;
        if (still && t >= 1) {
          draw(0);
          cancelAnimationFrame(raf);
          return;
        }
        const idle = t >= 1 && !playingRef.current;
        if (idle && settled) return; // nothing changes while paused: skip the work
        const develop = t < 1 ? -1 + (1 - Math.pow(1 - t, 3)) : 0;
        const pulse = t >= 1 && playingRef.current ? Math.sin(now / 280) * 0.06 : 0;
        draw(develop + pulse);
        settled = idle;
      };
      raf = requestAnimationFrame(tick);
    };
    img.onerror = () => {};
    img.src = src;

    // colour picker changed: redraw in the new colour
    const recolour = () => {
      ACID = accentRGB();
      draw(lastBias);
    };
    window.addEventListener("zt-accent", recolour);

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      cleanupIO();
      window.removeEventListener("zt-accent", recolour);
    };
  }, [src]);

  // Lens that follows the mouse and shows the real colours
  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || !wrap.current) return;
    const r = wrap.current.getBoundingClientRect();
    wrap.current.style.setProperty("--x", `${e.clientX - r.left}px`);
    wrap.current.style.setProperty("--y", `${e.clientY - r.top}px`);
  };

  return (
    <div
      ref={wrap}
      className={`dither ${ok ? "is-ready" : ""} ${open ? "is-open" : ""} ${className}`}
      style={size ? { width: size, height: size } : undefined}
      onPointerMove={move}
      onClick={still ? undefined : () => setOpen((o) => !o)}
      title={still ? undefined : "Hover or tap to see the real cover"}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} width={size || 300} height={size || 300} className="dither-real" loading="lazy" />
      <canvas ref={canvas} width={RES} height={RES} className="dither-canvas" aria-hidden="true" />
    </div>
  );
}
