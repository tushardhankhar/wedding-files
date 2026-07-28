"use client";

import type { Artwork } from "../../schema";
import { artworkStyles } from "../artwork-placement";
import { PalaceScene, Couple, Balustrade } from "./ornaments";

/**
 * The palace-at-dusk scene: sky, lake, skyline and — on the balcony — either the
 * theme's drawn couple or the client's own illustration (caricature, sketch…).
 *
 * Shared with the content editor's placement picker so what the client positions
 * is pixel-for-pixel what the site renders.
 */

/** Height the drawn couple occupies inside the scene. An upload at `scale: 1`
 * therefore stands exactly as tall as the figures it replaces. */
export const ARTWORK_HEIGHT_PCT = 62;

const stage = { height: `${ARTWORK_HEIGHT_PCT}%` };

export function GulistanScene({ artwork }: { artwork?: Artwork }) {
  const art = artwork?.url ? artworkStyles(artwork, ARTWORK_HEIGHT_PCT) : null;

  return (
    <div className="glt-scene-sky relative aspect-[5/4] w-full overflow-hidden rounded-t-[999px]">
      <PalaceScene className="absolute inset-0 h-full w-full" />

      {art && artwork ? (
        <>
          {/* The wrapper spans the scene, so its translate (in %) nudges the
              artwork by a share of the SCENE — independent of the drawing's
              own dimensions. */}
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
          {/* Railing over the artwork, so the figures read as standing on the
              balcony however the drawing is cropped. */}
          <Balustrade
            style={stage}
            className="absolute inset-x-0 bottom-0 mx-auto w-auto"
          />
        </>
      ) : (
        <Couple style={stage} className="absolute inset-x-0 bottom-0 mx-auto w-auto" />
      )}
    </div>
  );
}
