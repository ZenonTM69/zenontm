"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

// The first thing a visitor sees: a black screen with a big counter running 000 → 100,
// then the screen lifts away with a lime band and the opening animation plays underneath.
// While it's showing, every other animation on the page waits (see "LOADER" in globals.css).
// Shown once per visit (reloading in the same tab skips it). Skipped for reduced motion.

const useIso = typeof window !== "undefined" ? useLayoutEffect : useEffect;
const KEY = "zt-loaded";
const DURATION = 1150;
const HOLD = 550; // how long it sits on 69% ("haha nice")

export default function Preloader() {
  const [state, setState] = useState<"on" | "out" | "gone">("on");
  const count = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);

  // Only READ the "already seen" flag here. It's saved once the count has finished (below) –
  // saving it here made a second run of this code (React does that) skip the loader entirely.
  useIso(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(KEY) === "1";
    } catch {}
    if (seen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) setState("gone");
  }, []);

  useEffect(() => {
    if (state !== "on") return;
    const start = performance.now();
    let raf = 0;
    const ease = (t: number) => 1 - Math.pow(1 - t, 2.2);
    // the moment (0–1) the count reaches 69 – it stops there for HOLD ms and says NICE
    const hitAt = (1 - Math.pow(1 - 0.69, 1 / 2.2)) * DURATION;
    const tick = (now: number) => {
      const e = Math.max(0, now - start); // never below 0 (no "-14%")
      const holding = e >= hitAt && e < hitAt + HOLD;
      const t = Math.min(1, (holding ? hitAt : e < hitAt ? e : e - HOLD) / DURATION);
      const eased = holding ? 0.69 : ease(t);
      const n = Math.round(eased * 100);
      if (count.current) count.current.textContent = String(n).padStart(3, "0");
      if (bar.current) bar.current.style.transform = `scaleX(${eased})`;
      if (root.current) root.current.toggleAttribute("data-nice", holding);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setTimeout(() => setState("out"), 120);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [state]);

  useEffect(() => {
    if (state !== "out") return;
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {}
    const id = setTimeout(() => setState("gone"), 1000);
    return () => clearTimeout(id);
  }, [state]);

  if (state === "gone") return null;
  return (
    <div className="preloader" data-state={state} aria-hidden="true" ref={root}>
      <div className="pl-top">
        <span>ZENONTM</span>
        <span>©{new Date().getFullYear()}</span>
      </div>
      <div className="pl-mid">
        <span className="pl-word">MUSIC</span>
        <span className="pl-word">PHOTOS</span>
        <span className="pl-word">ME</span>
      </div>
      <div className="pl-bottom">
        <span className="pl-count">
          <span ref={count}>000</span>
          <span className="pl-pct">
            %<span className="pl-nice">haha nice</span>
          </span>
        </span>
        <span className="pl-label">LOADING ZENONTM.MEME</span>
      </div>
      <div className="pl-bar" ref={bar} />
    </div>
  );
}
