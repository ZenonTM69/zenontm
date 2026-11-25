"use client";
import { useEffect, useRef, useState } from "react";
import Icon from "./Icons";
import { swoosh } from "@/lib/sfx";

// Two tool buttons stacked above the speaker button (bottom-left):
// ✏️  DRAW  – scribble all over the site in the accent colour (just for you; gone when you leave)
// 🎨 COLOUR – swap the site's lime for another acid colour (remembered on this device)

export const ACCENTS = [
  { name: "Lime", value: "#c8ff2e" },
  { name: "Pink", value: "#ff4fa3" },
  { name: "Orange", value: "#ff7a1a" },
  { name: "Cyan", value: "#31e6ff" },
  { name: "Yellow", value: "#ffe14a" },
];

type Stroke = { color: string; pts: number[] }; // points stored in page coordinates [x, y, x, y…]

export default function Tools() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Stroke[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [hasInk, setHasInk] = useState(false);
  const [palette, setPalette] = useState(false);
  const [accent, setAccent] = useState(ACCENTS[0].value);

  // remember the colour choice
  useEffect(() => {
    try {
      const saved = localStorage.getItem("zt-accent");
      if (saved && ACCENTS.some((a) => a.value === saved)) setAccent(saved);
    } catch {}
  }, []);

  const pickColour = (value: string) => {
    setAccent(value);
    setPalette(false);
    document.documentElement.style.setProperty("--acid", value);
    try {
      localStorage.setItem("zt-accent", value);
    } catch {}
    window.dispatchEvent(new Event("zt-accent"));
    swoosh();
  };

  // ---------- drawing ----------
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    let raf = 0;

    const size = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      c.width = window.innerWidth * dpr;
      c.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      redraw();
    };
    const redraw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = 6;
      const sx = window.scrollX, sy = window.scrollY;
      for (const s of strokes.current) {
        const p = s.pts;
        if (p.length < 4) continue;
        ctx.strokeStyle = s.color;
        ctx.beginPath();
        ctx.moveTo(p[0] - sx, p[1] - sy);
        for (let i = 2; i < p.length - 2; i += 2) {
          // smooth curve through the points
          const mx = (p[i] + p[i + 2]) / 2, my = (p[i + 1] + p[i + 3]) / 2;
          ctx.quadraticCurveTo(p[i] - sx, p[i + 1] - sy, mx - sx, my - sy);
        }
        ctx.lineTo(p[p.length - 2] - sx, p[p.length - 1] - sy);
        ctx.stroke();
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; redraw(); });
    };

    let current: Stroke | null = null;
    const down = (e: PointerEvent) => {
      if (!c.classList.contains("is-on")) return;
      e.preventDefault();
      c.setPointerCapture(e.pointerId);
      const col = getComputedStyle(document.documentElement).getPropertyValue("--acid").trim() || "#c8ff2e";
      current = { color: col, pts: [e.clientX + window.scrollX, e.clientY + window.scrollY] };
      strokes.current.push(current);
      setHasInk(true);
    };
    const move = (e: PointerEvent) => {
      if (!current) return;
      current.pts.push(e.clientX + window.scrollX, e.clientY + window.scrollY);
      schedule();
    };
    const up = () => (current = null);

    size();
    window.addEventListener("resize", size);
    window.addEventListener("scroll", schedule, { passive: true });
    c.addEventListener("pointerdown", down);
    c.addEventListener("pointermove", move);
    c.addEventListener("pointerup", up);
    c.addEventListener("pointercancel", up);
    const clear = () => { strokes.current = []; setHasInk(false); redraw(); };
    window.addEventListener("zt-clear-ink", clear);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
      window.removeEventListener("scroll", schedule);
      c.removeEventListener("pointerdown", down);
      c.removeEventListener("pointermove", move);
      c.removeEventListener("pointerup", up);
      c.removeEventListener("pointercancel", up);
      window.removeEventListener("zt-clear-ink", clear);
    };
  }, []);

  const toggleDraw = () => {
    setDrawing((d) => !d);
    setPalette(false);
    swoosh();
  };

  return (
    <>
      <canvas ref={canvas} className={`draw-layer${drawing ? " is-on" : ""}`} aria-hidden="true" />

      {drawing && (
        <div className="draw-bar" role="status">
          <span>DRAW MODE · scribble anywhere</span>
          {hasInk && (
            <button onClick={() => window.dispatchEvent(new Event("zt-clear-ink"))}>Clear</button>
          )}
          <button onClick={toggleDraw}>Done</button>
        </div>
      )}

      <div className="tool-dock">
        <button
          className={`tool-btn${drawing ? " is-active" : ""}`}
          onClick={toggleDraw}
          aria-pressed={drawing}
          aria-label={drawing ? "Stop drawing" : "Draw on the page"}
          title="Draw on the page"
        >
          <Icon name="pencil" size={18} />
        </button>
        <div className="tool-colour">
          <button
            className={`tool-btn${palette ? " is-active" : ""}`}
            onClick={() => setPalette((p) => !p)}
            aria-expanded={palette}
            aria-label="Change the site colour"
            title="Change the site colour"
          >
            <span className="swatch-dot" style={{ background: accent }} />
          </button>
          {palette && (
            <div className="palette" role="menu" aria-label="Site colours">
              {ACCENTS.map((a) => (
                <button
                  key={a.value}
                  role="menuitemradio"
                  aria-checked={a.value === accent}
                  aria-label={a.name}
                  title={a.name}
                  className={`swatch${a.value === accent ? " is-current" : ""}`}
                  style={{ background: a.value }}
                  onClick={() => pickColour(a.value)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
