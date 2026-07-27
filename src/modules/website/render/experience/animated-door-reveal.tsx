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

/**
 * Carved-panel door face. The viewBox is stretched non-uniformly to fill the
 * door, so only shapes that tolerate distortion live here — the brass knob is a
 * DOM element (`.adr-knob`) placed outside the SVG so it stays perfectly round.
 */
function DoorArt({ side }: { side: "l" | "r" }) {
  const clipId = `adr-jaali-${side}`;
  const lattice = [-3, -2, -1, 0, 1, 2, 3, 4, 5];
  return (
    <svg
      viewBox="0 0 100 200"
      preserveAspectRatio="none"
      className="h-full w-full"
      aria-hidden
    >
      <defs>
        <clipPath id={clipId}>
          <rect x="9" y="108" width="82" height="80" rx="5" />
        </clipPath>
      </defs>
      {/* recessed panels, framed in a brass hairline */}
      <rect x="9" y="12" width="82" height="86" rx="5" className="sa-door-panel" />
      <rect x="9" y="108" width="82" height="80" rx="5" className="sa-door-panel" />
      {/* jharokha arch inside the upper panel */}
      <path d="M21 92 L21 48 Q50 22 79 48 L79 92" fill="none" className="sa-door-line" />
      <path d="M28 92 L28 53 Q50 33 72 53 L72 92" fill="none" className="sa-door-jaali" />
      {/* jaali lattice filling the lower panel */}
      <g clipPath={`url(#${clipId})`}>
        {lattice.map((i) => (
          <line key={`a${i}`} x1={9 + i * 20} y1="188" x2={9 + i * 20 + 80} y2="108" className="sa-door-jaali" />
        ))}
        {lattice.map((i) => (
          <line key={`b${i}`} x1={9 + i * 20} y1="108" x2={9 + i * 20 + 80} y2="188" className="sa-door-jaali" />
        ))}
      </g>
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
        <span aria-hidden className="adr-knob adr-knob-l" />
      </m.div>
      <m.div
        className="adr-door adr-door-r"
        style={{ transformOrigin: "right center" }}
        initial={false}
        animate={{ rotateY: isOpen ? 118 : 0 }}
        transition={swing}
      >
        <DoorArt side="r" />
        <span aria-hidden className="adr-knob adr-knob-r" />
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
