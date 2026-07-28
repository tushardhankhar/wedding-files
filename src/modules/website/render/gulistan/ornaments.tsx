"use client";

import type { CSSProperties } from "react";
import { m } from "motion/react";

/**
 * THE GULISTAN — ornament system (the "rose garden").
 *
 * A blush-and-gold Mughal-garden Save the Date: a cusped jharokha arch, roses
 * cascading from the corners, hanging temple bells, a domed palace mirrored in
 * a dusk lake, an illustrated couple on the balcony, and gold lanterns aglow.
 *
 * Everything is hand-drawn SVG line/fill art driven by the theme's --glt-*
 * tokens — no external images — so it stays crisp at any size, recolours with
 * the palette, and animates (draw-in, sway, flicker, drift). Continuous motion
 * lives in CSS (.glt-* classes) and collapses under prefers-reduced-motion;
 * one-shot entrances use Framer's `m`.
 */

/** Ornaments sized from the outside; `style` carries a caller-computed size. */
type SvgProps = { className?: string; style?: CSSProperties };

const GOLD = "var(--glt-gold)";
const GOLD_LITE = "var(--glt-gold-lite)";
const ROSE = "var(--glt-rose)";
const ROSE_DEEP = "var(--glt-rose-deep)";
const LEAF = "var(--glt-leaf)";

/* ── the botanical kit: rose, bud, leaf ───────────────────────────────────
 * Drawn in a unit space and scaled by `r`, so everything stays crisp at any
 * size. Three rules keep these reading as fine botanical illustration rather
 * than flat clip-art:
 *
 *   1. TONAL DEPTH — each ring of petals goes one step deeper and one step more
 *      opaque toward the centre, so a bloom has an inside. (The old version
 *      filled every petal the same, which is what made it read as a daisy.)
 *   2. ODD RINGS — 6 / 5 / 4 petals at staggered angles, never a single ring of
 *      five, which the eye reads as a cartoon flower.
 *   3. GOLD IS A HIGHLIGHT, NOT AN OUTLINE — one hairline on the outer
 *      silhouette and a pinpoint at the heart. Gold on every petal edge is what
 *      cheapens engraved-look art.
 */
const PETAL = "M0 0 C -0.6 -0.36 -0.52 -1.0 0 -1.22 C 0.52 -1.0 0.6 -0.36 0 0 Z";
const ring = (count: number, offset: number) =>
  Array.from({ length: count }, (_, i) => offset + (i * 360) / count);

/** Petal rings, outermost first: [angles, scale, opacity, which tone]. */
const BLOOM: [number[], number, number, "pale" | "base" | "deep"][] = [
  [ring(6, 0), 1, 0.5, "pale"],
  [ring(5, 32), 0.74, 0.78, "base"],
  [ring(4, 56), 0.46, 0.95, "deep"],
];

function Blossom({
  cx,
  cy,
  r,
  pale = "var(--glt-blush-2)",
  base = ROSE,
  deep = ROSE_DEEP,
}: {
  cx: number;
  cy: number;
  r: number;
  pale?: string;
  base?: string;
  deep?: string;
}) {
  const tone = { pale, base, deep };
  return (
    <g transform={`translate(${cx} ${cy}) scale(${r})`}>
      {BLOOM.map(([angles, scale, opacity, key]) =>
        angles.map((a) => (
          <path
            key={`${key}${a}`}
            d={PETAL}
            fill={tone[key]}
            opacity={opacity}
            transform={`rotate(${a}) scale(${scale})`}
          />
        ))
      )}
      {/* a single hairline on the outer silhouette, and the gold heart */}
      {ring(6, 0).map((a) => (
        <path
          key={`e${a}`}
          d={PETAL}
          fill="none"
          stroke={GOLD}
          strokeWidth={0.022}
          opacity={0.28}
          transform={`rotate(${a})`}
        />
      ))}
      <circle r={0.11} fill={GOLD_LITE} opacity={0.9} />
    </g>
  );
}

/** A closed bud — the quiet note between blooms; keeps a spray from reading
 * as a repeating pattern. */
