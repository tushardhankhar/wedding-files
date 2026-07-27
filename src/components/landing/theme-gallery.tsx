"use client";

import { useState } from "react";
import { SHOWCASE_THEMES, type ThemeCategory } from "./data";
import { ThemeCard } from "./theme-card";

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
          <ThemeCard key={t.id} theme={t} />
        ))}
      </div>
    </>
  );
}
