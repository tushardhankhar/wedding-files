import type { CSSProperties } from "react";
import type { Focus } from "../schema";

/**
 * Turns a stored per-image {@link Focus} into the two CSS pieces every theme
 * needs to frame a photo the same way, regardless of the theme's tile shape:
 *
 *   - `image`  → goes on the `<img>` (or background element): `object-position`
 *                aligns the focal point within the crop.
 *   - `zoom`   → goes on a wrapper INSIDE the fixed-size, `overflow-hidden`
 *                frame: a `scale()` about the same focal point. Keeping zoom on
 *                a separate wrapper leaves the `<img>`'s own transform free for
 *                per-theme hover animations (they compose rather than clash).
 *
 * With no focus set, `image` centers the photo and `zoom` is empty — byte-for-
 * byte the previous behaviour, so existing galleries are unaffected.
 */
export function focusStyles(focus?: Focus): {
  image: CSSProperties;
  zoom: CSSProperties;
} {
  const x = focus?.x ?? 0.5;
  const y = focus?.y ?? 0.5;
  const zoom = focus?.zoom ?? 1;
  const position = `${(x * 100).toFixed(2)}% ${(y * 100).toFixed(2)}%`;

  return {
    image: { objectPosition: position },
    zoom:
      zoom > 1
        ? { transform: `scale(${zoom})`, transformOrigin: position }
        : {},
  };
}
