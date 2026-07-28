"use client";

import type { Artwork } from "../schema";
import { getTheme } from "../themes/registry";
import { GulistanScene } from "./gulistan/scene";

/**
 * The theme's own illustrated scene with the client's artwork placed in it —
 * rendered by the exact components the guest site uses, on the theme's tokens,
 * so positioning the artwork in the content editor is WYSIWYG rather than a
 * guess. The wrapper is the scene's own box (no padding), which lets the picker
 * translate a drag straight into scene-relative offsets.
 *
 * The theme's page-level class (e.g. `.glt`) is deliberately NOT applied: it
 * carries full-viewport layout. Only the tokens the ornaments read are needed.
 *
 * Every theme whose `supports.artwork` is true needs a case here.
 */
export function ThemeArtworkPreview({
  themeId,
  artwork,
}: {
  themeId: string;
  artwork?: Artwork;
}) {
  const theme = getTheme(themeId);

  switch (theme.id) {
    case "gulistan":
      return (
        <div
          className="bg-[color:var(--glt-blush)]"
          style={theme.vars}
        >
          <GulistanScene artwork={artwork} />
        </div>
      );
    default:
      return null;
  }
}
