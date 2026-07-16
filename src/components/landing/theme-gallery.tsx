"use client";

import { useState } from "react";
import Link from "next/link";
import { SHOWCASE_THEMES, type ThemeCategory } from "./data";

/** Occasion filters shown above the theme gallery. */
const FILTERS: { id: "all" | ThemeCategory; label: string }[] = [
  { id: "all", label: "All events" },
  { id: "wedding", label: "Weddings" },
  { id: "save-the-date", label: "Save the Date" },
  { id: "other", label: "Other celebrations" },
];

export function ThemeGallery() {
  const [active, setActive] = useState<"all" | ThemeCategory>("all");
  const themes =
    active === "all"
      ? SHOWCASE_THEMES
      : SHOWCASE_THEMES.filter((t) => t.category === active);

  return (
    <>
      {/* small occasion filter, above the gallery */}
      <div className="mx-auto mt-8 max-w-6xl px-5 sm:px-8">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter themes by occasion">
          {FILTERS.map((f) => {
            const on = active === f.id;
            return (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setActive(f.id)}
                className={
                  on
                    ? "rounded-full bg-[color:var(--l-wine)] px-4 py-2 text-[13px] font-semibold text-[color:var(--l-ivory)] shadow-[0_12px_28px_-16px_rgba(59,16,34,.7)]"
                    : "rounded-full border border-[color:var(--l-line)] bg-white px-4 py-2 text-[13px] font-medium text-[color:var(--l-ink-soft)] transition-colors hover:border-[color:var(--l-gold)] hover:text-[color:var(--l-wine)]"
                }
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="l-gallery mt-8 px-5 sm:px-8 lg:px-[max(2rem,calc((100vw-72rem)/2))]">
        {themes.map((t) => (
          <div key={t.id} className="flex w-[272px] flex-col items-center">
            {/* iPhone frame showing the real theme, live */}
            <div className="group relative rounded-[2.5rem] border border-black/10 bg-[#0d0710] p-2 shadow-[0_44px_90px_-32px_rgba(59,16,34,.6)] ring-1 ring-white/5">
              {/* side buttons */}
              <span aria-hidden="true" className="absolute -left-[3px] top-24 h-12 w-[3px] rounded-l bg-black/30" />
              <span aria-hidden="true" className="absolute -right-[3px] top-20 h-8 w-[3px] rounded-r bg-black/30" />

              <div className="relative h-[520px] w-[248px] overflow-hidden rounded-[2rem] bg-[color:var(--l-ivory)]">
                {/* notch */}
                <span
                  aria-hidden="true"
                  className="absolute left-1/2 top-2 z-30 h-5 w-20 -translate-x-1/2 rounded-full bg-black"
                />
                {/* live status pill */}
                <span className="absolute right-3 top-3 z-30 inline-flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-white backdrop-blur-sm">
                  <span className="size-1.5 rounded-full bg-[#37d67a]" />
                  Live
                </span>

                {/* the actual guest site, rendered live and non-interactive */}
                <iframe
                  src={`/demo/${t.demo}?embed=1`}
                  title={`${t.name} theme — live preview`}
                  loading="lazy"
                  scrolling="no"
                  tabIndex={-1}
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 h-full w-full border-0"
                />

                {/* tap-the-screen affordance → opens the full demo in a new tab */}
                <Link
                  href={`/demo/${t.demo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open the ${t.name} theme live demo (opens in a new tab)`}
                  className="absolute inset-0 z-20 flex items-end justify-center bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 transition-opacity duration-300 focus-visible:opacity-100 group-hover:opacity-100"
                >
                  <span className="mb-7 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-[color:var(--l-wine)] shadow-lg">
                    Open live demo →
                  </span>
                </Link>
              </div>
            </div>

            {/* Theme name + vibe, below the phone */}
            <div className="mt-6 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[color:var(--l-gold)]">
                {t.vibe}
              </p>
              <h3 className="l-display mt-1 text-2xl font-semibold text-[color:var(--l-wine)]">
                {t.name}
              </h3>
              <p className="l-script text-lg text-[color:var(--l-pink)]">{t.tagline}</p>
            </div>

            {/* palette + explicit Live preview button */}
            <div className="mt-3 flex items-center gap-2">
              {t.palette.map((c) => (
                <span
                  key={c}
                  aria-hidden="true"
                  className="size-3 rounded-full border border-[color:var(--l-line)]"
                  style={{ background: c }}
                />
              ))}
            </div>
            <Link
              href={`/demo/${t.demo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-[color:var(--l-line)] bg-white px-6 py-3 text-sm font-semibold text-[color:var(--l-wine)] shadow-[0_10px_24px_-16px_rgba(59,16,34,.5)] transition-all hover:-translate-y-0.5 hover:border-[color:var(--l-gold)]"
            >
              <span aria-hidden="true" className="text-[color:var(--l-pink)]">▶</span>
              Live preview
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}
