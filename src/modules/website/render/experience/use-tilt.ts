"use client";

import { useEffect } from "react";
import {
  useMotionValue,
  useSpring,
  useReducedMotion,
  type MotionValue,
} from "motion/react";

export interface TiltControls {
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
  /** Sheen position (0–1 across the card), tracks the tilt. */
  glareX: MotionValue<number>;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerLeave: () => void;
}

/**
 * Springy 3D tilt for a card. Desktop: follows the cursor across the element.
 * Mobile: follows finger drag (pointer events cover touch) AND device tilt via
 * deviceorientation when the OS grants it. Disabled under reduced-motion.
 * Spread the returned rotateX/rotateY onto an `m.div` style with
 * transformPerspective, and the pointer handlers onto the same element.
 */
export function useTilt(max = 12): TiltControls {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const gx = useMotionValue(0.5);
  const reduce = useReducedMotion();

  const rotateX = useSpring(rx, { stiffness: 150, damping: 15, mass: 0.4 });
  const rotateY = useSpring(ry, { stiffness: 150, damping: 15, mass: 0.4 });
  const glareX = useSpring(gx, { stiffness: 120, damping: 20 });

  useEffect(() => {
    if (reduce) return;
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      const g = Math.max(-1, Math.min(1, e.gamma / 30));
      const b = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
      ry.set(g * max);
      rx.set(-b * max);
      gx.set(0.5 + g * 0.5);
    };
    window.addEventListener("deviceorientation", onOrient, true);
    return () => window.removeEventListener("deviceorientation", onOrient, true);
  }, [reduce, max, rx, ry, gx]);

  const onPointerMove = (e: React.PointerEvent) => {
    if (reduce) return;
    const el = e.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * 2 * max);
    rx.set(-py * 2 * max);
    gx.set((e.clientX - r.left) / r.width);
  };
  const onPointerLeave = () => {
    rx.set(0);
    ry.set(0);
    gx.set(0.5);
  };

  return { rotateX, rotateY, glareX, onPointerMove, onPointerLeave };
}
