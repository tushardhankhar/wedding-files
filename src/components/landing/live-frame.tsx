"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * The `/demo/[theme]?embed=1` iframe, mounted late and optionally self-touring.
 *
 * Two jobs the plain <iframe loading="lazy"> couldn't do:
 *
 * 1. **Deferred mount.** A hero iframe is a second full render of the guest site
 *    above the fold, and `loading="lazy"` doesn't help there — anything in the
 *    viewport loads immediately and drags LCP with it. So the element only
 *    enters the tree once it's actually near the viewport, which keeps the hero's
 *    headline and CTA on the critical path alone.
 * 2. **Auto-tour.** The product is interactive; a still screenshot of it isn't a
 *    demonstration. Because the demo is same-origin we can scroll its window
 *    ourselves, walking the visitor past the countdown, events, gallery and RSVP
 *    without touching the host page's scroll.
 *
 * `eager` opts both behaviours out for the screenshot routes (`/dev/card/*`),
 * where the iframe must exist in the first paint and must not move.
 */

/**
 * Section anchors the tour stops at, in the order a guest would meet them.
 * Every theme names its sections from this vocabulary, and each one only has
 * some of them, so the tour keeps whichever are actually in the document —
 * which is also why it can't just step through fractions of scroll height: at
 * 13,000px tall a fifth of the page is a blur that lands mid-section.
 */
const TOUR_STOPS = ["top", "story", "celebrations", "events", "gallery", "rsvp"];
const DWELL_MS = 3600;

export function LiveFrame({
  src,
  title,
  eager = false,
  tour = false,
  className,
  onStopChange,
}: {
  src: string;
  title: string;
  eager?: boolean;
  tour?: boolean;
  className?: string;
  /** Reports each section id the tour lands on. */
  onStopChange?: (stopId: string) => void;
}) {
  const holderRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  // Held in a ref, not read from the tour effect's closure: callers pass an
  // inline arrow, so a dependency on it would tear down and re-arm the interval
  // on every parent render and the tour would never advance.
  const onStopRef = useRef(onStopChange);
  useEffect(() => {
    onStopRef.current = onStopChange;
  }, [onStopChange]);
  const [mounted, setMounted] = useState(eager);
  // The tour only runs while the phone is on screen, so a scrolled-past hero
  // never spends frames scrolling a document nobody is looking at.
  const [onScreen, setOnScreen] = useState(false);

  // Mount when the phone comes within a screen of the viewport.
  useEffect(() => {
    if (eager) return;
    const holder = holderRef.current;
    if (!holder) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        setOnScreen(entry.isIntersecting);
        if (entry.isIntersecting) setMounted(true);
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(holder);
    return () => io.disconnect();
  }, [eager]);

  // A touring frame is the hero's, so it's on screen by definition and mustn't
  // wait on the observer: a background tab produces no frames, so no
  // intersection is ever delivered and the phone would still be empty when the
  // visitor switches to it. Idle time after first paint is late enough to keep
  // it off the critical path and early enough to be ready.
  useEffect(() => {
    if (eager || !tour || mounted) return;
    const idle = window.requestIdleCallback;
    if (idle) {
      const handle = idle(() => setMounted(true), { timeout: 2000 });
      return () => window.cancelIdleCallback(handle);
    }
    const timer = window.setTimeout(() => setMounted(true), 1200);
    return () => window.clearTimeout(timer);
  }, [eager, tour, mounted]);

  // Walk the demo through its sections, then return to the top and repeat.
  //
  // Deliberately not gated on a load event. A cached demo can finish loading
  // before React attaches onLoad, and waiting on a load that already happened
  // would strand the tour; instead every tick re-reads the document and simply
  // does nothing until the sections are there.
  useEffect(() => {
    if (!tour || eager || !mounted || !onScreen) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let stop = 0;
    const timer = window.setInterval(() => {
      // A hidden tab produces no frames, so a smooth scroll can't advance —
      // but setInterval still fires. Ticking through it would march the caller's
      // legend past sections the phone never actually moved to, and leave the
      // two disagreeing when the visitor comes back.
      if (document.hidden) return;

      const win = frameRef.current?.contentWindow;
      // Cross-origin or a swapped-out frame: leave the demo where it is rather
      // than throwing on every tick.
      try {
        const doc = win?.document;
        if (!win || !doc) return;
        // A touring frame can't carry scrolling="no" — that clamps scrollTo
        // along with the user's wheel — so the scrollbar it would have
        // suppressed is hidden from inside instead. Idempotent, and here rather
        // than at arm time because the document may not exist yet then.
        if (!doc.getElementById("jashn-tour-style")) {
          const style = doc.createElement("style");
          style.id = "jashn-tour-style";
          style.textContent =
            "html{scrollbar-width:none}html::-webkit-scrollbar{display:none}";
          doc.head.append(style);
        }
        // Resolved every tick rather than cached: a theme can mount sections
        // after first paint, and a stale node list would scroll to nothing.
        const stops = TOUR_STOPS.map((id) => doc.getElementById(id)).filter(
          (el): el is HTMLElement => Boolean(el),
        );
        if (!stops.length) return;
        stop = (stop + 1) % stops.length;
        // Rect + scrollY rather than offsetTop: sections sit inside a theme
        // wrapper, so offsetTop is measured from that wrapper, not the document.
        const top = stops[stop].getBoundingClientRect().top + win.scrollY;
        win.scrollTo({ top, behavior: "smooth" });
        onStopRef.current?.(stops[stop].id);
      } catch {
        window.clearInterval(timer);
      }
    }, DWELL_MS);

    return () => window.clearInterval(timer);
  }, [tour, eager, mounted, onScreen]);

  return (
    // The holder fills the phone screen so the observer measures the real slot
    // even before the iframe exists.
    <div ref={holderRef} className={cn("absolute inset-0", className)}>
      {mounted && (
        <iframe
          ref={frameRef}
          src={src}
          title={title}
          loading={eager ? "eager" : "lazy"}
          // Omitted while touring: scrolling="no" clamps programmatic scrollTo,
          // not just the user's wheel.
          scrolling={tour ? undefined : "no"}
          tabIndex={-1}
          aria-hidden="true"
          // Rounded on the iframe itself, not just clipped by the parent: under a
          // fractional transform the iframe composites on its own layer and its
          // square corners otherwise show through as light slivers.
          className="pointer-events-none absolute inset-0 h-full w-full rounded-[2rem] border-0"
        />
      )}
    </div>
  );
}
