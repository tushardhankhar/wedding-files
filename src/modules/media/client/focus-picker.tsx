"use client";

import { useRef, useState } from "react";
import type { Focus } from "@/modules/website/schema";
import { focusStyles } from "@/modules/website/render/image-focus";

/**
 * Lets the client aim a photo's crop. They drag a marker onto the subject (the
 * focal point) and zoom in; we store a theme-agnostic {@link Focus}. The live
 * previews use the very same `focusStyles()` the site renders with, so what you
 * see here is what each theme's frame will show — no matter its aspect ratio.
 */

const DEFAULT: Focus = { x: 0.5, y: 0.5, zoom: 1 };

/** Representative frame shapes the themes crop into. */
const FRAMES: { label: string; ratio: string }[] = [
  { label: "Wide", ratio: "16 / 9" },
  { label: "Portrait", ratio: "3 / 4" },
  { label: "Square", ratio: "1 / 1" },
];

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export function FocusPicker({
  url,
  value,
  onChange,
}: {
  url: string;
  value?: Focus;
  onChange: (focus: Focus) => void;
}) {
  const focus = value ?? DEFAULT;
  const areaRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  function pointTo(clientX: number, clientY: number) {
    const el = areaRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    onChange({
      ...focus,
      x: clamp01((clientX - rect.left) / rect.width),
      y: clamp01((clientY - rect.top) / rect.height),
    });
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Drag the dot onto the most important part (usually a face), then zoom to
        taste.
      </p>

      {/* Picker: whole image shown, with a draggable focal marker. */}
      <div
        ref={areaRef}
        className="relative mx-auto max-h-72 w-fit max-w-full cursor-crosshair select-none overflow-hidden rounded-md border bg-muted/40 touch-none"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setDragging(true);
          pointTo(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => dragging && pointTo(e.clientX, e.clientY)}
        onPointerUp={(e) => {
          e.currentTarget.releasePointerCapture(e.pointerId);
          setDragging(false);
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- couple gallery URL */}
        <img
          src={url}
          alt=""
          draggable={false}
          className="max-h-72 w-auto max-w-full object-contain"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-primary/70 shadow-[0_0_0_2px_rgba(0,0,0,0.35)]"
          style={{ left: `${focus.x * 100}%`, top: `${focus.y * 100}%` }}
        />
      </div>

      {/* Zoom */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-muted-foreground">Zoom</span>
        <input
          type="range"
          min={1}
          max={4}
          step={0.05}
          value={focus.zoom}
          onChange={(e) =>
            onChange({ ...focus, zoom: Number(e.target.value) })
          }
          className="h-1 flex-1 accent-primary"
          aria-label="Zoom"
        />
        <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
          {focus.zoom.toFixed(1)}×
        </span>
      </div>

      {/* Live previews — the real crops, via the site's own focusStyles(). */}
      <div>
        <p className="mb-1.5 text-xs text-muted-foreground">
          How it crops in different theme layouts:
        </p>
        <div className="grid grid-cols-3 gap-2">
          {FRAMES.map((f) => {
            const fs = focusStyles(focus);
            return (
              <figure key={f.label} className="space-y-1">
                <div
                  className="overflow-hidden rounded-md border bg-muted"
                  style={{ aspectRatio: f.ratio }}
                >
                  <div className="h-full w-full" style={fs.zoom}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- couple gallery URL */}
                    <img
                      src={url}
                      alt=""
                      draggable={false}
                      style={fs.image}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
                <figcaption className="text-center text-[10px] uppercase tracking-wide text-muted-foreground">
                  {f.label}
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </div>
  );
}
