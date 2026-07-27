"use client";

import { useId } from "react";
import { m } from "motion/react";

/**
 * THE JODI — ornament for the illustrated wedding plate.
 *
 * The theme's language comes from painted Indian invitation plates: a soft
 * ivory/blush watercolour field, an ornate gold mandala band across the top,
 * and a base scene of chhatri domes, foliage and peacocks with the couple
 * standing at the foot of the page. Licensed painted artwork fills those roles
 * (see art.tsx / ART.md); everything here is the hand-drawn SVG fallback plus
 * the smaller furniture that stays SVG regardless — rules, mandala accents and
 * the ceremony icon set.
 *
 * Fallback art is deliberately drawn as flat, geometric, single-weight forms:
 * architecture, mandalas and foliage are shapes SVG renders beautifully, and
 * the couple fallback is a BACK VIEW, which needs no faces or hands. It is
 * meant to read as tasteful placeholder, never to imitate painting.
 *
 * GOTCHA: a CSS animation that sets `transform` completely overrides an
 * element's SVG `transform` attribute — the element snaps to the origin. Any
 * animated part that also needs placing is wrapped: outer <g> translates,
 * inner <g> carries the animation class. Never both on one element.
 */

const GOLD = "var(--jdi-gold)";
const GOLD_LITE = "var(--jdi-gold-lite)";
const GOLD_DEEP = "var(--jdi-gold-deep)";
const MAGENTA = "var(--jdi-magenta)";
const MAGENTA_2 = "var(--jdi-magenta-2)";
const SAGE = "var(--jdi-sage)";
const SAGE_DEEP = "var(--jdi-sage-deep)";
const HAVELI = "var(--jdi-haveli)";
const HAVELI_2 = "var(--jdi-haveli-2)";
const HAVELI_3 = "var(--jdi-haveli-3)";
const MANDALA_PINK = "var(--jdi-mandala)";
const BLUSH_2 = "var(--jdi-blush-2)";
const LEHENGA = "var(--jdi-lehenga)";
const LEHENGA_2 = "var(--jdi-lehenga-2)";
const SHERWANI = "var(--jdi-sherwani)";
const SHERWANI_2 = "var(--jdi-sherwani-2)";
const DUPATTA = "var(--jdi-dupatta)";
const HAIR = "var(--jdi-hair)";
const SKIN_BACK = "var(--jdi-skin)";
const ELEPHANT = "var(--jdi-elephant)";
const ELEPHANT_2 = "var(--jdi-elephant-2)";
const BLOOM = "var(--jdi-bloom)";
const BLOOM_2 = "var(--jdi-bloom-2)";

/* ══════════════════════════════════════════════════════════════════════════
   ONE CONCENTRIC MANDALA — the motif the top border is built from.
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * The mandala itself, as a <g> centred on (0,0) with an outer radius of ~104.
 * Always drawn in full: a "half" mandala is produced by CLIPPING this to the
 * lower semicircle rather than by drawing half-arcs. Deriving arc sweep flags
 * and per-ring angular offsets by hand is where this kind of ornament silently
 * mis-registers; clipping a complete figure cannot.
 */
function MandalaContent() {
  const petal = (r1: number, r2: number, w: number) =>
    `M0 ${-r1} C${w} ${-r1 - (r2 - r1) * 0.45} ${w} ${-r2 + (r2 - r1) * 0.3} 0 ${-r2} C${-w} ${-r2 + (r2 - r1) * 0.3} ${-w} ${-r1 - (r2 - r1) * 0.45} 0 ${-r1} Z`;
  const petalRings = [
    { n: 24, d: petal(70, 96, 9), sw: 1.1, op: 0.9 },
    { n: 18, d: petal(48, 68, 9), sw: 1.2, op: 0.95 },
    { n: 12, d: petal(26, 46, 8), sw: 1.3, op: 1 },
  ];
  const RINGS = [96, 70, 68, 48, 46, 26, 14];
  const SCALLOPS = 56;
  // Deep-pink linework over a paler pink fill, with gold only as an accent —
  // the reference plate's medallion is pink-on-pink, not gold-on-white.
  return (
    <g>
      <circle r="100" fill={MANDALA_PINK} opacity="0.14" />
      <g stroke={MANDALA_PINK} fill="none">
        {RINGS.map((r, i) => (
          <circle key={r} r={r} strokeWidth={i % 2 ? 0.9 : 1.4} opacity="0.85" />
        ))}
        {petalRings.map((ring, ri) =>
          Array.from({ length: ring.n }).map((_, i) => (
            <path
              key={`${ri}-${i}`}
              d={ring.d}
              strokeWidth={ring.sw}
              opacity={ring.op}
              fill={ri === 1 ? MANDALA_PINK : "none"}
              fillOpacity={ri === 1 ? 0.22 : 0}
              transform={`rotate(${(360 / ring.n) * i})`}
            />
          ))
        )}
        {Array.from({ length: SCALLOPS }).map((_, i) => (
          <circle
            key={`s-${i}`}
            cy="-100"
            r="3.4"
            strokeWidth="1"
            opacity="0.9"
            transform={`rotate(${(360 / SCALLOPS) * i})`}
          />
        ))}
      </g>
      <circle r="14" fill={MANDALA_PINK} opacity="0.3" />
      <circle r="5" fill={GOLD_LITE} />
    </g>
  );
}

