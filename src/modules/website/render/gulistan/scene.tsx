"use client";

import type { Artwork } from "../../schema";
import { artworkStyles } from "../artwork-placement";
import { PalaceScene, Couple } from "./ornaments";

/**
 * The palace-at-dusk scene: sky, lake, skyline and, in front of it, either the
 * theme's drawn couple (on their balcony) or the client's own illustration
 * (caricature, sketch…) standing on the open lakefront — or, with the
 * illustration switched off, the empty lakefront at dusk.
 *
 * Shared with the content editor's placement picker so what the client positions
 * is pixel-for-pixel what the site renders.
 */

/** Height the drawn couple occupies inside the scene. An upload at `scale: 1`
 * therefore stands exactly as tall as the figures it replaces. */
export const ARTWORK_HEIGHT_PCT = 62;

const stage = { height: `${ARTWORK_HEIGHT_PCT}%` };

export function GulistanScene({
  artwork,
  /** The illustration slot itself — false when the client has switched the
   * figures off, leaving the palace and the lake on their own. */
  show = true,
}: {
  artwork?: Artwork;
  show?: boolean;
}) {
  const art = artwork?.url ? artworkStyles(artwork, ARTWORK_HEIGHT_PCT) : null;

  return (
    <div className="glt-scene-sky relative aspect-[5/4] w-full overflow-hidden rounded-t-[999px]">
      <PalaceScene className="absolute inset-0 h-full w-full" />

      {!show ? null : art && artwork?.url ? (
        /* No balcony railing over an upload — it cut across the drawing instead
           of framing it. (The drawn couple's railing lives inside <Couple>.)
           The wrapper spans the scene, so its translate (in %) nudges the
           artwork by a share of the SCENE — independent of the drawing's own
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
        <Couple style={stage} className="absolute inset-x-0 bottom-0 mx-auto w-auto" />
      )}
    </div>
  );
}
