"use client";
import { useEffect, useRef } from "react";

// A small square that follows the mouse (next to the normal arrow, which always stays)
// and turns into a label saying what will happen: OPEN, COPY, THROW, SCRATCH…
// Computers with a mouse only; off for reduced motion.

function labelFor(el: Element | null): string {
  if (!el) return "";
  if (el.closest(".draw-layer.is-on")) return "DRAW";
  if (el.closest("[data-stk]")) return "THROW";
  if (el.closest(".vinyl")) return "SCRATCH";
  if (el.closest(".wall-tile")) return "OPEN ↗";
  if (el.closest(".dither")) return "LOOK";
  if (el.closest(".big-title")) return "STRETCH";
  if (el.closest(".ht-solid")) return "HI :)";
  if (el.closest(".social-copy, button[aria-label^='Copy']")) return "COPY";
  if (el.closest("a[target='_blank']")) return "OPEN ↗";
  if (el.closest("a")) return "GO";
  if (el.closest("button")) return "PRESS";
  return "";
}

export default function SmartCursor() {
  const box = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || calm) return;
    let tx = -100, ty = -100, x = -100, y = -100, raf = 0, label = "";

    const loop = () => {
      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.2 ? requestAnimationFrame(loop) : 0;
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      tx = e.clientX + 14;
      ty = e.clientY + 16;
      el.classList.add("is-on");
      const next = labelFor(e.target as Element);
      if (next !== label) {
        label = next;
        if (text.current) text.current.textContent = next;
        el.classList.toggle("has-label", Boolean(next));
      }
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const leave = () => el.classList.remove("is-on");
    const down = () => el.classList.add("is-down");
    const up = () => el.classList.remove("is-down");
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  return (
    <div className="smart-cursor" ref={box} aria-hidden="true">
      <span ref={text} />
    </div>
  );
}