/** A fine line mandala. `half` keeps only the lower semicircle (border use). */
export function Mandala({ half = false, className }: { half?: boolean; className?: string }) {
  const clip = useId().replace(/:/g, "");
  if (!half) {
    return (
      <svg viewBox="-106 -106 212 212" fill="none" aria-hidden className={className}>
        <MandalaContent />
      </svg>
    );
  }
  return (
    <svg viewBox="-106 0 212 110" fill="none" aria-hidden className={className}>
      <defs>
        <clipPath id={`m${clip}`}>
          <rect x="-106" y="0" width="212" height="110" />
        </clipPath>
      </defs>
      <g clipPath={`url(#m${clip})`}>
        <MandalaContent />
      </g>
    </svg>
  );
}

/**
 * THE TOP BORDER fallback — three half-mandalas along the head of the plate.
 *
 * Built as ONE svg in user units rather than three percentage-sized elements, so
 * the whole band scales proportionally: sizing each mandala as a % of the
 * viewport shrank them to nothing at phone widths.
 */
export function MandalaBorder({ className }: { className?: string }) {
  const clip = useId().replace(/:/g, "");
  const group = (x: number, s: number, op: number) => (
    <g key={x} transform={`translate(${x} 0) scale(${s})`} opacity={op}>
      <MandalaContent />
    </g>
  );
  // No `slice`: the band scales with the page width and keeps every mandala
  // whole. Slicing cropped them to an arbitrary fraction of their height.
  return (
    <svg viewBox="0 0 800 116" fill="none" aria-hidden className={className}>
      <defs>
        <clipPath id={`b${clip}`}>
          <rect x="0" y="0" width="800" height="116" />
        </clipPath>
        <linearGradient id={`g${clip}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--jdi-blush-2)" stopOpacity="0.5" />
          <stop offset="60%" stopColor="var(--jdi-blush-2)" stopOpacity="0.16" />
          <stop offset="100%" stopColor="var(--jdi-blush-2)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* a soft blush band behind the ornament, as on the reference plates */}
      <rect x="0" y="0" width="800" height="116" fill={`url(#g${clip})`} />
      <g clipPath={`url(#b${clip})`}>
        {group(96, 0.66, 0.7)}
        {group(400, 1.02, 1)}
        {group(704, 0.66, 0.7)}
        {group(248, 0.42, 0.55)}
        {group(552, 0.42, 0.55)}
      </g>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   THE BASE SCENE fallback — chhatri domes, foliage and a peacock.
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * A domed chhatri pavilion. Proportioned from the base up as real ones are —
 * plinth, open colonnade, architrave, drum, dome, finial. Collapsing those into
 * one silhouette (the first pass) just reads as a brown egg.
 */
function Chhatri({ x, w, h, tone }: { x: number; w: number; h: number; tone: string }) {
  const half = w / 2;
  const base = 200;
  const plinth = base - h * 0.05;
  const colTop = base - h * 0.42;
  const archTop = colTop - h * 0.07;
  const drumTop = archTop - h * 0.09;
  const domeTop = drumTop - h * 0.3;
  return (
    <g transform={`translate(${x} 0)`} fill={tone} stroke={GOLD_DEEP} strokeWidth="0.7" strokeLinejoin="round">
      {/* plinth */}
      <rect x={-half * 1.1} y={plinth} width={w * 1.1} height={base - plinth} />
      {/* open colonnade — the gaps are what make it read as a pavilion */}
      {[-0.78, -0.26, 0.26, 0.78].map((f) => (
        <rect key={f} x={half * f - w * 0.05} y={colTop} width={w * 0.1} height={plinth - colTop} />
      ))}
      {/* architrave */}
      <rect x={-half * 1.02} y={archTop} width={w * 1.02} height={colTop - archTop} />
      {/* drum */}
      <rect x={-half * 0.66} y={drumTop} width={w * 0.66} height={archTop - drumTop} />
      {/* dome — a shallow onion, wider than the drum it sits on */}
      <path
        d={`M${-half * 0.74} ${drumTop}
            C${-half * 0.8} ${drumTop - (drumTop - domeTop) * 0.62} ${-half * 0.44} ${domeTop} 0 ${domeTop}
            C${half * 0.44} ${domeTop} ${half * 0.8} ${drumTop - (drumTop - domeTop) * 0.62} ${half * 0.74} ${drumTop} Z`}
      />
      {/* finial */}
      <line x1="0" y1={domeTop} x2="0" y2={domeTop - h * 0.09} stroke={GOLD_DEEP} strokeWidth="1.2" />
      <circle cx="0" cy={domeTop - h * 0.12} r={w * 0.035} fill={GOLD_LITE} />
    </g>
  );
}

/** A fine peacock in profile, tail trailing along the ground. */
function Peacock({ x, s }: { x: number; s: number }) {
  return (
    <g transform={`translate(${x} 200) scale(${s})`}>
      {/* trailing tail */}
      <path
        d="M2 -26 C-18 -22 -40 -12 -58 0 C-38 -4 -16 -8 2 -12 Z"
        fill={SAGE}
        stroke={SAGE_DEEP}
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      {[-14, -28, -42].map((tx, i) => (
        <g key={tx}>
          <ellipse cx={tx} cy={-14 + i * 2} rx="3.4" ry="2.4" fill={SAGE_DEEP} opacity="0.55" />
          <circle cx={tx} cy={-14 + i * 2} r="1.1" fill={GOLD_LITE} />
        </g>
      ))}
      {/* body + neck + head */}
      <path d="M2 -12 C10 -14 14 -22 12 -30 C10 -37 2 -38 0 -32 C-2 -26 0 -18 2 -12 Z" fill={SAGE_DEEP} />
      <path d="M11 -31 C13 -40 14 -48 12 -54" stroke={SAGE_DEEP} strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <circle cx="12" cy="-56" r="3" fill={SAGE_DEEP} />
      <path d="M15 -56 L20 -55 L15 -53 Z" fill={GOLD} />
      {[0, 3, -3].map((d, i) => (
        <line key={i} x1="12" y1="-59" x2={12 + d} y2="-64" stroke={SAGE_DEEP} strokeWidth="0.7" />
      ))}
      <path d="M2 -12 L4 0 L0 0 Z" fill={SAGE_DEEP} opacity="0.8" />
    </g>
  );
}

/** A frond of tropical foliage. */
function Frond({ x, s, flip }: { x: number; s: number; flip?: boolean }) {
  return (
    <g transform={`translate(${x} 200) scale(${flip ? -s : s} ${s})`}>
      <path d="M0 0 C-4 -30 -6 -56 -2 -78" stroke={SAGE_DEEP} strokeWidth="1.6" fill="none" />
      {Array.from({ length: 9 }).map((_, i) => {
        const t = i / 8;
        const y = -8 - t * 66;
        const len = 22 * (1 - t * 0.55);
        return (
          <g key={i}>
            <path
              d={`M${-2 - t * 2} ${y} C${-10 - len * 0.4} ${y - 4} ${-len} ${y - 10} ${-len - 4} ${y - 16}`}
              stroke={SAGE}
              strokeWidth="1.4"
              fill="none"
              opacity="0.9"
            />
            <path
              d={`M${-2 - t * 2} ${y} C${8 + len * 0.4} ${y - 4} ${len} ${y - 10} ${len + 4} ${y - 16}`}
              stroke={SAGE}
              strokeWidth="1.4"
              fill="none"
              opacity="0.75"
            />
          </g>
        );
      })}
    </g>
  );
}

/**
 * A caparisoned elephant with a gold howdah — the motif that flanks the couple
 * on the reference plates. Facing `dir`; the trunk curls toward the centre.
 */
function Elephant({ x, s, dir }: { x: number; s: number; dir: 1 | -1 }) {
  return (
    <g transform={`translate(${x} 200) scale(${dir * s} ${s})`}>
      {/* legs */}
      {[-26, -6, 14, 32].map((lx, i) => (
        <rect key={lx} x={lx} y={-30} width={i % 2 ? 13 : 15} height="30" rx="4" fill={i % 2 ? ELEPHANT_2 : ELEPHANT} />
      ))}
      {/* body */}
      <ellipse cx="6" cy="-48" rx="42" ry="30" fill={ELEPHANT} />
      <path d="M-36 -46 C-30 -30 -14 -22 6 -22 C26 -22 42 -30 48 -46 C40 -30 24 -24 6 -24 C-12 -24 -28 -30 -36 -46 Z" fill={ELEPHANT_2} opacity="0.6" />
      {/* head + ear + trunk + tusk */}
      <ellipse cx="-40" cy="-52" rx="20" ry="22" fill={ELEPHANT} />
      <path d="M-34 -66 C-48 -72 -60 -64 -58 -50 C-56 -38 -44 -36 -36 -42 Z" fill={ELEPHANT_2} />
      <path d="M-30 -70 C-42 -76 -54 -68 -52 -54" stroke={GOLD} strokeWidth="1.2" fill="none" opacity="0.8" />
      <path
        d="M-52 -40 C-58 -26 -54 -12 -44 -8 C-38 -6 -34 -12 -38 -16 C-44 -20 -46 -30 -44 -40 Z"
        fill={ELEPHANT}
      />
      <path d="M-46 -34 C-52 -24 -50 -16 -44 -12" stroke={ELEPHANT_2} strokeWidth="1.2" fill="none" opacity="0.7" />
      <path d="M-34 -34 C-30 -26 -24 -22 -18 -22" stroke="#F4EFE6" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* the howdah, in gold */}
      <rect x={-16} y={-96} width="46" height="24" rx="3" fill={GOLD_LITE} stroke={GOLD_DEEP} strokeWidth="1.1" />
      <path d="M-16 -96 L7 -112 L30 -96 Z" fill={GOLD} stroke={GOLD_DEEP} strokeWidth="1.1" strokeLinejoin="round" />
      <line x1="7" y1="-112" x2="7" y2="-120" stroke={GOLD_DEEP} strokeWidth="1.2" />
      <circle cx="7" cy="-122" r="2.4" fill={GOLD_LITE} />
      {[-8, 4, 16, 26].map((bx) => (
        <line key={bx} x1={bx} y1="-94" x2={bx} y2="-74" stroke={GOLD_DEEP} strokeWidth="0.8" opacity="0.7" />
      ))}
      {/* the jhool (embroidered drape) over its flank */}
      <path
        d="M-22 -70 C-16 -44 -6 -30 6 -30 C18 -30 30 -44 36 -70 Z"
        fill={BLOOM}
        stroke={GOLD_DEEP}
        strokeWidth="1"
        opacity="0.9"
      />
      {[
        [-6, -54],
        [8, -46],
        [22, -54],
      ].map(([bx, by]) => (
        <circle key={`${bx}-${by}`} cx={bx} cy={by} r="3" fill={GOLD_LITE} opacity="0.9" />
      ))}
    </g>
  );
}

/** A blowsy bloom for the floral band along the very foot of the plate. */
function Bloom({ x, y, r, tone }: { x: number; y: number; r: number; tone: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {Array.from({ length: 12 }).map((_, i) => (
        <ellipse key={i} cy={-r * 0.55} rx={r * 0.3} ry={r * 0.58} fill={tone} opacity="0.9" transform={`rotate(${i * 30})`} />
      ))}
      {Array.from({ length: 8 }).map((_, i) => (
        <ellipse key={`i-${i}`} cy={-r * 0.3} rx={r * 0.2} ry={r * 0.34} fill={tone} opacity="0.75" transform={`rotate(${i * 45 + 22})`} />
      ))}
      <circle r={r * 0.22} fill={GOLD_LITE} />
    </g>
  );
}

/** A leafy sprig for the floral band. */
function Leaf({ x, y, a, s, tone }: { x: number; y: number; a: number; s: number; tone: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${a}) scale(${s})`}>
      <path d="M0 0 C-9 -8 -9 -24 0 -34 C9 -24 9 -8 0 0 Z" fill={tone} />
      <path d="M0 -2 V-30" stroke={SAGE_DEEP} strokeWidth="0.8" opacity="0.55" />
    </g>
  );
}

/** A pointed Rajasthani arch, used along the haveli's arcade. */
function Arch({ x, y, w, h, tone }: { x: number; y: number; w: number; h: number; tone: string }) {
  const hw = w / 2;
  return (
    <path
      d={`M${x - hw} ${y} V${y - h * 0.55}
          C${x - hw} ${y - h * 0.86} ${x - hw * 0.4} ${y - h} ${x} ${y - h}
          C${x + hw * 0.4} ${y - h} ${x + hw} ${y - h * 0.86} ${x + hw} ${y - h * 0.55}
          V${y} Z`}
      fill={tone}
    />
  );
}

/**
 * THE HAVELI fallback — a Rajasthani palace mass anchored to the bottom-RIGHT,
 * as on the reference plate: a chhatri-crowned block with an arcaded front,
 * stepping down as it recedes left so it sits behind the couple's train.
 */
export function Haveli({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 460 300" fill="none" aria-hidden preserveAspectRatio="xMaxYEnd meet" className={className}>
      {/* the recessed wing, furthest left and palest */}
      <g opacity="0.55">
        <rect x="16" y="212" width="118" height="88" fill={HAVELI} />
        {[46, 76, 106].map((ax) => (
          <Arch key={ax} x={ax} y={300} w={20} h={46} tone={HAVELI_3} />
        ))}
        <rect x="10" y="204" width="130" height="10" fill={HAVELI_2} />
        <g transform="translate(-286 100) scale(1)">
          <Chhatri x={360} w={54} h={68} tone={HAVELI} />
        </g>
      </g>

      {/* the main block */}
      <rect x="126" y="166" width="228" height="134" fill={HAVELI} />
      <rect x="118" y="158" width="244" height="10" fill={HAVELI_2} />
      {/* arcaded ground floor */}
      {[160, 202, 244, 286, 328].map((ax) => (
        <Arch key={ax} x={ax} y={300} w={28} h={62} tone={HAVELI_3} />
      ))}
      {/* jharokha windows above */}
      {[168, 212, 256, 300, 340].map((ax) => (
        <g key={`w-${ax}`}>
          <Arch x={ax} y={214} w={18} h={34} tone={HAVELI_3} />
          <rect x={ax - 12} y={214} width="24" height="4" fill={HAVELI_2} />
        </g>
      ))}
      {/* cornice + parapet */}
      <rect x="122" y="150" width="236" height="8" fill={HAVELI_2} />
      {Array.from({ length: 20 }).map((_, i) => (
        <rect key={i} x={126 + i * 12} y="142" width="7" height="8" fill={HAVELI_2} />
      ))}
      {/* crowning chhatris */}
      <g transform="translate(-206 -50)">
        <Chhatri x={360} w={64} h={82} tone={HAVELI} />
      </g>
      <g transform="translate(-46 -50)">
        <Chhatri x={360} w={64} h={82} tone={HAVELI} />
      </g>
      <g transform="translate(-126 -82)">
        <Chhatri x={360} w={80} h={104} tone={HAVELI} />
      </g>

      {/* the tall corner tower on the right */}
      <rect x="366" y="128" width="82" height="172" fill={HAVELI_2} />
      <rect x="360" y="120" width="94" height="10" fill={HAVELI_3} />
      {[392, 424].map((ax) => (
        <Arch key={`t-${ax}`} x={ax} y={300} w={24} h={56} tone={HAVELI_3} />
      ))}
      {[392, 424].map((ax) => (
        <Arch key={`tw-${ax}`} x={ax} y={200} w={18} h={34} tone={HAVELI_3} />
      ))}
      <g transform="translate(47 -88)">
        <Chhatri x={360} w={70} h={90} tone={HAVELI} />
      </g>

      {/* a little foliage at the foot of the walls */}
      <Frond x={126} s={0.5} />
      <Frond x={358} s={0.44} flip />
      {[
        [140, 300, 11, BLOOM],
        [352, 300, 9, BLOOM_2],
      ].map(([bx, by, br, tone]) => (
        <Bloom key={`hb-${bx}`} x={bx as number} y={by as number} r={br as number} tone={tone as string} />
      ))}
    </svg>
  );
}

/**
 * THE SIDE BAND fallback — the vertical ornamental strip down the left edge of
 * the plate. A repeating gold-on-cream motif, tiled by the pattern's own height
 * so it fills any viewport length.
 */
export function SideBand({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 40 200" fill="none" aria-hidden preserveAspectRatio="none" className={className}>
      <defs>
        <pattern id={`p${id}`} width="40" height="50" patternUnits="userSpaceOnUse">
          <rect width="40" height="50" fill="var(--jdi-sherwani)" />
          <path d="M20 6 L30 25 L20 44 L10 25 Z" fill="none" stroke={GOLD} strokeWidth="1.1" />
          <path d="M20 13 L25 25 L20 37 L15 25 Z" fill={GOLD_LITE} opacity="0.55" />
          <circle cx="20" cy="25" r="2" fill={GOLD_DEEP} opacity="0.7" />
          <line x1="3" y1="0" x2="3" y2="50" stroke={GOLD} strokeWidth="0.8" opacity="0.6" />
          <line x1="37" y1="0" x2="37" y2="50" stroke={GOLD} strokeWidth="0.8" opacity="0.6" />
        </pattern>
      </defs>
      <rect width="40" height="200" fill={`url(#p${id})`} />
    </svg>
  );
}

/**
 * A small ground band of elephants and blooms — kept for the footer, where the
 * plate closes with ornament rather than architecture.
 */
export function BaseScene({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 800 200" fill="none" aria-hidden preserveAspectRatio="xMidYEnd slice" className={className}>
      <g opacity="0.45">
        <Chhatri x={150} w={86} h={98} tone={HAVELI} />
        <Chhatri x={652} w={80} h={92} tone={HAVELI} />
      </g>
      <Frond x={214} s={0.7} flip />
      <Frond x={590} s={0.68} />
      <Elephant x={196} s={0.92} dir={1} />
      <Elephant x={608} s={0.92} dir={-1} />
      <Peacock x={44} s={0.7} />
      <Peacock x={764} s={0.66} />
      <g>
        <rect x="0" y="186" width="800" height="14" fill={SAGE_DEEP} opacity="0.18" />
        {[
          [12, 196, 20],
          [86, 200, 16],
          [300, 200, 14],
          [500, 200, 15],
          [706, 198, 18],
          [782, 200, 16],
        ].map(([lx, ly, ls], i) => (
          <g key={`lf-${lx}`}>
            <Leaf x={lx as number} y={ly as number} a={-26 + i * 5} s={(ls as number) / 20} tone={SAGE} />
            <Leaf x={(lx as number) + 16} y={ly as number} a={22 - i * 4} s={(ls as number) / 24} tone={SAGE_DEEP} />
          </g>
        ))}
        {[
          [26, 190, 15, BLOOM],
          [64, 194, 11, BLOOM_2],
          [118, 192, 9, BLOOM],
          [332, 194, 10, BLOOM_2],
          [470, 193, 9, BLOOM],
          [686, 191, 13, BLOOM_2],
          [736, 194, 10, BLOOM],
          [778, 190, 12, BLOOM_2],
        ].map(([bx, by, br, tone]) => (
          <Bloom key={`bl-${bx}`} x={bx as number} y={by as number} r={br as number} tone={tone as string} />
        ))}
      </g>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   THE COUPLE fallback — a back view. No faces, no hands: the reference plate
   we are matching (and the most elegant of the three) shows exactly this.
   ══════════════════════════════════════════════════════════════════════════ */

export function CoupleFromBehind({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 400" fill="none" aria-hidden className={className}>
      {/* soft shadow on the ground */}
      <ellipse cx="140" cy="384" rx="94" ry="8" fill={MAGENTA_2} opacity="0.13" />

      {/* ── GROOM (left) — cream sherwani, rose safa, seen from behind ── */}
      <g>
        {/* churidar + mojari below the coat */}
        <path d="M84 320 L84 366 L98 366 L100 320 Z" fill={SHERWANI_2} stroke={GOLD_DEEP} strokeWidth="0.8" />
        <path d="M108 320 L110 366 L124 366 L124 320 Z" fill={SHERWANI_2} stroke={GOLD_DEEP} strokeWidth="0.8" />
        <path d="M80 366 C78 374 82 378 90 378 L100 378 L100 366 Z" fill={MAGENTA_2} />
        <path d="M108 366 L108 378 L118 378 C126 378 130 374 128 366 Z" fill={MAGENTA_2} />

        {/* the sherwani: real shoulder width, gently A-line to the knee */}
        <path
          d="M62 326 C63 268 68 202 74 164 C78 146 86 138 96 138 C106 138 114 146 118 164
             C124 202 129 268 130 326 C110 332 82 332 62 326 Z"
          fill={SHERWANI}
          stroke={GOLD_DEEP}
          strokeWidth="1.1"
          strokeLinejoin="round"
        />
        <path d="M62 322 C82 328 110 328 130 322" stroke={GOLD} strokeWidth="2.2" fill="none" opacity="0.85" />
        <path d="M96 150 V324" stroke={SHERWANI_2} strokeWidth="1.1" opacity="0.9" />
        {/* the stole down his back */}
        <path d="M112 148 C120 190 122 244 120 292 L108 290 C110 242 108 190 102 152 Z" fill={DUPATTA} opacity="0.5" />

        {/* shoulders → neck → the back of his head */}
        <path d="M86 140 C86 128 106 128 106 140 Z" fill={SHERWANI_2} />
        <path d="M89 132 L103 132 L103 120 L89 120 Z" fill={SKIN_BACK} />
        <ellipse cx="96" cy="104" rx="21" ry="22" fill={HAIR} />
        {/* the safa, wrapped, with its tail over one shoulder */}
        <path
          d="M74 100 C72 74 82 60 96 60 C110 60 120 74 118 100 C110 84 104 78 96 78 C88 78 82 84 74 100 Z"
          fill={LEHENGA}
          stroke={GOLD_DEEP}
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <path d="M77 92 C82 74 88 68 96 68" stroke={LEHENGA_2} strokeWidth="1.1" fill="none" opacity="0.7" />
        <path d="M86 84 C92 70 100 68 108 74" stroke={LEHENGA_2} strokeWidth="1.1" fill="none" opacity="0.55" />
        <path
          d="M116 92 C128 96 136 92 142 100 C134 108 122 108 114 100 Z"
          fill={LEHENGA}
          stroke={GOLD_DEEP}
          strokeWidth="0.9"
          strokeLinejoin="round"
        />
        <circle cx="112" cy="72" r="3" fill={GOLD_LITE} stroke={GOLD_DEEP} strokeWidth="0.7" />
      </g>

      {/* ── BRIDE (right) — magenta lehenga, long trailing dupatta ── */}
      <g>
        {/* the lehenga: a full bell to the floor */}
        <path
          d="M118 372 C122 300 130 218 142 158 C148 146 158 142 168 142 C178 142 188 146 194 158
             C206 218 214 300 218 372 C186 380 150 380 118 372 Z"
          fill={LEHENGA}
          stroke={GOLD_DEEP}
          strokeWidth="1.1"
          strokeLinejoin="round"
        />
        <g stroke={LEHENGA_2} strokeWidth="1" fill="none" opacity="0.45">
          <path d="M146 164 C138 224 130 300 126 368" />
          <path d="M168 158 V376" />
          <path d="M190 164 C198 224 206 300 210 368" />
        </g>
        {[
          [146, 226],
          [190, 232],
          [134, 282],
          [168, 292],
          [202, 284],
          [128, 336],
          [168, 346],
          [208, 338],
        ].map(([cx, cy]) => (
          <path
            key={`${cx}-${cy}`}
            d={`M${cx} ${cy - 4.4} C${cx + 2.4} ${cy - 1.6} ${cx + 2.4} ${cy + 1.6} ${cx} ${cy + 4.4} C${cx - 2.4} ${cy + 1.6} ${cx - 2.4} ${cy - 1.6} ${cx} ${cy - 4.4} Z`}
            fill={GOLD_LITE}
            opacity="0.85"
          />
        ))}
        <path d="M118 366 C150 374 186 374 218 366" stroke={GOLD} strokeWidth="4" fill="none" />
        <path d="M119 357 C150 365 186 365 217 357" stroke={GOLD_DEEP} strokeWidth="0.8" fill="none" opacity="0.55" />

        {/* the dupatta falling from her crown down over the lehenga */}
        <g className="jdi-drift">
          <path
            d="M156 96 C140 140 134 240 138 322 C148 268 154 196 162 150
               C172 196 180 268 190 322 C194 240 188 140 172 96 Z"
            fill={DUPATTA}
            stroke={GOLD_DEEP}
            strokeWidth="0.9"
            strokeLinejoin="round"
            opacity="0.72"
          />
          <path d="M160 108 C150 150 146 240 148 306" stroke={GOLD_LITE} strokeWidth="0.9" fill="none" opacity="0.65" />
        </g>

        {/* shoulders → neck → the back of her head, with a low bun */}
        <path d="M154 144 C154 132 182 132 182 144 Z" fill={LEHENGA_2} />
        <path d="M161 136 L175 136 L175 124 L161 124 Z" fill={SKIN_BACK} />
        <ellipse cx="168" cy="106" rx="20" ry="21" fill={HAIR} />
        <ellipse cx="168" cy="130" rx="13" ry="10" fill={HAIR} />
        <path d="M157 128 Q168 136 179 128" stroke={GOLD_LITE} strokeWidth="1.2" fill="none" opacity="0.8" />
        {/* the veil sitting over her crown */}
        <path
          d="M146 108 C144 78 154 62 168 62 C182 62 192 78 190 108 C182 88 176 80 168 80 C160 80 154 88 146 108 Z"
          fill={DUPATTA}
          stroke={GOLD_DEEP}
          strokeWidth="0.9"
          strokeLinejoin="round"
          opacity="0.9"
        />
        <path d="M150 100 C156 80 162 72 168 72" stroke={GOLD_LITE} strokeWidth="1" fill="none" opacity="0.7" />
      </g>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   FURNITURE — stays SVG regardless of the licensed artwork.
   ══════════════════════════════════════════════════════════════════════════ */

/** A gold hairline with a small blossom at its centre. */
export function GoldRule({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 18" fill="none" aria-hidden className={className}>
      <line x1="4" y1="9" x2="110" y2="9" stroke={GOLD} strokeWidth="0.9" opacity="0.7" />
      <line x1="150" y1="9" x2="256" y2="9" stroke={GOLD} strokeWidth="0.9" opacity="0.7" />
      <g transform="translate(130 9)">
        {Array.from({ length: 8 }).map((_, i) => (
          <ellipse key={i} cy="-4" rx="1.7" ry="3.4" fill={GOLD} opacity="0.55" transform={`rotate(${i * 45})`} />
        ))}
        <circle r="1.8" fill={GOLD_LITE} />
      </g>
      <circle cx="116" cy="9" r="1.2" fill={GOLD} opacity="0.75" />
      <circle cx="144" cy="9" r="1.2" fill={GOLD} opacity="0.75" />
    </svg>
  );
}

/** A blossom sprig for section heads. */
export function Sprig({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 34" fill="none" aria-hidden className={className}>
      <g stroke={SAGE_DEEP} strokeWidth="1" fill="none" opacity="0.85">
        <path d="M60 26 C44 26 34 18 20 20" />
        <path d="M60 26 C76 26 86 18 100 20" />
        <path d="M40 24 C36 18 32 15 26 14" opacity="0.7" />
        <path d="M80 24 C84 18 88 15 94 14" opacity="0.7" />
      </g>
      {[
        [20, 20],
        [100, 20],
        [26, 14],
        [94, 14],
      ].map(([cx, cy], i) => (
        <g key={`${cx}-${cy}`} transform={`translate(${cx} ${cy}) scale(${i > 1 ? 0.7 : 1})`}>
          {Array.from({ length: 5 }).map((_, k) => (
            <ellipse key={k} cy="-3" rx="1.7" ry="3" fill={BLUSH_2} stroke={MAGENTA} strokeWidth="0.4" transform={`rotate(${k * 72})`} />
          ))}
          <circle r="1.2" fill={GOLD_LITE} />
        </g>
      ))}
      <g transform="translate(60 24)">
        {Array.from({ length: 8 }).map((_, i) => (
          <ellipse key={i} cy="-5" rx="2" ry="4.4" fill={MAGENTA} opacity="0.45" transform={`rotate(${i * 45})`} />
        ))}
        <circle r="2.2" fill={GOLD_LITE} />
      </g>
    </svg>
  );
}

/** A slow-turning mandala watermark for section backgrounds. */
export function MandalaWatermark({ className }: { className?: string }) {
  return <Mandala className={className} />;
}

/** A cusped medallion frame that draws itself in — used around the plate. */
export function PlateFrame({ className }: { className?: string }) {
  const d =
    "M18 470 V150 C18 92 62 44 128 26 C150 20 190 20 212 26 C278 44 322 92 322 150 V470";
  return (
    <svg viewBox="0 0 340 480" fill="none" preserveAspectRatio="none" aria-hidden className={className}>
      <m.path
        d={d}
        stroke={GOLD}
        strokeWidth="1.4"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.7 }}
        transition={{ duration: 2.2, ease: "easeInOut" }}
      />
      <m.path
        d={d}
        stroke={GOLD_DEEP}
        strokeWidth="0.7"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.4 }}
        transition={{ duration: 2.2, ease: "easeInOut", delay: 0.2 }}
        style={{ transform: "translate(8px, 8px)" }}
      />
    </svg>
  );
}

/* ── ceremony icons — single-weight gold line ──────────────────────────────── */
function IconHaldi() {
  return (
    <g stroke={GOLD_DEEP} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 26 C12 34 17 39 24 39 C31 39 36 34 36 26 Z" />
      <path d="M10 26 H38" />
      <path d="M24 20 C20 15 21 10 24 7 C27 10 28 15 24 20 Z" />
      <path d="M18 22 C15 19 15 15 17 13" opacity="0.6" />
      <path d="M30 22 C33 19 33 15 31 13" opacity="0.6" />
    </g>
  );
}
function IconMehendi() {
  return (
    <g stroke={GOLD_DEEP} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 40 L16 24 C16 17 20 12 26 12 L30 12 L30 22 L24 22 L24 40 Z" />
      <path d="M20 34 C24 30 20 25 23 21" opacity="0.85" />
      <circle cx="27" cy="17" r="1.6" fill={GOLD_LITE} stroke="none" />
      <path d="M31 30 C35 27 35 22 32 19" opacity="0.55" />
    </g>
  );
}
function IconSangeet() {
  return (
    <g stroke={GOLD_DEEP} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="17" cy="30" rx="8" ry="9" />
      <path d="M9 30 H25" />
      <ellipse cx="32" cy="33" rx="6" ry="6.5" />
      <path d="M26 33 H38" />
      <path d="M28 16 L28 6 L36 8" />
      <circle cx="26" cy="17" r="1.6" fill={GOLD_LITE} stroke="none" />
    </g>
  );
}
function IconWedding() {
  return (
    <g stroke={GOLD_DEEP} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M24 8 C20 16 27 19 24 27 C30 23 30 14 24 8 Z" />
      <path d="M13 30 H35 L31 41 H17 Z" />
      <path d="M11 30 H37" />
      <path d="M19 34 L19 37" opacity="0.6" />
      <path d="M29 34 L29 37" opacity="0.6" />
    </g>
  );
}
function IconReception() {
  return (
    <g stroke={GOLD_DEEP} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 10 H23 L20 24 C20 27 16 27 16 24 Z" />
      <path d="M18 27 V39 M14 39 H22" />
      <path d="M25 10 H35 L32 24 C32 27 28 27 28 24 Z" />
      <path d="M30 27 V39 M26 39 H34" />
      <circle cx="24" cy="7" r="1.5" fill={GOLD_LITE} stroke="none" />
    </g>
  );
}

const ICONS: Array<{ test: RegExp; Icon: () => React.ReactElement }> = [
  { test: /haldi|pithi/i, Icon: IconHaldi },
  { test: /mehendi|mehndi|henna/i, Icon: IconMehendi },
  { test: /sangeet|sangam|music|dance|cocktail/i, Icon: IconSangeet },
  { test: /reception|swagat|valima|after/i, Icon: IconReception },
  { test: /wedding|vivah|pheras?|shaadi|nikah|mandap|ceremony|muhurat/i, Icon: IconWedding },
];

/** Picks the closest ceremony icon for an event name (defaults to the fire). */
export function CeremonyIcon({ name, className }: { name: string; className?: string }) {
  const match = ICONS.find((x) => x.test.test(name));
  const Icon = match?.Icon ?? IconWedding;
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden className={className}>
      <Icon />
    </svg>
  );
}
