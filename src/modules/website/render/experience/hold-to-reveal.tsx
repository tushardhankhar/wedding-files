"use client";

import { useRef, useState, type ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";

export interface HoldToRevealProps {
  children: ReactNode;
  label: ReactNode;
  durationMs?: number;
  size?: number;
  ringColor?: string;
  trackColor?: string;
  hintColor?: string;
  onReveal?: () => void;
  className?: string;
}

/**
 * Press-and-hold to reveal. A circular SVG ring fills over `durationMs`; release
 * early and it eases back to empty. Completing reveals `children` with a fade.
 * Pointer (mouse + finger) driven; the ring offset is written directly to the
 * DOM in rAF (no per-frame React state). Enter/Space reveal instantly for
 * keyboard users. Reusable across themes.
 */
export function HoldToReveal({
  children,
  label,
  durationMs = 1500,
  size = 132,
  ringColor = "#C6FF00",
  trackColor = "rgba(255,255,255,0.15)",
  hintColor = "rgba(255,255,255,0.6)",
  onReveal,
  className,
}: HoldToRevealProps) {
  const [revealed, setRevealed] = useState(false);
  const [holding, setHolding] = useState(false);
  const circleRef = useRef<SVGCircleElement | null>(null);
  const raf = useRef<number | null>(null);
  const startT = useRef(0);
  const prog = useRef(0);

  const R = (size - 14) / 2;
  const CIRC = 2 * Math.PI * R;

  const draw = (p: number) => {
    prog.current = p;
    if (circleRef.current)
      circleRef.current.style.strokeDashoffset = String(CIRC * (1 - p));
  };

  const stop = () => {
    if (raf.current != null) {
      cancelAnimationFrame(raf.current);
      raf.current = null;
    }
  };

  const finish = () => {
    stop();
    draw(1);
    setHolding(false);
    setRevealed(true);
    onReveal?.();
  };

  // `time` is the rAF timestamp (same clock as performance.now, but passed in
  // rather than called during render — keeps the component body pure).
  const tick = (time: number) => {
    if (!startT.current) startT.current = time - prog.current * durationMs;
    const p = Math.min(1, (time - startT.current) / durationMs);
    draw(p);
    if (p >= 1) {
      finish();
      return;
    }
    raf.current = requestAnimationFrame(tick);
  };

  const decay = () => {
    prog.current -= 0.06;
    if (prog.current <= 0) {
      draw(0);
      return;
    }
    draw(prog.current);
    raf.current = requestAnimationFrame(decay);
  };

  const begin = () => {
    if (revealed) return;
    setHolding(true);
    stop();
    startT.current = 0; // recomputed from the first rAF timestamp
    raf.current = requestAnimationFrame(tick);
  };
  const cancel = () => {
    if (revealed || !holding) return;
    setHolding(false);
    stop();
    raf.current = requestAnimationFrame(decay);
  };
  const onKey = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === " ") && !revealed) {
      e.preventDefault();
      finish();
    }
  };

  return (
    <div className={`flex flex-col items-center ${className ?? ""}`}>
      <AnimatePresence mode="wait" initial={false}>
        {revealed ? (
          <m.div
            key="revealed"
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center"
          >
            {children}
          </m.div>
        ) : (
          <m.button
            key="ring"
            type="button"
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            aria-label={typeof label === "string" ? label : "Hold to reveal"}
            onPointerDown={begin}
            onPointerUp={cancel}
            onPointerLeave={cancel}
            onKeyDown={onKey}
            className="relative flex select-none flex-col items-center outline-none"
            style={{ width: size, touchAction: "none" }}
          >
            <svg width={size} height={size} className="rotate-[-90deg]">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={R}
                fill="none"
                stroke={trackColor}
                strokeWidth={7}
              />
              <circle
                ref={circleRef}
                cx={size / 2}
                cy={size / 2}
                r={R}
                fill="none"
                stroke={ringColor}
                strokeWidth={7}
                strokeLinecap="round"
                strokeDasharray={CIRC}
                strokeDashoffset={CIRC}
                style={{
                  filter: `drop-shadow(0 0 6px ${ringColor})`,
                  transition: holding ? "none" : "stroke-dashoffset .1s linear",
                }}
              />
            </svg>
            <span
              className="pointer-events-none absolute inset-0 flex items-center justify-center text-2xl"
              aria-hidden
            >
              {holding ? "⚡" : "◉"}
            </span>
          </m.button>
        )}
      </AnimatePresence>
      {!revealed && (
        <span
          className="mt-4 max-w-[16rem] text-center text-[11px] font-semibold uppercase tracking-[0.28em]"
          style={{ color: hintColor }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
