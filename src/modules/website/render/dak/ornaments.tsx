"use client";

import { useId } from "react";

/**
 * THE DAK — the invitation arrives as airmail.
 *
 * The conceit: this is not a website about a postcard, it *is* the postcard —
 * aged card stock, a perforated stamp in the corner, a wax postmark struck
 * half over it, and a handwritten address. "Dak" is the post; the theme is
 * philatelic rather than floral.
 *
 * Three decisions hold it together:
 *
 * 1. PERFORATION IS THE MOTIF. Every card on the page is a stamp. Small marks
 *    (nav, buttons, seals) draw their teeth in SVG via `scallop()` so the
 *    shape is a true perforated outline at any size; large content-bearing
 *    cards get their teeth from CSS (`.dak-perf`, one radial-gradient strip
 *    per edge in the ground colour, biting inward) — no masks, no compositing,
 *    identical in every engine.
 *
 * 2. ENGRAVED, NOT ILLUSTRATED. Stamp interiors are intaglio: single-weight
 *    line work and flat silhouettes over fine hatching, in one ink at a time.
 *    Postal printing had one plate per colour — so the art does too.
 *
 * 3. THREE INKS. Postal navy, brass and vermilion over stock. Vermilion is
 *    rationed to what a post office would actually strike in red: postmarks,
 *    the airmail chevron, the wax seal.
 *
 * Ornaments take `currentColor` wherever they sit on more than one ground, so
 * a mark reads correctly on navy and on paper without a second variant.
 *
 * GOTCHA (shared with the other bespoke renderers): a CSS animation that sets
 * `transform` overrides an element's SVG `transform` attribute outright, so an
 * animated part that also needs placing is always two nested <g>: outer
 * translates, inner animates. Never both on one element.
 */

const GOLD = "var(--dak-gold)";
const GOLD_LITE = "var(--dak-gold-lite)";
const RED = "var(--dak-red)";
const INK = "var(--dak-ink)";
const SURFACE = "var(--dak-surface)";

/* ══════════════════════════════════════════════════════════════════════════
   PERFORATION — the outline every stamp on the page is cut to.
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * A rectangle whose edges are bitten by semicircular perforations. Traversed
 * clockwise, so every notch arc uses sweep-flag 1 and bites inward.
 */
function scallop(w: number, h: number, r: number, nx: number, ny: number): string {
  const sx = w / nx;
  const sy = h / ny;
  const n = (v: number) => Number(v.toFixed(2));
  let d = "M0 0";
  for (let i = 0; i < nx; i++) {
    const c = i * sx + sx / 2;
    d += ` L${n(c - r)} 0 A${r} ${r} 0 0 1 ${n(c + r)} 0`;
  }
  d += ` L${w} 0`;
  for (let i = 0; i < ny; i++) {
    const c = i * sy + sy / 2;
    d += ` L${w} ${n(c - r)} A${r} ${r} 0 0 1 ${w} ${n(c + r)}`;
  }
  d += ` L${w} ${h}`;
  for (let i = 0; i < nx; i++) {
    const c = w - (i * sx + sx / 2);
    d += ` L${n(c + r)} ${h} A${r} ${r} 0 0 1 ${n(c - r)} ${h}`;
  }
  d += ` L0 ${h}`;
  for (let i = 0; i < ny; i++) {
    const c = h - (i * sy + sy / 2);
    d += ` L0 ${n(c + r)} A${r} ${r} 0 0 1 0 ${n(c - r)}`;
  }
  return `${d} Z`;
}

/* ══════════════════════════════════════════════════════════════════════════
   THE CAMEO — the couple, engraved. Silhouettes over hatching, the way a
   commemorative stamp carries a portrait: no faces, no expressions, just the
   read of a bride and a groom. It is the only figurative art in the theme,
   and it appears exactly three times (hero stamp, seal, nav mark).
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * A head in profile, facing right — brow, nose, lip, chin and jaw. Both busts
 * share it: profile is what a struck portrait can carry at 20mm, where a
 * front-facing head collapses into a featureless disc.
 */
const PROFILE_HEAD =
  "M-13 -14 C-13 -28 -7 -35 2 -35 C11 -35 15 -28 14 -20 C13.7 -17 13 -15 12 -13 " +
  "L16.5 -6.5 L11 -4 C13 -2 12 0.4 9 1.4 C11 3.4 10 6.6 6 7.6 " +
  "C0 9.4 -6 6.6 -9 2.6 C-12 -0.6 -13 -7 -13 -14 Z";

