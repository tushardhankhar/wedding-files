"use client";

import type { Artwork } from "../schema";
import { getTheme } from "../themes/registry";
import { GulistanScene } from "./gulistan/scene";
import { JodiPortrait } from "./jodi/portrait";
import { OvertureCameo } from "./save-the-date/cameo";
import { MuhuratCameo } from "./muhurat/cameo";

/**
 * The theme's own illustration slot with the client's artwork placed in it —
 * rendered by the exact components the guest site uses, on the theme's tokens,
 * so positioning the artwork in the content editor is WYSIWYG rather than a
 * guess. With no artwork it shows the theme's own drawn couple, which is what the
 * editor previews before anything has been uploaded.
 *
 * The wrapper is the slot's own box (no padding), which lets the picker translate
 * a drag straight into slot-relative offsets.
 *
 * The theme's page-level class (e.g. `.glt`) is deliberately NOT applied: it
 * carries full-viewport layout. Only the tokens the ornaments read are needed.
 *
 * Every theme whose `supports.artwork` is truthy needs a case here.
 */
export function ThemeArtworkPreview({
  themeId,
  artwork,
  initials,
}: {
  themeId: string;
  artwork?: Artwork;
  /** The couple's monogram — the cameo themes carry it on the frame. */
  initials?: string;
}) {
  const theme = getTheme(themeId);

  switch (theme.id) {
    case "gulistan":
      return (
        <div className="bg-[color:var(--glt-blush)]" style={theme.vars}>
          <GulistanScene artwork={artwork} />
        </div>
      );
    /* The plate fills the wrapper edge to edge — no padding, so a drag in the
       picker maps straight onto plate-relative offsets. */
    case "jodi":
      return (
        <div className="bg-[color:var(--jdi-paper)]" style={theme.vars}>
          <JodiPortrait artwork={artwork} />
        </div>
      );
    /* The cameo themes get the page's own ground behind them, with the niche or
       medallion stretched to fill it (`fill`) so a drag maps 1:1 onto the stored
       offsets. `minHeight` undoes the page class's full-viewport height. */
    case "save-the-date":
      return (
        <div className="std" style={{ ...theme.vars, minHeight: 0 }}>
          <OvertureCameo artwork={artwork} initials={initials} fill />
        </div>
      );
    case "muhurat":
      return (
        <div className="mht" style={{ ...theme.vars, minHeight: 0 }}>
          <MuhuratCameo artwork={artwork} initials={initials} fill />
        </div>
      );
    default:
      return null;
  }
}
