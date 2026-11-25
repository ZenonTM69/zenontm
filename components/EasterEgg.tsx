"use client";
import { useEffect, useRef, useState } from "react";

// SECRET MODE
// Type "zenon" on a keyboard (or tap the giant ZENONTM at the bottom 5 times on a phone):
// the whole site flips to inverted colours (black becomes white, lime becomes deep purple),
// the stickers get flung around and a little sound plays. Do it again to go back.

const WORD = "zenon";

function zap() {
  try {
    if (localStorage.getItem("zenontm-sound") === "off") return;
  } catch {}
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const t = ctx.currentTime + 0.02;
  const out = ctx.createGain();
  out.gain.value = 0.18;
  out.connect(ctx.destination);
  // quick rising arcade arpeggio
  [392, 523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "square";
    o.frequency.value = f;
    const s = t + i * 0.07;
    g.gain.setValueAtTime(0.0001, s);
    g.gain.exponentialRampToValueAtTime(0.5, s + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, s + 0.16);
    o.connect(g).connect(out);
    o.start(s);
    o.stop(s + 0.2);
  });
  setTimeout(() => ctx.close().catch(() => {}), 1200);
}

export default function EasterEgg() {
  const [on, setOn] = useState(false);
  const [toast, setToast] = useState(0);
  const typed = useRef("");
  const taps = useRef<number[]>([]);
  const onRef = useRef(false);

  useEffect(() => {
    const toggle = () => {
      onRef.current = !onRef.current;
      document.documentElement.classList.toggle("secret", onRef.current);
      setOn(onRef.current);
      setToast(Date.now());
      window.dispatchEvent(new Event("zt-secret"));
      zap();
    };
    const key = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, [contenteditable]")) return;
      typed.current = (typed.current + e.key.toLowerCase()).slice(-WORD.length);
      if (typed.current === WORD) {
        typed.current = "";
        toggle();
      }
    };
    const tap = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest("[data-secret-tap]")) return;
      const now = Date.now();
      taps.current = [...taps.current.filter((x) => now - x < 2000), now];
      if (taps.current.length >= 5) {
        taps.current = [];
        toggle();
      }
    };
    window.addEventListener("keydown", key);
    window.addEventListener("pointerdown", tap);
    return () => {
      window.removeEventListener("keydown", key);
      window.removeEventListener("pointerdown", tap);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(0), 3200);
    return () => clearTimeout(id);
  }, [toast]);

  return toast ? (
    <div className="secret-toast" role="status" key={toast}>
      {on ? "SECRET MODE ON · do it again to go back" : "SECRET MODE OFF"}
    </div>
  ) : null;
}