function Bud({ cx, cy, r, rot = 0 }: { cx: number; cy: number; r: number; rot?: number }) {
  return (
    <g transform={`translate(${cx} ${cy}) scale(${r}) rotate(${rot})`}>
      <path
        d="M0 0 C -0.4 -0.28 -0.38 -0.96 0 -1.14 C 0.38 -0.96 0.4 -0.28 0 0 Z"
        fill={ROSE}
        opacity={0.72}
      />
      <path
        d="M0 -0.06 C -0.16 -0.34 -0.14 -0.86 0 -1.02 C 0.14 -0.86 0.16 -0.34 0 -0.06 Z"
        fill={ROSE_DEEP}
        opacity={0.6}
      />
      {/* sepals */}
      <path d="M-0.34 -0.12 C -0.5 -0.34 -0.46 -0.6 -0.4 -0.72" stroke={LEAF} strokeWidth={0.06} opacity={0.75} />
      <path d="M0.34 -0.12 C 0.5 -0.34 0.46 -0.6 0.4 -0.72" stroke={LEAF} strokeWidth={0.06} opacity={0.75} />
    </g>
  );
}

/** A lanceolate leaf with a midrib — pointed, not the fat ellipse it was. */
function Leaf({ cx, cy, r, rot = 0 }: { cx: number; cy: number; r: number; rot?: number }) {
  return (
    <g transform={`translate(${cx} ${cy}) scale(${r}) rotate(${rot})`}>
      <path
        d="M0 0 C 0.34 -0.34 0.32 -0.86 0 -1.16 C -0.32 -0.86 -0.34 -0.34 0 0 Z"
        fill={LEAF}
        opacity={0.62}
      />
      <path d="M0 -0.06 L0 -1.04" stroke="var(--glt-cream)" strokeWidth={0.05} opacity={0.45} />
    </g>
  );
}

/* ── a rose spray spilling from a top corner ───────────────────────────────
 * Composition notes, since this is the element that decides whether the page
 * reads couture or craft-fair:
 *
 *   • IT HUGS THE CORNER. The mass sits in the top ~140 of a 200×420 stage and
 *     tapers to a single trailing stem, so it never wanders into the headline's
 *     column the way the old full-width curtain did.
 *   • THREE BLOOMS, NOT ELEVEN. One hero bloom, one supporting, one small —
 *     a clear size hierarchy — with buds and leaves carrying the rest. Restraint
 *     is the whole look.
 *   • IT DISSOLVES. A gradient mask fades the strand out as it descends, so the
 *     spray ends in air instead of being chopped off mid-stem.
 */
