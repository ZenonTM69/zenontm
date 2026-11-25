"use client";
import { useEffect, useRef, useState } from "react";

// The cut-out photo on the first screen. On a computer, moving the mouse over it sends
// ripples through the picture like water, with a slight colour split at the wave edge.
// Drawn with WebGL; if WebGL isn't available (or on phones / reduced motion) the normal photo shows.

const MAX = 10; // ripples alive at once

const VERT = `
attribute vec2 p;
varying vec2 uv;
void main() { uv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `
precision mediump float;
uniform sampler2D img;
uniform float t;
uniform float aspect;
uniform vec3 drops[${MAX}];
varying vec2 uv;
void main() {
  vec2 off = vec2(0.0);
  for (int i = 0; i < ${MAX}; i++) {
    vec3 d = drops[i];
    float age = t - d.z;
    if (age < 0.0 || age > 2.0) continue;
    vec2 dv = uv - d.xy;
    dv.x *= aspect;
    float dist = length(dv);
    float front = age * 0.45;
    float ring = exp(-pow((dist - front) * 16.0, 2.0));
    float amp = ring * exp(-age * 2.0) * 0.045 * sin(dist * 70.0 - age * 16.0);
    off += (dist > 0.0001 ? dv / dist : vec2(0.0)) * amp;
  }
  vec4 c = texture2D(img, uv + off);
  float r = texture2D(img, uv + off * 2.2).r;
  float b = texture2D(img, uv - off * 1.2).b;
  gl_FragColor = vec4(r, c.g, b, c.a);
}`;

export default function PhotoRipple({ src, alt }: { src: string; alt: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [gl, setGl] = useState(false);

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || calm) return;
    const g = c.getContext("webgl", { premultipliedAlpha: false, alpha: true, antialias: false });
    if (!g) return;

    const shader = (type: number, code: string) => {
      const s = g.createShader(type)!;
      g.shaderSource(s, code);
      g.compileShader(s);
      return g.getShaderParameter(s, g.COMPILE_STATUS) ? s : null;
    };
    const vs = shader(g.VERTEX_SHADER, VERT), fs = shader(g.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = g.createProgram()!;
    g.attachShader(prog, vs);
    g.attachShader(prog, fs);
    g.linkProgram(prog);
    if (!g.getProgramParameter(prog, g.LINK_STATUS)) return;
    g.useProgram(prog);

    const buf = g.createBuffer();
    g.bindBuffer(g.ARRAY_BUFFER, buf);
    g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), g.STATIC_DRAW);
    const loc = g.getAttribLocation(prog, "p");
    g.enableVertexAttribArray(loc);
    g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);
    const uT = g.getUniformLocation(prog, "t");
    const uAspect = g.getUniformLocation(prog, "aspect");
    const uDrops = g.getUniformLocation(prog, "drops");

    const drops = new Float32Array(MAX * 3).fill(-10);
    let next = 0;
    const t0 = performance.now();
    const now = () => (performance.now() - t0) / 1000;
    let raf = 0, ready = false, lastAdd = 0, lx = -1, ly = -1;

    const size = () => {
      const r = c.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      c.width = Math.max(1, Math.round(r.width * dpr));
      c.height = Math.max(1, Math.round(r.height * dpr));
      g.viewport(0, 0, c.width, c.height);
      g.uniform1f(uAspect, r.width / Math.max(1, r.height));
      render();
    };
    const render = () => {
      if (!ready) return;
      g.uniform1f(uT, now());
      g.uniform3fv(uDrops, drops);
      g.clearColor(0, 0, 0, 0);
      g.clear(g.COLOR_BUFFER_BIT);
      g.drawArrays(g.TRIANGLE_STRIP, 0, 4);
    };
    const loop = () => {
      render();
      const alive = Array.from({ length: MAX }, (_, i) => now() - drops[i * 3 + 2]).some((a) => a < 2);
      raf = alive ? requestAnimationFrame(loop) : 0;
    };
    const add = (x: number, y: number) => {
      drops.set([x, y, now()], next * 3);
      next = (next + 1) % MAX;
      if (!raf) raf = requestAnimationFrame(loop);
    };

    // The photo ignores the mouse itself (so the title stays hoverable), so we watch the hero.
    const hero = c.closest(".hero") ?? document;
    const move = (e: Event) => {
      const pe = e as PointerEvent;
      if (pe.pointerType !== "mouse" || !ready) return;
      const r = c.getBoundingClientRect();
      const x = (pe.clientX - r.left) / r.width, y = 1 - (pe.clientY - r.top) / r.height;
      if (x < 0 || x > 1 || y < 0 || y > 1) return;
      const t = performance.now();
      if (t - lastAdd < 70 || Math.hypot(pe.clientX - lx, pe.clientY - ly) < 14) return;
      lastAdd = t;
      lx = pe.clientX;
      ly = pe.clientY;
      add(x, y);
    };

    const img = new Image();
    img.onload = () => {
      const tex = g.createTexture();
      g.bindTexture(g.TEXTURE_2D, tex);
      g.pixelStorei(g.UNPACK_FLIP_Y_WEBGL, true);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.LINEAR);
      g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, g.RGBA, g.UNSIGNED_BYTE, img);
      ready = true;
      setGl(true);
      size();
    };
    img.src = src;

    const ro = new ResizeObserver(size);
    ro.observe(c);
    hero.addEventListener("pointermove", move);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      hero.removeEventListener("pointermove", move);
    };
  }, [src]);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={`ht-photo${gl ? " is-hidden" : ""}`} src={src} alt={alt} />
      <canvas ref={canvas} className={`ht-photo ht-gl${gl ? " is-ready" : ""}`} aria-hidden="true" />
    </>
  );
}
