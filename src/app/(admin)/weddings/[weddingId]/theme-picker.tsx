"use client";

import { useState, useTransition } from "react";
import { updateWeddingThemeAction } from "@/modules/weddings/server/actions";

export interface ThemeOption {
  id: string;
  name: string;
  description: string;
  swatch: string[];
}

export function ThemePicker({
  weddingId,
  currentThemeId,
  themes,
}: {
  weddingId: string;
  currentThemeId: string;
  themes: ThemeOption[];
}) {
  const [selected, setSelected] = useState(currentThemeId);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function choose(id: string) {
    if (id === selected || pending) return;
    const prev = selected;
    setSelected(id);
    setError(null);
    startTransition(async () => {
      const res = await updateWeddingThemeAction(weddingId, id);
      if (res.error) {
        setSelected(prev);
        setError(res.error);
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {themes.map((t) => {
          const active = t.id === selected;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => choose(t.id)}
              disabled={pending}
              aria-pressed={active}
              className={`rounded-xl border p-3 text-left transition-colors ${
                active
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-border hover:border-[color:var(--gold-line)]"
              }`}
            >
              <div className="mb-2 flex gap-1.5">
                {t.swatch.map((c) => (
                  <span
                    key={c}
                    className="size-5 rounded-full border border-black/10"
                    style={{ background: c }}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="font-heading text-sm font-semibold">
                  {t.name}
                </span>
                {active ? (
                  <span className="font-heading text-[11px] font-semibold uppercase tracking-wide text-primary">
                    Selected
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {t.description}
              </p>
            </button>
          );
        })}
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
