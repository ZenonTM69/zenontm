"use client";
import { useEffect } from "react";
import { pop } from "@/lib/sfx";

// Click (or tap) on any empty part of the page and a little burst of lime shapes pops out,
// with a tiny "pop" sound (only if the opening sound is switched on).
// Clicking links, buttons, stickers etc. works normally and doesn't burst.

const SKIP = "a, button, input, textarea, select, label, [data-stk], .dither, .vinyl, .big-title, .preloader, .draw-layer, .tool-dock, .draw-bar";
const SHAPES = ["sq", "dot", "plus", "tri"];

export default function ClickBurst() {
  useEffect(() => {
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const layer = document.createElement("div");
    layer.className = "burst-layer";
    layer.setAttribute("aria-hidden", "true");
    document.body.appendChild(layer);

    const click = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest(SKIP) || window.getSelection()?.toString()) return;
      pop();
      if (calm) return;
      const ring = document.createElement("i");
      ring.className = "burst-ring";
      ring.style.left = `${e.clientX}px`;
      ring.style.top = `${e.clientY}px`;
      layer.appendChild(ring);
      for (let i = 0; i < 12; i++) {
        const p = document.createElement("i");
        const a = (i / 12) * Math.PI * 2 + Math.random() * 0.4;
        const d = 50 + Math.random() * 90;
        p.className = `burst-p bp-${SHAPES[i % SHAPES.length]}${Math.random() < 0.3 ? " bp-white" : ""}`;
        p.style.left = `${e.clientX}px`;
        p.style.top = `${e.clientY}px`;
        p.style.setProperty("--dx", `${Math.cos(a) * d}px`);
        p.style.setProperty("--dy", `${Math.sin(a) * d}px`);
        p.style.setProperty("--rot", `${(Math.random() - 0.5) * 540}deg`);
        p.style.setProperty("--s", `${0.6 + Math.random() * 0.9}`);
        layer.appendChild(p);
      }
      setTimeout(() => {
        while (layer.childElementCount > 120) layer.firstChild?.remove();
      }, 0);
      setTimeout(() => {
        Array.from(layer.children).slice(0, 13).forEach((n) => n.remove());
      }, 900);
    };
    window.addEventListener("click", click);
    return () => {
      window.removeEventListener("click", click);
      layer.remove();
    };
  }, []);
  return null;
}
