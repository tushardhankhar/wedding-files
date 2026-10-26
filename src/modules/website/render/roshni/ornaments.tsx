"use client";

import { useId, useRef, type CSSProperties, type ReactNode } from "react";
import { m, useInView, useReducedMotion } from "motion/react";

/**
 * THE ROSHNI — ornaments.
 *
 * Gold line leads everywhere; colour is a wash behind it (see the SVG-ornament
 * rule in the theme notes). The rangoli and mandala are generated from polar
 * maths at module scope, so they are deterministic and cost nothing per render.
 * Every SVG id goes through `useId()` — most of these render more than once.
 */

/* ── Polar helpers ───────────────────────────────────────────────────────── */

const r2 = (n: number) => Math.round(n * 100) / 100;
function pt(r: number, deg: number): [number, number] {
  const a = ((deg - 90) * Math.PI) / 180;
  return [r2(r * Math.cos(a)), r2(r * Math.sin(a))];
}

/** One pointed petal from radius r1 to r2, `half` degrees wide each side. */
function petal(r1: number, rTip: number, deg: number, half: number, bulge = 1.15): string {
  const [x1, y1] = pt(r1, deg - half);
  const [x2, y2] = pt(r1, deg + half);
  const [tx, ty] = pt(rTip, deg);
  const mid = r1 + (rTip - r1) * 0.55;
  const [c1x, c1y] = pt(mid, deg - half * bulge);
  const [c2x, c2y] = pt(mid, deg + half * bulge);
  return `M${x1} ${y1}Q${c1x} ${c1y} ${tx} ${ty}Q${c2x} ${c2y} ${x2} ${y2}`;
}

function ring(n: number, offset: number, f: (deg: number) => string): string {
  return Array.from({ length: n }, (_, i) => f(offset + (360 / n) * i)).join("");
}

function circle(r: number): string {
  return `M${-r} 0a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`;
}

/** Scallops: n arcs bulging outward between r and r + depth. */
function scallops(n: number, r: number, depth: number): string {
  const step = 360 / n;
  return Array.from({ length: n }, (_, i) => {
    const a = i * step;
    const [x1, y1] = pt(r, a);
    const [cx, cy] = pt(r + depth * 2, a + step / 2);
    const [x2, y2] = pt(r, a + step);
    return `M${x1} ${y1}Q${cx} ${cy} ${x2} ${y2}`;
  }).join("");
}

/** An 8-point star between two radii. */
function star(n: number, rIn: number, rOut: number): string {
  const pts = Array.from({ length: n * 2 }, (_, i) =>
    pt(i % 2 ? rIn : rOut, (360 / (n * 2)) * i),
  );
  return `M${pts.map((p) => p.join(" ")).join("L")}Z`;
}

/* The rangoli, layer by layer, drawn from the centre outward. */
const RANGOLI_LINES = [
  circle(6),
  star(8, 10, 21),
  circle(25),
  ring(8, 0, (d) => petal(25, 54, d, 17)),
  ring(8, 0, (d) => petal(30, 46, d, 6, 1.4)), // vein inside each lotus petal
  ring(8, 22.5, (d) => petal(36, 60, d, 9)),
  scallops(24, 62, 3.2),
  ring(16, 11.25, (d) => petal(70, 88, d, 6.5)),
  circle(68),
];
const RANGOLI_WASH = [
  ring(8, 0, (d) => petal(25, 54, d, 17) + "Z"),
  ring(16, 11.25, (d) => petal(70, 88, d, 6.5) + "Z"),
];
const RANGOLI_DOTS = Array.from({ length: 48 }, (_, i) => pt(94, i * 7.5));
const RANGOLI_BUDS = Array.from({ length: 16 }, (_, i) => pt(80, i * 22.5 + 11.25));

/**
 * A golden rangoli that draws itself. Each layer is ONE path of many subpaths,
 * so the stroke travels round the ring petal by petal — the way a hand lays
 * powder — instead of every petal appearing at once.
 */
