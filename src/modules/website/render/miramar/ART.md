# The Miramar — artwork specification

This theme's ornament is **painted, not drawn**. Eight transparent WebPs ship at

    public/themes/miramar/*.webp

and are theme-level and static — the same anchor for every couple, part of the
build. A couple's own photographs are a different thing entirely and arrive
through `config.gallery` and `config.heroPhoto`.

Sources are **not** committed (they are ~2.5 MB each). Keep them somewhere you
can find again, and rebuild with:

    python3 scripts/build-miramar-art.py <source-dir>

The script expects seven PNGs named for their stems in the table below.

## The layers

| File | Source stem | Role | Encoded |
|---|---|---|---|
| `spray-corner.webp` | `spray-corner` | The head of the garland, cut and tapered. All four corners of the hero plate. | 620×334 |
| `garland.webp` | `spray-corner` | The **same** painting whole — a full-length side garland for the welcome section's margins. | 520×780 |
| `cross.webp` | `cross` | Nautical cross: gold tracery on navy, compass rose at the crossing, one blush rose at its foot. The crown of the plate. | 458×730 |
| `anchor-floral.webp` | `anchor-floral` | The anchor dressed with roses and hydrangea. The theme's signature; the footer. | 700×1085 |
| `anchor.webp` | `anchor` | The same anchor undressed, rope only. The small nautical mark (Details). | 420×646 |
| `bouquet.webp` | `bouquet` | Standalone bouquet — the Families head, and the RSVP's margins. | 620×1015 |
| `wheel.webp` | `wheel` | Ship's wheel. **Watermark only** (see below). | 640×620 |
| `knot.webp` | `knot` | Reef knot, navy through ivory, gold ferrules. Every divider that matters. | 900×486 |

Every one of these is a slot in `ART_SLOTS` in `art.tsx`, and that table mirrors
`public/themes/miramar/manifest.json`. **Re-running the build script can move the
dimensions — re-check the table when you do**, or the browser reserves the wrong
box and the plate reflows under the type.

## Three things the build script exists for

1. **Threshold before you trim.** Every source carries a faint halo reaching
   most of the way to the canvas edge, so `Image.getbbox()` finds nothing to cut
   — alpha 1 counts as content. Thresholding at `HALO_FLOOR` first is what lets
   these shed a third of their pixels.

2. **Taper a cut edge.** `spray-corner` is a *slice* out of the middle of the
   garland painting, and a razor-straight cut across a spray of flowers is the
   single most obvious tell that a corner ornament is a piece of something
   bigger. The `fade` column ramps alpha away over the last quarter of the crop,
   so the trail reads as receding. Only cut edges get this — the garland's own
   foot is already tapered by the painter and would go foggy.

3. **Lossy alpha.** WebP stores the alpha plane losslessly by default, and on
   these feathered halos that plane is most of the file.

## The two rules the composition depends on

**ONE PAINTING MAKES A BORDER.** `spray-corner` is laid into all four corners of
the plate and flipped on each axis — that is how a printed border is made, and it
is why the plate has a floral crown for the weight of one image. The head pair
runs at 46–48% width; the foot pair is pulled back to 36% at 0.8 opacity, so the
plate reads top-down rather than as four equal weights fighting for the middle.

**THE KEYLINE DRAWS OVER THE FLOWERS.** `.mrm-frameline` sits at `z-[6]`, above
the sprays at `z-[4]`. Underneath them it was swallowed at the corners and the
plate lost its edge along its whole head. Engraved stationery runs the rule
straight across the spray; so does this.

## The wheel is a watermark, and only a watermark

Its mahogany is a fourth hue this palette does not otherwise carry — navy, dusty
blue, blush, ivory, champagne gold. Held at `opacity-[0.1]` behind the story it
is a turning shadow; at any stronger it stops being a watermark and becomes a
colour the rest of the page has to answer for.

## Every slot has a drawn fallback

`Art` takes a `fallback`, and every call site in `miramar-view.tsx` passes the
SVG ornament the painting replaced (`RadiantCross`, `CornerBloom`,
`CornerShells`, `Anchor`, `Compass`, `Dove`, `GoldDivider`). A deployment that
never ran the build script degrades to the hand-drawn theme rather than to a page
of broken images. Those ornaments are therefore **not dead code** — do not delete
them from `ornaments.tsx`.

The rest of `ornaments.tsx` is live in its own right: the shore scene, the
lighthouse and its beam, the surf, the gulls, the shells, the dove, the rules and
the drifting petals are all still SVG, because they are line-work that has to
tint with the palette and animate. Paintings carry the *objects*; SVG carries the
*drawing*.
