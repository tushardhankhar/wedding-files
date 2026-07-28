#!/usr/bin/env python3
"""Build The Jodi's plate — the couple in their mehrab arch — from a source
illustration.

    python3 scripts/build-jodi-plate.py <source-image>

Writes public/themes/jodi/plate.webp. Requires Pillow: `pip3 install Pillow`.

WHY THIS EXISTS. The plate ships as an OPAQUE rectangle rather than a matted
cut-out — matting was tried and rejected, because the drawn keyline has a gap in
the right spandrel and a flood fill therefore clears one spandrel's paper and not
the other's. An opaque rectangle is invisible on the page only if its paper is
uniform and matches the theme's `--jdi-paper` exactly, and painted paper never
is: the source carries soft watercolour blooms that leave its corners ~15 levels
warmer than its middle, which showed up on the page as a lighter rectangle.

So this flattens the paper to a single #FEFAEF and lets the theme paint its own
blooms in CSS. That is the better division anyway — CSS blooms scale with the
page, where a baked-in wash stays locked to the plate's rectangle.

Open paper is found by EROSION, not by colour. Colour alone cannot separate the
wash (~30 levels of spread between channels) from the gold embroidery's lightest
highlights (~40) — too close to threshold safely. A 13px min-filter stays bright
only where nothing dark is nearby, so embroidery highlights (always within a few
pixels of a gold line) are excluded while broad paper is kept. His cream churidar
gets caught too, and that is fine: it is within a couple of levels of the paper.

See src/modules/website/render/jodi/ART.md for the whole contract.
"""
import sys
from pathlib import Path

try:
    from PIL import Image, ImageChops, ImageFilter
except ImportError:
    sys.exit("Pillow is required: pip3 install Pillow")

ROOT = Path(__file__).resolve().parent.parent
DEST = ROOT / "public" / "themes" / "jodi"

# The source the shipped plate was built from measures 2816×1536, with the arch's
# keyline box at x 918–1898 (centre 1408) / y 21–1400 and the rug oversailing it
# at x 533–2110, y 1313–1499. The crop is centred on the ARCH — which cuts the
# rug's ends, so those get dissolved into the paper below rather than left as a
# hard vertical edge.
ARCH_CX = 1408
HALF = 735
CROP = (ARCH_CX - HALF, 0, ARCH_CX + HALF, 1520)

PAPER = (254, 250, 239)   # --jdi-paper
OPEN_MIN = 210            # how bright an eroded pixel must be to count as paper
ERODE = 13                # min-filter window; must exceed the linework's width
FADE = 170                # px of left/right edge dissolved into the paper
# Only the one asset ships. 1400px is plenty: the plate never renders wider
# than about 730 CSS px.
OUTPUTS = ((1400, "plate.webp"),)


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit(__doc__.strip().splitlines()[2].strip())
    src = Path(sys.argv[1]).expanduser()
    if not src.is_file():
        sys.exit(f"no such file: {src}")

    im = Image.open(src).convert("RGB")
    if im.size != (2816, 1536):
        print(f"! source is {im.size}, not the 2816×1536 the crop box was measured "
              f"on — check CROP before trusting the result")
    im = im.crop(CROP)
    w, h = im.size
    print(f"crop {im.size}  aspect {w / h:.4f}")

    # ── flatten the paper ────────────────────────────────────────────────────
    r, g, b = im.split()
    darkest = ImageChops.darker(ImageChops.darker(r, g), b)
    mask = darkest.filter(ImageFilter.MinFilter(ERODE)).point(
        lambda v: 255 if v >= OPEN_MIN else 0
    )
    # feathered, so repainted paper meets untouched artwork without a step
    mask = mask.filter(ImageFilter.GaussianBlur(2.5))
    flat = Image.new("RGB", (w, h), PAPER)
    im = Image.composite(flat, im, mask)

    # ── dissolve the rug's cut ends ──────────────────────────────────────────
    fade = Image.new("L", (w, h))
    row = []
    for x in range(w):
        t = min(1.0, min(x, w - 1 - x) / FADE)
        row.append(round(255 * (t * t * (3 - 2 * t))))  # smoothstep
    fade.putdata(row * h)
    im = Image.composite(im, flat, fade)

    DEST.mkdir(parents=True, exist_ok=True)
    for width, name in OUTPUTS:
        out = im.resize((width, round(width * h / w)), Image.LANCZOS)
        out.save(DEST / name, quality=88, method=6)
        print(f"wrote {(DEST / name).relative_to(ROOT)}  {out.size}")

    # Every edge must now read as the paper — this is the check that matters.
    px = im.load()
    edge = ([px[x, 0] for x in range(0, w, 40)] + [px[x, h - 1] for x in range(0, w, 40)]
            + [px[0, y] for y in range(0, h, 40)] + [px[w - 1, y] for y in range(0, h, 40)])
    lo = tuple(min(c[i] for c in edge) for i in range(3))
    hi = tuple(max(c[i] for c in edge) for i in range(3))
    print(f"edges: min {lo} max {hi} — both must equal {PAPER}")
    if lo != PAPER or hi != PAPER:
        sys.exit("! the plate's edges are not flat paper; it will show a rectangle")


if __name__ == "__main__":
    main()
