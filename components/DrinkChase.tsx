"use client";
import { useEffect } from "react";

// "Buy me a drink" joke: as soon as the mouse enters the lime block, the Revolut button
// chases it around (with a bit of wobble), so it's always right under your cursor.
// Mouse leaves → it slides back home. Computers with a mouse only; off for reduced motion.
export default function DrinkChase() {
  useEffect(() => {
    const card = document.querySelector<HTMLElement>(".drink");
    const btn = card?.querySelector<HTMLElement>(".revolut-btn");
    if (!card || !btn) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || calm) return;

    let tx = 0, ty = 0, x = 0, y = 0, rot = 0, raf = 0, inside = false;

    const loop = () => {
      const px = x;
      x += (tx - x) * 0.16;
      y += (ty - y) * 0.16;
      rot += ((x - px) * 0.9 - rot) * 0.2; // leans in the direction it's moving
      rot = Math.max(-14, Math.min(14, rot));
      btn.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
      btn.style.rotate = `${rot.toFixed(2)}deg`;
      const moving = Math.abs(tx - x) + Math.abs(ty - y) > 0.3 || Math.abs(rot) > 0.1;
      raf = moving ? requestAnimationFrame(loop) : 0;
      if (!moving && !inside) {
        btn.style.translate = "";
        btn.style.rotate = "";
      }
    };
    const go = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      inside = true;
      card.classList.add("is-chasing");
      // where the button sits when it isn't moved
      const c = card.getBoundingClientRect();
      const b = btn.getBoundingClientRect();
      const homeX = b.left - x + b.width / 2, homeY = b.top - y + b.height / 2;
      // aim the button's centre at the cursor, but keep it inside the lime block
      const cx = Math.min(c.right - b.width / 2 - 8, Math.max(c.left + b.width / 2 + 8, e.clientX));
      const cy = Math.min(c.bottom - b.height / 2 - 8, Math.max(c.top + b.height / 2 + 8, e.clientY));
      tx = cx - homeX;
      ty = cy - homeY;
      go();
    };
    const leave = () => {
      inside = false;
      card.classList.remove("is-chasing");
      tx = ty = 0;
      go();
    };
    card.addEventListener("pointermove", move);
    card.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      card.removeEventListener("pointermove", move);
      card.removeEventListener("pointerleave", leave);
    };
  }, []);
  return null;
}
