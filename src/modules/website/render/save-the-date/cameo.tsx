"use client";

import type { Artwork } from "../../schema";
import { artworkStyles } from "../artwork-placement";
import { CoupleIllustration, type CoupleColors } from "../couple-illustration";

/**
 * THE OVERTURE'S CAMEO — an arched gold niche with the couple standing in it,
 * in place of the monogram seal. The initials move to the keystone at the crown,
 * so the illustration takes the top of the card without costing the theme its
 * monogram.
 *
 * Holds either the theme's own drawn couple or the client's uploaded caricature,
 * and is shared with the editor's placement picker so what they position is what
 * guests see.
 */

/** Height the drawn couple occupies inside the niche. An upload at `scale: 1`
 * therefore stands exactly as tall as the figures it replaces. */
export const CAMEO_HEIGHT_PCT = 76;

/** Ivory, champagne and gold only — the Overture is emerald + gold + ivory, and
 * a fourth hue in the niche would break that. The two read apart by silhouette
 * and by tone: his sherwani is the brighter ivory, her lehenga the champagne. */
const OVERTURE_COUPLE: CoupleColors = {
  skin: "#e7c2a6",
  hair: "#2a1c18",
  attireA: "#f7f0dd",
  attireB: "#e8d5ab",
  bodice: "#d8c091",
  drape: "#c9a23f",
  gold: "#b8912f",
  goldLite: "#e8cd7e",
  shadow: "#04140f",
};

export function OvertureCameo({
  artwork,
  initials,
  /** Stretch the niche to its container instead of its own width — the editor's
   * placement picker needs the slot to be the box it measures drags against. */
  fill,
}: {
  artwork?: Artwork;
  initials?: string;
  fill?: boolean;
}) {
  const art = artwork?.url ? artworkStyles(artwork, CAMEO_HEIGHT_PCT) : null;

  return (
    <div className="std-cameo-wrap">
      <div className={fill ? "std-cameo std-cameo--fill" : "std-cameo"}>
        <span className="std-cameo-glow" aria-hidden />

        {art && artwork?.url ? (
          /* The wrapper spans the niche, so its translate (in %) nudges the
             drawing by a share of the NICHE — independent of the drawing's own
             dimensions. */
          <div className="absolute inset-0" style={art.shift}>
            {/* eslint-disable-next-line @next/next/no-img-element -- client-uploaded artwork on R2 */}
            <img
              src={artwork.url}
              alt=""
              draggable={false}
              style={art.image}
              className="absolute inset-x-0 bottom-0 mx-auto w-auto max-w-none object-contain"
            />
          </div>
        ) : (
          <CoupleIllustration
            colors={OVERTURE_COUPLE}
            style={{ height: `${CAMEO_HEIGHT_PCT}%` }}
            className="absolute inset-x-0 bottom-0 mx-auto w-auto"
          />
        )}

        {/* the niche's own mouldings, over the art */}
        <span className="std-cameo-inner" aria-hidden />
        <span className="std-cameo-sill" aria-hidden />
      </div>

      {initials ? (
        <span className="std-cameo-key">
          <span className="std-cameo-mono">{initials}</span>
        </span>
      ) : null}
    </div>
  );
}
