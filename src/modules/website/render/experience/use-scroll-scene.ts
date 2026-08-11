"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { registerScrollTrigger } from "./smooth-scroll";

/**
 * How much motion this device has earned.
 *
 * - `full`  — pointer-capable or roomy viewport: pinned sequences, every layer.
 * - `lite`  — phones: same choreography, fewer layers, no pinning. Pinning on a
 *             phone fights the URL-bar collapse, which changes viewport height
 *             mid-scroll and makes a pinned section jump.
 * - `still` — `prefers-reduced-motion: reduce`: no scrubbing at all. Scenes are
 *             expected to render their FINAL state, not their first.
 */
export type SceneTier = "full" | "lite" | "still";

export interface SceneContext {
  tier: SceneTier;
  /** The element the hook is attached to. All selectors should be scoped to it. */
  scope: HTMLElement;
}

/**
 * Attach a scroll-driven scene to an element.
 *
 * Returns a ref to spread onto the scene's root. `build` runs once per matching
 * tier and may create any number of tweens and ScrollTriggers; everything it
 * creates is reverted automatically when the tier changes or the component
 * unmounts, because it all happens inside a `gsap.matchMedia` scoped to the root.
 * That is the whole reason this wraps matchMedia rather than raw ScrollTrigger:
 * resizing a desktop window down to phone width has to tear the pinned desktop
 * choreography down completely, and hand-rolled cleanup misses pin spacers.
 *
 * `build` must not touch React state. These scenes are scrubbed at 60fps, and a
 * setState per frame would be both a render storm and a lint error — the repo
 * bans setState-in-effect. Scenes talk to the DOM through GSAP directly.
 */
export function useScrollScene<T extends HTMLElement = HTMLDivElement>(
  build: (ctx: SceneContext) => void,
) {
  const ref = useRef<T | null>(null);
  // `build` is re-created on every render; keeping it in a ref lets the scene
  // effect stay mount-only, so a parent re-render never tears down and rebuilds
  // a scrubbed timeline mid-scroll.
  //
  // The sync has to happen in its own effect rather than during render (writing
  // a ref while rendering is a React correctness error, and the repo lints for
  // it). Declaring it FIRST matters: effects run in declaration order, so the
  // ref is current before the scene effect below reads it on mount.
  const buildRef = useRef(build);
  useEffect(() => {
    buildRef.current = build;
  });

  useEffect(() => {
    const scope = ref.current;
    if (!scope) return;
    registerScrollTrigger();

    const mm = gsap.matchMedia(scope);
    mm.add(
      {
        full: "(prefers-reduced-motion: no-preference) and (min-width: 768px)",
        lite: "(prefers-reduced-motion: no-preference) and (max-width: 767px)",
        still: "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        const c = context.conditions as Record<SceneTier, boolean>;
        const tier: SceneTier = c.still ? "still" : c.full ? "full" : "lite";
        buildRef.current({ tier, scope });
      },
    );

    return () => mm.revert();
  }, []);

  return ref;
}

/**
 * Refresh ScrollTrigger once the theme's artwork has settled.
 *
 * Painted layers arrive after first paint and most are `position: absolute`, but
 * enough of them sit in flow that the document keeps growing for a second or two
 * — and a ScrollTrigger built against the shorter document ends its scrub early,
 * stranding a sequence part-finished. Fonts do the same thing to headings.
 *
 * Call this once from the theme root.
 */
export function useRefreshOnLoad() {
  useEffect(() => {
    registerScrollTrigger();
    let cancelled = false;
    const refresh = () => {
      if (!cancelled) ScrollTrigger.refresh();
    };

    // Anything still decoding when we mount.
    const pending = Array.from(document.images).filter((img) => !img.complete);
    pending.forEach((img) => {
      img.addEventListener("load", refresh, { once: true });
      img.addEventListener("error", refresh, { once: true });
    });
    document.fonts?.ready.then(refresh).catch(() => {});
    window.addEventListener("load", refresh, { once: true });

    return () => {
      cancelled = true;
      pending.forEach((img) => {
        img.removeEventListener("load", refresh);
        img.removeEventListener("error", refresh);
      });
      window.removeEventListener("load", refresh);
    };
  }, []);
}
