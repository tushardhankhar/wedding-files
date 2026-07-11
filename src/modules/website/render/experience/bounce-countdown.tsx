"use client";

import { AnimatePresence, m } from "motion/react";
import { useCountdown, pad2 } from "../use-countdown";

export interface BounceCountdownProps {
  dateIso: string;
  time?: string;
  labels?: [string, string, string, string];
  colors?: string[];
  className?: string;
}

/**
 * Four colourful blocks whose numbers bounce (spring) as they change. Reused for
 * playful themes. Transform/opacity only; the global MotionConfig collapses the
 * bounce to a fade under reduced-motion.
 */
export function BounceCountdown({
  dateIso,
  time,
  labels = ["Days", "Hours", "Minutes", "Seconds"],
  colors = ["#60A5FA", "#FACC15", "#FB7185", "#A78BFA"],
  className,
}: BounceCountdownProps) {
  const c = useCountdown(dateIso, time);
  const units = [
    { k: "d", v: c.days, l: labels[0] },
    { k: "h", v: c.hours, l: labels[1] },
    { k: "m", v: c.minutes, l: labels[2] },
    { k: "s", v: c.seconds, l: labels[3] },
  ];
  return (
    <div className={`flex items-start justify-center gap-2.5 sm:gap-4 ${className ?? ""}`}>
      {units.map((u, i) => {
        const text = pad2(u.v, c.ready);
        return (
          <div key={u.k} className="flex flex-col items-center gap-2.5">
            <div
              className="cf-block"
              style={{ background: colors[i % colors.length] }}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <m.span
                  key={text}
                  initial={{ y: -16, scale: 0.5, opacity: 0 }}
                  animate={{ y: 0, scale: 1, opacity: 1 }}
                  exit={{ y: 16, scale: 0.5, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 520, damping: 20 }}
                  className="cf-block-num"
                >
                  {text}
                </m.span>
              </AnimatePresence>
            </div>
            <span className="cf-block-label" aria-label={`${u.v} ${u.l}`}>
              {u.l}
            </span>
          </div>
        );
      })}
    </div>
  );
}
