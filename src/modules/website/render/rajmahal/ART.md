# The Rajmahal — artwork specification

This theme is built from **ten painted layers**, not from drawn SVG. They ship at

    public/themes/rajmahal/*.webp

and are theme-level and static — the same palace for every couple, part of the
build. A couple's own photographs are a different thing entirely and arrive
through `config.gallery`.

Sources are **not** committed (they are ~3.5 MB each). Keep them somewhere you
can find again, and rebuild with:

    python3 scripts/build-rajmahal-art.py <source-dir>

## The layers

| File | Role | Encoded |
|---|---|---|
| `gate-closed.webp` | The carved gateway, doors **shut**. The first screen. | 940×1290 |
| `gate-open.webp` | The **same** gateway, doors ajar onto the gardens. | 940×1291 |
| `palace.webp` | The palace facade, seen from the garden. | 1200×670 |
| `toran.webp` | Marigold & jasmine garland archway with bells. | 820×1230 |
| `jharokha.webp` | Carved stone balcony — frames the couple. | 640×739 |
| `couple.webp` | Bride & groom, full length. | 660×1070 |
| `elephant-left.webp` | Caparisoned elephant, **facing left**. | 458×380 |
| `elephant-right.webp` | Caparisoned elephant, **facing right**. | 457×380 |
| `peacock-side.webp` | Peacock in profile, tail cascading. | 500×839 |
| `peacock-fan.webp` | Peacock front-on, tail fanned. | 740×514 |

## THE GATEWAY PAIR IS THE CONTRACT

Everything cinematic about this theme rests on one property: **`gate-closed` and
`gate-open` are the same arch, and their stonework registers.** Differencing the
two shows movement confined to the door leaves; the outer arch, columns, peacock
statues and plinths line up.

That is what lets the hero work the way it does. `gate-open` is laid down whole
and never animated — it supplies the frame, the garden and the palace beyond.
Over it sit two **leaves**: copies of `gate-closed`, each clipped to half the
doorway and hinged on its outer edge. At rest they cover the aperture exactly and
the composite reads as one closed gate. On scroll they swing inward and fade.

The obvious alternative — cross-dissolving the two whole plates — was tried and
rejected: the stone ghosts against itself for the length of the dissolve, and the
stonework is exactly where the eye is fixated.

**If you replace either gateway image, you must replace both, from the same
generation, with the camera unmoved.** A pair that does not register will show
the frame swimming as the doors open, and no amount of tuning fixes it.

### The aperture

Measured off the paintings by differencing them — not eyeballed:

```
left 26.5%   top 16%   right 79.5%   bottom 100%   (split at 53%)
```

These live as `--rjm-ap-*` on `.rjm` in `globals.css`, and the `clip-path` on
`.rjm-leaf-l` / `.rjm-leaf-r` derives from them. The leaves are cut **slightly
wider than the stone opening** on purpose: they overlap onto the jamb, so when
they swing away they reveal identical stone from `gate-open` underneath. A gap
would flash the garden at the hinge line; an overlap is invisible.

Re-derive them after any art swap with the difference-profile snippet in the
build script's history, or by eye against `_aperture_test.png`.

## Replacing a layer

Drop a new source PNG named exactly as the table above into your source dir and
re-run the build script. Requirements:

| | |
|---|---|
| **Format** | PNG or WebP with a **real alpha channel** — a true cut-out, not a subject on a background |
| **Edges** | Soft/feathered. The script preserves the feather; it does not create one |
| **Ground** | None. Anything opaque behind the subject will composite as a visible rectangle |
| **Size** | At least the encoded size in the table; larger is fine, the script downscales |

The current set arrived already matted, which is why there is no matting step in
the pipeline. If a future source does not, matte it before it reaches the script
— a flood-fill against these smooth gradient backdrops leaks badly into the pale
elephants.

### What the build script actually does

Two things beyond a resize, both load-bearing:

1. **Trims on an alpha threshold, not `getbbox()`.** Every layer carries a faint
   warm halo reaching nearly to the canvas edge, so the true bbox is the whole
   canvas and trimming would be a no-op. Thresholding at alpha 8 first finds
   where the subject stops — that is what sheds 30–60% of the pixels.

2. **Encodes with `alpha_quality=70`.** WebP stores the alpha plane losslessly by
   default, and on these wide feathered halos that plane was ~40% of every file.
   Lossy alpha is visually identical on the theme's ivory ground — verified on
   the two hardest edges in the set, the peacock's tail filaments and the toran's
   jasmine strands — and takes the set from 3.7 MB to 1.6 MB.

RGB quality barely matters here: 82 → 56 saves only ~20%, because painterly
texture compresses poorly either way. Do not chase it.

## Budget

1.6 MB total, of which **only `gate-closed` is eager** — it is the first screen.
Everything else is `loading="lazy"`. Keep it that way: making a second layer
eager doubles the bytes before first paint for something below the fold.

## Palette

Read off the paintings, so the type and the artwork agree — see the `rajmahal`
entry in `themes/registry.ts` for the full set. **Three colours only:**

- Sandstone / paper: `#FDF6EB`, deepening to `#E8CFA8`
- Antique gold: `#C08F3F` (light `#E7CD8E`, deep `#8A6526`)
- Deep maroon: `#7C2230` — from the bride's lehenga

The peacocks bring teal and lapis, but **only inside their own artwork**. Nothing
in the CSS may introduce a fourth hue, or the palace stops reading as one lit
interior and starts reading as a swatch page.

## Licensing

Use only artwork you hold the rights to, and keep the licence or the generation
record alongside the source. The current set is AI-generated illustration
supplied by the project owner as unencumbered.

## Verifying

1. Load `/demo/rajmahal`. Scroll the hero slowly — the leaves must stay locked to
   the stone jamb through the whole swing, with no seam and no garden leaking at
   the hinge.
2. Check the hero at **248px wide** — that is the iframe width inside
   `ThemePhone`, which the landing gallery and `/dev/card/[themeId]` both render.
   This repo has been bitten by a hero that was perfect at 430px and clipped at
   248px.
3. Turn on `prefers-reduced-motion`. The doors should already be open, the hero's
   300vh runway should collapse, and nothing should scrub.
4. Throttle to slow 3G and confirm only `gate-closed` blocks first paint.
5. Re-run `node scripts/capture-theme-cards.mjs rajmahal` so the gallery card
   picks up the art.
