"use client";

import type { Artwork } from "../../schema";
import { artworkStyles } from "../artwork-placement";
import { CoupleIllustration, type CoupleColors } from "../couple-illustration";
import { Art } from "./art";
import { MehrabPlate, PLATE_VIEWBOX } from "./ornaments";

/** The shared couple drawing, wearing The Jodi's palette. */
const COUPLE: CoupleColors = {
  skin: "var(--jdi-skin)",
  hair: "var(--jdi-hair)",
  attireA: "var(--jdi-sherwani)",
  attireB: "var(--jdi-lehenga)",
  bodice: "var(--jdi-lehenga-2)",
  drape: "var(--jdi-dupatta)",
  gold: "var(--jdi-gold)",
  goldLite: "var(--jdi-gold-lite)",
  shadow: "var(--jdi-maroon-2)",
};

/**
 * THE JODI's illustration slot — the couple standing in a gold mehrab arch at
 * the foot of the invitation.
 *
 * Two things can fill it, and they are built differently on purpose:
 *
 *   • the theme's own painted plate — ONE flat image, arch and pair and rug
 *     drawn together (see art.tsx). Nothing here frames it; the painting is
 *     already framed.
 *   • the client's own drawing — the arch is drawn in SVG (MehrabPlate) and
 *     their artwork stands inside it, on the drawn rug.
 *
 * Both occupy the SAME box, at the same aspect, so switching between them never
 * reflows the hero. Shared with the content editor's placement picker, so what a
 * client positions is pixel-for-pixel what their guests see.
 */

/**
 * Height the figures occupy inside the plate, as a share of its height. An
 * upload at `scale: 1` therefore stands as tall as the couple it replaces, with
 * headroom under the arch's crown.
 */
export const ARTWORK_HEIGHT_PCT = 82;

/** Where the ground is: the painted couple's feet sit at 95.4% of the plate. */
const FEET_PCT = 95.4;

export function JodiPortrait({
  artwork,
  className = "",
}: {
  /** The client's own drawing, already resolved (see resolveArtwork). */
  artwork?: Artwork | null;
  className?: string;
}) {
  const art = artwork?.url ? artworkStyles(artwork, ARTWORK_HEIGHT_PCT) : null;
  /* The plate carries its own aspect, so a caller that constrains ONE axis gets
   * the other for free — the content editor's preview hands it a width, the hero
   * hands it a height. A caller that sets both (`h-full w-full`) overrides this,
   * which is why the image below still guards with object-contain. */
  const box = { aspectRatio: `${PLATE_VIEWBOX.w} / ${PLATE_VIEWBOX.h}` };

  if (art && artwork?.url) {
    return (
      <div className={`relative ${className}`} style={box}>
        <MehrabPlate className="absolute inset-0 h-full w-full" />
        {/* The wrapper spans the whole plate, so the stored offset (in %) nudges
            the drawing by a share of the PLATE — independent of its own size. */}
        <div className="absolute inset-0" style={art.shift}>
          {/* eslint-disable-next-line @next/next/no-img-element -- client-uploaded artwork on R2 */}
          <img
            src={artwork.url}
            alt=""
            draggable={false}
            style={{ ...art.image, bottom: `${100 - FEET_PCT}%` }}
            className="absolute inset-x-0 mx-auto w-auto max-w-none object-contain"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={box}>
      <Art
        slot="plate"
        /* object-contain + object-bottom is a guard, not a crop: the box is the
           artwork's own aspect, so it normally fits exactly — but if a caller
           ever constrains both axes, the couple loses headroom above the arch
           rather than their feet. */
        className="absolute inset-0 h-full w-full object-contain object-bottom"
        fallback={
          <>
            <MehrabPlate className="absolute inset-0 h-full w-full" />
            <CoupleIllustration
              colors={COUPLE}
              className="absolute inset-x-0 mx-auto w-auto"
              style={{ height: `${ARTWORK_HEIGHT_PCT}%`, bottom: `${100 - FEET_PCT}%` }}
            />
          </>
        }
      />
    </div>
  );
}
