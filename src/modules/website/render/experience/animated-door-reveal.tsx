"use client";

import { useEffect, useState, type ReactNode } from "react";
import { m } from "motion/react";
import { FloatingParticles } from "./floating-particles";

export interface AnimatedDoorRevealProps {
  /** Content revealed behind the doors (always in the DOM → accessible). */
  children: ReactNode;
  /** Controlled open state. Omit to use autoOpenDelay (uncontrolled). */
  open?: boolean;
  /** Uncontrolled: open by itself this many ms after mount. */
  autoOpenDelay?: number;
  onOpen?: () => void;
  height?: number | string;
  doorLabel?: ReactNode;
  dust?: boolean;
  className?: string;
}

function DoorArt({ side }: { side: "l" | "r" }) {
  const knobX = side === "l" ? 88 : 12;
  return (
    <svg
      viewBox="0 0 100 200"
      preserveAspectRatio="none"
      className="h-full w-full"
      aria-hidden
    >
      {/* recessed panels */}
      <rect x="10" y="16" width="80" height="80" rx="6" className="sa-door-panel" />
      <rect x="10" y="104" width="80" height="80" rx="6" className="sa-door-panel" />
      {/* jharokha arch on the top panel */}
      <path
        d="M20 84 L20 46 Q50 20 80 46 L80 84"
        fill="none"
        className="sa-door-line"
      />
      {/* brass studs */}
      {[30, 56, 82].map((y) => (
        <circle key={y} cx="50" cy={y + 60} r="2.2" className="sa-door-stud" />
      ))}
      {/* knob on the inner edge */}
      <circle cx={knobX} cy="110" r="4.5" className="sa-door-knob" />
    </svg>
  );
}

/**
 * Two illustrated doors that swing open (3D rotateY) to reveal `children` in a
 * pool of warm light with rising dust motes. Controlled via `open`, or set
 * `autoOpenDelay` for a self-opening hero. Reused for the hero AND the RSVP
 * "doors reopen" moment. Reduced-motion collapses the swing via MotionConfig.
 */
export function AnimatedDoorReveal({
  children,
  open,
  autoOpenDelay,
  onOpen,
  height = 460,
  doorLabel,
  dust = true,
  className,
}: AnimatedDoorRevealProps) {
  const controlled = open !== undefined;
  const [autoOpen, setAutoOpen] = useState(false);
  const isOpen = controlled ? open : autoOpen;

  useEffect(() => {
    if (controlled || autoOpenDelay == null) return;
    const t = window.setTimeout(() => {
      setAutoOpen(true);
      onOpen?.();
    }, autoOpenDelay);
    return () => window.clearTimeout(t);
  }, [controlled, autoOpenDelay, onOpen]);

  const swing = { duration: 1.3, ease: [0.6, 0, 0.2, 1] as const };

  return (
    <div
      className={`adr relative overflow-hidden ${className ?? ""}`}
      style={{ height, perspective: 1400 }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <m.div
          aria-hidden
          className="adr-light absolute inset-0"
          animate={{ opacity: isOpen ? 1 : 0 }}
          transition={{ duration: 1, delay: isOpen ? 0.5 : 0 }}
        />
        {dust && isOpen ? (
          <FloatingParticles
            colors={["#ffe6ad", "#f6c667", "#ffffff"]}
            density={7}
            maxCount={40}
            minR={0.5}
            maxR={2}
            speed={0.3}
            mode="rise"
          />
        ) : null}
        <m.div
          className="relative z-10 px-6 text-center"
          animate={{ opacity: isOpen ? 1 : 0, scale: isOpen ? 1 : 0.9 }}
          transition={{ duration: 0.9, delay: isOpen ? 0.6 : 0 }}
        >
          {children}
        </m.div>
      </div>

      <m.div
        className="adr-door adr-door-l"
        style={{ transformOrigin: "left center" }}
        initial={false}
        animate={{ rotateY: isOpen ? -118 : 0 }}
        transition={swing}
      >
        <DoorArt side="l" />
      </m.div>
      <m.div
        className="adr-door adr-door-r"
        style={{ transformOrigin: "right center" }}
        initial={false}
        animate={{ rotateY: isOpen ? 118 : 0 }}
        transition={swing}
      >
        <DoorArt side="r" />
      </m.div>

      {doorLabel ? (
        <m.div
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-6 text-center"
          animate={{ opacity: isOpen ? 0 : 1 }}
          transition={{ duration: 0.5 }}
        >
          {doorLabel}
        </m.div>
      ) : null}
    </div>
  );
}
