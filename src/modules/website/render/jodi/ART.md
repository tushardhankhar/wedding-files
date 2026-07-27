# The Jodi — artwork specification

This theme is built around licensed painted illustration. Drop the files at the
paths below and they replace the SVG fallbacks automatically — **no code change
is needed**, the theme detects them at load.

All artwork is theme-level and static (the same decorated plate for every
couple), so it lives in `public/themes/jodi/` and ships with the build. It is
not part of a couple's own photo uploads.

## Why separate layers rather than one background image

The reference plates are single composed images. Reproducing them as one image
does not survive responsive layout: at 390px wide you must either crop the
couple out of frame or shrink the mandala band until it is invisible. Supplying
the three pieces separately lets the border stay full-bleed, the couple stay
anchored to the foot of the plate, and the base scene stay proportional, at
every viewport width.

If you only have a single composed image, buy/commission it **layered** — most
stock illustrators sell the PSD/AI source, and the three exports below take
minutes to produce from it.

## The slots

| Slot | Path | Format | Recommended size | Notes |
|---|---|---|---|---|
| `topBorder` | `public/themes/jodi/top-border.png` | PNG, **transparent** | 2400 × 500 | The gold/pink mandala band. Must tile or centre cleanly; keep the design symmetrical about the horizontal centre so it crops well on narrow screens. Bleed to the left and right edges. |
| `couple` | `public/themes/jodi/couple.png` | PNG, **transparent** | 1200 × 1800 | The couple, full length, **feet flush to the bottom edge** of the canvas and no built-in shadow (the theme casts its own). Trim transparent margins tightly — the theme anchors to the image box. |
| `baseScene` | `public/themes/jodi/base-scene.png` | PNG, **transparent** | 2400 × 700 | Chhatri domes, foliage, peacocks, elephants. Ground line flush to the bottom edge. Keep the centre relatively open so the couple reads against it. |
| `wash` | `public/themes/jodi/wash.jpg` | JPG (opaque) | 1600 × 2400 | *Optional.* A painted paper/floral watercolour ground. Omit it and the theme uses its own CSS wash, which is lighter to load — only add this if the paper texture matters to you. |

## Palette to brief the illustrator

Match the theme tokens so the art and the typography agree:

- Ground: ivory `#FBF6EA` → `#F5EDDC`, blush wash `#F6DCE2`
- Bride's lehenga: magenta `#A81E58`, deeper `#7C1240`
- Groom's sherwani: cream `#FBF1E2`
- Ornament: antique gold `#C9A24A`, light gold `#E8CD7E`
- Foliage: sage `#8FA87A`
- Architecture: soft ochre `#E3BC93`
- Text ink: `#5A2436`

## Licensing

Use only artwork you hold a licence for. The reference images this theme was
designed from carry stock watermarks; they are licensable cheaply, but they must
be bought — shipping watermarked or unlicensed stock in a paid product is a real
exposure. Keep the licence receipt alongside the assets.

## Verifying

1. Drop the files in.
2. Load `/demo/jodi` — the fallbacks should be gone.
3. Re-run `node scripts/capture-theme-cards.mjs` (if you use the social cards)
   so the gallery card picks up the real art.

Until files are present each missing slot logs one 404 per page load. That is
deliberate — it makes an un-provisioned slot obvious in development.
