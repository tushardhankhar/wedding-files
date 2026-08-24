"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Localized, Focus } from "../../schema";
import { T } from "../bilingual";
import { focusStyles } from "../image-focus";

export interface GalleryImage {
  url: string;
  caption?: Localized;
  focus?: Focus;
}

/* ══════════════════════════════════════════════════════════════════════════
   THE LIGHTBOX
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * Owns "which photograph is open", shared by every place a photograph appears.
 *
 * There is ONE index space — the gallery's own array — and every thumbnail
 * anywhere on the page (the portrait wall, and the photo breaks between
 * sections) opens at its index in it. That is what makes the arrows work: open a
 * break photo and you can page straight on through the whole collection instead
 * of hitting a wall of two.
 */
export function useLightbox(images: GalleryImage[]) {
  const [index, setIndex] = useState<number | null>(null);
  /* Where focus was when the lightbox opened, so it can be put back. Closing a
   * dialog and dropping focus to <body> loses a keyboard user's place on the
   * page entirely. */
  const opener = useRef<HTMLElement | null>(null);

  const open = useCallback((i: number) => {
    opener.current = document.activeElement as HTMLElement | null;
    setIndex(i);
  }, []);

  const close = useCallback(() => {
    const back = opener.current;
    opener.current = null;
    setIndex(null);
    /* Restored on the NEXT frame, not here. React has not removed the dialog
     * yet, and when it does the browser moves focus off the unmounted node to
     * <body> — which silently undoes a synchronous restore. Verified: without
     * the deferral, Escape left focus on <body> every time. */
    requestAnimationFrame(() => back?.focus?.());
  }, []);

  const step = useCallback(
    (delta: number) => {
      setIndex((i) => (i === null ? null : (i + delta + images.length) % images.length));
    },
    [images.length],
  );

  return { images, index, open, close, step };
}

export type Lightbox = ReturnType<typeof useLightbox>;

/**
 * The opened photograph, full and uncropped.
 *
 * `object-contain`, not `object-cover`, is the entire point of this component:
 * every frame on the page — the round brass portholes, the arched plates, the
 * full-bleed breaks — crops to fill, so a portrait in a square porthole loses
 * its top and bottom. This is where the guest sees what the couple actually
 * uploaded.
 *
 * NOT PORTALLED, deliberately. It renders inside the theme root so it inherits
 * `[data-lang]` (which is what drives the bilingual `T`) and the `--mrm-*`
 * custom properties. Portalled to <body> both are gone: captions would render in
 * English AND Hindi at once, and every colour would fall back. The theme's
 * mobile menu is `fixed inset-0` inside the same root and clears the ancestor's
 * `overflow-x: clip` without trouble, so there is nothing to escape from.
 */
