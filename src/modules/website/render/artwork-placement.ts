import type { CSSProperties } from "react";
import type { Artwork } from "../schema";
import type { ArtworkSupport } from "../themes/registry";

/**
 * What a theme should draw in its illustration slot:
 *
 *   - `show: false`          — nothing (the client switched the illustration off).
 *   - `show: true, art: null` — the theme's own drawn figures.
 *   - `show: true, art: {…}`  — the client's uploaded drawing, placed.
 *
 * A theme whose figures are part of its scene ("built-in") keeps drawing them
 * until the client explicitly switches the slot off; one where the illustration
 * is an addition ("optional") stays typographic until they turn it on.
 */
export function resolveArtwork(
  artwork: Artwork | undefined,
  support: ArtworkSupport
): { show: boolean; art: Artwork | null } {
  const show = artwork ? artwork.enabled : support === "built-in";
  return { show, art: show && artwork?.url ? artwork : null };
}

/**
 * Turns a stored {@link Artwork} into the two CSS pieces a theme needs to drop a
 * client's illustration into the slot its own artwork occupies:
 *
 *   - `shift` → goes on a wrapper that spans the whole slot (`absolute inset-0`).
 *               Its `translate` is in percentages, i.e. relative to the SLOT, so
 *               `x`/`y` mean the same nudge no matter the artwork's own size.
 *   - `image` → goes on the `<img>`: height as a share of the slot (so the
 *               drawing scales with the scene on every screen) plus the mirror.
 *
 * `baseHeightPct` is the height the theme's built-in artwork occupies, so
 * `scale: 1` lands the upload exactly where the drawn figures were.
 *
 * The editor's picker uses this same function, so what the client positions is
 * what the site renders.
 */
export function artworkStyles(
  art: Artwork,
  baseHeightPct: number
): { shift: CSSProperties; image: CSSProperties } {
  const x = art.x ?? 0;
  const y = art.y ?? 0;
  const scale = art.scale ?? 1;
  return {
    shift: {
      transform: `translate(${(x * 100).toFixed(2)}%, ${(y * 100).toFixed(2)}%)`,
    },
    image: {
      height: `${(baseHeightPct * scale).toFixed(2)}%`,
      transform: art.flip ? "scaleX(-1)" : undefined,
    },
  };
}
