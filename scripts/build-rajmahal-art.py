#!/usr/bin/env python3
"""
Build The Rajmahal's art layers.

    python3 scripts/build-rajmahal-art.py <source-dir> [--out public/themes/rajmahal]

The source images are transparent PNGs — already cut out, with a soft feathered
edge and a faint warm halo around each subject. That halo is the reason this
script exists rather than a plain `cwebp` loop:

1. **Trim on a threshold, not on the bbox.** `Image.getbbox()` treats alpha 1 as
   content, and every one of these carries a near-invisible glow reaching most of
   the way to the canvas edge — so the true bbox is essentially the whole canvas
   and trimming does nothing. Thresholding at `HALO_FLOOR` first finds where the
   subject actually stops, which is what lets these files shed 30-60% of their
   pixels.

2. **Keep the halo that is left.** We trim to the thresholded box plus a small
   `HALO_PAD` margin, so the soft edge still fades out inside the frame instead of
   being cut square. A hard edge on the peacock's tail feathers is the one thing
   that would make these read as clip-art.

Output is one WebP per layer plus `manifest.json`, whose aspect ratios are mirrored
in `ART_SLOTS` in `render/rajmahal/art.tsx`. Re-run this and the aspect ratios can
move, so re-check that table when you do.
"""

import json
import os
import sys

from PIL import Image

# Alpha at or below this is treated as "not the subject" when measuring the crop.
# 8/255 sits above the halo's tail and below anything with visible colour in it.
HALO_FLOOR = 8
# Fraction of the trimmed size kept as breathing room so the soft edge can fade.
HALO_PAD = 0.015

# name -> (max width, max height, quality). Sized to roughly 2x the largest CSS box
# each layer is ever painted into, which covers a 2x phone without paying for
# detail nobody sees.
#
# The gateway pair is deliberately the biggest and the most compressed. It is the
# only art that gets scaled ABOVE 1:1 — the hero dollies through it — so it needs
# the pixels; but it is also flat sandstone texture, which tolerates a low RGB
# quality better than the peacocks' saturated barbs do. Peak sharpness matters at
# the START of that push, since by the end the arch is mostly off-screen anyway.
LAYERS = {
    "gate-open":      (940, 1420, 70),
    "palace":         (1200, 800, 72),
    "toran":          (820, 1230, 72),
    "jharokha":       (640, 740, 74),
    "couple":         (660, 1070, 74),
    "elephant-left":  (560, 380, 74),
    "elephant-right": (560, 380, 74),
    "peacock-side":   (500, 840, 74),
    "peacock-fan":    (740, 520, 74),
}

# Lossy alpha is where the savings actually are. These layers carry a wide
# feathered halo, and WebP stores the alpha plane losslessly by default — that
# plane, not the colour, was ~40% of every file. At 70 it is visually identical
# on the theme's ivory ground, verified on the two hardest edges in the set (the
# peacock's tail filaments and the toran's jasmine strands).
ALPHA_QUALITY = 70

# `gate-closed.png` is a SOURCE, not a shipped layer.
#
# The hero never shows the closed gate whole — it shows `gate-open` (which
# supplies the stone frame) with the closed door leaves composited into the
# doorway. So shipping the entire closed painting would send ~350 KB to paint a
# region that is 53% x 84% of it, on the critical path, above the fold.
#
# Instead we crop it to exactly the aperture and ship that. The box is measured
# off the two paintings by differencing them; it MUST stay in step with the
# --rjm-ap-* custom properties in globals.css, which position the crop back over
# the frame. Changing one without the other slides the doors off their hinges.
GATE_APERTURE = (0.265, 0.16, 0.795, 1.0)  # left, top, right, bottom (fractions)
DOORS_QUALITY = 74


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


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 1
    src = sys.argv[1]
    out = "public/themes/rajmahal"
    if "--out" in sys.argv:
        out = sys.argv[sys.argv.index("--out") + 1]
    os.makedirs(out, exist_ok=True)

    manifest = {}
    total = 0
    for name, (mw, mh, quality) in LAYERS.items():
        path = os.path.join(src, f"{name}.png")
        if not os.path.exists(path):
            print(f"  MISSING  {name}.png")
            continue
        im = Image.open(path).convert("RGBA")
        before = im.size
        im = trimmed(im)
        im.thumbnail((mw, mh), Image.LANCZOS)

        dest = os.path.join(out, f"{name}.webp")
        im.save(
            dest, "WEBP", quality=quality, method=6, alpha_quality=ALPHA_QUALITY
        )
        size = os.path.getsize(dest)
        total += size
        w, h = im.size
        manifest[name] = {"w": w, "h": h, "ratio": round(w / h, 4)}
        print(
            f"  {name:16} {before[0]}x{before[1]} -> {w}x{h}  "
            f"ratio {w / h:.4f}  {size / 1024:6.1f} KB"
        )

    # The door leaves, cropped out of the closed gate. Trimmed like the rest so
    # the crop is taken from the same pixels the aperture was measured against.
    closed = os.path.join(src, "gate-closed.png")
    if os.path.exists(closed):
        im = trimmed(Image.open(closed).convert("RGBA"))
        im.thumbnail((940, 1420), Image.LANCZOS)
        l, t, r, b = GATE_APERTURE
        doors = im.crop(
            (int(im.width * l), int(im.height * t), int(im.width * r), int(im.height * b))
        )
        dest = os.path.join(out, "gate-doors.webp")
        doors.save(dest, "WEBP", quality=DOORS_QUALITY, method=6, alpha_quality=ALPHA_QUALITY)
        size = os.path.getsize(dest)
        total += size
        w, h = doors.size
        manifest["gate-doors"] = {"w": w, "h": h, "ratio": round(w / h, 4)}
        print(
            f"  {'gate-doors':16} cropped from gate-closed -> {w}x{h}  "
            f"ratio {w / h:.4f}  {size / 1024:6.1f} KB"
        )
    else:
        print("  MISSING  gate-closed.png (source for gate-doors)")

    with open(os.path.join(out, "manifest.json"), "w") as f:
        json.dump(manifest, f, indent=2, sort_keys=True)
        f.write("\n")
    print(f"\n  {len(manifest)} layers, {total / 1024:.0f} KB total -> {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
