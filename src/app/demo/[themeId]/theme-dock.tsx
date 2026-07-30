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
 */
export function ThemeDock({
  themes,
  activeId,
}: {
  themes: { id: string; name: string }[];
  activeId: string;
}) {
  const rail = useRef<HTMLDivElement>(null);

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

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-3">
      <div className="flex max-w-full items-center gap-1.5 rounded-full bg-black/80 px-3 py-2 text-white shadow-2xl backdrop-blur-md">
        <Link
          href="/"
          aria-label="Back to Join the Jashn"
          className="flex-none rounded-full px-2 py-1.5 text-xs font-semibold text-white/85 transition-colors hover:text-white sm:px-3"
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
          className="flex flex-nowrap items-center gap-1.5 overflow-x-auto [mask-image:linear-gradient(to_right,transparent_0,#000_28px,#000_calc(100%_-_28px),transparent_100%)] [scrollbar-width:none] sm:flex-wrap sm:justify-center sm:overflow-visible sm:[mask-image:none] [&::-webkit-scrollbar]:hidden"
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
                    ? "flex-none rounded-full bg-[#e8c877] px-3 py-1.5 text-xs font-bold whitespace-nowrap text-[#3b1022]"
                    : "flex-none rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap text-white/70 transition-colors hover:text-white"
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
