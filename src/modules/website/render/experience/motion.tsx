"use client";

import { LazyMotion, domAnimation, MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/**
 * Shared Framer Motion boundary for every "experience" theme.
 *
 * • LazyMotion + domAnimation → only the DOM animation features are bundled
 *   (the `m` component instead of `motion`), keeping the runtime small.
 * • strict → forces the use of `m.*` (not `motion.*`), so no feature is pulled
 *   in accidentally and the bundle stays lean.
 * • MotionConfig reducedMotion="user" → automatically honours
 *   prefers-reduced-motion for every child (transform/opacity tweens collapse).
 *
 * Bespoke renderers import `m` from "motion/react" and wrap their root here.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