export function FloralCascade({
  side,
  className,
}: {
  side: "left" | "right";
  className?: string;
}) {
  const maskId = `glt-fade-${side}`;
  // Two stems: a short arching one carrying the blooms, and a long thin trail.
  const stems = [
    "M4 -6 C 40 26 62 62 68 104 C 74 148 62 178 46 206",
    "M22 -4 C 44 44 34 96 20 140 C 8 178 14 226 26 268",
    "M2 8 C 26 70 52 132 48 196 C 45 250 30 296 22 344",
  ];
  const blooms = [
    { x: 30, y: 18, r: 21 }, // hero bloom, tucked into the corner
    { x: 74, y: 62, r: 13 }, // supporting
    { x: 20, y: 104, r: 9 }, // small
  ];
  const buds = [
    { x: 58, y: 26, r: 13, rot: 24 },
    { x: 48, y: 132, r: 10, rot: -18 },
    { x: 34, y: 196, r: 7, rot: 12 },
  ];
  const leaves = [
    { x: 54, y: 8, r: 15, rot: 62 },
    { x: 12, y: 52, r: 13, rot: -34 },
    { x: 76, y: 96, r: 12, rot: 48 },
    { x: 30, y: 148, r: 11, rot: -28 },
    { x: 52, y: 168, r: 9, rot: 54 },
    { x: 20, y: 240, r: 8, rot: -22 },
  ];
  return (
    <svg
      viewBox="0 0 200 420"
      fill="none"
      aria-hidden
      className={className}
      style={{ transform: side === "right" ? "scaleX(-1)" : undefined }}
    >
      <defs>
        <linearGradient id={maskId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.42" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="0.78" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={`${maskId}-m`}>
          <rect x="0" y="0" width="200" height="420" fill={`url(#${maskId})`} />
        </mask>
      </defs>

      <g mask={`url(#${maskId}-m)`}>
        {stems.map((d, i) => (
          <path key={`s${i}`} d={d} stroke={LEAF} strokeWidth={i === 2 ? 0.9 : 1.3} opacity={0.42} />
        ))}
        {leaves.map((l, i) => (
          <Leaf key={`l${i}`} cx={l.x} cy={l.y} r={l.r} rot={l.rot} />
        ))}
        {buds.map((b, i) => (
          <Bud key={`d${i}`} cx={b.x} cy={b.y} r={b.r} rot={b.rot} />
        ))}
        {blooms.map((b, i) => (
          <Blossom key={`b${i}`} cx={b.x} cy={b.y} r={b.r} />
        ))}
      </g>
    </svg>
  );
}

/* ── the cusped jharokha arch that frames the hero ────────────────────────── */
export function ArchFrame({ className }: { className?: string }) {
  // Symmetric multi-foil arch across the top with slender pillars down the
  // sides. Outline draws itself in on load. viewBox 400×620, non-uniform scale.
  const arch =
    "M20 600 V210 C20 150 40 120 66 104 " +
    "C86 92 96 74 104 54 C112 74 128 88 148 92 " +
    "C168 96 182 84 200 62 C218 84 232 96 252 92 " +
    "C272 88 288 74 296 54 C304 74 314 92 334 104 " +
    "C360 120 380 150 380 210 V600";
  return (
    <svg
      viewBox="0 0 400 620"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden
      className={className}
    >
      {/* A frame should be felt, not read: a fine engraved line at 0.55, with a
          paler inner rule for the double-line look of a letterpress border.
          At 2.4px/0.9 it competed with the headline for attention. */}
      <m.path
        d={arch}
        stroke={GOLD}
        strokeWidth="1.4"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.55 }}
        transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
      />
      <m.path
        d={arch}
        stroke={GOLD_LITE}
        strokeWidth="0.6"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.4 }}
        transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1], delay: 0.14 }}
        style={{ transform: "translateX(7px)" }}
      />
      {/* pillar bases */}
      {[20, 380].map((x) => (
        <g key={x} stroke={GOLD} strokeWidth="1.4" opacity="0.5">
          <line x1={x - 12} y1="600" x2={x + 12} y2="600" />
          <line x1={x - 8} y1="586" x2={x + 8} y2="586" />
        </g>
      ))}
    </svg>
  );
}

/* ── a small line-art Ganesha for the arch apex (auspicious) ──────────────── */
export function Ganesha({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden className={className}>
      <g stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* crown / mukut */}
        <path d="M60 14 L52 30 L68 30 Z" fill={GOLD_LITE} opacity="0.85" />
        <circle cx="60" cy="12" r="2.4" fill={GOLD} />
        {/* head */}
        <circle cx="60" cy="52" r="20" />
        {/* ears */}
        <path d="M40 46 C28 40 24 54 30 64 C36 72 44 66 44 60" />
        <path d="M80 46 C92 40 96 54 90 64 C84 72 76 66 76 60" />
        <circle cx="34" cy="55" r="3" fill={GOLD} stroke="none" />
        <circle cx="86" cy="55" r="3" fill={GOLD} stroke="none" />
        {/* eyes + tilak */}
        <circle cx="53" cy="49" r="1.6" fill={GOLD} stroke="none" />
        <circle cx="67" cy="49" r="1.6" fill={GOLD} stroke="none" />
        <line x1="60" y1="42" x2="60" y2="50" />
        {/* trunk — graceful S curve */}
        <path d="M60 56 C60 70 50 74 46 84 C43 92 50 98 58 94" />
        {/* tusks */}
        <path d="M52 66 L48 74" />
        <path d="M68 66 L72 74" />
        {/* lotus base */}
        <path
          d="M36 100 Q60 86 84 100 Q60 112 36 100 Z"
          fill={GOLD_LITE}
          opacity="0.5"
          strokeWidth="1.4"
        />
      </g>
    </svg>
  );
}

