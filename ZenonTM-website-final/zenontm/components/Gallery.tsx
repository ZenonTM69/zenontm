"use client";
import { useCallback, useEffect, useState } from "react";
import type { Photo } from "@/lib/site";
import Icon from "./Icons";

function PhotoFill({ p }: { p: Photo }) {
  return p.src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={p.src} alt={p.caption} loading="lazy" />
  ) : (
    <div
      className="photo-ph"
      role="img"
      aria-label={`${p.caption} (placeholder)`}
      style={{
        background: `radial-gradient(circle at 25% 20%, hsl(${p.hue} 90% 65% / .9), transparent 55%),
                     radial-gradient(circle at 80% 85%, hsl(${p.hue + 70} 90% 50% / .8), transparent 50%),
                     hsl(${p.hue} 60% 14%)`,
      }}
    />
  );
}

// Photo grid. Click a photo to open it full-screen; use arrow keys or Esc.
export default function Gallery({ photos }: { photos: Photo[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (d: number) => setOpen((i) => (i === null ? i : (i + d + photos.length) % photos.length)),
    [photos.length]
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close, step]);

  return (
    <>
      <div className="gallery">
        {photos.map((p, i) => (
          <button key={p.caption} className="photo" onClick={() => setOpen(i)} aria-label={`Open photo: ${p.caption}`}>
            <PhotoFill p={p} />
            <span className="photo-cap">
              {p.caption}
              <Icon name="expand" size={16} />
            </span>
          </button>
        ))}
      </div>

      {open !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={photos[open].caption} onClick={close}>
          <button className="lb-btn lb-close" onClick={close} aria-label="Close">
            <Icon name="close" />
          </button>
          <button className="lb-btn lb-prev" onClick={(e) => { e.stopPropagation(); step(-1); }} aria-label="Previous photo">
            <Icon name="left" />
          </button>
          <figure className="lb-figure" onClick={(e) => e.stopPropagation()} key={open}>
            <PhotoFill p={photos[open]} />
            <figcaption>
              {photos[open].caption}
              <span>
                {open + 1} / {photos.length}
              </span>
            </figcaption>
          </figure>
          <button className="lb-btn lb-next" onClick={(e) => { e.stopPropagation(); step(1); }} aria-label="Next photo">
            <Icon name="right" />
          </button>
        </div>
      )}
    </>
  );
}
