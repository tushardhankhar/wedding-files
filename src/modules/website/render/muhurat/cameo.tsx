"use client";

import type { Artwork } from "../../schema";
import { artworkStyles } from "../artwork-placement";
import { CoupleIllustration, type CoupleColors } from "../couple-illustration";

/**
 * THE MUHURAT'S CAMEO — a round medallion with the couple standing on a gold
 * plinth inside it, set in place of the monogram seal so the theme's slow-turning
 * mandala becomes a halo around them. The initials move to a small gold plate at
 * the medallion's foot.
 *
 * Holds either the theme's own drawn couple or the client's uploaded caricature,
 * and is shared with the editor's placement picker so what they position is what
 * guests see.
 */

/** Height the drawn couple occupies inside the stage — the medallion above its
 * plinth (a circle narrows toward its foot, so the figures stand on the plinth
 * rather than on the medallion's lowest point, where there is no room). An upload
 * at `scale: 1` therefore stands exactly as tall as the figures it replaces. */
export const CAMEO_HEIGHT_PCT = 88;

/** Ivory, champagne and gold — the Muhurat is maroon + gold + ivory, and a fourth
 * hue in the medallion would break that. */
const MUHURAT_COUPLE: CoupleColors = {
  skin: "#e8c3a4",
  hair: "#2b1620",
  attireA: "#f7f0e0",
  attireB: "#ecd3a6",
  bodice: "#d9b97f",
  drape: "#c9a23f",
  gold: "#b8912f",
  goldLite: "#e8cd7e",
  shadow: "#2c0712",
};

export function MuhuratCameo({
  artwork,
  initials,
  /** Stretch the medallion to its container instead of its own width — the
   * editor's placement picker needs the slot to be the box it measures drags
   * against. */
  fill,
}: {
  artwork?: Artwork;
  initials?: string;
  fill?: boolean;
}) {
  const art = artwork?.url ? artworkStyles(artwork, CAMEO_HEIGHT_PCT) : null;

  return (
    <div className="mht-cameo-wrap">
      <div className={fill ? "mht-cameo mht-cameo--fill" : "mht-cameo"}>
        <span className="mht-cameo-glow" aria-hidden />

        {/* The stage stops at the plinth, so both the drawn couple and an upload
            stand on it — and a drag in the editor moves the art by a share of
            this same box, which is what keeps the picker WYSIWYG. */}
        <div className="mht-cameo-stage">
          {art && artwork?.url ? (
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
              colors={MUHURAT_COUPLE}
              style={{ height: `${CAMEO_HEIGHT_PCT}%` }}
              className="absolute inset-x-0 bottom-0 mx-auto w-auto"
            />
          )}
        </div>

        <span className="mht-cameo-plinth" aria-hidden />
        <span className="mht-cameo-inner" aria-hidden />
      </div>

      {initials ? (
        <span className="mht-cameo-plate">
          <span className="mht-cameo-mono">{initials}</span>
        </span>
      ) : null}
    </div>
  );
}