/** Groom bust, facing right — turban wrapped low, a kalgi at the crest. */
function GroomBust({ fill }: { fill: string }) {
  return (
    <g fill={fill}>
      {/* shoulders + neck, then the head over them */}
      <path d="M-23 34 C-23 17 -10 11 1 11 C13 11 25 17 25 34 Z" />
      <path d="M-5 2 H7 V13 H-5 Z" />
      <path d={PROFILE_HEAD} />
      {/* the safa, sitting over the crown and down to the brow */}
      <path d="M-15 -19 C-16 -37 -6 -45 4 -44 C15 -43 19 -33 17 -21 C10 -30 -6 -29 -15 -19 Z" />
      {/* kalgi — upright and set back, so it reads as a crest, not a horn */}
      <path d="M5 -44 C6 -51 8 -55 10 -58 C11 -52 10 -47 9 -43 Z" />
      <circle cx="7" cy="-42" r="2" />
    </g>
  );
}

/** Bride bust, facing right — low bun, maang tikka, dupatta over the shoulder. */
function BrideBust({ fill }: { fill: string }) {
  return (
    <g fill={fill}>
      <path d="M-23 34 C-23 17 -10 11 1 11 C13 11 25 17 25 34 Z" />
      <path d="M-5 2 H7 V13 H-5 Z" />
      {/* the dupatta falls behind her, drawn as one unbroken sheet */}
      <path d="M-6 -36 C-22 -29 -30 -5 -27 34 L-13 34 C-17 6 -15 -20 -3 -33 Z" />
      <path d={PROFILE_HEAD} />
      {/* hair, swept back from the parting into a low bun */}
      <path d="M-14 -16 C-15 -32 -6 -39 3 -38 C13 -37 15 -28 14 -21 C10 -29 -4 -31 -14 -16 Z" />
      <ellipse cx="-16" cy="-9" rx="8.5" ry="7.5" />
      {/* gajra on the bun */}
      <circle cx="-22" cy="-16" r="2" />
      <circle cx="-17" cy="-19" r="1.7" />
      {/* maang tikka, hanging at the parting */}
      <circle cx="9" cy="-30" r="2.1" />
    </g>
  );
}

/**
 * The couple in an oval, over engraver's hatching — the interior of the
 * commemorative stamp. `tone` is the single plate ink.
 */
