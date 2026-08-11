"use client";

import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";

/**
 * Pointer-driven camera for a `.m-scene` / `.m-layers` stack.
 *
 * Writes two CSS custom properties — `--m-px` and `--m-py`, both in degrees —
 * onto the element the returned ref is attached to. The 3D transform itself
 * lives in CSS (`.m-layers`), so this hook only ever touches two custom
 * properties and never a `transform`: nothing here can fight the scrubbed GSAP
 * transforms applied to the individual depth layers inside.
 *
 * Deliberately *not* React state. This fires on every pointer move; a setState
 * per event would re-render the entire theme dozens of times a second, and the
 * repo bans setState-driven animation for exactly that reason.
 *
 * Listens on `window` rather than the scene, because the parallax should track
 * the pointer even while it is over the nav or a button sitting above the
 * stage — a camera that snaps back to centre whenever the cursor crosses a link
 * is more distracting than no camera at all.
 *
 * Touch devices never fire `pointermove` without a press, so the scene simply
 * stays at its neutral 0deg/0deg — which is the composition as designed.
 */
export function usePointerCamera<T extends HTMLElement = HTMLDivElement>(
  /** Maximum yaw/pitch in degrees at the edges of the viewport. */
  amount = 3.5,
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // A camera is only worth having where there is a pointer to drive it.
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let frame = 0;
    let toX = 0;
    let toY = 0;
    let atX = 0;
    let atY = 0;

    // The easing lives here rather than in a CSS transition on `.m-layers`.
    // A transition would be restarted by every write, so how far behind the
    // camera trails would depend on how fast the pointer happened to be moving;
    // a fixed-rate glide toward the target gives one constant follow instead.
    // The loop also stops dead once it has caught up rather than running on.
    const tick = () => {
      atX += (toX - atX) * 0.09;
      atY += (toY - atY) * 0.09;
      el.style.setProperty("--m-px", `${atX.toFixed(3)}deg`);
      el.style.setProperty("--m-py", `${atY.toFixed(3)}deg`);
      frame =
        Math.abs(toX - atX) > 0.01 || Math.abs(toY - atY) > 0.01
          ? requestAnimationFrame(tick)
          : 0;
    };

    const onMove = (e: PointerEvent) => {
      // −1 … 1 across the viewport, so the neutral pose is dead centre.
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      // Yaw follows the pointer, pitch opposes it: looking down at a scene
      // should tip its top away, which is the opposite sign.
      toX = nx * amount;
      toY = -ny * amount * 0.6;
      if (!frame) frame = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [amount]);

  return ref;
}

/**
 * Handlers that tilt a framed portrait toward the pointer and track a specular
 * highlight across it.
 *
 * Writes `--m-rx` / `--m-ry` (degrees of pitch and yaw) and `--m-mx` / `--m-my`
 * (the highlight's position, in percent) onto the hovered element; `.m-tilt-inner`
 * and `.m-sheen` in globals.css consume them. Returning inert handlers rather
 * than a hook keeps this usable inside the gallery's `.map`, where a hook cannot
 * legally go.
 *
 * Tracking is deliberately instant and only the release is eased, via the
 * `.m-settling` class held for the length of the return to flush. A frame that
 * trails the cursor feels rubbery; one locked to it feels like a solid object
 * being tipped, which is the whole point of the effect.
 */
export function tiltHandlers(maxDeg = 7) {
  return {
    onPointerMove(e: ReactPointerEvent<HTMLElement>) {
      // Coarse pointers report a position too, but a tilt that only appears
      // under a finger — where it is also hidden by that finger — is noise.
      if (e.pointerType !== "mouse") return;
      const el = e.currentTarget;
      // Tracking is instant; only the release is eased. See `.m-settling`.
      el.classList.remove("m-settling");
      const r = el.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width;
      const ny = (e.clientY - r.top) / r.height;
      el.style.setProperty("--m-ry", `${((nx - 0.5) * 2 * maxDeg).toFixed(2)}deg`);
      // Pitch is inverted: pointer near the top should lift the top edge away.
      el.style.setProperty("--m-rx", `${((0.5 - ny) * 2 * maxDeg).toFixed(2)}deg`);
      el.style.setProperty("--m-mx", `${(nx * 100).toFixed(1)}%`);
      el.style.setProperty("--m-my", `${(ny * 100).toFixed(1)}%`);
    },
    onPointerLeave(e: ReactPointerEvent<HTMLElement>) {
      const el = e.currentTarget;
      // Turn the transition on for the length of the return to flush, then off
      // again so the next hover tracks the pointer without lag.
      el.classList.add("m-settling");
      el.style.removeProperty("--m-rx");
      el.style.removeProperty("--m-ry");
      window.setTimeout(() => el.classList.remove("m-settling"), 720);
    },
  };
}