/* ── a slender gold pendant for the arch crown ─────────────────────────────
 * Replaces the row of swinging temple bells that used to hang across the
 * headline. One static, symmetrical jewel on the centre line: it decorates the
 * crown without competing with the type, and nothing about it moves. */
export function CrownPendant({ className }: { className?: string }) {
  // Compact on purpose: at ~36px tall a long chain renders as a stray hair, so
  // the jewel fills the box and the suspension is a short link, not a thread.
  return (
    <svg viewBox="0 0 44 60" fill="none" aria-hidden className={className}>
      <circle cx="22" cy="6" r="2.4" fill={GOLD} opacity="0.75" />
      <line x1="22" y1="9" x2="22" y2="15" stroke={GOLD} strokeWidth="1.2" opacity="0.6" />
      {/* a lotus-bud drop — the classic jhumar silhouette */}
      <path
        d="M22 15 C11 28 11 45 22 56 C33 45 33 28 22 15 Z"
        fill={GOLD_LITE}
        opacity="0.5"
        stroke={GOLD}
        strokeWidth="1.1"
      />
      <path d="M22 24 C17 32 17 42 22 48 C27 42 27 32 22 24 Z" fill={GOLD} opacity="0.28" />
      <circle cx="22" cy="36" r="2.2" fill={GOLD} opacity="0.85" />
    </svg>
  );
}

/* ── the palace + dusk lake behind the couple ─────────────────────────────── */
export function PalaceScene({ className }: { className?: string }) {
  // A row of onion-domed pavilions on a far bank, mirrored in still water.
  // viewBox 800×360; the sky gradient + water come from the wrapping element.
  const dome = (cx: number, base: number, w: number, h: number, key: string) => (
    <g key={key}>
      <rect x={cx - w * 0.5} y={base - h * 0.55} width={w} height={h * 0.55} />
      <path
        d={`M${cx - w * 0.5} ${base - h * 0.55}
            C${cx - w * 0.5} ${base - h * 0.5 - h * 0.5} ${cx - w * 0.22} ${base - h * 1.2} ${cx} ${base - h * 1.2}
            C${cx + w * 0.22} ${base - h * 1.2} ${cx + w * 0.5} ${base - h * 0.5 - h * 0.5} ${cx + w * 0.5} ${base - h * 0.55} Z`}
      />
      <line x1={cx} y1={base - h * 1.2} x2={cx} y2={base - h * 1.42} strokeWidth="1.6" />
      <circle cx={cx} cy={base - h * 1.46} r="2.4" />
    </g>
  );
  const skyline = (base: number, fill: string, opacity: number) => (
    <g fill={fill} stroke={fill} opacity={opacity} strokeWidth="1">
      {/* central grand pavilion + flanking chhatris, receding smaller outward */}
      {dome(400, base, 120, 96, "c")}
      {dome(270, base, 84, 70, "l1")}
      {dome(530, base, 84, 70, "r1")}
      {dome(150, base, 64, 54, "l2")}
      {dome(650, base, 64, 54, "r2")}
      {dome(60, base, 44, 40, "l3")}
      {dome(740, base, 44, 40, "r3")}
      {/* connecting rampart wall */}
      <rect x="20" y={base - 26} width="760" height="26" />
    </g>
  );
  return (
    <svg viewBox="0 0 800 360" fill="none" aria-hidden className={className} preserveAspectRatio="xMidYMax slice">
      {/* far silhouette + near silhouette for depth */}
      {skyline(196, "var(--glt-palace-far)", 0.55)}
      {skyline(200, "var(--glt-palace)", 0.92)}
      {/* twinkling window/garden lights along the bank */}
      {Array.from({ length: 40 }).map((_, i) => (
        <circle
          key={i}
          cx={40 + i * 19}
          cy={182 + (i % 3) * 6}
          r={i % 4 === 0 ? 2 : 1.3}
          fill={GOLD_LITE}
          className="glt-twinkle"
          style={{ animationDelay: `${(i % 7) * 0.4}s` }}
        />
      ))}
      {/* the lake — reflection of the skyline, softened + rippling */}
      <g transform="translate(0 400) scale(1 -1)" opacity="0.28">
        {skyline(200, "var(--glt-palace)", 0.9)}
      </g>
      <g stroke={GOLD_LITE} strokeWidth="1" opacity="0.25">
        {[236, 268, 300, 332].map((y, i) => (
          <line key={i} x1="30" y1={y} x2="770" y2={y} strokeDasharray="2 22" />
        ))}
      </g>
    </svg>
  );
}

