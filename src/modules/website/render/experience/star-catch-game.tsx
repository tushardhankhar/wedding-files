"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, m, useReducedMotion } from "motion/react";

interface Star {
  id: number;
  x: number; // left %
  topPct: number; // static position for reduced-motion
  color: string;
  size: number;
  dur: number;
}

export interface StarCatchGameProps {
  durationSec?: number;
  colors?: string[];
  rewardText?: ReactNode;
  height?: number;
  className?: string;
}

/**
 * "Catch the stars" — a lightweight, contained tap game. Stars fall (transform
 * `y`, GPU-friendly) for a fixed window; tap to score. Reduced-motion players
 * get static stars that fade in place (no falling) so it stays playable. All
 * timers/spawns are cleaned up. Reusable — any theme can drop in its own colours
 * and reward line.
 */
export function StarCatchGame({
  durationSec = 8,
  colors = ["#FACC15", "#FB7185", "#60A5FA", "#A78BFA"],
  rewardText = "You've won a birthday hug 🎉",
  height = 320,
  className,
}: StarCatchGameProps) {
  const [phase, setPhase] = useState<"idle" | "playing" | "done">("idle");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(durationSec);
  const [stars, setStars] = useState<Star[]>([]);
  const idRef = useRef(0);
  const reduce = useReducedMotion();

  const remove = (id: number) =>
    setStars((s) => s.filter((x) => x.id !== id));
  const catchStar = (id: number) => {
    setStars((s) => s.filter((x) => x.id !== id));
    setScore((v) => v + 1);
  };

  useEffect(() => {
    if (phase !== "playing") return;
    const timer = setInterval(() => {
      setTimeLeft((v) => {
        if (v <= 1) {
          setPhase("done");
          setStars([]);
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    const spawn = setInterval(() => {
      idRef.current += 1;
      const id = idRef.current;
      const dur = reduce ? 1.4 : 3 + Math.random() * 1.8;
      setStars((s) => [
        ...s,
        {
          id,
          x: 8 + Math.random() * 82,
          topPct: 10 + Math.random() * 70,
          color: colors[id % colors.length],
          size: 26 + Math.random() * 16,
          dur,
        },
      ]);
      // safety removal (backs up onAnimationComplete / reduced-motion)
      window.setTimeout(() => remove(id), dur * 1000 + 300);
    }, 480);
    return () => {
      clearInterval(timer);
      clearInterval(spawn);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, reduce]);

  const start = () => {
    setScore(0);
    setTimeLeft(durationSec);
    setStars([]);
    setPhase("playing");
  };

  return (
    <div
      className={`cf-game relative mx-auto w-full max-w-md overflow-hidden rounded-[28px] ${className ?? ""}`}
      style={{ height }}
    >
      {phase === "playing" ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-between px-5 py-3 font-fredoka text-base font-bold text-white">
          <span>⭐ {score}</span>
          <span>⏱ {timeLeft}s</span>
        </div>
      ) : null}

      <AnimatePresence>
        {stars.map((st) =>
          reduce ? (
            <m.button
              key={st.id}
              type="button"
              aria-label="Catch the star"
              onClick={() => catchStar(st.id)}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute z-10 cursor-pointer select-none leading-none"
              style={{
                left: `${st.x}%`,
                top: `${st.topPct}%`,
                fontSize: st.size,
                color: st.color,
                touchAction: "manipulation",
              }}
            >
              ⭐
            </m.button>
          ) : (
            <m.button
              key={st.id}
              type="button"
              aria-label="Catch the star"
              onClick={() => catchStar(st.id)}
              initial={{ y: 0 }}
              animate={{ y: height + 80 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: st.dur, ease: "linear" }}
              onAnimationComplete={() => remove(st.id)}
              className="absolute z-10 cursor-pointer select-none leading-none"
              style={{
                left: `${st.x}%`,
                top: -44,
                fontSize: st.size,
                color: st.color,
                touchAction: "manipulation",
              }}
            >
              ⭐
            </m.button>
          )
        )}
      </AnimatePresence>

      {phase !== "playing" ? (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 px-6 text-center">
          {phase === "idle" ? (
            <>
              <p className="font-fredoka text-2xl font-semibold text-white">
                Catch the stars ⭐
              </p>
              <p className="max-w-xs text-sm text-white/80">
                Tap as many falling stars as you can in {durationSec} seconds!
              </p>
              <button type="button" onClick={start} className="cf-btn">
                Start
              </button>
            </>
          ) : (
            <>
              <p className="font-fredoka text-3xl font-semibold text-white">
                You caught {score} {score === 1 ? "star" : "stars"}!
              </p>
              <p className="text-lg font-semibold text-white">{rewardText}</p>
              <button type="button" onClick={start} className="cf-btn-sm">
                Play again
              </button>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
