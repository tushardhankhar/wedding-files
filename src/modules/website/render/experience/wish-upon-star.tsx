"use client";

import { useRef, useState, type ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { FloatingParticles } from "./floating-particles";

interface Wish {
  id: number;
  text: string;
  left: number;
  top: number;
}

export interface WishUponStarProps {
  prompt: ReactNode;
  confirmText?: ReactNode;
  placeholder?: string;
  buttonLabel?: string;
  starColor?: string;
  height?: number;
  className?: string;
}

/**
 * Type a wish → a star rises from the input and settles among the stars,
 * staying visible (wishes accumulate). Resting spots are deterministic per
 * index (no Math.random in render). The rise is a transform tween that the
 * global MotionConfig collapses to a fade under reduced-motion. Reusable.
 */
export function WishUponStar({
  prompt,
  confirmText = "Your wish is now among the stars ✨",
  placeholder = "Type your wish…",
  buttonLabel = "Wish ✨",
  starColor = "#C5A46D",
  height = 240,
  className,
}: WishUponStarProps) {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [text, setText] = useState("");
  const idRef = useRef(0);

  const spot = (i: number) => ({
    left: 10 + ((i * 37) % 78),
    top: 10 + ((i * 23) % 52),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    idRef.current += 1;
    const s = spot(wishes.length);
    setWishes((w) => [...w, { id: idRef.current, text: t, left: s.left, top: s.top }]);
    setText("");
  };

  return (
    <div className={className}>
      <p className="lm-serif mb-5 text-center text-2xl text-[color:var(--lm-cocoa)]">
        {prompt}
      </p>
      <div
        className="lm-sky relative mx-auto max-w-md overflow-hidden rounded-[28px]"
        style={{ height }}
      >
        <FloatingParticles
          colors={["#ffffff", "#DCEAF7", "#C5A46D"]}
          density={7}
          maxCount={34}
          minR={0.5}
          maxR={1.8}
          speed={0.15}
        />
        {wishes.map((w) => (
          <m.span
            key={w.id}
            title={w.text}
            initial={{ y: height * 0.55, opacity: 0, scale: 0.3 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            className="absolute text-lg"
            style={{
              left: `${w.left}%`,
              top: `${w.top}%`,
              color: starColor,
              textShadow: `0 0 8px ${starColor}`,
            }}
          >
            ✦
          </m.span>
        ))}
      </div>
      <form onSubmit={submit} className="mx-auto mt-5 flex max-w-md items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          maxLength={80}
          aria-label="Your wish for the little one"
          className="lm-input flex-1"
        />
        <button type="submit" className="lm-wish-btn">
          {buttonLabel}
        </button>
      </form>
      <AnimatePresence>
        {wishes.length > 0 ? (
          <m.p
            key="confirm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center text-sm tracking-wide"
            style={{ color: starColor }}
          >
            {confirmText}
          </m.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
