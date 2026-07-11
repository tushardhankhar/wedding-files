"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";

const POP_COLORS = ["#FACC15", "#FB7185", "#60A5FA", "#A78BFA", "#34D399"];

export interface TapBalloonProps {
  color: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
  /** Bob animation delay (staggers a cluster of balloons). */
  delay?: number;
  /** Optional reward revealed in place after the pop (e.g. a secret star). */
  reward?: ReactNode;
  onPop?: () => void;
}

function BalloonSVG({ color, size }: { color: string; size: number }) {
  const gid = `balg-${color.replace("#", "")}`;
  return (
    <svg width={size} height={size * 1.45} viewBox="0 0 60 88" aria-hidden>
      <defs>
        <radialGradient id={gid} cx="36%" cy="30%" r="72%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="45%" stopColor={color} />
          <stop offset="100%" stopColor={color} />
        </radialGradient>
      </defs>
      <ellipse cx="30" cy="31" rx="26" ry="30" fill={`url(#${gid})`} />
      <path d="M26 60 L34 60 L30 68 Z" fill={color} />
      <path
        d="M30 68 Q35 78 27 88"
        stroke={color}
        strokeWidth="1.4"
        fill="none"
        opacity="0.55"
      />
    </svg>
  );
}

function PopBurst({ size }: { size: number }) {
  const n = 9;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-[34%] -translate-x-1/2"
    >
      {Array.from({ length: n }).map((_, i) => {
        const a = (i / n) * Math.PI * 2;
        const d = size * 0.95;
        return (
          <m.span
            key={i}
            className="absolute block h-2 w-2 rounded-full"
            style={{ background: POP_COLORS[i % POP_COLORS.length] }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos(a) * d,
              y: Math.sin(a) * d,
              opacity: 0,
              scale: 0.4,
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        );
      })}
    </div>
  );
}

/**
 * A decorative balloon that gently bobs (CSS transform keyframe — cheap even
 * with several on a page) and pops on tap with a DOM particle burst. Optionally
 * reveals a reward in place. Reused wherever a playful tap interaction fits.
 */
export function TapBalloon({
  color,
  size = 64,
  className,
  style,
  delay = 0,
  reward,
  onPop,
}: TapBalloonProps) {
  const [popped, setPopped] = useState(false);
  const pop = () => {
    if (popped) return;
    setPopped(true);
    onPop?.();
  };
  return (
    <div
      className={`cf-bob absolute ${className ?? ""}`}
      style={{ ...style, animationDelay: `${delay}s` }}
    >
      <AnimatePresence>
        {!popped ? (
          <m.button
            key="balloon"
            type="button"
            onClick={pop}
            aria-label="Pop the balloon"
            exit={{ opacity: 0, scale: 1.15 }}
            transition={{ duration: 0.18 }}
            whileTap={{ scale: 0.92 }}
            className="block cursor-pointer outline-none"
            style={{ width: size }}
          >
            <BalloonSVG color={color} size={size} />
          </m.button>
        ) : null}
      </AnimatePresence>
      {popped ? <PopBurst size={size} /> : null}
      <AnimatePresence>
        {popped && reward ? (
          <m.div
            key="reward"
            initial={{ opacity: 0, y: 12, scale: 0.7 }}
            animate={{ opacity: 1, y: -10, scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 14 }}
            className="absolute left-1/2 top-0 z-10 -translate-x-1/2 whitespace-nowrap"
          >
            {reward}
          </m.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
