"use client";

import { useRef } from "react";
import type { Artwork } from "@/modules/website/schema";
import { ThemeArtworkPreview } from "@/modules/website/render/artwork-preview";

/**
 * Lets the client fit their own illustration (caricature, portrait sketch…) into
 * the theme's scene: drag it around, size it, mirror it. The preview *is* the
 * theme's scene rendered by the site's own components, so the fit they see is
 * the fit guests get.
 *
 * Offsets are fractions of the scene, which keeps the placement correct on every
 * screen size — see {@link Artwork}.
 */

/** How far the artwork may travel from home, as a share of the scene. */
const LIMIT = 0.5;
/** Arrow-key nudge per press. */
const STEP = 0.02;

const clamp = (n: number, max = LIMIT) => Math.min(max, Math.max(-max, n));

export function ArtworkPicker({
  themeId,
  value,
  initials,
  onChange,
}: {
  themeId: string;
  value: Artwork;
  /** The couple's monogram, for themes that carry it on the artwork's frame. */
  initials?: string;
  onChange: (artwork: Artwork) => void;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  /** Pointer origin + the offsets it started from, so a drag is relative. */
  const drag = useRef<{
    px: number;
    py: number;
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);

  function move(clientX: number, clientY: number) {
    const d = drag.current;
    if (!d) return;
    onChange({
      ...value,
      x: clamp(d.x + (clientX - d.px) / d.w),
      y: clamp(d.y + (clientY - d.py) / d.h),
    });
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Drag the artwork to place it, then size it until it sits naturally in the
        scene. Arrow keys nudge it a step at a time.
      </p>

      {/* Draggable stage — the real theme scene. */}
      <div
        ref={stageRef}
        role="application"
        tabIndex={0}
        aria-label="Position the artwork in the scene"
        className="mx-auto max-w-sm cursor-grab touch-none select-none overflow-hidden rounded-lg border active:cursor-grabbing focus-visible:ring-3 focus-visible:ring-ring/50"
        onPointerDown={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = {
            px: e.clientX,
            py: e.clientY,
            x: value.x,
            y: value.y,
            w: rect.width,
            h: rect.height,
          };
        }}
        onPointerMove={(e) => move(e.clientX, e.clientY)}
        onPointerUp={(e) => {
          e.currentTarget.releasePointerCapture(e.pointerId);
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
        onKeyDown={(e) => {
          const nudge: Record<string, [number, number]> = {
            ArrowLeft: [-STEP, 0],
            ArrowRight: [STEP, 0],
            ArrowUp: [0, -STEP],
            ArrowDown: [0, STEP],
          };
          const d = nudge[e.key];
          if (!d) return;
          e.preventDefault();
          onChange({
            ...value,
            x: clamp(value.x + d[0]),
            y: clamp(value.y + d[1]),
          });
        }}
      >
        <ThemeArtworkPreview themeId={themeId} artwork={value} initials={initials} />
      </div>

      {/* Size */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-muted-foreground">Size</span>
        <input
          type="range"
          min={0.3}
          max={2.5}
          step={0.05}
          value={value.scale}
          onChange={(e) => onChange({ ...value, scale: Number(e.target.value) })}
          className="h-1 flex-1 accent-primary"
          aria-label="Artwork size"
        />
        <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
          {value.scale.toFixed(2)}×
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <input
            type="checkbox"
            checked={value.flip}
            onChange={(e) => onChange({ ...value, flip: e.target.checked })}
          />
          Mirror horizontally
        </label>
        <button
          type="button"
          className="text-xs font-medium text-muted-foreground underline-offset-4 hover:underline"
          onClick={() =>
            onChange({ ...value, x: 0, y: 0, scale: 1, flip: false })
          }
        >
          Reset placement
        </button>
      </div>
    </div>
  );
}
