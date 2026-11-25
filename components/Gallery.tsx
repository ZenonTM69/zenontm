"use client";
import { useCallback, useEffect, useState } from "react";
import type { Photo } from "@/lib/site";
import Icon from "./Icons";

// Photo grid. Works with any number of photos (layout changes with the count).
// Click/tap a photo to view it full-screen; arrow keys or the buttons move between photos, Esc closes.
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

  if (photos.length === 0) {
    return (
      <div className="gallery-empty">
        <span className="ge-frame" aria-hidden="true" />
        <p>No photos up yet.</p>
      </div>
    );
  }

  const layout = photos.length >= 5 ? "feature" : `n${photos.length}`;
  const current = open !== null ? photos[open] : null;

  return (
    <>
      <div className="gallery" data-layout={layout}>
        {photos.map((p, i) => (
          <button key={p.src} className="photo" onClick={() => setOpen(i)} aria-label={`Open photo${p.caption ? `: ${p.caption}` : ` ${i + 1}`}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.src} alt={p.caption ?? ""} loading="lazy" />
            <span className="photo-cap">
              <span className="photo-idx">{String(i + 1).padStart(2, "0")}</span>
              {p.caption && <span>{p.caption}</span>}
            </span>
          </button>
        ))}
      </div>

      {current && open !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={current.caption ?? `Photo ${open + 1}`} onClick={close}>
          <button className="lb-btn lb-close" onClick={close} aria-label="Close">
            <Icon name="close" />
          </button>
          {photos.length > 1 && (
            <button className="lb-btn lb-prev" onClick={(e) => { e.stopPropagation(); step(-1); }} aria-label="Previous photo">
              <Icon name="left" />
            </button>
          )}
          <figure className="lb-figure" onClick={(e) => e.stopPropagation()} key={open}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={current.src} alt={current.caption ?? ""} />
            <figcaption>
              {current.caption ?? ""}
              <span>
                {open + 1} / {photos.length}
              </span>
            </figcaption>
          </figure>
          {photos.length > 1 && (
            <button className="lb-btn lb-next" onClick={(e) => { e.stopPropagation(); step(1); }} aria-label="Next photo">
              <Icon name="right" />
            </button>
          )}
        </div>
      )}
    </>
  );
}
