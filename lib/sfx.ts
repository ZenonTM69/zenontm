// Tiny sound effects made live in the browser (no audio files).
// Everything here respects the speaker button: if sound is off, nothing plays.
// Browsers only allow sound after the visitor has clicked/tapped/pressed a key,
// so nothing plays before that.

let ctx: AudioContext | null = null;
let unlocked = false;

if (typeof window !== "undefined") {
  const unlock = () => {
    unlocked = true;
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  };
  window.addEventListener("pointerdown", unlock);
  window.addEventListener("keydown", unlock);
}

export function soundOn() {
  try {
    return localStorage.getItem("zenontm-sound") !== "off";
  } catch {
    return true;
  }
}

function audio(): AudioContext | null {
  if (!unlocked || !soundOn()) return null;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx ??= new AC();
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

function blip(type: OscillatorType, from: number, to: number, length: number, volume: number) {
  const c = audio();
  if (!c) return;
  const t = c.currentTime;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(from, t);
  o.frequency.exponentialRampToValueAtTime(to, t + length * 0.7);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(volume, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + length);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + length + 0.02);
}

/** soft tick when the mouse moves onto a button or link */
export const tick = () => blip("sine", 2400, 1800, 0.035, 0.035);
/** firmer "tock" when something is pressed */
export const tock = () => blip("triangle", 520, 260, 0.08, 0.09);
/** bubbly pop for the click bursts */
export const pop = () => blip("triangle", 420 + Math.random() * 200, 1400 + Math.random() * 400, 0.12, 0.12);
/** little swoosh for switching colours / tools */
export const swoosh = () => blip("sine", 300, 1200, 0.18, 0.08);
