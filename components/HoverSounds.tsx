"use client";
import { useEffect } from "react";
import { tick, tock } from "@/lib/sfx";

// Soft ticks when the mouse moves onto buttons and links, and a "tock" when one is pressed.
// Follows the speaker button (mute = silence).
export default function HoverSounds() {
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    let current: Element | null = null;
    let last = 0;
    const over = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const el = (e.target as Element).closest("a, button, [data-stk], .vinyl");
      if (el === current) return;
      current = el;
      const now = performance.now();
      if (el && now - last > 45) {
        last = now;
        tick();
      }
    };
    const down = (e: PointerEvent) => {
      if ((e.target as Element).closest("a, button")) tock();
    };
    if (fine) document.addEventListener("pointerover", over);
    document.addEventListener("pointerdown", down);
    return () => {
      document.removeEventListener("pointerover", over);
      document.removeEventListener("pointerdown", down);
    };
  }, []);
  return null;
}
