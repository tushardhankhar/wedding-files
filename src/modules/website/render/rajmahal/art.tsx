"use client";

import { useCallback, useState } from "react";

/**
 * THE RAJMAHAL — the painted layers.
 *
 * Ten transparent WebPs under /public/themes/rajmahal/, built from the source
 * paintings by `scripts/build-rajmahal-art.py`. See ART.md for what each one is
 * and how to replace it.
 *
 * These are THEME-level and static — the same palace for every couple, part of
 * the build. A couple's own photographs are a different thing entirely and
 * arrive through `config.gallery` / `config.artwork`.
 *
 * Two properties of this set drive the whole renderer:
 *
 * 1. **Every layer is a true cut-out with a soft edge.** Nothing needs a card, a
 *    frame or a matching backdrop to hide a seam — subjects can sit directly on
 *    the sandstone ground, overlap each other, and move independently.
 *
 * 2. **The two gateway paintings are the same arch.** Identical framing,
 *    identical stonework, differing only in the door leaves and what shows
 *    through them. So `gate-open` supplies the stone frame and the garden, and
 *    `gate-doors` — the closed leaves, cropped out of the closed painting at the
 *    measured aperture — is laid back over the doorway and hinged. The frame is
 *    never animated, which is why the swing reads as doors moving rather than as
 *    one picture dissolving into another.
 *
 * `w`/`h` are the real encoded dimensions. They are passed to every `<img>` so
 * the browser reserves the right box before the bytes land — without them the
 * hero reflows on load and any ScrollTrigger built against the old height ends
 * its scrub early.
 */

export type ArtSlot =
  | "gate-doors"
  | "gate-open"
  | "palace"
  | "toran"
  | "jharokha"
  | "couple"
  | "elephant-left"
  | "elephant-right"
  | "peacock-side"
  | "peacock-fan";

interface SlotSpec {
  src: string;
  w: number;
  h: number;
  /** Whether it should block first paint. Only the two hero layers may set this. */
  eager?: boolean;
}

/**
 * Mirrors `manifest.json`. Re-running the build script can move these — the
 * script prints the ratios, so re-check this table when you do.
 */
export const ART_SLOTS: Record<ArtSlot, SlotSpec> = {
  // Both gateway layers ARE the first screen and must arrive together — the
  // frame without the doors is an open gate, the doors without the frame is a
  // pair of doors floating on sand. Either one arriving late is a visible wrong
  // state, so neither may be lazy.
  "gate-open": { src: "/themes/rajmahal/gate-open.webp", w: 940, h: 1291, eager: true },
  "gate-doors": { src: "/themes/rajmahal/gate-doors.webp", w: 498, h: 1084, eager: true },
  palace: { src: "/themes/rajmahal/palace.webp", w: 1200, h: 670 },
  toran: { src: "/themes/rajmahal/toran.webp", w: 820, h: 1230 },
  jharokha: { src: "/themes/rajmahal/jharokha.webp", w: 640, h: 739 },
  couple: { src: "/themes/rajmahal/couple.webp", w: 660, h: 1070 },
  "elephant-left": { src: "/themes/rajmahal/elephant-left.webp", w: 458, h: 380 },
  "elephant-right": { src: "/themes/rajmahal/elephant-right.webp", w: 457, h: 380 },
  "peacock-side": { src: "/themes/rajmahal/peacock-side.webp", w: 500, h: 839 },
  "peacock-fan": { src: "/themes/rajmahal/peacock-fan.webp", w: 740, h: 514 },
};

/** Aspect ratio (w/h) of a layer — for reserving space in CSS. */
export function ratioOf(slot: ArtSlot): number {
  const s = ART_SLOTS[slot];
  return s.w / s.h;
}

/**
 * Renders a painted layer, falling back to `fallback` if the file is missing.
 * Decorative by definition — always aria-hidden with an empty alt.
 *
 * `onError` ALONE IS NOT ENOUGH, and this is not theoretical: the markup is
 * server-rendered, so the browser starts fetching immediately and an eager
 * slot's 404 typically lands BEFORE React hydrates and attaches the handler. The
 * error event is missed and the fallback never appears — a lazy slot would fall
 * back correctly while the eager one silently rendered a 0-height broken image.
 * So we also check the node on mount: a finished load with no intrinsic width is
 * a failed load. (Same fix as the Jodi plate; see render/jodi/art.tsx.)
 */
export function Art({
  slot,
  className,
  style,
  fallback = null,
}: {
  slot: ArtSlot;
  className?: string;
  style?: React.CSSProperties;
  fallback?: React.ReactNode;
}) {
  const [missing, setMissing] = useState(false);
  const spec = ART_SLOTS[slot];

  const check = useCallback((node: HTMLImageElement | null) => {
    if (node && node.complete && node.naturalWidth === 0) setMissing(true);
  }, []);

  if (missing) return <>{fallback}</>;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- static theme art, sized entirely by its container
    <img
      ref={check}
      src={spec.src}
      width={spec.w}
      height={spec.h}
      alt=""
      aria-hidden
      draggable={false}
      loading={spec.eager ? "eager" : "lazy"}
      // The hero must decode before it is composited; everything else may stream
      // in without blocking a scrub already in progress.
      decoding={spec.eager ? "sync" : "async"}
      fetchPriority={spec.eager ? "high" : "auto"}
      className={className}
      style={style}
      onError={() => setMissing(true)}
    />
  );
}
