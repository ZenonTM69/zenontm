"use client";
import { useEffect, useRef } from "react";
import PhotoRipple from "./PhotoRipple";

// The giant ZENONTM title with the cut-out photo standing in front of it.
// On a computer, letters near the mouse lift up (turned off for people who prefer reduced motion).
const TEXT = "ZENONTM";

export default function HeroTitle({ photo, photoAlt }: { photo: string; photoAlt: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || calm) return;

    const letters = Array.from(el.querySelectorAll<HTMLElement>(".ht-l"));
    let frame = 0;
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        letters.forEach((l, i) => {
          const r = l.getBoundingClientRect();
          const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
          const f = Math.max(0, 1 - d / 320);
          el.style.setProperty(`--l${i}`, `${(-f * f * 18).toFixed(1)}px`);
        });
      });
    };
    const reset = () => letters.forEach((_, i) => el.style.setProperty(`--l${i}`, "0px"));
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", reset);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", reset);
    };
  }, []);

  return (
    <div className="hero-title" ref={ref}>
      <h1 className="ht-solid" aria-label="ZenonTM">
        {TEXT.split("").map((c, i) => (
          <span key={i} aria-hidden="true" className={`ht-l${i >= 5 ? " ht-tm" : ""}`} style={{ transform: `translateY(var(--l${i}, 0px)) rotate(calc(var(--fr, 0deg) * var(--q, 0)))`, ["--n" as string]: i }}>
            {c}
          </span>
        ))}
      </h1>
      <PhotoRipple src={photo} alt={photoAlt} />
    </div>
  );
}
