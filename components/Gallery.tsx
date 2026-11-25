"use client";
import { useCallback, useEffect, useState } from "react";
import type { Photo } from "@/lib/site";
import Icon from "./Icons";

// Photo + video grid. Works with any number of items (layout changes with the count).
// Click/tap one to view it full-screen; arrow keys or the buttons move between items, Esc closes.
// Videos show their cover picture with a play badge, play a silent preview on mouse hover,
// and play with sound + controls when opened.
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
        <p>Nothing up yet.</p>
      </div>
    );
  }

  const layout = photos.length >= 5 ? "feature" : `n${photos.length}`;
  const current = open !== null ? photos[open] : null;
  const kind = (p: Photo) => (p.video ? "video" : "photo");

  // silent preview while the mouse is over a video tile
  const preview = (e: React.PointerEvent<HTMLElement>, on: boolean) => {
    if (e.pointerType !== "mouse") return;
    const v = e.currentTarget.querySelector("video");
    if (!v) return;
    if (on) v.play().catch(() => {});
    else { v.pause(); v.currentTime = 0; }
  };

  return (
    <>
      <div className="gallery" data-layout={layout}>
        {photos.map((p, i) => (
          <button
            key={p.src}
            className={`photo${p.video ? " is-video" : ""}`}
            onClick={() => setOpen(i)}
            onPointerEnter={p.video ? (e) => preview(e, true) : undefined}
            onPointerLeave={p.video ? (e) => preview(e, false) : undefined}
            aria-label={`Open ${kind(p)}${p.caption ? `: ${p.caption}` : ` ${i + 1}`}`}
          >
            {p.video ? (
              <>
                <video src={p.src} poster={p.poster} muted loop playsInline preload="none" />
                <span className="photo-play" aria-hidden="true" />
              </>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.src} alt={p.caption ?? ""} loading="lazy" />
            )}
            <span className="photo-cap">
              <span className="photo-idx">{String(i + 1).padStart(2, "0")}</span>
              {p.caption && <span>{p.caption}</span>}
            </span>
          </button>
        ))}
      </div>

      {current && open !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={current.caption ?? `${kind(current)} ${open + 1}`} onClick={close}>
          <button className="lb-btn lb-close" onClick={close} aria-label="Close">
            <Icon name="close" />
          </button>
          {photos.length > 1 && (
            <button className="lb-btn lb-prev" onClick={(e) => { e.stopPropagation(); step(-1); }} aria-label="Previous">
              <Icon name="left" />
            </button>
          )}
          <figure className="lb-figure" onClick={(e) => e.stopPropagation()} key={open}>
            {current.video ? (
              <video
                src={current.src}
                poster={current.poster}
                controls
                playsInline
                loop
                ref={(v) => {
                  if (!v || v.dataset.started) return;
                  v.dataset.started = "1";
                  // try with sound; if the browser blocks that, play muted (the speaker icon unmutes)
                  v.play().catch(() => { v.muted = true; v.play().catch(() => {}); });
                }}
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={current.src} alt={current.caption ?? ""} />
            )}
            <figcaption>
              {current.caption ?? ""}
              <span>
                {open + 1} / {photos.length}
              </span>
            </figcaption>
          </figure>
          {photos.length > 1 && (
            <button className="lb-btn lb-next" onClick={(e) => { e.stopPropagation(); step(1); }} aria-label="Next">
              <Icon name="right" />
            </button>
          )}
        </div>
      )}
    </>
  );
}
