"use client";

import { useCallback, useState } from "react";

/**
 * THE JODI — licensed artwork slots.
 *
 * This theme is designed around painted illustration (see ART.md for exactly
 * what to buy or commission, at what size and format). Each piece of artwork is
 * an independent LAYER rather than one composed background, because a single
 * baked composition cannot adapt across viewports: at 390px it either crops the
 * couple or shrinks the mandala band to nothing. Independent layers let the
 * border stay full-bleed, the couple stay anchored to the foot of the plate, and
 * the base scene stay proportional, at every width.
 *
 * Artwork is THEME-level and static (the same plate for every couple), so it
 * lives under /public/themes/jodi/ and ships with the build — it is not part of
 * a couple's own uploads.
 *
 * Until a file is present the slot renders its SVG fallback, so the theme, the
 * public demo and the theme-card screenshots all stay presentable. Dropping the
 * real file in at the documented path is the only step needed to upgrade — no
 * code change. (A missing slot logs one 404 per load; that is deliberate, it
 * makes an un-provisioned slot obvious in development.)
 */

export type ArtSlot = "mandala" | "couple" | "haveli" | "sideBand" | "wash";

interface SlotSpec {
  /** Where to put the file. */
  src: string;
  /** Whether it should block first paint. */
  eager: boolean;
}

export const ART_SLOTS: Record<ArtSlot, SlotSpec> = {
  /** The medallion hanging from the top edge, centred. Cropped by the edge. */
  mandala: { src: "/themes/jodi/mandala.png", eager: true },
  /** The couple, full length, anchored to the bottom-LEFT of the plate. */
  couple: { src: "/themes/jodi/couple.png", eager: true },
  /** The haveli / palace, anchored to the bottom-RIGHT, sitting behind her train. */
  haveli: { src: "/themes/jodi/haveli.png", eager: true },
  /** The vertical ornamental strip down the left edge. Optional, but eager:
   * anything in the first viewport must be, or the mount-time fallback check
   * cannot fire (a lazy image that has not started loading is not `complete`). */
  sideBand: { src: "/themes/jodi/side-band.png", eager: true },
  /** An optional painted paper/floral wash behind everything. Safe to defer:
   * it is sized by its container, so a pending load leaves no gap. */
  wash: { src: "/themes/jodi/wash.jpg", eager: false },
};

/**
 * Renders a licensed art layer, falling back to `fallback` if the file is not
 * present. Decorative by definition — always aria-hidden with an empty alt.
 *
 * `onError` ALONE IS NOT ENOUGH. The markup is server-rendered, so the browser
 * begins fetching the image immediately and an eager slot's 404 typically lands
 * *before* React hydrates and attaches the handler — the error event is missed
 * and the fallback never appears. (This is why a lazy slot fell back correctly
 * while an eager one silently rendered a 0-height broken image.) So we also
 * check the element on mount: a finished load with no intrinsic width is a
 * failed load.
 */
export function Art({
  slot,
  className,
  fallback = null,
}: {
  slot: ArtSlot;
  className?: string;
  fallback?: React.ReactNode;
}) {
  const [missing, setMissing] = useState(false);
  const spec = ART_SLOTS[slot];

  const check = useCallback((node: HTMLImageElement | null) => {
    if (node && node.complete && node.naturalWidth === 0) setMissing(true);
  }, []);

  if (missing) return <>{fallback}</>;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- static licensed theme art, sized entirely by its container
    <img
      ref={check}
      src={spec.src}
      alt=""
      aria-hidden
      draggable={false}
      loading={spec.eager ? "eager" : "lazy"}
      onError={() => setMissing(true)}
      className={className}
    />
  );
}
