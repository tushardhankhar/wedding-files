"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

let registered = false;

/**
 * Register ScrollTrigger exactly once, on the client.
 *
 * Every consumer calls this rather than doing it at module scope: the module is
 * imported during SSR too, and registering a DOM plugin there touches `document`.
 */
export function registerScrollTrigger() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

/**
 * Wraps a theme in Lenis smooth scrolling.
 *
 * **Lenis MUST own its own rAF loop.** An earlier version set `autoRaf: false`
 * and stepped Lenis from `gsap.ticker` instead — the widely-posted "one clock"
 * recipe, chosen so ScrollTrigger and Lenis could never read scroll position in a
 * different order within a frame. It makes the page unscrollable.
 *
 * GSAP's ticker auto-sleeps after `autoSleep` frames (120 by default) with no
 * active animations. Nothing on an idle page keeps it awake, so a few seconds
 * after the last tween finishes the ticker stops — and with it the only thing
 * calling `lenis.raf()`. Lenis preventDefaults the wheel but can no longer
 * advance, so wheel, touch and anchor scrolling all die silently. It survives
 * casual testing precisely because testing keeps animations running.
 *
 * The ordering concern that motivated the single ticker is real but small here:
 * this theme pins with CSS `position: sticky`, not GSAP `pin`, so there are no
 * pin spacers to desynchronise. `lenis.on("scroll", ScrollTrigger.update)` keeps
 * the two in step, which is enough.
 *
 * `lagSmoothing(0)` still applies to GSAP itself: its default lag smoothing hides
 * a stalled main thread by fast-forwarding time, which desynchronises a scrub
 * from the scrollbar. Better to drop frames honestly than to jump.
 *
 * Under `prefers-reduced-motion` no Lenis instance is created at all and the page
 * keeps native scrolling — smooth-scroll hijacking is itself a motion effect, and
 * it is the part people with vestibular sensitivity report first.
 *
 * `paused` holds the page still. A theme with a cover — a ceremonial entrance,
 * a gate — needs the document not to move while that cover is up, or the
 * visitor scrolls the page behind it and the reveal lands on a hero that has
 * already slid halfway off screen. It is deliberately handled two ways at once,
 * because there are two things that can scroll: `lenis.stop()` for Lenis, and a
 * capture-phase `preventDefault` for the native scrolling that remains under
 * reduced motion. Neither touches `overflow`, which would collapse the
 * scrollbar and shift the whole layout sideways at exactly the wrong moment.
 *
 * `preventDefault` does not stop propagation, so a cover that opens itself on
 * wheel or touch still hears the gesture.
 *
 * `children` is optional: this component is nothing but effects, so a theme
 * that needs to feed it state from inside its own tree can render it as a
 * childless sibling rather than restructuring itself around a wrapper.
 */
export function SmoothScroll({
  children,
  paused = false,
}: {
  children?: ReactNode;
  paused?: boolean;
}) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    registerScrollTrigger();

    const lenis = new Lenis({
      duration: 1.05,
      // Slightly over-damped: the tail settles rather than coasting, which keeps
      // scrubbed art from drifting after the finger lifts.
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      // Lenis drives itself. See the note above — do not set this to false.
      autoRaf: true,
      anchors: true,
      // Touch devices already have momentum in hardware; doubling it feels laggy.
      smoothWheel: true,
      syncTouch: false,
    });

    const update = () => ScrollTrigger.update();
    lenis.on("scroll", update);
    gsap.ticker.lagSmoothing(0);
    lenisRef.current = lenis;

    return () => {
      lenis.off("scroll", update);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Declared after the effect that creates Lenis, so on mount the instance
  // already exists by the time this runs and an initially-paused page is held
  // still from the first frame rather than one effect too late.
  useEffect(() => {
    if (!paused) {
      lenisRef.current?.start();
      return;
    }
    lenisRef.current?.stop();
    const block = (e: Event) => e.preventDefault();
    window.addEventListener("wheel", block, { passive: false, capture: true });
    window.addEventListener("touchmove", block, { passive: false, capture: true });
    return () => {
      window.removeEventListener("wheel", block, true);
      window.removeEventListener("touchmove", block, true);
      lenisRef.current?.start();
    };
  }, [paused]);

  return <>{children}</>;
}
