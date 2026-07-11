"use client";

import { AnimatePresence, m } from "motion/react";
import { useCountdown, pad2 } from "../use-countdown";

export interface FlipCountdownProps {
  dateIso: string;
  time?: string;
  labels?: [string, string, string, string];
  className?: string;
  /** Extra classes on each flip tile (colour/size overrides via CSS vars). */
  tileClassName?: string;
  labelClassName?: string;
}

/**
 * A split-flap style countdown. Each unit tile flips (rotateX) as its value
 * changes — mechanical, GPU-friendly (transform + opacity only). Colours are
 * driven by CSS variables (--flip-bg / --flip-ink / --flip-line / --flip-shadow)
 * so any theme can restyle it. Reduced-motion collapses the flip to a fade via
 * the global MotionConfig. Built on the shared useCountdown hook.
 */
export function FlipCountdown({
  dateIso,
  time,
  labels = ["Days", "Hours", "Minutes", "Seconds"],
  className,
  tileClassName,
  labelClassName,
}: FlipCountdownProps) {
  const c = useCountdown(dateIso, time);
  const units = [
    { k: "d", v: c.days, label: labels[0] },
    { k: "h", v: c.hours, label: labels[1] },
    { k: "m", v: c.minutes, label: labels[2] },
    { k: "s", v: c.seconds, label: labels[3] },
  ];

  return (
    <div
      className={`flipcd flex items-start justify-center gap-2 sm:gap-4 ${className ?? ""}`}
    >
      {units.map((u) => {
        const text = pad2(u.v, c.ready);
        return (
          <div key={u.k} className="flex flex-col items-center gap-2.5">
            <div className={`flipcd-tile ${tileClassName ?? ""}`}>
              <AnimatePresence initial={false} mode="popLayout">
                <m.span
                  key={text}
                  initial={{ rotateX: -90, opacity: 0 }}
                  animate={{ rotateX: 0, opacity: 1 }}
                  exit={{ rotateX: 90, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
                  className="flipcd-num"
                >
                  {text}
                </m.span>
              </AnimatePresence>
            </div>
            <span
              className={`flipcd-label ${labelClassName ?? ""}`}
              aria-label={`${u.v} ${u.label}`}
            >
              {u.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