/* ── the couple on the balcony (backs turned, facing the palace) ──────────── */
/** The balcony railing belongs to the drawn couple alone — a client's uploaded
 * illustration replaces this whole SVG, railing included. */
export function Couple({ className, style }: SvgProps) {
  return (
    <svg viewBox="0 0 300 320" fill="none" aria-hidden className={className} style={style}>
      {/* balustrade */}
      <g stroke={GOLD} opacity="0.8">
        <line x1="10" y1="300" x2="290" y2="300" strokeWidth="3" />
        <line x1="10" y1="266" x2="290" y2="266" strokeWidth="2" />
        {Array.from({ length: 13 }).map((_, i) => (
          <line key={i} x1={22 + i * 21} y1="268" x2={22 + i * 21} y2="299" strokeWidth="2" />
        ))}
      </g>

      {/* ── groom (left) — cream sherwani ── */}
      <g>
        {/* body / sherwani */}
        <path
          d="M110 300 C104 250 104 200 112 168 C116 150 128 142 140 142 C152 142 162 152 165 170 C170 205 168 255 164 300 Z"
          fill="var(--glt-cream)"
          stroke="var(--glt-gold)"
          strokeWidth="1.4"
        />
        {/* arm around bride */}
        <path
          d="M162 176 C182 172 198 176 206 190 C199 190 190 190 182 194 C174 198 168 196 162 190 Z"
          fill="var(--glt-cream)"
          stroke="var(--glt-gold)"
          strokeWidth="1.2"
        />
        {/* neck + head */}
        <rect x="132" y="120" width="16" height="18" fill="var(--glt-cream)" />
        <circle cx="140" cy="108" r="18" fill="var(--glt-skin)" />
        {/* hair (back of head) */}
        <path d="M122 106 C122 92 132 84 140 84 C148 84 158 92 158 106 C150 98 130 98 122 106 Z" fill="var(--glt-hair)" />
        {/* embroidery dots */}
        {[
          [128, 200],
          [140, 220],
          [150, 240],
          [132, 250],
          [146, 270],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1.6" fill="var(--glt-gold)" opacity="0.7" />
        ))}
      </g>

      {/* ── bride (right) — blush lehenga + dupatta ── */}
      <g>
        {/* flared skirt */}
        <path
          d="M150 300 C150 250 156 210 168 186 C174 174 186 172 194 174 C204 176 210 188 214 210 C220 244 222 274 224 300 Z"
          fill="var(--glt-rose)"
          stroke="var(--glt-gold)"
          strokeWidth="1.4"
        />
        {/* dupatta over shoulder */}
        <path
          d="M180 158 C196 150 214 156 222 176 C214 176 206 180 200 188 C194 180 186 168 180 158 Z"
          fill="var(--glt-rose-deep)"
          opacity="0.9"
          stroke="var(--glt-gold)"
          strokeWidth="1"
        />
        {/* neck + head */}
        <rect x="180" y="132" width="13" height="16" fill="var(--glt-skin)" />
        <circle cx="186" cy="122" r="16" fill="var(--glt-skin)" />
        {/* long hair down the back */}
        <path
          d="M172 118 C170 104 178 96 186 96 C194 96 202 104 200 118 C202 150 198 186 190 210 C188 186 184 150 186 128 C182 150 180 186 178 208 C172 184 170 148 172 118 Z"
          fill="var(--glt-hair)"
        />
        {/* maang tikka / hair jewel */}
        <circle cx="186" cy="106" r="2.4" fill="var(--glt-gold-lite)" />
        {/* lehenga embroidery */}
        {[
          [176, 220],
          [190, 236],
          [202, 252],
          [184, 262],
          [198, 280],
          [172, 250],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1.6" fill="var(--glt-gold)" opacity="0.75" />
        ))}
        {/* skirt hem trim */}
        <path d="M152 296 Q188 288 222 296" stroke="var(--glt-gold-lite)" strokeWidth="2" />
      </g>
    </svg>
  );
}

