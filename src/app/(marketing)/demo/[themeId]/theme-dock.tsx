"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

/**
 * Demo chrome: back to the landing page + switch themes in place.
 *
 * On phones the theme list is a single horizontally scrolling row. Wrapping it
 * instead stacked 16 chips into six rows, and the resulting slab of black
 * covered most of the theme it was meant to be showing. From `sm` up there's
 * room to wrap, so it does.
 *
 * ── Why this component is fussy about the bottom of the screen ──────────────
 * A horizontally scrolling rail pinned to the bottom edge of a phone is the
 * worst possible neighbourhood for touch, and all three hazards bit real users
 * on iPhone (reported in Chrome iOS and the Instagram in-app browser):
 *
 *   1. Scroll chaining. When the rail hit either end, the leftover horizontal
 *      pan escaped to the browser, which read it as the back/forward EDGE SWIPE
 *      and navigated away from the demo mid-drag. `overscroll-x-contain` stops
 *      the chain; `touch-pan-x` tells the compositor this is a horizontal
 *      surface so a slightly diagonal drag doesn't get handed to the page.
 *   2. Tap targets. Chips were ~28px tall against Apple's 44px minimum, so on
 *      the bottom edge — already the least precise part of the screen — half the
 *      taps landed on the browser's own toolbar instead of a theme.
 *   3. Clearance. `bottom-4` put the pill 16px off the edge, inside the region
 *      iOS reserves for the home-indicator gesture and directly against Chrome's
 *      and Instagram's bottom bars.
 *
 * The `env(safe-area-inset-bottom)` terms are currently no-ops: the app does not
 * set `viewport-fit=cover` (doing so would slide every theme's fixed header
 * under the notch), so iOS already insets the viewport for us. They are written
 * anyway so this stays correct if cover is ever switched on.
 */
export function ThemeDock({
  themes,
  activeId,
}: {
  themes: { id: string; name: string }[];
  activeId: string;
}) {
  const rail = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLDivElement>(null);

  // Centre the current theme in the rail so you can see where you are without
  // dragging. Nudges the rail's own scrollLeft only — scrollIntoView would be
  // free to scroll the ancestors (and the page) along with it.
  useEffect(() => {
    const el = rail.current?.querySelector<HTMLElement>('[data-active="true"]');
    if (!el || !rail.current) return;
    const chip = el.getBoundingClientRect();
    const box = rail.current.getBoundingClientRect();
    rail.current.scrollLeft += chip.left - box.left - (box.width - chip.width) / 2;
  }, [activeId]);

  // Publish the dock's real height so the themes' shared back-to-top button can
  // sit above it instead of on top of the rail's last chips (`.gtt` is fixed at
  // right/bottom 22px, which overlapped the dock on any phone-width screen).
  // Measured rather than hardcoded because the dock wraps to several rows once
  // it has room to.
  useEffect(() => {
    const el = pill.current;
    if (!el) return;
    const root = document.documentElement;
    root.classList.add("has-theme-dock");
    const publish = () =>
      root.style.setProperty("--theme-dock-h", `${el.offsetHeight}px`);
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.classList.remove("has-theme-dock");
      root.style.removeProperty("--theme-dock-h");
    };
  }, []);

  // 44px minimum touch target on phones (Apple's floor), back to the compact
  // pill from `sm` up where there's a cursor and no bottom-edge crowding.
  const chipBase =
    "inline-flex min-h-11 flex-none items-center rounded-full px-4 text-sm whitespace-nowrap sm:min-h-0 sm:px-3 sm:py-1.5 sm:text-xs";

  return (
    <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom,0px)+1.75rem)] z-50 flex justify-center px-3 sm:bottom-[calc(env(safe-area-inset-bottom,0px)+1rem)]">
      <div
        ref={pill}
        className="flex max-w-full items-center gap-1.5 rounded-full bg-black/80 px-3 py-2 text-white shadow-2xl backdrop-blur-md"
      >
        <Link
          href="/"
          aria-label="Back to Join the Jashn"
          className={`${chipBase} font-semibold text-white/85 transition-colors hover:text-white`}
        >
          <span aria-hidden="true">←</span>
          <span aria-hidden="true" className="ml-1 hidden sm:inline">
            Join the Jashn
          </span>
        </Link>

        <span aria-hidden="true" className="h-4 w-px flex-none bg-white/25" />

        {/* The edge fade keeps a half-scrolled chip from being sliced off mid-word. */}
        <div
          ref={rail}
          className="flex touch-pan-x flex-nowrap items-center gap-1.5 overflow-x-auto overscroll-x-contain [mask-image:linear-gradient(to_right,transparent_0,#000_28px,#000_calc(100%_-_28px),transparent_100%)] [scrollbar-width:none] sm:flex-wrap sm:justify-center sm:overflow-visible sm:[mask-image:none] [&::-webkit-scrollbar]:hidden"
        >
          {themes.map((t) => {
            const active = t.id === activeId;
            return (
              <Link
                key={t.id}
                href={`/demo/${t.id}`}
                data-active={active}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? `${chipBase} bg-[#e8c877] font-bold text-[#3b1022]`
                    : `${chipBase} font-medium text-white/70 transition-colors hover:text-white`
                }
              >
                {t.name}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
