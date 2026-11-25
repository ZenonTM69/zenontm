"use client";
import { useEffect, useRef } from "react";

// A huge ZENONTM across the bottom of the page.
// On a computer, letters near the mouse stretch up and turn lime.
// (Tapping it 5 times quickly is the phone way into secret mode – see EasterEgg.tsx.)
const TEXT = "ZENONTM";

export default function BigTitle() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || calm) return;
    const letters = Array.from(el.querySelectorAll<HTMLElement>(".bt-l"));
    let frame = 0;
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        letters.forEach((l) => {
          const r = l.getBoundingClientRect();
          const d = Math.abs(e.clientX - (r.left + r.width / 2));
          const f = Math.max(0, 1 - d / (r.width * 1.6));
          l.style.setProperty("--s", (1 + f * f * 0.55).toFixed(3));
          l.style.setProperty("--k", f.toFixed(3));
        });
      });
    };
    const reset = () => letters.forEach((l) => { l.style.setProperty("--s", "1"); l.style.setProperty("--k", "0"); });
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", reset);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", reset);
    };
  }, []);

  return (
    <div className="big-title" ref={ref} aria-hidden="true" data-secret-tap>
      {TEXT.split("").map((c, i) => (
        <span key={i} className={`bt-l${i >= 5 ? " bt-tm" : ""}`}>
          {c}
        </span>
      ))}
    </div>
  );
}
