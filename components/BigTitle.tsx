"use client";
import { useEffect, useRef, useState } from "react";
import { pop, tock } from "@/lib/sfx";

// A huge ZENONTM across the bottom of the page.
// - On a computer, letters near the mouse stretch up and turn lime.
// - Any letter can be grabbed and thrown (mouse or finger): it flies, bounces on the
//   floor line and springs back to its spot.
// - Visitors can type their own word into the box under it ("stretch to type").
// (Tapping it 5 times quickly is still the phone way into secret mode – see EasterEgg.tsx.)
const DEFAULT = "ZENONTM";
const MAX = 12;

// spring settings (per second): stiffer = snaps back faster, damping = less wobble
const STIFF = 90;
const DAMP = 7;

type Body = { x: number; y: number; r: number; vx: number; vy: number; vr: number; held: boolean };

export default function BigTitle() {
  const ref = useRef<HTMLDivElement>(null);
  const [word, setWord] = useState("");
  const text = (word.trim() || DEFAULT).toUpperCase();
  const isDefault = text === DEFAULT;

  // ---- hover stretch (mouse only) ----
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
  }, [text]);

  // ---- grab-and-throw physics ----
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const letters = Array.from(el.querySelectorAll<HTMLElement>(".bt-l"));
    const bodies: Body[] = letters.map(() => ({ x: 0, y: 0, r: 0, vx: 0, vy: 0, vr: 0, held: false }));
    let raf = 0;
    let last = 0;
    let lastBonk = 0;

    const paint = (i: number) => {
      const b = bodies[i];
      letters[i].style.transform =
        b.x || b.y || b.r ? `translate(${b.x.toFixed(1)}px, ${b.y.toFixed(1)}px) rotate(${b.r.toFixed(2)}deg)` : "";
    };

    const step = (t: number) => {
      const dt = Math.min(0.032, (t - (last || t)) / 1000) || 0.016;
      last = t;
      let moving = false;
      bodies.forEach((b, i) => {
        if (b.held) { moving = true; return; }
        // spring pulls each letter home, damping calms it down
        b.vx += (-STIFF * b.x - DAMP * b.vx) * dt;
        b.vy += (-STIFF * b.y - DAMP * b.vy) * dt;
        b.vr += (-STIFF * b.r - DAMP * b.vr) * dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.r += b.vr * dt;
        // the line under the letters is the floor: bounce off it
        if (b.y > 0 && b.vy > 0) {
          if (b.vy > 250 && t - lastBonk > 90) { tock(); lastBonk = t; }
          b.y = 0;
          b.vy *= -0.45;
          b.vr += b.vx * 0.02;
        }
        const still = Math.abs(b.x) + Math.abs(b.y) + Math.abs(b.r) < 0.3 &&
          Math.abs(b.vx) + Math.abs(b.vy) + Math.abs(b.vr) < 3;
        if (still) { b.x = b.y = b.r = b.vx = b.vy = b.vr = 0; } else moving = true;
        paint(i);
      });
      raf = moving ? requestAnimationFrame(step) : 0;
      if (!raf) last = 0;
    };
    const wake = () => { if (!raf) raf = requestAnimationFrame(step); };

    const cleanups = letters.map((l, i) => {
      const down = (e: PointerEvent) => {
        if (e.button !== 0) return;
        const b = bodies[i];
        const sx = e.clientX - b.x, sy = e.clientY - b.y;
        let px = e.clientX, py = e.clientY, pt = performance.now();
        let moved = false;
        b.held = true;
        b.vx = b.vy = b.vr = 0;
        l.setPointerCapture(e.pointerId);
        l.classList.add("is-held");
        wake();

        const move = (m: PointerEvent) => {
          const now = performance.now();
          const dt = Math.max(1, now - pt) / 1000;
          if (!moved && Math.hypot(m.clientX - e.clientX, m.clientY - e.clientY) > 4) { moved = true; pop(); }
          // remember how fast the pointer is going, so letting go throws the letter
          b.vx = b.vx * 0.5 + ((m.clientX - px) / dt) * 0.5;
          b.vy = b.vy * 0.5 + ((m.clientY - py) / dt) * 0.5;
          px = m.clientX; py = m.clientY; pt = now;
          b.x = m.clientX - sx;
          b.y = Math.min(0, m.clientY - sy); // can't push it through the floor
          b.r = Math.max(-35, Math.min(35, b.vx * 0.02));
          paint(i);
        };
        const up = () => {
          b.held = false;
          const cap = (v: number) => Math.max(-2800, Math.min(2800, v));
          b.vx = cap(b.vx); b.vy = cap(b.vy);
          b.vr = b.vx * 0.15;
          // a quick tap shouldn't fire it across the screen
          if (!moved) { b.vx = b.vy = b.vr = 0; }
          l.classList.remove("is-held");
          l.removeEventListener("pointermove", move);
          l.removeEventListener("pointerup", up);
          l.removeEventListener("pointercancel", up);
          wake();
        };
        l.addEventListener("pointermove", move);
        l.addEventListener("pointerup", up);
        l.addEventListener("pointercancel", up);
      };
      l.addEventListener("pointerdown", down);
      return () => l.removeEventListener("pointerdown", down);
    });

    return () => {
      cancelAnimationFrame(raf);
      cleanups.forEach((c) => c());
      letters.forEach((l) => { l.style.transform = ""; });
    };
  }, [text]);

  const chars = Array.from(text);
  // shrink longer words so they still fit across the screen
  const fit = Math.min(1, DEFAULT.length / Math.max(chars.length, 1));

  return (
    <>
      <div
        className="big-title"
        ref={ref}
        aria-hidden="true"
        data-secret-tap
        style={{ ["--fit" as string]: fit.toFixed(3) }}
      >
        {chars.map((c, i) => (
          <span key={`${text}-${i}`} className={`bt-l${isDefault && i >= 5 ? " bt-tm" : ""}`}>
            {c === " " ? " " : c}
          </span>
        ))}
      </div>
      <div className="bt-type">
        <label htmlFor="bt-input">Write your own</label>
        <input
          id="bt-input"
          type="text"
          value={word}
          maxLength={MAX}
          placeholder={DEFAULT}
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => setWord(e.target.value.replace(/[^\p{L}\p{N} !?&.'-]/gu, "").slice(0, MAX))}
        />
        {word && (
          <button type="button" onClick={() => setWord("")} aria-label="Put ZENONTM back">
            ↺
          </button>
        )}
      </div>
    </>
  );
}