export function MiramarLightbox({ images, index, close, step }: Lightbox) {
  const dialog = useRef<HTMLDivElement | null>(null);
  const touchX = useRef<number | null>(null);
  const openHere = index !== null;

  /* Keys, and the page underneath. Both are only wired while something is open,
   * so the page behaves exactly as before whenever it is not. */
  useEffect(() => {
    if (!openHere) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    /* Without this the page scrolls behind the scrim on every wheel/touch, and
     * on a phone the guest closes the photo to find themselves somewhere else
     * entirely. Restored to whatever it was, not hardcoded back to "". */
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [openHere, close, step]);

  /* Move focus into the dialog when it opens, so Escape and the arrow keys
   * reach it without the guest having to click first. */
  useEffect(() => {
    if (openHere) dialog.current?.focus();
  }, [openHere]);

  if (index === null) return null;
  const img = images[index];
  if (!img) return null;
  const many = images.length > 1;

  return (
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-label="Photograph"
      tabIndex={-1}
      className="mrm-lightbox fixed inset-0 z-[80] flex flex-col outline-none"
      onClick={close}
      onTouchStart={(e) => {
        touchX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const from = touchX.current;
        touchX.current = null;
        if (from === null || !many) return;
        const dx = (e.changedTouches[0]?.clientX ?? from) - from;
        // 48px: past a thumb's natural wobble, short of a deliberate scroll.
        if (Math.abs(dx) > 48) step(dx < 0 ? 1 : -1);
      }}
    >
      {/* the bar: counter left, close right */}
      <div className="relative z-10 flex shrink-0 items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <span className="mrm-sans text-[11px] font-semibold uppercase tracking-[0.3em] text-[color:var(--mrm-gold-lite)] sm:text-xs">
          {many ? `${index + 1} / ${images.length}` : ""}
        </span>
        <button
          type="button"
          onClick={close}
          className="mrm-lightbox-btn h-11 w-11"
          aria-label="Close"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </button>
      </div>

      {/* the photograph. The click-to-close lives on the backdrop, so the frame
          itself has to stop the event or every attempt to look closely shuts it. */}
      <figure
        className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center px-3 pb-4 sm:px-16"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- couple-provided gallery URLs */}
        <img
          key={img.url}
          src={img.url}
          alt=""
          className="mrm-lightbox-img max-h-full min-h-0 w-auto max-w-full object-contain"
        />
        {img.caption ? (
          <figcaption className="mrm-serif mt-4 max-w-xl shrink-0 text-center text-sm italic text-[color:var(--mrm-shell)]/85 sm:text-base">
            <T value={img.caption} />
          </figcaption>
        ) : null}
      </figure>

      {many ? (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
            className="mrm-lightbox-btn absolute left-2 top-1/2 z-10 h-12 w-12 -translate-y-1/2 sm:left-5"
            aria-label="Previous photograph"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
              <path
                d="M15 5l-7 7 7 7"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
            className="mrm-lightbox-btn absolute right-2 top-1/2 z-10 h-12 w-12 -translate-y-1/2 sm:right-5"
            aria-label="Next photograph"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
              <path
                d="M9 5l7 7-7 7"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </button>
        </>
      ) : null}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   THE PHOTO BREAK — photographs between the sections
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * A full-bleed band of one or two photographs, dropped between two sections.
 *
 * It is deliberately edge-to-edge: every section on this page is a bounded
 * column on paper, so a photograph that runs the full width is the one moment
 * the invitation opens out — which is what makes it read as a breath between
 * chapters rather than as a second gallery.
 *
 * The photographs are the FIRST few of the gallery's own array, and they still
 * appear on the portrait wall further down. That is not a duplication bug: the
 * break is a highlight, and keeping one index space is what lets the lightbox
 * page on from a break photo into the whole collection.
 */
export function MiramarPhotoBreak({
  images,
  from,
  lightbox,
}: {
  images: GalleryImage[];
  /** Index into the gallery array of the first photograph in this band. */
  from: number;
  lightbox: Lightbox;
}) {
  if (images.length === 0) return null;
  const pair = images.length > 1;

  return (
    <section
      className="mrm-break relative"
      aria-label="Photographs"
      data-tw-reveal
    >
      <div className={`grid ${pair ? "grid-cols-2" : "grid-cols-1"}`}>
        {images.map((img, i) => {
          const fs = focusStyles(img.focus);
          return (
            <button
              key={img.url + i}
              type="button"
              onClick={() => lightbox.open(from + i)}
              /* Two photographs are half as wide, so they need to be taller to
                 hold the same subject — hence the two aspect scales. */
              className={`mrm-break-tile group relative block w-full overflow-hidden ${
                pair ? "aspect-[3/4] sm:aspect-[4/5] lg:aspect-[3/2]" : "aspect-[4/3] sm:aspect-[21/9]"
              }`}
              aria-label="View photograph"
            >
              <span className="block h-full w-full" style={fs.zoom}>
                {/* eslint-disable-next-line @next/next/no-img-element -- couple-provided gallery URLs */}
                <img
                  src={img.url}
                  alt=""
                  loading="lazy"
                  style={fs.image}
                  className="h-full w-full object-cover transition-transform duration-[2.4s] ease-out group-hover:scale-[1.06]"
                />
              </span>
              {/* the tint that ties a photograph of any temperature back to the
                  theme, and gives the caption something to sit on */}
              <span className="mrm-break-veil pointer-events-none absolute inset-0" />
              {img.caption ? (
                <span className="mrm-serif pointer-events-none absolute inset-x-0 bottom-0 px-4 pb-5 pt-12 text-center text-sm italic text-white sm:text-base">
                  <T value={img.caption} />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
