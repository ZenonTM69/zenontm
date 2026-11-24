"use client";
import { useEffect, useRef } from "react";

/**
 * The animated background (glowing orbs, grid, cursor glow) plus two
 * site-wide mouse effects:
 *  - `.spot`  cards get a glowing border that follows the cursor
 *  - `.tilt`  cards lean slightly toward the cursor in 3D
 * Effects only run on devices with a real mouse, and not for people who
 * asked their system for reduced motion.
 */
export default function Background() {
  const glow = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine) return;

    let lastTilt: HTMLElement | null = null;
    let frame = 0;

    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (glow.current) {
          glow.current.style.transform = `translate(${e.clientX - 250}px, ${e.clientY - 250}px)`;
        }
        const target = e.target as Element | null;

        const spot = target?.closest?.(".spot") as HTMLElement | null;
        if (spot) {
          const r = spot.getBoundingClientRect();
          spot.style.setProperty("--mx", `${e.clientX - r.left}px`);
          spot.style.setProperty("--my", `${e.clientY - r.top}px`);
        }

        if (calm) return;
        const tilt = target?.closest?.(".tilt") as HTMLElement | null;
        if (lastTilt && lastTilt !== tilt) {
          lastTilt.style.setProperty("--rx", "0deg");
          lastTilt.style.setProperty("--ry", "0deg");
        }
        if (tilt) {
          const r = tilt.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          tilt.style.setProperty("--rx", `${(-y * 8).toFixed(2)}deg`);
          tilt.style.setProperty("--ry", `${(x * 8).toFixed(2)}deg`);
        }
        lastTilt = tilt;
      });
    };

    const onLeave = () => {
      if (lastTilt) {
        lastTilt.style.setProperty("--rx", "0deg");
        lastTilt.style.setProperty("--ry", "0deg");
        lastTilt = null;
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div className="bg" aria-hidden="true">
      <div className="orb orb-a" />
      <div className="orb orb-b" />
      <div className="orb orb-c" />
      <div className="grid-overlay" />
      <div className="noise" />
      <div className="cursor-glow" ref={glow} />
    </div>
  );
}