export function CoupleCameo({
  className,
  tone = GOLD_LITE,
  hatch = GOLD,
}: {
  className?: string;
  tone?: string;
  hatch?: string;
}) {
  const id = useId();
  return (
    <svg viewBox="0 0 160 170" fill="none" aria-hidden className={className}>
      <defs>
        <pattern id={`${id}-h`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <line x1="0" y1="0" x2="0" y2="6" stroke={hatch} strokeWidth="0.7" opacity="0.4" />
        </pattern>
        <clipPath id={`${id}-c`}>
          <ellipse cx="80" cy="85" rx="66" ry="76" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-c)`}>
        <ellipse cx="80" cy="85" rx="66" ry="76" fill={`url(#${id}-h)`} />
        {/* the disc behind them — a plain plate device, not a scene */}
        <circle cx="80" cy="62" r="35" fill={hatch} opacity="0.2" />
        {/* they face one another: he is drawn facing right, she is mirrored */}
        <g transform="translate(56 104)">
          <GroomBust fill={tone} />
        </g>
        <g transform="translate(104 104) scale(-1 1)">
          <BrideBust fill={tone} />
        </g>
      </g>
      <ellipse cx="80" cy="85" rx="66" ry="76" stroke={hatch} strokeWidth="1.1" opacity="0.85" />
      <ellipse cx="80" cy="85" rx="61" ry="71" stroke={hatch} strokeWidth="0.5" opacity="0.5" />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   STAMPS
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * The definitive stamp: perforated stock, an engraved keyline, the couple's
 * cameo, a denomination and a country line. The hero's postage.
 */
export function CoupleStamp({
  initials,
  year,
  className,
}: {
  initials: string;
  year: string;
  className?: string;
}) {
  const id = useId();
  const W = 200;
  const H = 244;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} fill="none" aria-hidden className={className}>
      <defs>
        <linearGradient id={`${id}-s`} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor={INK} />
          <stop offset="1" stopColor="var(--dak-ink-3)" />
        </linearGradient>
      </defs>
      {/* stock */}
      <path d={scallop(W, H, 4.6, 11, 13)} fill={SURFACE} />
      {/* printed panel */}
      <rect x="12" y="12" width={W - 24} height={H - 24} fill={`url(#${id}-s)`} />
      <rect x="17" y="17" width={W - 34} height={H - 34} stroke={GOLD} strokeWidth="0.8" opacity="0.7" />
      {/* the engraved subject, set as a nested plate inside the panel */}
      <svg x="30" y="42" width="140" height="149" viewBox="0 0 160 170">
        <CoupleCameo />
      </svg>
      {/* country line, monogram, year — the way a definitive is set */}
      <text x="100" y="36" textAnchor="middle" className="dak-mono" fontSize="9.5" letterSpacing="3.2" fill={GOLD_LITE}>
        DAK · डाक
      </text>
      <text x="100" y="212" textAnchor="middle" className="dak-mono" fontSize="13" letterSpacing="4" fill={GOLD_LITE}>
        {initials}
      </text>
      <text x="100" y="227" textAnchor="middle" className="dak-mono" fontSize="8" letterSpacing="2.6" fill={GOLD} opacity="0.8">
        {year}
      </text>
      <g fill={GOLD} opacity="0.8">
        <path d="M34 205 L38 209 L34 213 L30 209 Z" />
        <path d="M166 205 L170 209 L166 213 L162 209 Z" />
      </g>
    </svg>
  );
}

/**
 * A small perforated stamp bearing a monogram — the nav mark, and the cameo
 * that rides inside every primary button.
 */
export function DakMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 52" fill="none" aria-hidden className={className}>
      <path d={scallop(44, 52, 2.2, 7, 8)} fill="currentColor" opacity="0.1" />
      <path d={scallop(44, 52, 2.2, 7, 8)} stroke="currentColor" strokeWidth="0.9" opacity="0.75" />
      <rect x="7" y="8" width="30" height="36" stroke="currentColor" strokeWidth="0.7" opacity="0.55" />
      {/* two silhouettes, reduced until only the read survives */}
      <g fill="currentColor">
        <path d="M13 38 C13 30 15 26 18 26 C21 26 23 30 23 38 Z" />
        <circle cx="18" cy="22" r="4" />
        <path d="M21 38 C21 30 24 26 27 26 C30 26 32 30 32 38 Z" opacity="0.75" />
        <circle cx="27" cy="22" r="4" opacity="0.75" />
      </g>
      <circle cx="22" cy="13" r="1.5" fill="currentColor" />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   POSTMARKS — struck, not printed. Always at a slight angle in use.
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * A circular date-stamp: town on the upper arc, a legend on the lower, the
 * date between two bars. Inherits `currentColor` so it strikes in vermilion on
 * paper and in brass on navy.
 */
export function Postmark({
  town,
  line1,
  line2,
  legend = "PAR AVION",
  className,
}: {
  town: string;
  line1: string;
  line2?: string;
  legend?: string;
  className?: string;
}) {
  const id = useId();
  return (
    <svg viewBox="0 0 128 128" fill="none" aria-hidden className={className}>
      <defs>
        {/* Both legends ride the same radius, well clear of the date panel.
            Clockwise over the top → upright letters; counter-clockwise under
            the bottom → upright letters. Reversing either flips the text. */}
        <path id={`${id}-t`} d="M13 64 A51 51 0 0 1 115 64" />
        <path id={`${id}-b`} d="M13 64 A51 51 0 0 0 115 64" />
      </defs>
      <circle cx="64" cy="64" r="59" stroke="currentColor" strokeWidth="2.4" />
      <circle cx="64" cy="64" r="43" stroke="currentColor" strokeWidth="0.9" opacity="0.6" />
      <text className="dak-mono" fontSize="11" letterSpacing="2.4" fill="currentColor">
        <textPath href={`#${id}-t`} startOffset="50%" textAnchor="middle">
          {town}
        </textPath>
      </text>
      <text className="dak-mono" fontSize="8" letterSpacing="2" fill="currentColor" opacity="0.85">
        <textPath href={`#${id}-b`} startOffset="50%" textAnchor="middle">
          {legend}
        </textPath>
      </text>
      {/* the date panel, ruled top and bottom the way a canceller is cut */}
      <line x1="29" y1="50" x2="99" y2="50" stroke="currentColor" strokeWidth="1.1" opacity="0.8" />
      <text
        x="64"
        y={line2 ? "66" : "70"}
        textAnchor="middle"
        className="dak-mono"
        fontSize="14"
        letterSpacing="1.4"
        fill="currentColor"
      >
        {line1}
      </text>
      {line2 ? (
        <text x="64" y="75.5" textAnchor="middle" className="dak-mono" fontSize="8.5" letterSpacing="1.8" fill="currentColor" opacity="0.9">
          {line2}
        </text>
      ) : null}
      <line x1="29" y1="81" x2="99" y2="81" stroke="currentColor" strokeWidth="1.1" opacity="0.8" />
    </svg>
  );
}

/** The cancellation waves that run off the side of a struck stamp. */
export function CancelWaves({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 46" fill="none" aria-hidden className={className}>
      {[6, 15, 24, 33, 42].map((y, i) => (
        <path
          key={y}
          d={`M2 ${y} C30 ${y - 5} 52 ${y + 5} 80 ${y} C108 ${y - 5} 132 ${y + 5} 158 ${y}`}
          stroke="currentColor"
          strokeWidth="1.9"
          opacity={0.8 - i * 0.06}
        />
      ))}
    </svg>
  );
}

/** A rectangular hand-stamp cachet, e.g. DELIVERED / REPLY PAID. */
export function Cachet({ label, className }: { label: string; className?: string }) {
  return (
    <span className={`dak-cachet ${className ?? ""}`}>
      <span className="dak-cachet-in">{label}</span>
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   SEALS, RULES & FLIGHT
   ══════════════════════════════════════════════════════════════════════════ */

/** Wax, pressed with the couple's monogram. Deliberately not a circle. */
export function WaxSeal({ initials, className }: { initials: string; className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden className={className}>
      <defs>
        <radialGradient id={`${id}-w`} cx="40%" cy="34%" r="78%">
          <stop offset="0" stopColor="#B93B33" />
          <stop offset="0.55" stopColor={RED} />
          <stop offset="1" stopColor="var(--dak-red-deep)" />
        </radialGradient>
      </defs>
      {/* the irregular spread of wax under the press */}
      <path
        d="M62 7 C80 9 93 17 101 32 C111 49 113 63 105 79 C97 95 83 109 61 112 C41 115 23 105 13 89
           C3 72 7 52 16 37 C24 22 42 6 62 7 Z"
        fill={`url(#${id}-w)`}
      />
      <path
        d="M60 16 C76 16 88 24 95 36 C104 50 106 63 99 76 C93 89 80 101 61 104 C43 107 28 99 20 85
           C11 71 13 54 20 41 C27 27 43 16 60 16 Z"
        stroke="#E9B4AE"
        strokeWidth="0.8"
        opacity="0.22"
      />
      {/* the pressed ring of dots */}
      {Array.from({ length: 28 }).map((_, i) => (
        <circle key={i} cx="60" cy="22" r="1.4" fill="#EFC7C2" opacity="0.28" transform={`rotate(${i * (360 / 28)} 60 61)`} />
      ))}
      <text x="60" y="70" textAnchor="middle" className="dak-serif" fontSize="34" letterSpacing="1" fill="#F3D2CD" opacity="0.88">
        {initials}
      </text>
    </svg>
  );
}

/** A brass hairline with a lozenge — the section rule. */
export function PostalRule({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 14" fill="none" aria-hidden className={className}>
      <line x1="2" y1="7" x2="112" y2="7" stroke={GOLD} strokeWidth="0.9" opacity="0.7" />
      <line x1="148" y1="7" x2="258" y2="7" stroke={GOLD} strokeWidth="0.9" opacity="0.7" />
      <path d="M130 1.5 L136.5 7 L130 12.5 L123.5 7 Z" stroke={GOLD} strokeWidth="0.9" fill="none" />
      <circle cx="130" cy="7" r="1.3" fill={GOLD_LITE} />
      <circle cx="117" cy="7" r="1" fill={GOLD} opacity="0.8" />
      <circle cx="143" cy="7" r="1" fill={GOLD} opacity="0.8" />
    </svg>
  );
}

/**
 * A folded paper dart, nose to the right. A letter that flies is the truer
 * device for this theme than an airliner — and it survives being 14px wide,
 * which a fuselage with wings and a tailplane does not.
 */
function Plane({ fill }: { fill: string }) {
  return (
    <g>
      {/* the far wing, then the fold, then the near wing */}
      <path d="M34 0 L-14 -15 L-2 1 Z" fill={fill} opacity="0.55" />
      <path d="M34 0 L-14 15 L-2 1 Z" fill={fill} />
      <path d="M34 0 L-2 1 L-6 8 Z" fill={fill} opacity="0.8" />
    </g>
  );
}

/**
 * The route: a dashed great-circle arc with the plane travelling it. The plane
 * is nested — outer <g> carries the CSS keyframes, inner places and scales it
 * — because a CSS transform would otherwise wipe the SVG transform attribute.
 */
export function FlightRoute({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 900 120" fill="none" aria-hidden className={className}>
      <path
        d="M20 96 C170 34 400 12 620 30 C740 40 830 62 884 84"
        stroke={GOLD}
        strokeWidth="1.4"
        strokeDasharray="2 9"
        strokeLinecap="round"
        opacity="0.7"
      />
      <circle cx="20" cy="96" r="4.5" fill={GOLD} />
      <circle cx="20" cy="96" r="9" stroke={GOLD} strokeWidth="1" opacity="0.6" />
      <circle cx="884" cy="84" r="4.5" fill={RED} />
      <circle cx="884" cy="84" r="9" stroke={RED} strokeWidth="1" opacity="0.6" />
      <g className="dak-fly">
        <g className="dak-fly-y">
          <g transform="translate(0 26)">
            <Plane fill={GOLD_LITE} />
          </g>
        </g>
      </g>
    </svg>
  );
}

/** Airmail's own device: a winged letter, for the countdown eyebrow. */
export function WingedLetter({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 64" fill="none" aria-hidden className={className}>
      <g stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round">
        <rect x="42" y="20" width="36" height="24" />
        <path d="M42 20 L60 34 L78 20" />
        <path d="M38 26 C26 22 16 22 6 26" opacity="0.8" />
        <path d="M38 32 C24 30 14 31 4 34" opacity="0.6" />
        <path d="M82 26 C94 22 104 22 114 26" opacity="0.8" />
        <path d="M82 32 C96 30 106 31 116 34" opacity="0.6" />
      </g>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   CEREMONY VIGNETTES — the engraved subject of each celebration's stamp.
   Single-weight line, one ink, no fills. Matched on the event's own name so
   couples who write "Haldi Ceremony" or "Sangeet Night" still get theirs.
   ══════════════════════════════════════════════════════════════════════════ */

function VHaldi() {
  return (
    <g>
      <path d="M14 28 C14 37 20 42 28 42 C36 42 42 37 42 28 Z" />
      <path d="M11 28 H45" />
      <path d="M28 22 C23 16 24 10 28 6 C32 10 33 16 28 22 Z" />
      <path d="M20 24 C17 20 17 15 19 13" opacity="0.6" />
      <path d="M36 24 C39 20 39 15 37 13" opacity="0.6" />
    </g>
  );
}
/** An open palm, henna side out — four fingers, a thumb and a paisley in it. */
function VMehendi() {
  return (
    <g>
      <path d="M20 46 C15 40 15 32 17 27 L17 17 M22 15 V26 M27 14 V26 M32 16 V27" />
      <path d="M17 27 C13 24 11 20 12 17" />
      <path d="M32 27 C36 30 37 36 34 42 C32 45 28 47 20 46" />
      <path d="M24 38 C28 35 25 30 27 27" />
      <circle cx="27" cy="24" r="1.6" fill="currentColor" stroke="none" />
    </g>
  );
}
function VSangeet() {
  return (
    <g>
      <ellipse cx="20" cy="32" rx="9" ry="10" />
      <path d="M11 32 H29" />
      <ellipse cx="36" cy="35" rx="7" ry="7.5" />
      <path d="M29 35 H43" />
      <path d="M32 16 V6 L41 8" />
      <circle cx="30" cy="17" r="1.8" fill="currentColor" stroke="none" />
    </g>
  );
}
function VWedding() {
  return (
    <g>
      <path d="M28 8 C23 17 31 21 28 30 C35 25 35 15 28 8 Z" />
      <path d="M15 33 H41 L36 45 H20 Z" />
      <path d="M12 33 H44" />
      <path d="M22 37 V40" opacity="0.6" />
      <path d="M34 37 V40" opacity="0.6" />
    </g>
  );
}
function VReception() {
  return (
    <g>
      <path d="M14 10 H26 L22 26 C22 29 18 29 18 26 Z" />
      <path d="M20 29 V44 M15 44 H25" />
      <path d="M30 10 H42 L38 26 C38 29 34 29 34 26 Z" opacity="0.85" />
      <path d="M36 29 V44 M31 44 H41" opacity="0.85" />
      <circle cx="28" cy="7" r="1.6" fill="currentColor" stroke="none" />
    </g>
  );
}
function VBaraat() {
  return (
    <g>
      <path d="M10 42 H46" />
      <path d="M16 42 V30 C16 24 22 20 28 20 C34 20 40 24 40 30 V42" />
      <path d="M28 20 V12" />
      <path d="M20 12 H36" />
      <path d="M24 30 H32" opacity="0.6" />
    </g>
  );
}
function VDefault() {
  return (
    <g>
      <path d="M28 8 L31 22 L45 25 L31 28 L28 42 L25 28 L11 25 L25 22 Z" />
      <circle cx="28" cy="25" r="3" opacity="0.6" />
    </g>
  );
}

const VIGNETTES: Array<[RegExp, () => React.JSX.Element]> = [
  [/haldi|pithi|turmeric/i, VHaldi],
  [/mehendi|mehandi|henna/i, VMehendi],
  [/sangeet|music|dance|cocktail|dj/i, VSangeet],
  [/baraat|barat|welcome|swagat|milni/i, VBaraat],
  [/reception|dinner|party|brunch|lunch/i, VReception],
  [/wedding|vivah|pheras|phere|nikah|muhurat|shaadi|shadi|vows|ceremony|mandap|anand/i, VWedding],
];

/** The engraved subject for an event, chosen from its name. */
export function CeremonyVignette({ name, className }: { name: string; className?: string }) {
  const Art = VIGNETTES.find(([re]) => re.test(name))?.[1] ?? VDefault;
  return (
    <svg viewBox="0 0 56 52" fill="none" aria-hidden className={className}>
      <g stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <Art />
      </g>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   BACKGROUND PLATES
   ══════════════════════════════════════════════════════════════════════════ */

/** Faint concentric strike-rings, as if the page itself had been cancelled. */
export function StrikeRings({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" fill="none" aria-hidden className={className}>
      <g stroke={GOLD} fill="none">
        <circle cx="200" cy="200" r="188" strokeWidth="1.6" />
        <circle cx="200" cy="200" r="152" strokeWidth="0.6" />
        <circle cx="200" cy="200" r="116" strokeWidth="0.6" />
        {Array.from({ length: 60 }).map((_, i) => (
          <line key={i} x1="200" y1="12" x2="200" y2="26" strokeWidth="0.7" transform={`rotate(${i * 6} 200 200)`} />
        ))}
      </g>
    </svg>
  );
}

/**
 * The map plate behind the hero: dashed latitudes, longitudes and a scatter of
 * route pins. Abstract on purpose — a real coastline would date the theme to
 * one country.
 */
export function MapPlate({ className }: { className?: string }) {
  const lat = [40, 96, 152, 208, 264, 320];
  const lon = [60, 160, 260, 360, 460, 560, 660, 760, 860];
  return (
    <svg viewBox="0 0 900 360" fill="none" aria-hidden className={className}>
      <g stroke={GOLD} strokeWidth="0.7" opacity="0.5">
        {lat.map((y) => (
          <path key={y} d={`M10 ${y} C240 ${y - 16} 660 ${y + 16} 890 ${y}`} strokeDasharray="3 10" />
        ))}
        {lon.map((x) => (
          <path key={x} d={`M${x} 14 C${x - 14} 130 ${x + 14} 240 ${x} 348`} strokeDasharray="3 10" />
        ))}
      </g>
      <g fill={GOLD}>
        {[
          [160, 96],
          [460, 152],
          [660, 208],
          [360, 264],
        ].map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <circle cx={x} cy={y} r="3.4" />
            <circle cx={x} cy={y} r="8" fill="none" stroke={GOLD} strokeWidth="0.8" opacity="0.7" />
          </g>
        ))}
      </g>
    </svg>
  );
}

/* Album corner mounts are four fixed-size paper triangles — see `.dak-mounts`
   in globals.css. They are CSS rather than SVG so they stay the same size on a
   landscape plate and a portrait one; a stretched SVG mount grows with the
   frame and stops reading as a photo corner. */
