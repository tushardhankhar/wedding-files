# The Jodi — artwork specification

This theme is built around ONE piece of illustration: the couple standing in a
gold mehrab arch on ivory paper. It ships at

    public/themes/jodi/plate.webp

and it is theme-level and static — the same plate for every couple, part of the
build, not part of anyone's photo uploads. A couple's OWN illustration is a
different thing entirely and arrives through `config.artwork`; see
[Client artwork](#client-artwork) below.

## Why one image and not layers

An earlier version of this theme split its artwork into four slots (mandala,
couple, haveli, side band) so each could be placed independently. This one does
not, because the drawing it is built from composes the arch, the pair and the rug
they stand on as a single scene — there is no seam to cut along. Automatic
matting was tried and rejected: the drawn keyline has a small gap in the right
spandrel, so a flood fill clears one spandrel's paper and not the other's, giving
a plate that is die-cut down one side and rectangular down the other.

So the plate is one rectangle, and the theme is built so that a rectangle is
enough.

## THE PAPER IS THE CONTRACT

The plate is **opaque**, not transparent. It sits invisibly on the page because
its paper and the page's ground are the same colour — and that only holds if two
things stay true:

1. **`--jdi-paper` (`#FEFAEF`) is the artwork's paper, exactly.** Change one
   without the other and the plate grows visible edges.
2. **Nothing tonal may render behind the plate.** The hero's ground is flat
   `--jdi-paper`; its watercolour blooms live in `.jdi-wash`, a layer scoped
   inside the copy's column precisely so they cannot drift under the artwork.
   (The first version put those blooms on the hero itself and the plate showed up
   as a lighter rectangle against them.)

If you ever need a tonal background behind the plate, the plate has to become a
real transparent cut-out first — hand-masked, not flood-filled.

## Replacing the plate

Drop a new file at `public/themes/jodi/plate.webp` and the theme picks it up with
no code change. To fit the theme it must be:

| | |
|---|---|
| **Format** | WebP or PNG, **opaque** |
| **Aspect** | **0.967** (e.g. 1470 × 1520). This is `PLATE_VIEWBOX` in `ornaments.tsx` — the drawn mehrab shares it so a swap never reflows the hero. Change one, change both. |
| **Width** | ~1400px. The plate never renders wider than about 730 CSS px. |
| **Paper** | Flat `#FEFAEF` across the whole image, **including its corners** — see below. |
| **Composition** | The arch centred horizontally; the couple's feet at ~95% of the height (`FEET_PCT` in `portrait.tsx`); a little paper all round. |

### Flattening the paper

Painted artwork rarely has flat paper — the source for the current plate carries
soft watercolour blooms that make its corners ~15 levels warmer than its middle,
which is exactly what showed as a rectangle on the page. `scripts/build-jodi-plate.py`
does the flattening and is the script the shipped asset was built with:

    python3 scripts/build-jodi-plate.py <source-image>

It finds open paper by **erosion**, not by colour. Colour alone cannot separate
the wash (~30 levels of spread between channels) from the gold embroidery's
lightest highlights (~40) — too close to threshold safely. A 13px min-filter
stays bright only where nothing dark is nearby, so embroidery highlights, which
always sit within a few pixels of a gold line, are excluded while broad paper is
kept. Whatever it does catch of the groom's cream churidar is harmless: that is
within a couple of levels of the paper already.

It also dissolves the left and right edges into the paper, because the crop is
centred on the arch and that cuts the rug's ends — a soft dissolve reads as a
runner fading out, a hard cut reads as a mistake.

## Client artwork

`supports.artwork` is `"built-in"` for this theme: the painted couple is drawn by
default, and a client can either switch the slot off (leaving a purely
typographic leaf) or upload their own caricature or portrait sketch to stand in
the arch instead.

An upload cannot reuse the painted plate — the arch is part of that painting and
there is no way to lift the pair out of it. So the arch is **also drawn in SVG**,
as `MehrabPlate` in `ornaments.tsx`: keyline border, cusped arch, spandrel
paisleys and a fringed rug. `portrait.tsx` picks between the two.

Only one is ever on screen, so they do not have to match pixel for pixel, but
every number in `MehrabPlate` is measured off the painting and converted into the
shared viewBox, so the two read as the same design at the same scale.

An upload should be a **transparent-background** drawing, full length, feet at
the bottom edge of its canvas. `ARTWORK_HEIGHT_PCT` (82) is the height it takes
at `scale: 1`, chosen to leave headroom under the arch's crown; the client can
then nudge, scale and mirror it, and what they position in the content editor is
what their guests see (the editor renders this same component).

## Palette

Read off the artwork itself, so the type and the painting agree — see the `jodi`
entry in `themes/registry.ts` for the full set. Three colours:

- Paper: ivory `#FEFAEF`, deepening to `#F3E8D2`
- Ornament: antique gold `#C29B4E` (light `#E3C88A`, dark enough to read on ivory `#9A7526`)
- Accent: oxblood `#7A1B22` — her lehenga (deeper `#5A1218`)
- Text ink: warm brown `#4A2A22`, soft `#8A6A5C`
- The bouquet's sage `#97A177` is the only other hue, in hairline doses

## Licensing

Use only artwork you hold the rights to, and keep the licence or the generation
record alongside the asset. The current plate is an AI-generated illustration
supplied by the project owner as unencumbered.

## Verifying

1. Load `/demo/jodi`. Check the hero at a phone width and at ≥1024px — the layout
   switches from stacked to two columns at `lg`.
2. Look hard at the paper around the plate. Any rectangle at all means the paper
   contract above is broken.
3. Force the drawn fallback (in devtools, point the plate's `<img src>` at a file
   that does not exist) to check `MehrabPlate` — this is what a client's own
   artwork stands in.
4. Re-run `node scripts/capture-theme-cards.mjs jodi` so the gallery card picks up
   the new art.
