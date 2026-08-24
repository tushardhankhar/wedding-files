#!/usr/bin/env python3
"""
Build The Miramar's art layers.

    python3 scripts/build-miramar-art.py <source-dir> [--out public/themes/miramar]

Same shape as `build-rajmahal-art.py`, and for the same reason: the sources are
transparent PNGs that already carry a soft feathered edge and a faint halo
reaching most of the way to the canvas, so `Image.getbbox()` finds nothing to
trim. Threshold the alpha first, crop to *that* box plus a small margin, and the
files shed a third of their pixels while the edge still fades out inside the
frame.

What is different here is that two of the shipped layers are CROPS of one
source. `spray-corner.png` is a full left-edge garland: dense cluster at the
head, tapering trail at the foot. The plate wants the head (a corner spray) and
the deep sections want the whole run (a side garland), so the same painting is
cut twice rather than being asked to be both at one size.

Output is one WebP per layer plus `manifest.json`, whose dimensions are mirrored
in `ART_SLOTS` in `render/miramar/art.tsx`. Re-run this and those can move, so
re-check that table when you do.
"""

import json
import os
import sys

from PIL import Image

# Alpha at or below this is "not the subject" when measuring the crop. 8/255 sits
# above the halo's tail and below anything with visible colour in it.
HALO_FLOOR = 8
# Fraction of the trimmed size kept as breathing room so the soft edge can fade.
HALO_PAD = 0.015

# slot -> (source stem, max width, max height, quality, crop, fade)
#
# `crop` is (left, top, right, bottom) as fractions of the TRIMMED source, or
# None for the whole thing.
#
# `fade` is the fraction of the CROPPED height over which alpha is ramped away
# at the bottom edge, or 0 for none. It exists for exactly one reason: a crop
# taken through the middle of a painting leaves a razor-straight cut, and a
# razor-straight cut across a spray of flowers is the single most obvious tell
# that a "corner ornament" is a slice of something bigger. Ramping the last
# quarter of the trail to nothing reads instead as the garland receding, which
# is what watercolour florals do anyway. Only cut edges get this — a natural
# edge that the painter already tapered must be left alone, or it goes foggy.
#
# Sizes are roughly 2x the largest CSS box each layer is ever painted into. The
# florals get the highest quality in the set: a rose petal's gradient is the one
# thing in this theme that shows WebP blocking on ivory paper, and the corner
# spray sits at the top of the hero where it is looked at longest.
LAYERS = {
    # The plate's corner spray — the head of the garland, where the roses,
    # hydrangea and gypsophila are densest.
    "spray-corner":  ("spray-corner", 620, 620, 82, (0.0, 0.0, 1.0, 0.36), 0.26),
    # The same garland whole, for a section's outer edge. No fade: the painter
    # already tapers this one to nothing at the foot.
    "garland":       ("spray-corner", 520, 1000, 80, None, 0.0),
    # The nautical cross: gold tracery on navy, one blush rose at its foot. The
    # theme's Catholic mark — it replaces a drawn one at the crown of the plate.
    "cross":         ("cross", 460, 730, 82, None, 0.0),
    # The anchor dressed with roses — the signature. Big, so it survives being
    # the largest single object on the page.
    "anchor-floral": ("anchor-floral", 700, 1090, 80, None, 0.0),
    # The same anchor undressed, for the small nautical marks.
    "anchor":        ("anchor", 420, 660, 80, None, 0.0),
    # The bouquet — a standalone spray for a section head.
    "bouquet":       ("bouquet", 620, 1030, 82, None, 0.0),
    # The ship's wheel. Warm mahogany, which is a fourth hue this palette does
    # not otherwise carry, so it is only ever a low-opacity watermark.
    "wheel":         ("wheel", 640, 630, 78, None, 0.0),
    # The reef knot, navy through ivory with gold ferrules — the divider.
    "knot":          ("knot", 900, 490, 80, None, 0.0),
}

# Lossy alpha is where the savings are: WebP stores the alpha plane losslessly by
# default, and on a wide feathered halo that plane is ~40% of the file. At 72 it
# is visually identical on this theme's ivory, checked on the two hardest edges
# in the set (the gypsophila sprays and the rope's frayed tassels).
ALPHA_QUALITY = 72


def trimmed(im: Image.Image) -> Image.Image:
    """Crop away the canvas the subject never reaches, keeping its soft edge."""
    alpha = im.getchannel("A")
    solid = alpha.point(lambda v: 255 if v > HALO_FLOOR else 0)
    box = solid.getbbox()
    if box is None:
        return im
    l, t, r, b = box
    pad_x = int((r - l) * HALO_PAD)
    pad_y = int((b - t) * HALO_PAD)
    return im.crop(
        (
            max(0, l - pad_x),
            max(0, t - pad_y),
            min(im.width, r + pad_x),
            min(im.height, b + pad_y),
        )
    )


def faded(im: Image.Image, fraction: float) -> Image.Image:
    """Ramp alpha away over the bottom `fraction` of the image, easing in."""
    alpha = im.getchannel("A")
    band = max(1, int(im.height * fraction))
    ramp = Image.new("L", (1, im.height), 255)
    for i in range(band):
        y = im.height - band + i
        t = (i + 1) / band
        # Cubic rather than linear: a linear ramp starts biting immediately and
        # visibly greys the flowers well above the edge.
        ramp.putpixel((0, y), int(255 * (1 - t) ** 3))
    alpha = Image.composite(
        alpha, Image.new("L", im.size, 0), ramp.resize(im.size)
    )
    im = im.copy()
    im.putalpha(alpha)
    return im


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 1
    src = sys.argv[1]
    out = "public/themes/miramar"
    if "--out" in sys.argv:
        out = sys.argv[sys.argv.index("--out") + 1]
    os.makedirs(out, exist_ok=True)

    manifest = {}
    total = 0
    for name, (stem, mw, mh, quality, crop, fade) in LAYERS.items():
        path = os.path.join(src, f"{stem}.png")
        if not os.path.exists(path):
            print(f"  MISSING  {stem}.png")
            continue
        im = trimmed(Image.open(path).convert("RGBA"))
        before = im.size
        if crop:
            l, t, r, b = crop
            im = im.crop(
                (int(im.width * l), int(im.height * t), int(im.width * r), int(im.height * b))
            )
            # A crop can leave empty canvas on the cut edge; take it back off.
            im = trimmed(im)
        if fade:
            im = faded(im, fade)
        im.thumbnail((mw, mh), Image.LANCZOS)

        dest = os.path.join(out, f"{name}.webp")
        im.save(dest, "WEBP", quality=quality, method=6, alpha_quality=ALPHA_QUALITY)
        size = os.path.getsize(dest)
        total += size
        w, h = im.size
        manifest[name] = {"w": w, "h": h, "ratio": round(w / h, 4)}
        print(
            f"  {name:14} {stem}.png {before[0]}x{before[1]} -> {w}x{h}  "
            f"ratio {w / h:.4f}  {size / 1024:6.1f} KB"
        )

    with open(os.path.join(out, "manifest.json"), "w") as f:
        json.dump(manifest, f, indent=2, sort_keys=True)
        f.write("\n")
    print(f"\n  {len(manifest)} layers, {total / 1024:.0f} KB total -> {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
