"use client";
import { useEffect } from "react";

// Buttons gently pull towards the mouse when it gets close, then spring back.
// Computers with a mouse only; off for people who prefer reduced motion.
const SELECTOR = ".soc-chip, .nav-socials, .to-top, .btn-spotify, .sound-toggle";
const REACH = 40; // how far (px) outside a button the pull starts
const STRENGTH = 0.22;
const MAX_X = 7; // furthest a button can move (px) – smaller than the gap between buttons
const MAX_Y = 6;

export default function Magnetic() {
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || calm) return;

    type S = { x: number; y: number; tx: number; ty: number };
    const state = new Map<HTMLElement, S>();
    let mx = -9999, my = -9999, raf = 0;

    const loop = () => {
      let busy = false;
      const els = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR));
      // Only the ONE button nearest the mouse is pulled, so neighbours never collide.
      let nearest: HTMLElement | null = null, best = Infinity;
      const info = els.map((el) => {
        const s = state.get(el) ?? { x: 0, y: 0, tx: 0, ty: 0 };
        state.set(el, s);
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2 - s.x, cy = r.top + r.height / 2 - s.y; // centre without the pull
        const dx = mx - cx, dy = my - cy;
        const inside = Math.abs(dx) < r.width / 2 + REACH && Math.abs(dy) < r.height / 2 + REACH;
        const dist = Math.hypot(dx / r.width, dy / r.height);
        if (inside && dist < best) { best = dist; nearest = el; }
        return { el, s, dx, dy };
      });
      info.forEach(({ el, s, dx, dy }) => {
        const on = el === nearest;
        s.tx = on ? Math.max(-MAX_X, Math.min(MAX_X, dx * STRENGTH)) : 0;
        s.ty = on ? Math.max(-MAX_Y, Math.min(MAX_Y, dy * STRENGTH)) : 0;
        s.x += (s.tx - s.x) * 0.18;
        s.y += (s.ty - s.y) * 0.18;
        if (Math.abs(s.tx - s.x) > 0.1 || Math.abs(s.ty - s.y) > 0.1) busy = true;
        el.style.translate = Math.abs(s.x) + Math.abs(s.y) < 0.05 ? "" : `${s.x.toFixed(2)}px ${s.y.toFixed(2)}px`;
      });
      raf = busy ? requestAnimationFrame(loop) : 0;
    };
    const move = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const leave = () => {
      mx = my = -9999;
      if (!raf) raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    window.addEventListener("scroll", leave, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      window.removeEventListener("scroll", leave);
      state.forEach((_, el) => (el.style.translate = ""));
    };
  }, []);
  return null;
}