/* ── a hanging garden lantern with a flickering flame ─────────────────────── */
export function Lantern({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 150" fill="none" aria-hidden className={className}>
      {/* chain */}
      <line x1="40" y1="0" x2="40" y2="22" stroke={GOLD} strokeWidth="1.4" opacity="0.7" />
      <g stroke={GOLD} strokeWidth="2" strokeLinejoin="round">
        {/* cap */}
        <path d="M26 30 L40 18 L54 30 Z" fill={GOLD_LITE} opacity="0.9" />
        {/* body — a jaali cage */}
        <path d="M24 30 L56 30 L52 104 L28 104 Z" fill="var(--glt-lantern-glass)" />
        <line x1="34" y1="30" x2="36" y2="104" />
        <line x1="46" y1="30" x2="44" y2="104" />
        <line x1="26" y1="52" x2="54" y2="52" opacity="0.6" />
        <line x1="26" y1="80" x2="54" y2="80" opacity="0.6" />
        {/* base + drop finial */}
        <path d="M26 104 L54 104 L48 116 L32 116 Z" fill={GOLD_LITE} opacity="0.9" />
        <line x1="40" y1="116" x2="40" y2="132" />
        <circle cx="40" cy="136" r="4" fill={GOLD} />
      </g>
      {/* glow + flame */}
      <circle cx="40" cy="66" r="16" fill={GOLD_LITE} opacity="0.28" className="glt-glow" />
      <path
        d="M40 78 C34 72 36 62 40 54 C44 62 46 72 40 78 Z"
        fill={GOLD_LITE}
        className="glt-flame"
      />
      <path d="M40 76 C37 72 38 66 40 60 C42 66 43 72 40 76 Z" fill="#fff6df" className="glt-flame" />
    </svg>
  );
}

/* ── rose petals drifting down over the whole page (deterministic) ──────────
 * Six petals, not ten; 30–46s falls, not 15–22s; and the near/far split (size +
 * blur + opacity) gives depth. Ambience you notice only if you look for it —
 * anything faster or denser turns the page into a screensaver. */
export function PetalFall({ className }: { className?: string }) {
  // Fixed set → no random → SSR-stable. Each petal loops a fall+sway in CSS.
  const petals = [
    { left: 8, delay: 0, dur: 38, size: 13, hue: ROSE, drift: 26, far: false },
    { left: 24, delay: 13, dur: 46, size: 8, hue: ROSE_DEEP, drift: -18, far: true },
    { left: 43, delay: 6, dur: 34, size: 11, hue: ROSE, drift: 22, far: false },
    { left: 62, delay: 22, dur: 44, size: 8, hue: ROSE, drift: -24, far: true },
    { left: 79, delay: 9, dur: 30, size: 12, hue: ROSE_DEEP, drift: 20, far: false },
    { left: 93, delay: 27, dur: 42, size: 9, hue: ROSE, drift: -16, far: true },
  ];
  return (
    <div className={className} aria-hidden>
      {petals.map((p, i) => (
        <span
          key={i}
          className="glt-petal"
          style={
            {
              left: `${p.left}%`,
              animationDelay: `-${p.delay}s`,
              animationDuration: `${p.dur}s`,
              ["--drift" as string]: `${p.drift}px`,
              // Distant petals sit softer and hazier — depth of field.
              ["--petal-opacity" as string]: p.far ? 0.3 : 0.5,
              filter: p.far ? "blur(0.6px)" : undefined,
            } as React.CSSProperties
          }
        >
          <svg viewBox="0 0 20 20" width={p.size} height={p.size} fill="none">
            <path
              d="M10 1 C15 5 18 11 10 19 C2 11 5 5 10 1 Z"
              fill={p.hue}
              opacity="0.75"
            />
            <path d="M10 4 C11 9 11 14 10 18" stroke={GOLD_LITE} strokeWidth="0.5" opacity="0.45" />
          </svg>
        </span>
      ))}
    </div>
  );
}
