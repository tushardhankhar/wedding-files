"use client";

import { useRef, type CSSProperties } from "react";
import type { Focus } from "../../schema";

export interface CarouselItem {
  url?: string;
  caption?: string;
  focus?: Focus;
  /** Placeholder background (CSS) when there is no photo. */
  bg?: string;
  emoji?: string;
}

export interface PhotoCarouselProps {
  items: CarouselItem[];
  className?: string;
  /** Instant-photo frame tint. */
  frameColor?: string;
  captionColor?: string;
}

// Deterministic small tilt per card (no Math.random → no hydration mismatch).
const TILTS = [-4, 3, -2.5, 4, -3.5, 2];

/**
 * A swipeable row of instant-photo cards. Uses native scroll-snap (touch/wheel)
 * plus pointer drag-to-scroll on desktop — no Framer drag feature needed, so it
 * stays in the lean domAnimation bundle and is buttery on mobile. Falls back to
 * tasteful gradient placeholder cards when a photo has no url. Reusable across
 * themes (captions render in the script display font via `.xp-hand`).
 */
export function PhotoCarousel({
  items,
  className,
  frameColor = "#ffffff",
  captionColor = "#7c88a1",
}: PhotoCarouselProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const drag = useRef({ active: false, startX: 0, startLeft: 0, moved: false });

  const onPointerDown = (e: React.PointerEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    drag.current = {
      active: true,
      startX: e.clientX,
      startLeft: el.scrollLeft,
      moved: false,
    };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const el = scrollRef.current;
    if (!el || !drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    el.scrollLeft = drag.current.startLeft - dx;
  };
  const end = () => {
    drag.current.active = false;
  };

  return (
    <div
      ref={scrollRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={end}
      onPointerLeave={end}
      className={`xp-carousel flex snap-x snap-mandatory gap-5 overflow-x-auto px-[8%] py-6 ${className ?? ""}`}
      style={{ scrollbarWidth: "none", cursor: "grab" }}
    >
      {items.map((it, i) => {
        const photoStyle: CSSProperties = it.url
          ? {
              backgroundImage: `url(${it.url})`,
              backgroundSize: "cover",
              backgroundPosition: it.focus
                ? `${(it.focus.x * 100).toFixed(1)}% ${(it.focus.y * 100).toFixed(1)}%`
                : "center",
            }
          : { background: it.bg ?? "linear-gradient(135deg,#A78BFA,#60A5FA)" };
        return (
          <figure
            key={i}
            className="xp-photo shrink-0 snap-center"
            style={{
              rotate: `${TILTS[i % TILTS.length]}deg`,
              background: frameColor,
            }}
          >
            <div
              className="xp-photo-img flex items-center justify-center text-5xl"
              style={photoStyle}
              onDragStart={(e) => e.preventDefault()}
            >
              {!it.url && it.emoji ? (
                <span aria-hidden>{it.emoji}</span>
              ) : null}
            </div>
            {it.caption ? (
              <figcaption
                className="xp-hand mt-2.5 text-center text-2xl leading-tight"
                style={{ color: captionColor }}
              >
                {it.caption}
              </figcaption>
            ) : null}
          </figure>
        );
      })}
    </div>
  );
}
