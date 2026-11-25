"use client";
import { useRef, useState } from "react";

// The vinyl record that slides out from behind the album cover while a song plays.
// Grab it and drag it round to "scratch" like a DJ – it makes a scratch sound that follows
// how fast you move (only if the site's sound is switched on). Let go and it spins again.

type Scratch = { ctx: AudioContext; src: AudioBufferSourceNode; filter: BiquadFilterNode; gain: GainNode };

function startSound(): Scratch | null {
  try {
    if (localStorage.getItem("zenontm-sound") === "off") return null;
  } catch {}
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  const ctx = new AC();
  // a short loop of rough noise that we speed up / filter as the record moves
  const buf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < d.length; i++) {
    last = last * 0.82 + (Math.random() * 2 - 1) * 0.18; // softened noise = vinyl "zip"
    d[i] = last * 3;
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 2.2;
  const gain = ctx.createGain();
  gain.gain.value = 0;
  src.connect(filter).connect(gain).connect(ctx.destination);
  src.start();
  return { ctx, src, filter, gain };
}

export default function ScratchVinyl({ label }: { label: string }) {
  const el = useRef<HTMLDivElement>(null);
  const [scratching, setScratching] = useState(false);
  const [used, setUsed] = useState(false);

  const down = (e: React.PointerEvent<HTMLDivElement>) => {
    const v = el.current;
    if (!v) return;
    e.preventDefault();
    v.setPointerCapture(e.pointerId);
    const r = v.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    // start from wherever the spin animation currently is
    const m = new DOMMatrix(getComputedStyle(v).transform);
    let angle = (Math.atan2(m.b, m.a) * 180) / Math.PI;
    let prev = (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI;
    let prevT = performance.now();
    const sound = startSound();
    setScratching(true);
    setUsed(true);
    v.style.transform = `rotate(${angle}deg)`;

    const move = (ev: PointerEvent) => {
      const a = (Math.atan2(ev.clientY - cy, ev.clientX - cx) * 180) / Math.PI;
      let delta = a - prev;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      prev = a;
      angle += delta;
      v.style.transform = `rotate(${angle}deg)`;
      const now = performance.now();
      const speed = Math.abs(delta) / Math.max(1, now - prevT); // degrees per ms
      prevT = now;
      if (sound) {
        const t = sound.ctx.currentTime;
        sound.gain.gain.setTargetAtTime(Math.min(0.5, speed * 0.25), t, 0.015);
        sound.filter.frequency.setTargetAtTime(500 + Math.min(4000, speed * 2200), t, 0.02);
        sound.src.playbackRate.setTargetAtTime((delta < 0 ? 0.6 : 1) + Math.min(2, speed * 0.8), t, 0.02);
      }
    };
    const up = () => {
      v.removeEventListener("pointermove", move);
      v.removeEventListener("pointerup", up);
      v.removeEventListener("pointercancel", up);
      v.style.transform = "";
      setScratching(false);
      if (sound) {
        sound.gain.gain.setTargetAtTime(0, sound.ctx.currentTime, 0.03);
        setTimeout(() => sound.ctx.close().catch(() => {}), 300);
      }
    };
    v.addEventListener("pointermove", move);
    v.addEventListener("pointerup", up);
    v.addEventListener("pointercancel", up);
  };

  return (
    <>
      <div
        ref={el}
        className={`vinyl${scratching ? " is-scratching" : ""}`}
        style={{ ["--label" as string]: label }}
        onPointerDown={down}
        title="Grab and drag to scratch"
      />
      {!used && <span className="scratch-hint" aria-hidden="true">SCRATCH ME ↻</span>}
    </>
  );
}