export function Rangoli({
  draw = true,
  delay = 0,
  duration = 3.2,
  className,
  style,
}: {
  draw?: boolean;
  delay?: number;
  duration?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const reduce = useReducedMotion();
  const step = duration / RANGOLI_LINES.length;
  const on = draw ? 1 : 0;
  const t = (i: number, d = step * 1.6) =>
    reduce ? { duration: 0 } : { duration: d, delay: delay + i * step, ease: "easeInOut" as const };

  return (
    <svg viewBox="-100 -100 200 200" className={className} style={style} aria-hidden>
      <g fill="var(--rsh-marigold)" stroke="none">
        {RANGOLI_WASH.map((d, i) => (
          <m.path
            key={i}
            d={d}
            initial={{ opacity: 0 }}
            animate={{ opacity: draw ? (i ? 0.16 : 0.1) : 0 }}
            transition={t(RANGOLI_LINES.length - 2 + i, 1.2)}
          />
        ))}
      </g>
      <g fill="none" stroke="var(--rsh-gold)" strokeLinecap="round" strokeLinejoin="round">
        {RANGOLI_LINES.map((d, i) => (
          <m.path
            key={i}
            d={d}
            strokeWidth={i === 4 ? 0.45 : 0.8}
            stroke={i === 3 || i === 7 ? "var(--rsh-glow)" : undefined}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: on, opacity: on }}
            transition={t(i)}
          />
        ))}
      </g>
      <g fill="var(--rsh-glow)">
        {RANGOLI_DOTS.map(([x, y], i) => (
          <m.circle
            key={i}
            cx={x}
            cy={y}
            r={i % 2 ? 0.9 : 1.5}
            initial={{ opacity: 0 }}
            animate={{ opacity: on }}
            transition={
              reduce
                ? { duration: 0 }
                : { duration: 0.3, delay: delay + duration * 0.85 + i * 0.012 }
            }
          />
        ))}
        {RANGOLI_BUDS.map(([x, y], i) => (
          <m.circle
            key={`b${i}`}
            cx={x}
            cy={y}
            r={1.8}
            fill="var(--rsh-marigold)"
            initial={{ opacity: 0 }}
            animate={{ opacity: draw ? 0.9 : 0 }}
            transition={reduce ? { duration: 0 } : { duration: 0.4, delay: delay + duration + i * 0.03 }}
          />
        ))}
      </g>
    </svg>
  );
}

/* A finer, static mandala for behind the hero (it turns slowly in CSS). */
const MANDALA = [
  circle(14),
  circle(30),
  circle(58),
  circle(92),
  circle(97),
  ring(12, 0, (d) => petal(14, 30, d, 13)),
  ring(24, 0, (d) => petal(30, 56, d, 6.5)),
  ring(24, 7.5, (d) => petal(36, 50, d, 2.5, 1.6)),
  scallops(36, 58, 2.5),
  ring(36, 5, (d) => petal(64, 90, d, 4)),
  ring(72, 0, (d) => {
    const [x, y] = pt(94.5, d);
    return `M${x} ${y}m-0.6 0a0.6 0.6 0 1 0 1.2 0a0.6 0.6 0 1 0 -1.2 0`;
  }),
].join("");

export function Mandala({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="-100 -100 200 200" className={className} style={style} aria-hidden>
      <path d={MANDALA} fill="none" stroke="var(--rsh-gold)" strokeWidth="0.35" />
    </svg>
  );
}

/* ── Diya ─────────────────────────────────────────────────────────────────
 * Brass bowl in SVG; the flame is CSS (three nested spans) so it can flicker
 * on the compositor. `lit` false renders the bowl dark; flipping it to true
 * plays the ignition — the flame swells from a spark, then settles into its
 * own flicker rhythm (`seed` staggers the rhythm so a row never pulses in
 * unison). */
