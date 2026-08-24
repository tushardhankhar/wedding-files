"use client";

import { useCallback, useState } from "react";

/**
 * THE MIRAMAR — the painted layers.
 *
 * Eight transparent WebPs under /public/themes/miramar/, built from the source
 * paintings by `scripts/build-miramar-art.py`. See ART.md for what each one is
 * and how to replace it.
 *
 * These are THEME-level and static — the same anchor for every couple, part of
 * the build. A couple's own photographs arrive through `config.gallery` /
 * `config.heroPhoto` and never come through here.
 *
 * WHY PAINTINGS AND NOT SVG. The theme's first pass drew all of this by hand:
 * the anchor, the corner sprays, the cross. That version read as clip-art, and
 * the engraved rewrite that followed — line leads, wash behind — was correct in
 * principle but still could not carry the weight the brief wanted. A rose in
 * vector is a gradient-mesh exercise the browser then re-composites every frame.
 * Painted layers give the invitation real petal texture, brass with a highlight
 * on it, and rope you can see the lay of, for 757 KB across the whole set, most
 * of it lazy.
 *
 * The drawn ornaments in `ornaments.tsx` are NOT dead: the shore scene, the
 * lighthouse, the surf, the shells, the dove and the rules are all still SVG,
 * because those are line-work that has to tint with the palette and animate.
 * Paintings carry the *objects*; SVG carries the *drawing*.
 *
 * `w`/`h` are the real encoded dimensions and are passed to every `<img>`, so
 * the browser reserves the right box before the bytes land and nothing on the
 * plate reflows underneath the type.
 */

export type ArtSlot =
  | "spray-corner"
  | "garland"
  | "cross"
  | "anchor-floral"
  | "anchor"
  | "bouquet"
  | "wheel"
  | "knot";

interface SlotSpec {
  src: string;
  w: number;
  h: number;
  /** Whether it should block first paint. Only the plate's own layers may set this. */
  eager?: boolean;
}

/**
 * Mirrors `manifest.json`. Re-running the build script can move these — the
 * script prints the dimensions, so re-check this table when you do.
 */
export const ART_SLOTS: Record<ArtSlot, SlotSpec> = {
  // The plate's four corners and its crown ARE the first screen. A corner spray
  // arriving a beat late is a visible wrong state — the invitation paints bare
  // and then grows flowers — so these three are eager.
  "spray-corner": { src: "/themes/miramar/spray-corner.webp", w: 620, h: 334, eager: true },
  cross: { src: "/themes/miramar/cross.webp", w: 458, h: 730, eager: true },
  knot: { src: "/themes/miramar/knot.webp", w: 900, h: 486, eager: true },
  garland: { src: "/themes/miramar/garland.webp", w: 520, h: 780 },
  "anchor-floral": { src: "/themes/miramar/anchor-floral.webp", w: 700, h: 1085 },
  anchor: { src: "/themes/miramar/anchor.webp", w: 420, h: 646 },
  bouquet: { src: "/themes/miramar/bouquet.webp", w: 620, h: 1015 },
  wheel: { src: "/themes/miramar/wheel.webp", w: 640, h: 620 },
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
 * slot's 404 typically lands BEFORE React hydrates and attaches the handler.
 * The error event is missed and the fallback never appears. So we also check the
 * node on mount: a finished load with no intrinsic width is a failed load.
 * (Same fix as the Jodi plate and the Rajmahal gateway.)
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
      decoding={spec.eager ? "sync" : "async"}
      fetchPriority={spec.eager ? "high" : "auto"}
      className={className}
      style={style}
      onError={() => setMissing(true)}
    />
  );
}
