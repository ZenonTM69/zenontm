"use client";
import { useEffect, useRef, useState } from "react";
import Icon from "./Icons";

// The opening sound: a soft whoosh, a low thump and a shimmering chord, made live in the
// browser with the Web Audio API (no audio file to download, nothing copyrighted).
//
// Browsers never let a website play sound before the visitor has tapped, clicked or pressed a key.
// So: we try straight away (works if the browser allows it), otherwise it plays on their first tap.
// The speaker button turns it off/on and the choice is remembered on that device.

const KEY = "zenontm-sound";

function makeContext(): AudioContext | null {
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  return AC ? new AC() : null;
}

// Plays the sound once on a running audio context, then shuts the context down.
function playChime(ctx: AudioContext) {
  const t = ctx.currentTime + 0.05;

  const master = ctx.createGain();
  master.gain.value = 0.22;
  // A little echo so it feels spacious
  const delay = ctx.createDelay();
  delay.delayTime.value = 0.28;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.32;
  const wet = ctx.createGain();
  wet.gain.value = 0.35;
  delay.connect(feedback).connect(delay);
  delay.connect(wet).connect(master);
  master.connect(ctx.destination);

  // 1. Whoosh: noise swept upwards through a filter
  const noise = ctx.createBuffer(1, ctx.sampleRate * 1.2, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = noise;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 1.4;
  bp.frequency.setValueAtTime(300, t);
  bp.frequency.exponentialRampToValueAtTime(3800, t + 0.9);
  const ng = ctx.createGain();
  ng.gain.setValueAtTime(0.0001, t);
  ng.gain.exponentialRampToValueAtTime(0.5, t + 0.55);
  ng.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
  src.connect(bp).connect(ng).connect(master);
  src.start(t);
  src.stop(t + 1.2);

  // 2. Low thump as the letters land
  const sub = ctx.createOscillator();
  sub.type = "sine";
  sub.frequency.setValueAtTime(90, t + 0.45);
  sub.frequency.exponentialRampToValueAtTime(38, t + 0.9);
  const sg = ctx.createGain();
  sg.gain.setValueAtTime(0.0001, t + 0.45);
  sg.gain.exponentialRampToValueAtTime(0.9, t + 0.48);
  sg.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
  sub.connect(sg).connect(master);
  sub.start(t + 0.45);
  sub.stop(t + 1.2);

  // 3. Shimmering chord, one note after another (D, A, F#, A)
  [293.66, 440, 739.99, 880].forEach((f, i) => {
    const start = t + 0.5 + i * 0.11;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(0.22 - i * 0.03, start + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, start + 2.4);
    g.connect(master);
    g.connect(delay);
    for (const [type, detune] of [["sine", 0], ["triangle", 7]] as const) {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = f;
      o.detune.value = detune;
      o.connect(g);
      o.start(start);
      o.stop(start + 2.5);
    }
  });

  setTimeout(() => ctx.close().catch(() => {}), 4500);
}

export default function IntroSound() {
  const [on, setOn] = useState(true);
  const played = useRef(false);

  useEffect(() => {
    let enabled = true;
    try {
      enabled = localStorage.getItem(KEY) !== "off";
    } catch {}
    setOn(enabled);
    if (!enabled) return;
    const ctx = makeContext();
    if (!ctx) return;

    const events = ["pointerdown", "keydown", "touchend"] as const;
    const cleanup = () => events.forEach((e) => window.removeEventListener(e, onFirst));
    const go = () => {
      cleanup();
      if (played.current) return; // already played, or the visitor turned sound off first
      played.current = true;
      playChime(ctx);
    };
    // Browsers keep audio "asleep" until the visitor interacts. The first tap/click/key wakes it.
    function onFirst(e: Event) {
      if ((e.target as Element | null)?.closest?.(".sound-toggle")) return;
      ctx!.resume().catch(() => {});
    }
    ctx.onstatechange = () => ctx.state === "running" && go();
    if (ctx.state === "running") go();
    else events.forEach((e) => window.addEventListener(e, onFirst));

    return () => {
      cleanup();
      ctx.onstatechange = null;
      if (!played.current) ctx.close().catch(() => {});
    };
  }, []);

  const toggle = () => {
    const next = !on;
    setOn(next);
    played.current = true; // the toggle itself shouldn't trigger the first-tap sound
    try {
      localStorage.setItem(KEY, next ? "on" : "off");
    } catch {}
    if (next) {
      const ctx = makeContext();
      ctx?.resume().then(() => playChime(ctx)).catch(() => {});
    }
  };

  return (
    <button
      className={`sound-toggle${on ? "" : " is-off"}`}
      onClick={toggle}
      aria-label={on ? "Turn opening sound off" : "Turn opening sound on"}
      aria-pressed={on}
      title={on ? "Sound on" : "Sound off"}
    >
      <Icon name={on ? "sound" : "muted"} size={18} />
    </button>
  );
}