export function Diya({
  size = 64,
  lit = true,
  delay = 0,
  seed = 0,
  className,
}: {
  size?: number;
  lit?: boolean;
  delay?: number;
  seed?: number;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  const style = {
    "--d": `${size}px`,
    "--d-delay": `${delay}s`,
    "--d-flick": `${1.5 + ((seed * 37) % 9) / 10}s`,
    "--d-phase": `${-((seed * 53) % 17) / 10}s`,
  } as CSSProperties;
  return (
    <span
      className={`rsh-diya ${lit ? "is-lit" : ""} ${className ?? ""}`}
      style={style}
      aria-hidden
    >
      <span className="rsh-diya-halo" />
      <span className="rsh-flame-wrap">
        <span className="rsh-flame">
          <span className="rsh-flame-body" />
        </span>
      </span>
      <svg viewBox="0 0 100 50" className="rsh-diya-bowl">
        <defs>
          <linearGradient id={`${id}b`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F3CF6E" />
            <stop offset="0.35" stopColor="#D9A52E" />
            <stop offset="0.75" stopColor="#8C6414" />
            <stop offset="1" stopColor="#4E3608" />
          </linearGradient>
          <linearGradient id={`${id}s`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#000" stopOpacity="0.35" />
            <stop offset="0.45" stopColor="#000" stopOpacity="0" />
            <stop offset="0.7" stopColor="#FFF4CF" stopOpacity="0.28" />
            <stop offset="1" stopColor="#000" stopOpacity="0.3" />
          </linearGradient>
          <radialGradient id={`${id}o`} cx="0.5" cy="0.4" r="0.6">
            <stop offset="0" stopColor="#FFE7A0" />
            <stop offset="1" stopColor="#7A4A0C" />
          </radialGradient>
        </defs>
        {/* foot */}
        <path d="M39 37h22l-3 8H42z" fill={`url(#${id}b)`} />
        <ellipse cx="50" cy="45.5" rx="13" ry="2.6" fill="#6B4A0E" />
        {/* bowl */}
        <path d="M5 17c3 13 22 21 45 21s42-8 45-21z" fill={`url(#${id}b)`} />
        <path d="M5 17c3 13 22 21 45 21s42-8 45-21z" fill={`url(#${id}s)`} />
        {/* engraved band */}
        <path
          d="M13 25c9 5 22 8 37 8s28-3 37-8"
          fill="none"
          stroke="#FBE6A6"
          strokeWidth="0.7"
          opacity="0.55"
        />
        <path
          d="M18 29.5c8 3.6 19 5.6 32 5.6s24-2 32-5.6"
          fill="none"
          stroke="#4E3608"
          strokeWidth="0.6"
          strokeDasharray="0.1 3"
          strokeLinecap="round"
        />
        {/* rim + oil */}
        <ellipse cx="50" cy="17" rx="45" ry="6.5" fill="#E9BE55" />
        <ellipse cx="50" cy="17.4" rx="39" ry="4.6" fill={`url(#${id}o)`} />
        <ellipse cx="50" cy="16.4" rx="45" ry="6" fill="none" stroke="#FFF1C4" strokeWidth="0.6" opacity="0.7" />
        {/* wick */}
        <path d="M49 17c0-3 1-5 1.6-6.5" stroke="#3B2508" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      </svg>
    </span>
  );
}

/* ── Akash kandil (hanging lantern) ──────────────────────────────────────── */
export function Lantern({
  cord = 40,
  className,
  style,
}: {
  /** Length of the hanging cord in viewBox units (the lantern body is ~110). */
  cord?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const id = useId().replace(/:/g, "");
  const y = cord;
  return (
    <svg
      viewBox={`0 0 60 ${y + 118}`}
      className={className}
      style={style}
      aria-hidden
    >
      <defs>
        <radialGradient id={`${id}g`} cx="0.5" cy="0.5" r="0.55">
          <stop offset="0" stopColor="#FFF0B8" />
          <stop offset="0.35" stopColor="#F0C35A" />
          <stop offset="0.75" stopColor="#C46A1E" />
          <stop offset="1" stopColor="#6E1A22" />
        </radialGradient>
        <radialGradient id={`${id}h`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#F0C35A" stopOpacity="0.55" />
          <stop offset="1" stopColor="#F0C35A" stopOpacity="0" />
        </radialGradient>
      </defs>
      <line x1="30" y1="0" x2="30" y2={y + 4} stroke="var(--rsh-gold)" strokeWidth="0.8" />
      <circle className="rsh-lantern-halo" cx="30" cy={y + 46} r="34" fill={`url(#${id}h)`} />
      {/* crown */}
      <path d={`M24 ${y + 4}h12l4 8H20z`} fill="var(--rsh-gold)" />
      <path d={`M20 ${y + 12}h20`} stroke="#FBE6A6" strokeWidth="0.6" />
      {/* body */}
      <path
        d={`M30 ${y + 12}C52 ${y + 18} 56 ${y + 62} 30 ${y + 80}C4 ${y + 62} 8 ${y + 18} 30 ${y + 12}Z`}
        fill={`url(#${id}g)`}
      />
      <g fill="none" stroke="var(--rsh-gold)" strokeWidth="0.7" opacity="0.9">
        <path d={`M30 ${y + 12}C40 ${y + 22} 42 ${y + 60} 30 ${y + 80}`} />
        <path d={`M30 ${y + 12}C20 ${y + 22} 18 ${y + 60} 30 ${y + 80}`} />
        <path d={`M30 ${y + 12}V${y + 80}`} />
        <path d={`M12.5 ${y + 34}C22 ${y + 38} 38 ${y + 38} 47.5 ${y + 34}`} />
        <path d={`M12.5 ${y + 56}C22 ${y + 60} 38 ${y + 60} 47.5 ${y + 56}`} />
      </g>
      <path
        d={`M30 ${y + 12}C52 ${y + 18} 56 ${y + 62} 30 ${y + 80}C4 ${y + 62} 8 ${y + 18} 30 ${y + 12}Z`}
        fill="none"
        stroke="var(--rsh-glow)"
        strokeWidth="0.9"
      />
      {/* base + tassels */}
      <path d={`M24 ${y + 80}h12l-2 5h-8z`} fill="var(--rsh-gold)" />
      <g stroke="var(--rsh-gold)" strokeWidth="0.7">
        <line x1="27" y1={y + 85} x2="25" y2={y + 108} />
        <line x1="30" y1={y + 85} x2="30" y2={y + 114} />
        <line x1="33" y1={y + 85} x2="35" y2={y + 108} />
      </g>
      <g fill="var(--rsh-glow)">
        <circle cx="25" cy={y + 109} r="1.4" />
        <circle cx="30" cy={y + 115} r="1.6" />
        <circle cx="35" cy={y + 109} r="1.4" />
      </g>
    </svg>
  );
}

/* ── Marigold toran ──────────────────────────────────────────────────────── */
const SWAGS = 6;
const TORAN_W = 360;
/** Points along each swag (a shallow catenary between two hooks). */
const TORAN_FLOWERS = Array.from({ length: SWAGS }, (_, s) => {
  const x0 = (TORAN_W / SWAGS) * s;
  const w = TORAN_W / SWAGS;
  return Array.from({ length: 7 }, (_, i) => {
    const t = i / 6;
    return { x: r2(x0 + w * t), y: r2(8 + Math.sin(Math.PI * t) * 20), r: i % 3 === 0 ? 5.6 : 4.8 };
  });
}).flat();
/** Hanging strands at each hook, alternating long/short, ending in a leaf. */
const TORAN_STRANDS = Array.from({ length: SWAGS + 1 }, (_, i) => ({
  x: (TORAN_W / SWAGS) * i,
  n: i % 2 ? 3 : 4,
}));

/**
 * The toran is tiled at its drawn proportions rather than stretched: one strip
 * scaled to a 1280px-wide band blew each marigold up to the size of a fist and
 * cropped the strands off. `className` sizes the band (its height sets the
 * scale); the strips repeat outward from the centre and the edges clip.
 */
export function Toran({ className }: { className?: string }) {
  return (
    <div className={`flex justify-center overflow-hidden ${className ?? ""}`} aria-hidden>
      {[0, 1, 2, 3, 4, 5, 6].map((k) => (
        <ToranStrip key={k} />
      ))}
    </div>
  );
}

function ToranStrip() {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      viewBox={`0 0 ${TORAN_W} 76`}
      className="h-full w-auto flex-none"
      style={{ aspectRatio: `${TORAN_W} / 76` }}
    >
      <defs>
        <radialGradient id={`${id}m`} cx="0.42" cy="0.38" r="0.65">
          <stop offset="0" stopColor="#FFC85A" />
          <stop offset="0.55" stopColor="#E8891C" />
          <stop offset="1" stopColor="#A4500E" />
        </radialGradient>
        <g id={`${id}f`}>
          <circle r="1" fill={`url(#${id}m)`} />
          <circle r="0.72" fill="none" stroke="#8A3E08" strokeWidth="0.09" strokeDasharray="0.14 0.12" opacity="0.7" />
          <circle r="0.42" fill="none" stroke="#FFE19A" strokeWidth="0.08" strokeDasharray="0.1 0.12" opacity="0.7" />
        </g>
        <path id={`${id}l`} d="M0 0c3 3 3.6 9 0 14c-3.6-5-3-11 0-14z" />
      </defs>
      <path d={`M0 6.5H${TORAN_W}`} stroke="var(--rsh-gold)" strokeWidth="1.2" />
      {TORAN_STRANDS.map((s, i) => (
        <g key={i}>
          {Array.from({ length: s.n }, (_, k) => (
            <use
              key={k}
              href={`#${id}f`}
              transform={`translate(${s.x} ${12 + k * 9}) scale(${4.6 - k * 0.3})`}
            />
          ))}
          <g transform={`translate(${s.x} ${10 + s.n * 9})`}>
            <use href={`#${id}l`} fill="#4E5A26" />
            <path d="M0 1v12" stroke="var(--rsh-gold)" strokeWidth="0.5" />
          </g>
        </g>
      ))}
      {TORAN_FLOWERS.map((f, i) => (
        <use key={i} href={`#${id}f`} transform={`translate(${f.x} ${f.y}) scale(${f.r})`} />
      ))}
    </svg>
  );
}

/* ── Drifting marigold petals ────────────────────────────────────────────
 * Deterministic positions; each span carries its own size so that, if CSS
 * motion is off, nothing collapses into an intrinsic-size SVG. Hidden under
 * reduced motion in CSS. */
const PETALS = Array.from({ length: 14 }, (_, i) => ({
  left: (i * 37 + 7) % 100,
  size: 9 + ((i * 7) % 7),
  dur: 11 + ((i * 13) % 9),
  delay: -((i * 29) % 17),
  sway: 18 + ((i * 11) % 22),
  tone: i % 3,
}));
const PETAL_TONES = ["#E8891C", "#F0C35A", "#D9A52E"];

export function Petals({ count = 14 }: { count?: number }) {
  return (
    <div className="rsh-petals" aria-hidden>
      {PETALS.slice(0, count).map((p, i) => (
        <span
          key={i}
          className="rsh-petal"
          style={
            {
              left: `${p.left}%`,
              width: p.size,
              height: p.size,
              "--p-dur": `${p.dur}s`,
              "--p-delay": `${p.delay}s`,
              "--p-sway": `${p.sway}px`,
            } as CSSProperties
          }
        >
          <svg viewBox="0 0 10 10" width={p.size} height={p.size}>
            <path
              d="M5 0.6C8 2.6 8.6 6.6 5 9.4C1.4 6.6 2 2.6 5 0.6z"
              fill={PETAL_TONES[p.tone]}
              opacity="0.85"
            />
            <path d="M5 2v6" stroke="#8A3E08" strokeWidth="0.35" opacity="0.5" />
          </svg>
        </span>
      ))}
    </div>
  );
}

/* ── Detail-card icons ───────────────────────────────────────────────────── */

/** Calendar whose top leaf turns over on a slow loop. */
export function CalendarIcon({ day }: { day: string }) {
  return (
    <span className="rsh-cal" aria-hidden>
      <span className="rsh-cal-rings" />
      <span className="rsh-cal-head" />
      <span className="rsh-cal-day">{day}</span>
      <span className="rsh-cal-leaf">{day}</span>
    </span>
  );
}

/** Clock whose hands sweep round to the party's start time on reveal. */
export function ClockIcon({ hours, minutes }: { hours: number; minutes: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const seen = useInView(ref, { once: true, margin: "-10%" });
  const hourDeg = ((hours % 12) + minutes / 60) * 30;
  const minDeg = minutes * 6;
  // Each hand sits in a group carrying an invisible dial-sized circle, so its
  // fill-box centre — the CSS pivot — is the dial centre, not the hand's own.
  const hand = (deg: number, cls: string, line: ReactNode) => (
    <g style={{ transform: `rotate(${deg}deg)`, transformBox: "fill-box", transformOrigin: "center" }}>
      <g className={seen ? `rsh-hand ${cls}` : "rsh-hand-wait"}>
        <circle r="21" fill="none" />
        {line}
      </g>
    </g>
  );
  return (
    <svg ref={ref} viewBox="-24 -24 48 48" className="rsh-clock" aria-hidden>
      <circle r="21" fill="none" stroke="var(--rsh-gold)" strokeWidth="1.4" />
      <circle r="18.2" fill="rgba(240,195,90,0.08)" stroke="var(--rsh-gold)" strokeWidth="0.4" />
      {Array.from({ length: 12 }, (_, i) => {
        const [x1, y1] = pt(15.2, i * 30);
        const [x2, y2] = pt(i % 3 ? 16.6 : 17.4, i * 30);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="var(--rsh-glow)"
            strokeWidth={i % 3 ? 0.6 : 1.2}
          />
        );
      })}
      {hand(
        hourDeg,
        "rsh-hand-h",
        <line y2="-9.5" stroke="var(--rsh-glow)" strokeWidth="1.8" strokeLinecap="round" />,
      )}
      {hand(
        minDeg,
        "rsh-hand-m",
        <line y2="-14" stroke="var(--rsh-ivory)" strokeWidth="1" strokeLinecap="round" />,
      )}
      <circle r="1.6" fill="var(--rsh-glow)" />
    </svg>
  );
}

/** Map pin that drops in and keeps a slow ripple under it. */
export function PinIcon() {
  return (
    <span className="rsh-pin" aria-hidden>
      <span className="rsh-pin-ripple" />
      <svg viewBox="0 0 24 32" className="rsh-pin-svg">
        <path
          d="M12 1C6 1 1.8 5.4 1.8 11.1 1.8 18.6 12 31 12 31s10.2-12.4 10.2-19.9C22.2 5.4 18 1 12 1z"
          fill="var(--rsh-gold)"
        />
        <path
          d="M12 1C6 1 1.8 5.4 1.8 11.1 1.8 18.6 12 31 12 31"
          fill="none"
          stroke="#FFF1C4"
          strokeWidth="0.8"
          opacity="0.6"
        />
        <circle cx="12" cy="11" r="4.2" fill="var(--rsh-wine)" />
        <circle cx="12" cy="11" r="1.6" fill="var(--rsh-glow)" />
      </svg>
    </span>
  );
}

/** A thin gold rule with a lotus bud at its centre. */
export function GoldRule({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 16" className={className} aria-hidden>
      <path d="M8 8H100M140 8H232" stroke="var(--rsh-gold)" strokeWidth="0.8" />
      <circle cx="6" cy="8" r="1.4" fill="var(--rsh-gold)" />
      <circle cx="234" cy="8" r="1.4" fill="var(--rsh-gold)" />
      <path
        d="M120 1.5c4 2.5 5.6 5.2 5.6 6.5S124 13 120 14.5c-4-1.5-5.6-5.2-5.6-6.5S116 4 120 1.5z"
        fill="rgba(240,195,90,0.18)"
        stroke="var(--rsh-gold)"
        strokeWidth="0.8"
      />
      <path d="M106 8c4-3 7-3 9.5 0M134 8c-4-3-7-3-9.5 0" fill="none" stroke="var(--rsh-gold)" strokeWidth="0.8" />
    </svg>
  );
}

/** Engraved corner for the ivory letter panel (mirrored by CSS for the others). */
export function PanelCorner({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <g fill="none" stroke="var(--rsh-gold-deep)" strokeWidth="0.8" strokeLinecap="round">
        <path d="M4 60V12C4 7.6 7.6 4 12 4H60" />
        <path d="M10 60V18c0-4.4 3.6-8 8-8h42" strokeWidth="0.5" />
        <path d="M16 16c6 1 10 5 11 11c-6-1-10-5-11-11z" fill="rgba(217,165,46,0.18)" />
        <path d="M16 16l11 11" strokeWidth="0.45" />
        <path d="M27 14c5 0 9 2 12 6M14 27c0 5 2 9 6 12" />
        <circle cx="41" cy="21.5" r="1.3" fill="var(--rsh-gold)" stroke="none" />
        <circle cx="21.5" cy="41" r="1.3" fill="var(--rsh-gold)" stroke="none" />
      </g>
    </svg>
  );
}
