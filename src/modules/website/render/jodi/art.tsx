"use client";

import { useCallback, useState } from "react";

/**
 * THE JODI — the painted plate.
 *
 * The whole theme is built around one piece of illustration: the couple standing
 * in a gold mehrab arch on ivory paper (see ART.md for what it is and how to
 * replace it). It ships as a SINGLE image rather than separate layers, because
 * the arch, the pair and the rug they stand on are drawn as one composition —
 * splitting them apart is what a matting pass would have to guess at, and the
 * drawn keyline has a gap in the right spandrel that defeats an automatic cut.
 *
 * It is also deliberately OPAQUE, not a transparent cut-out: `--jdi-paper` is
 * the artwork's own paper colour, so the plate's rectangle has nothing to show
 * against wherever the theme puts it. The renderer feathers the top edge with a
 * CSS mask as insurance against any tonal drift.
 *
 * Artwork here is THEME-level and static (the same plate for every couple), so
 * it lives under /public/themes/jodi/ and ships with the build. A couple's OWN
 * illustration is a different thing entirely — that arrives through
 * `config.artwork` and stands in the theme's drawn arch instead (see
 * portrait.tsx).
 *
 * Until the file is present the slot renders its SVG fallback, so the theme, the
 * public demo and the theme-card screenshots all stay presentable.
 */

export type ArtSlot = "plate";

interface SlotSpec {
  /** Where to put the file. */
  src: string;
  /** Whether it should block first paint. */
  eager: boolean;
}

export const ART_SLOTS: Record<ArtSlot, SlotSpec> = {
  /** The couple in their arch, on paper. Fills the foot of the invitation. */
  plate: { src: "/themes/jodi/plate.webp", eager: true },
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
    // eslint-disable-next-line @next/next/no-img-element -- static licensed theme art, sized entirely by its container
    <img
      ref={check}
      src={spec.src}
      alt=""
      aria-hidden
      draggable={false}
      loading={spec.eager ? "eager" : "lazy"}
      onError={() => setMissing(true)}
      style={style}
      className={className}
    />
  );
}
