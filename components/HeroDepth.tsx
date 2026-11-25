"use client";
import { useEffect } from "react";

// Two effects on the first screen:
// 1. DEPTH – on a computer, the title, photo and stickers shift at different speeds as the
//    mouse moves, so the screen feels 3D. (--px / --py, from -1 to 1)
// 2. SCROLL-APART – as you scroll down, the ZENONTM letters spread apart and fade while the
//    photo sinks away, like the title is breaking up as you leave. (--sp, from 0 to 1)
// Both are switched off for people who prefer reduced motion.

export default function HeroDepth() {
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>(".hero");
    if (!hero || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
    const loop = () => {
      x += (tx - x) * 0.08;
      y += (ty - y) * 0.08;
      hero.style.setProperty("--px", x.toFixed(4));
      hero.style.setProperty("--py", y.toFixed(4));
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.001 ? requestAnimationFrame(loop) : 0;
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      tx = (e.clientX / window.innerWidth) * 2 - 1;
      ty = (e.clientY / window.innerHeight) * 2 - 1;
      if (!raf) raf = requestAnimationFrame(loop);
    };

    let sraf = 0;
    const scroll = () => {
      if (sraf) return;
      sraf = requestAnimationFrame(() => {
        sraf = 0;
        const p = Math.min(1, Math.max(0, window.scrollY / (hero.offsetHeight * 0.75)));
        hero.style.setProperty("--sp", p.toFixed(4));
      });
    };

    if (fine) window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("scroll", scroll, { passive: true });
    scroll();
    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(sraf);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", scroll);
    };
  }, []);
  return null;
}
