"use client";

import { useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";

const INNER = "M0,0 C 11,-16 11,-34 0,-48 C -11,-34 -11,-16 0,0 Z";
const OUTER = "M0,-52 C 13,-68 13,-86 0,-100 C -13,-86 -13,-68 0,-52 Z";

interface Seg {
  id: number;
  kind: "circle" | "path";
  d?: string;
  angle?: number;
}

export interface InteractiveRangoliProps {
  colors: string[];
  completeText?: ReactNode;
  onComplete?: () => void;
  className?: string;
}

/**
 * A geometric rangoli the guest colours in: pick a palette dot, tap segments to
 * fill them (smooth CSS transition). Once ~60% is filled it auto-completes the
 * rest in a cascade and lights diyas around it. Pointer/touch via SVG onClick.
 * Reusable — any auspicious theme can pass its own palette + completion line.
 */
export function InteractiveRangoli({
  colors,
  completeText = "Shubh Aarambh ✨",
  onComplete,
  className,
}: InteractiveRangoliProps) {
  const segments = useMemo<Seg[]>(() => {
    const s: Seg[] = [{ id: 0, kind: "circle" }];
    for (let k = 0; k < 8; k++) s.push({ id: 1 + k, kind: "path", d: INNER, angle: k * 45 });
    for (let k = 0; k < 8; k++) s.push({ id: 9 + k, kind: "path", d: OUTER, angle: k * 45 + 22.5 });
    return s;
  }, []);
  const total = segments.length;
  const [fills, setFills] = useState<Record<number, string>>({});
  const [active, setActive] = useState(colors[0] ?? "#D99A2B");
  const [completed, setCompleted] = useState(false);

  const autoComplete = (current: Record<number, string>) => {
    const remaining = segments.filter((s) => !current[s.id]);
    remaining.forEach((s, i) => {
      window.setTimeout(() => {
        setFills((f) => ({ ...f, [s.id]: colors[s.id % colors.length] ?? active }));
      }, i * 90);
    });
    window.setTimeout(() => {
      setCompleted(true);
      onComplete?.();
    }, remaining.length * 90 + 250);
  };

  const fillSeg = (id: number) => {
    if (completed || fills[id]) return;
    const next = { ...fills, [id]: active };
    setFills(next);
    if (Object.keys(next).length >= Math.ceil(total * 0.6)) autoComplete(next);
  };

  return (
    <div className={className}>
      <div className="mb-6 flex justify-center gap-3">
        {colors.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setActive(c)}
            aria-label={`Pick colour ${c}`}
            aria-pressed={active === c}
            className={`sa-dot ${active === c ? "sa-dot-on" : ""}`}
            style={{ background: c }}
          />
        ))}
      </div>

      <div className="relative mx-auto" style={{ maxWidth: 340 }}>
        <svg viewBox="0 0 200 200" className="w-full">
          <circle
            cx="100"
            cy="100"
            r="97"
            fill="none"
            stroke="var(--sa-saffron)"
            strokeWidth="0.6"
            opacity="0.4"
          />
          {segments.map((s) =>
            s.kind === "circle" ? (
              <circle
                key={s.id}
                cx="100"
                cy="100"
                r="16"
                fill={fills[s.id] ?? "transparent"}
                stroke="var(--sa-terracotta)"
                strokeWidth="1.2"
                className="sa-seg"
                onClick={() => fillSeg(s.id)}
              />
            ) : (
              <path
                key={s.id}
                d={s.d}
                transform={`translate(100 100) rotate(${s.angle})`}
                fill={fills[s.id] ?? "transparent"}
                stroke="var(--sa-terracotta)"
                strokeWidth="1.2"
                className="sa-seg"
                onClick={() => fillSeg(s.id)}
              />
            )
          )}
        </svg>

        <AnimatePresence>
          {completed
            ? Array.from({ length: 8 }).map((_, k) => {
                const a = ((k * 45) * Math.PI) / 180;
                const left = 50 + 46 * Math.cos(a);
                const top = 50 + 46 * Math.sin(a);
                return (
                  <m.span
                    key={k}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: k * 0.08, type: "spring", stiffness: 200, damping: 14 }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 text-2xl"
                    style={{ left: `${left}%`, top: `${top}%` }}
                    aria-hidden
                  >
                    🪔
                  </m.span>
                );
              })
            : null}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {completed ? (
          <m.p
            key="complete"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="sa-serif mt-6 text-center text-3xl text-[color:var(--sa-terracotta)]"
          >
            {completeText}
          </m.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
