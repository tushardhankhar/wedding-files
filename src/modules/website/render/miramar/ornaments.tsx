"use client";

import { useId } from "react";

/**
 * THE MIRAMAR — ornament system for the Catholic seafarer wedding site.
 *
 * Every decoration is hand-drawn SVG driven by the theme's --mrm-* tokens — no
 * external images — so it stays crisp at any size, recolours with the palette
 * and animates (draw-in, sway, drift, beam). Continuous motion lives in CSS
 * (.mrm-* classes) and collapses under prefers-reduced-motion; one-shot
 * entrances use Framer's `m`.
 *
 * Motif vocabulary: a radiant cross, entwined rings, a chapel on the headland,
 * the shoreline itself (surf, gulls, a lateen sail), the shore's treasures —
 * scallop, conch, starfish, pearls — and the blush roses & sea-blue blooms that
 * garland them. Brass supplies the metal: a ship's anchor, a compass rose,
 * porthole rings around the photographs, and a lighthouse that still sweeps.
 *
 * Palette discipline: sea blue and blush rose are the two colours, antique gold
 * is the metal, shell ivory is the paper. Nothing else is introduced.
 */

const GOLD = "var(--mrm-gold)";
const GOLD_LITE = "var(--mrm-gold-lite)";
const GOLD_DEEP = "var(--mrm-gold-deep)";
const SEA = "var(--mrm-sea)";
const SEA_LITE = "var(--mrm-sea-lite)";
const SEA_PALE = "var(--mrm-sea-pale)";
const ROSE = "var(--mrm-rose)";
const ROSE_LITE = "var(--mrm-rose-lite)";
const ROSE_DEEP = "var(--mrm-rose-deep)";
const LEAF = "var(--mrm-leaf)";
const PEARL = "var(--mrm-pearl)";
const SHELL = "var(--mrm-shell)";

/* ══════════════════════════════════════════════════════════════════════════
   THE CROSS — a slender Latin cross on a sunburst, crowning the invitation.
   ══════════════════════════════════════════════════════════════════════════ */
export function RadiantCross({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 168" fill="none" aria-hidden className={className}>
      {/* the radiance: 28 rays of alternating length behind the crossing */}
      <g className="mrm-rays" stroke={GOLD} strokeLinecap="round">
        {Array.from({ length: 28 }).map((_, i) => {
          const a = (i * 360) / 28;
          const long = i % 2 === 0;
          const r0 = 20;
          const r1 = long ? 46 : 33;
          const rad = (a * Math.PI) / 180;
          const cx = 70;
          const cy = 62;
          return (
            <line
              key={i}
              x1={(cx + Math.cos(rad) * r0).toFixed(1)}
              y1={(cy + Math.sin(rad) * r0).toFixed(1)}
              x2={(cx + Math.cos(rad) * r1).toFixed(1)}
              y2={(cy + Math.sin(rad) * r1).toFixed(1)}
              strokeWidth={long ? 1.1 : 0.7}
              opacity={long ? 0.55 : 0.32}
            />
          );
        })}
      </g>

      {/* the cross — tapered arms with budded tips (a cross bottonée) */}
      <g>
        <path
          d="M66.4 22 C66.4 22 67 30 67 38 L58 38.6 C52 38.8 50 41 50 44 C50 47 52 49.2 58 49.4 L67 50 L67 108 C67 122 66.4 130 66.4 130 L73.6 130 C73.6 130 73 122 73 108 L73 50 L82 49.4 C88 49.2 90 47 90 44 C90 41 88 38.8 82 38.6 L73 38 C73 30 73.6 22 73.6 22 Z"
          fill={GOLD}
          stroke={GOLD_DEEP}
          strokeWidth="0.8"
        />
        {/* budded terminals */}
        {[
          [70, 20],
          [70, 132],
          [48, 44],
          [92, 44],
        ].map(([cx, cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="3.4" fill={GOLD_LITE} stroke={GOLD_DEEP} strokeWidth="0.7" />
            <circle cx={cx - 0.8} cy={cy - 0.8} r="1.1" fill={PEARL} opacity="0.8" />
          </g>
        ))}
        {/* the crossing jewel */}
        <circle cx="70" cy="44" r="6.4" fill={GOLD_LITE} stroke={GOLD_DEEP} strokeWidth="0.8" />
        <circle cx="70" cy="44" r="2.6" fill={SEA} opacity="0.85" />
        {/* a hairline highlight down the shaft */}
        <line x1="68.6" y1="52" x2="68.6" y2="126" stroke={PEARL} strokeWidth="0.8" opacity="0.5" />
      </g>

      {/* two small waves at the foot — the cross stands on the water */}
      <g stroke={SEA} strokeWidth="1.2" opacity="0.5" fill="none">
        <path d="M48 142 q7 -6 14 0 q7 6 14 0 q7 -6 14 0" />
        <path d="M54 151 q6.5 -5 13 0 q6.5 5 13 0" opacity="0.6" />
      </g>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   THE RINGS — two entwined bands, one pavé-set (from the invitation's centre).
   ══════════════════════════════════════════════════════════════════════════ */
export function Rings({ className }: { className?: string }) {
  // Minted per instance: two Rings on one page must not share a clip path.
  const clip = `mrm-ring-${useId().replace(/:/g, "")}`;
  return (
    <svg viewBox="0 0 200 110" fill="none" aria-hidden className={className}>
      {/* the shadow they cast on the paper */}
      <ellipse cx="100" cy="98" rx="62" ry="6" fill={SEA} opacity="0.1" />

      {/* left band — plain, thicker, tipped forward */}
      <g transform="rotate(-14 78 56)">
        <ellipse cx="78" cy="56" rx="34" ry="36" stroke={GOLD_DEEP} strokeWidth="11" />
        <ellipse cx="78" cy="56" rx="34" ry="36" stroke={GOLD} strokeWidth="8" />
        <path d="M46 44 C50 26 64 20 78 20" stroke={GOLD_LITE} strokeWidth="3" opacity="0.85" fill="none" />
      </g>

      {/* right band — pavé, passing through the left */}
      <g transform="rotate(12 124 52)">
        <ellipse cx="124" cy="52" rx="31" ry="33" stroke={GOLD_DEEP} strokeWidth="9" />
        <ellipse cx="124" cy="52" rx="31" ry="33" stroke={GOLD} strokeWidth="6.4" />
        {Array.from({ length: 16 }).map((_, i) => {
          const a = (i * 360) / 16;
          const rad = (a * Math.PI) / 180;
          return (
            <circle
              key={i}
              cx={(124 + Math.cos(rad) * 31).toFixed(1)}
              cy={(52 + Math.sin(rad) * 33).toFixed(1)}
              r="1.5"
              fill={PEARL}
              opacity="0.9"
            />
          );
        })}
      </g>

      {/* the left band drawn again over the crossing, so the two truly interlock */}
      <g transform="rotate(-14 78 56)" clipPath={`url(#${clip})`}>
        <ellipse cx="78" cy="56" rx="34" ry="36" stroke={GOLD_DEEP} strokeWidth="11" />
        <ellipse cx="78" cy="56" rx="34" ry="36" stroke={GOLD} strokeWidth="8" />
      </g>
      <clipPath id={clip}>
        <rect x="0" y="0" width="200" height="52" />
      </clipPath>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   THE SHORE'S TREASURES — scallop, conch, starfish, pearls.
   Each is drawn from its own origin so the corner clusters can compose them.
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * A fan scallop, hinge at the bottom. Engraved like the flowers: the gold
 * contour and ribs are the drawing. It also carries its own form shading — shell
 * ivory on shell-ivory paper has almost no contrast, and the first pass left the
 * corner shells reading as faint outlines.
 */
function scallop(fill: string, opacity = 1) {
  const outline =
    "M50 92 C22 88 4 66 4 42 C4 20 24 4 50 4 C76 4 96 20 96 42 C96 66 78 88 50 92 Z";
  return (
    <g opacity={opacity}>
      <path d={outline} fill={fill} stroke={GOLD_DEEP} strokeWidth="1.3" />
      {/* the form: the shell turns away from the light at its lower edges */}
      <path
        d="M50 92 C22 88 4 66 4 42 C4 34 7 27 12 21 C10 30 12 48 20 62 C28 76 38 86 50 92 Z"
        fill={GOLD_DEEP}
        fillOpacity="0.1"
      />
      <path
        d="M50 92 C78 88 96 66 96 42 C96 34 93 27 88 21 C90 30 88 48 80 62 C72 76 62 86 50 92 Z"
        fill={GOLD_DEEP}
        fillOpacity="0.06"
      />
      {/* ribs radiating from the hinge */}
      {Array.from({ length: 9 }).map((_, i) => {
        const t = (i - 4) / 4;
        return (
          <path
            key={i}
            d={`M50 90 C${(50 + t * 26).toFixed(1)} 60 ${(50 + t * 44).toFixed(1)} 30 ${(50 + t * 47).toFixed(1)} ${(6 + Math.abs(t) * 12).toFixed(1)}`}
            stroke={GOLD_DEEP}
            strokeWidth="0.9"
            opacity="0.6"
            fill="none"
          />
        );
      })}
      {/* the growth line near the rim, and the hinge ears */}
      <path d="M12 26 C24 34 76 34 88 26" stroke={GOLD_DEEP} strokeWidth="0.7" opacity="0.35" fill="none" />
      <path d="M50 92 C40 92 34 86 32 80 M50 92 C60 92 66 86 68 80" stroke={GOLD_DEEP} strokeWidth="1.1" opacity="0.7" fill="none" />
    </g>
  );
}

export function ScallopShell({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 96" fill="none" aria-hidden className={className}>
      {scallop(SHELL)}
    </svg>
  );
}

/** A spiral conch (turret), apex up. */
function conch(fill: string) {
  return (
    <g>
      <path
        d="M40 4 C52 14 58 30 58 48 C58 72 48 90 30 96 C14 100 4 92 4 80 C4 66 16 58 28 58 C36 58 40 62 40 68 C40 74 34 78 28 76"
        fill={fill}
        stroke={GOLD_DEEP}
        strokeWidth="1.3"
      />
      {/* the shaded side, then the whorl lines */}
      <path
        d="M40 4 C52 14 58 30 58 48 C58 66 52 82 42 92 C48 78 50 62 50 48 C50 30 46 15 40 4 Z"
        fill={GOLD_DEEP}
        fillOpacity="0.1"
      />
      <path d="M40 12 C48 24 52 38 52 50" stroke={GOLD_DEEP} strokeWidth="0.8" opacity="0.6" fill="none" />
      <path d="M34 22 C42 32 46 42 46 52" stroke={GOLD_DEEP} strokeWidth="0.7" opacity="0.45" fill="none" />
      <path d="M12 84 C18 74 28 68 38 68" stroke={GOLD_DEEP} strokeWidth="0.8" opacity="0.55" fill="none" />
      {/* the ribs across the whorls */}
      {[22, 34, 46].map((y) => (
        <path key={y} d={`M${(40 - y * 0.28).toFixed(1)} ${y} C${(48 - y * 0.1).toFixed(1)} ${y + 3} ${(54 - y * 0.06).toFixed(1)} ${y + 5} ${(56 - y * 0.04).toFixed(1)} ${y + 8}`} stroke={GOLD_DEEP} strokeWidth="0.5" opacity="0.3" fill="none" />
      ))}
      {/* the aperture's blush lip */}
      <path d="M30 96 C14 100 4 92 4 80 C4 74 8 69 14 66 C10 74 12 86 22 90 Z" fill={ROSE_LITE} opacity="0.8" />
    </g>
  );
}

export function Conch({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 62 102" fill="none" aria-hidden className={className}>
      {conch(SHELL)}
    </svg>
  );
}

/** A five-armed starfish, centred on 0,0 in a 0 0 80 80 box. */
function starfish(fill: string) {
  return (
    <g>
      {[0, 72, 144, 216, 288].map((a) => (
        <g key={a} transform={`rotate(${a} 40 40)`}>
          <path
            d="M40 40 C33.5 29 33.5 15 40 3 C46.5 15 46.5 29 40 40 Z"
            fill={fill}
            fillOpacity="0.85"
            stroke={GOLD_DEEP}
            strokeWidth="0.9"
            strokeLinejoin="round"
          />
          {/* the ridge down the arm, and the stipple either side of it */}
          <path d="M40 36 L40 8" stroke={GOLD_DEEP} strokeWidth="0.5" opacity="0.5" />
          {[14, 20, 26, 32].map((y) => (
            <g key={y}>
              <circle cx={40 - (36 - y) * 0.16 - 1.6} cy={y} r="0.6" fill={GOLD_DEEP} opacity="0.34" />
              <circle cx={40 + (36 - y) * 0.16 + 1.6} cy={y} r="0.6" fill={GOLD_DEEP} opacity="0.34" />
            </g>
          ))}
        </g>
      ))}
      <circle cx="40" cy="40" r="6.4" fill={fill} stroke={GOLD_DEEP} strokeWidth="0.85" />
      <circle cx="40" cy="40" r="2.2" fill={GOLD_DEEP} opacity="0.3" />
    </g>
  );
}

export function Starfish({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" aria-hidden className={className}>
      {starfish("var(--mrm-shell-2)")}
    </svg>
  );
}

/** A short strand of pearls along a gentle curve. */
function pearls(count: number, x: number, y: number, w: number, dip: number) {
  return (
    <g>
      {Array.from({ length: count }).map((_, i) => {
        const t = i / (count - 1);
        const px = x + t * w;
        const py = y + Math.sin(t * Math.PI) * dip;
        return (
          <g key={i}>
            <circle cx={px.toFixed(1)} cy={py.toFixed(1)} r={i % 3 === 0 ? 3.4 : 2.6} fill={PEARL} stroke={GOLD_DEEP} strokeWidth="0.5" opacity="0.95" />
            <circle cx={(px - 0.9).toFixed(1)} cy={(py - 0.9).toFixed(1)} r="0.8" fill="#fff" opacity="0.9" />
          </g>
        );
      })}
    </g>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   THE GARLAND FLOWERS — a blush rose and a sea-blue bloom, plus gold foliage.
   ══════════════════════════════════════════════════════════════════════════ */

/*
 * THE BOTANICAL LANGUAGE — engraved, not filled.
 *
 * The first pass drew each flower as rings of flat, fully-saturated petals. That
 * is clip-art: high chroma, perfectly regular geometry, and no linework, so the
 * corners read as stickers rather than as printed stationery. Everything below is
 * rebuilt on the three rules that make an engraved botanical read as expensive:
 *
 *   1. LINE LEADS. The gold-sepia contour is the drawing; the colour is a wash
 *      *behind* it at 0.3–0.5 opacity. Chroma stays low so the paper still reads
 *      as the lightest thing on the page.
 *   2. NOTHING IS REGULAR. Petals come from three different contours at
 *      irregular angles (66°/71°/77°, not a clean 72°), so no flower is a
 *      rosette stamped from one shape.
 *   3. RESTRAINT. Foliage and negative space carry the corner; three flowers do
 *      the work nine were doing.
 */

/** Three petal contours, so no two petals on a flower are the same shape. */
const PETAL_OUTER = [
  "M0 0 C -15 -4 -23 -18 -17 -29 C -11 -38 4 -39 12 -30 C 20 -21 14 -5 0 0 Z",
  "M0 0 C -13 -6 -21 -19 -14 -30 C -7 -39 8 -37 14 -27 C 20 -17 12 -4 0 0 Z",
  "M0 0 C -16 -3 -25 -15 -20 -27 C -15 -37 1 -40 10 -32 C 19 -24 15 -6 0 0 Z",
];
const PETAL_MID = [
  "M0 0 C -10 -4 -16 -14 -11 -22 C -6 -29 5 -28 9 -21 C 14 -13 8 -3 0 0 Z",
  "M0 0 C -9 -5 -14 -15 -8 -22 C -3 -28 6 -26 10 -19 C 13 -12 7 -2 0 0 Z",
];

/**
 * A blush garden rose, engraved. The wash sits behind a fine gold contour, and
 * the petals fold inward to a spiralled heart with one catch of light on it.
 */
function rose(x: number, y: number, s: number, rot = 0) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {/* the outer round — five petals, three contours, irregular spacing */}
      {[0, 66, 137, 211, 288].map((a, i) => (
        <path
          key={a}
          d={PETAL_OUTER[i % 3]}
          transform={`rotate(${a})`}
          fill={ROSE_LITE}
          fillOpacity="0.46"
          stroke={GOLD_DEEP}
          strokeWidth="0.6"
          strokeOpacity="0.7"
          strokeLinejoin="round"
        />
      ))}
      {/* the inner round, sitting a little deeper in tone */}
      {[31, 104, 173, 249, 322].map((a, i) => (
        <path
          key={a}
          d={PETAL_MID[i % 2]}
          transform={`rotate(${a})`}
          fill={ROSE}
          fillOpacity="0.4"
          stroke={GOLD_DEEP}
          strokeWidth="0.5"
          strokeOpacity="0.6"
          strokeLinejoin="round"
        />
      ))}
      {/* the cup: where the flower folds in on itself and goes to shadow */}
      <path
        d="M0 1 C -8 -1 -12 -9 -8 -15 C -3 -20 6 -19 8 -12 C 10 -5 5 1 0 1 Z"
        fill={ROSE_DEEP}
        fillOpacity="0.26"
        stroke={GOLD_DEEP}
        strokeWidth="0.5"
        strokeOpacity="0.65"
      />
      {/* the spiralled heart, drawn as line only */}
      <path
        d="M1.5 -3 C -5 -5 -7.5 -11.5 -2 -13.5 C 4 -15.5 8.5 -10.5 6.5 -6 C 4.5 -1.5 -0.5 0.5 -3.5 -1.5"
        fill="none"
        stroke={GOLD_DEEP}
        strokeWidth="0.75"
        strokeOpacity="0.8"
      />
      <circle cx="-0.5" cy="-7.5" r="1.5" fill={GOLD_LITE} opacity="0.9" />
    </g>
  );
}

/**
 * A five-petal sea bloom — the reference's cornflower blues. Same language: a
 * pale wash inside a gold contour, with fine veins and a stamen crown.
 */
function bloom(x: number, y: number, s: number, rot = 0) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {[0, 69, 143, 216, 291].map((a) => (
        <g key={a} transform={`rotate(${a})`}>
          <path
            d="M0 0 C -10 -6 -14 -19 -6 -26 C 1 -31 10 -27 11 -18 C 12 -9 7 -3 0 0 Z"
            fill={SEA_PALE}
            fillOpacity="0.62"
            stroke={GOLD_DEEP}
            strokeWidth="0.6"
            strokeOpacity="0.72"
            strokeLinejoin="round"
          />
          {/* three veins to the petal's edge — the engraving's texture */}
          <path d="M0 -4 C 1 -11 2 -18 2 -24" stroke={SEA} strokeWidth="0.5" opacity="0.42" fill="none" />
          <path d="M-1 -6 C -4 -12 -6 -17 -6 -22" stroke={SEA} strokeWidth="0.4" opacity="0.3" fill="none" />
          <path d="M1 -6 C 5 -12 8 -16 9 -20" stroke={SEA} strokeWidth="0.4" opacity="0.3" fill="none" />
        </g>
      ))}
      {/* the stamens, then the eye */}
      {[18, 90, 162, 234, 306].map((a) => {
        const rad = (a * Math.PI) / 180;
        return (
          <line
            key={a}
            x1="0"
            y1="0"
            x2={(Math.cos(rad) * 6).toFixed(1)}
            y2={(Math.sin(rad) * 6).toFixed(1)}
            stroke={GOLD_DEEP}
            strokeWidth="0.5"
            opacity="0.7"
          />
        );
      })}
      <circle cx="0" cy="0" r="3.2" fill={GOLD_LITE} fillOpacity="0.85" stroke={GOLD_DEEP} strokeWidth="0.55" />
    </g>
  );
}

/** A closed bud on a short stem — the restraint that keeps a corner from being
 * a bouquet. Two sepals, one furled petal, gold line throughout. */
function bud(x: number, y: number, s: number, rot = 0) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d="M0 0 C 0 -6 -1 -12 -2 -17" stroke={GOLD_DEEP} strokeWidth="0.8" opacity="0.8" fill="none" />
      <path
        d="M-2 -17 C -8 -20 -9 -29 -4 -34 C 1 -38 7 -35 7 -28 C 7 -22 3 -17 -2 -17 Z"
        fill={ROSE_LITE}
        fillOpacity="0.5"
        stroke={GOLD_DEEP}
        strokeWidth="0.6"
        strokeOpacity="0.75"
      />
      <path d="M-3 -21 C -1 -26 2 -30 5 -31" stroke={GOLD_DEEP} strokeWidth="0.5" opacity="0.6" fill="none" />
      {/* the sepals reaching up the bud */}
      <path d="M-2 -16 C -7 -19 -9 -24 -8 -28" stroke={LEAF} strokeWidth="1.2" opacity="0.7" fill="none" />
      <path d="M-2 -16 C 2 -19 5 -23 5 -27" stroke={LEAF} strokeWidth="1.2" opacity="0.6" fill="none" />
    </g>
  );
}

/**
 * A leafed sprig growing from its origin along `rot`. Engraved like the flowers:
 * a gold stem, leaves as fine contours over a pale sage wash, each with its own
 * midrib — so foliage can carry a corner without shouting.
 */
function sprig(x: number, y: number, len: number, rot: number, s = 1) {
  const leaves = Math.max(4, Math.round(len / 12));
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {/* the stem, arcing as it lengthens */}
      <path
        d={`M0 0 C ${len * 0.3} ${-len * 0.09} ${len * 0.68} ${-len * 0.17} ${len} ${-len * 0.13}`}
        stroke={GOLD_DEEP}
        strokeWidth="1.1"
        fill="none"
        opacity="0.85"
      />
      {Array.from({ length: leaves }).map((_, i) => {
        const t = (i + 1) / (leaves + 1);
        const lx = t * len;
        const ly = -len * 0.14 * Math.sin(t * Math.PI);
        const up = i % 2 === 0;
        // largest at a third of the way out, tapering to the tip
        const ll = 7.5 + (1 - Math.abs(t - 0.34) * 1.5) * 7;
        const a = up ? -40 : 36;
        return (
          <g key={i} transform={`translate(${lx.toFixed(1)} ${ly.toFixed(1)}) rotate(${a})`}>
            {/* a lanceolate leaf: two arcs meeting at the tip */}
            <path
              d={`M0 0 C ${(ll * 0.42).toFixed(1)} ${(-ll * 0.4).toFixed(1)} ${(ll * 0.86).toFixed(1)} ${(-ll * 0.3).toFixed(1)} ${ll.toFixed(1)} 0 C ${(ll * 0.86).toFixed(1)} ${(ll * 0.3).toFixed(1)} ${(ll * 0.42).toFixed(1)} ${(ll * 0.4).toFixed(1)} 0 0 Z`}
              fill={LEAF}
              fillOpacity="0.34"
              stroke={GOLD_DEEP}
              strokeWidth="0.55"
              strokeOpacity="0.8"
              strokeLinejoin="round"
            />
            <path d={`M0.6 0 L${(ll * 0.88).toFixed(1)} 0`} stroke={GOLD_DEEP} strokeWidth="0.4" opacity="0.5" />
          </g>
        );
      })}
      {/* the tip, closed by a single gold bud */}
      <circle cx={len.toFixed(1)} cy={(-len * 0.13).toFixed(1)} r="1.8" fill={GOLD_LITE} stroke={GOLD_DEEP} strokeWidth="0.5" />
    </g>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   THE CORNER CLUSTERS. Two compositions, each anchored to its own corner and
   mirrored with a CSS scale by the caller: florals lead the top corners, the
   shore's treasures lead the bottom ones — exactly as on a printed plate.
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * Top-corner spray. FOLIAGE CARRIES IT — three roses, two sea blooms and two
 * buds, threaded through five gold sprigs. Nine flat flowers per corner (the
 * first pass) read as a sticker; this reads as a printed spray, and the paper
 * still gets to be the lightest thing in the corner.
 *
 * Everything is placed by angle-and-radius from (0,0) so the composition fills a
 * quarter disc out of its own corner rather than banding along one edge.
 */
export function CornerBloom({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" aria-hidden className={className}>
      {/* the foliage, radiating across the whole quarter */}
      {sprig(6, 16, 126, 14)}
      {sprig(12, 10, 138, 40)}
      {sprig(16, 18, 118, 66)}
      {sprig(10, 28, 96, 88, 0.92)}
      {sprig(4, 44, 84, -8, 0.88)}

      {/* three flowers, on a diagonal, largest nearest the corner */}
      {rose(58, 50, 1.06, -16)}
      {bloom(102, 32, 0.86, 28)}
      {rose(48, 104, 0.72, -34)}

      {/* two buds and one small bloom to break the line, then a shell */}
      {bud(112, 76, 0.86, 118)}
      {bud(28, 140, 0.72, 172)}
      {bloom(140, 60, 0.5, -20)}
      <g transform="translate(88 118) rotate(-26) scale(0.36)">{scallop(SHELL, 0.95)}</g>

      {/* pearls along the outer arc — the last, quietest note */}
      {pearls(3, 148, 100, 26, 12)}
      <circle cx="166" cy="42" r="2.2" fill={PEARL} stroke={GOLD_DEEP} strokeWidth="0.5" />
      <circle cx="80" cy="12" r="2.4" fill={PEARL} stroke={GOLD_DEEP} strokeWidth="0.5" />
      <circle cx="12" cy="112" r="2" fill={PEARL} stroke={GOLD_DEEP} strokeWidth="0.5" />
    </svg>
  );
}

/**
 * Bottom-corner cluster: the shore's treasures, composed out of the BOTTOM-left
 * corner so the shells sit on the plate's edge the way they sit on sand. Same
 * restraint — the shells lead, two roses and one bloom finish.
 */
export function CornerShells({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" aria-hidden className={className}>
      {/* sea oats standing behind everything */}
      {sprig(16, 186, 120, -62)}
      {sprig(48, 196, 104, -78, 0.9)}
      {sprig(8, 168, 90, -34, 0.9)}
      {sprig(84, 198, 78, -86, 0.8)}

      {/* the big scallop, hinge down, sitting on the corner */}
      <g transform="translate(2 116) scale(0.84)">{scallop("var(--mrm-shell-2)")}</g>
      {/* a conch leaning against it */}
      <g transform="translate(76 106) rotate(16) scale(0.88)">{conch("var(--mrm-sand)")}</g>
      {/* a smaller scallop in front, turned over */}
      <g transform="translate(52 156) rotate(170) scale(0.42)">{scallop("var(--mrm-sand)", 0.95)}</g>

      {/* the starfish, half-buried in the sand */}
      <g transform="translate(104 142) rotate(-18) scale(0.66)">{starfish("var(--mrm-sand)")}</g>

      {/* two roses and a bloom up the edge, and one bud beyond them */}
      {rose(138, 114, 0.8, 22)}
      {bloom(168, 146, 0.62, -26)}
      {rose(106, 82, 0.5, -34)}
      {bud(150, 84, 0.74, 46)}

      {/* pearls on the sand */}
      {pearls(3, 148, 180, 30, -8)}
      <circle cx="94" cy="184" r="2.6" fill={PEARL} stroke={GOLD_DEEP} strokeWidth="0.5" />
      <circle cx="182" cy="168" r="2.2" fill={PEARL} stroke={GOLD_DEEP} strokeWidth="0.5" />
      <circle cx="30" cy="192" r="2" fill={PEARL} stroke={GOLD_DEEP} strokeWidth="0.5" />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   BRASS — the anchor, the compass rose, the lighthouse.
   ══════════════════════════════════════════════════════════════════════════ */
export function Anchor({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 180" fill="none" aria-hidden className={className}>
      {/* the rope, looped through the ring */}
      <path
        d="M60 22 C40 12 22 20 20 38 C18 54 32 62 44 56"
        stroke={GOLD_DEEP}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        opacity="0.55"
      />
      <path
        d="M60 22 C40 12 22 20 20 38 C18 54 32 62 44 56"
        stroke={GOLD_LITE}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeDasharray="4 5"
        fill="none"
        opacity="0.7"
      />
      {/* ring */}
      <circle cx="60" cy="22" r="12" stroke={GOLD} strokeWidth="6" />
      <circle cx="60" cy="22" r="12" stroke={GOLD_DEEP} strokeWidth="1" />
      {/* shank */}
      <path d="M56 34 L56 138 L64 138 L64 34 Z" fill={GOLD} stroke={GOLD_DEEP} strokeWidth="1" />
      {/* stock (crossbar) with tapered tips */}
      <path d="M22 58 L98 58 L92 66 L28 66 Z" fill={GOLD} stroke={GOLD_DEEP} strokeWidth="1" />
      <circle cx="22" cy="62" r="4" fill={GOLD_LITE} stroke={GOLD_DEEP} strokeWidth="0.8" />
      <circle cx="98" cy="62" r="4" fill={GOLD_LITE} stroke={GOLD_DEEP} strokeWidth="0.8" />
      {/* arms + flukes */}
      <path
        d="M60 138 C40 138 20 126 14 104 C12 98 20 96 24 102 C32 118 46 126 60 126 C74 126 88 118 96 102 C100 96 108 98 106 104 C100 126 80 138 60 138 Z"
        fill={GOLD}
        stroke={GOLD_DEEP}
        strokeWidth="1"
      />
      <path d="M8 96 L26 106 L14 112 Z" fill={GOLD} stroke={GOLD_DEEP} strokeWidth="1" />
      <path d="M112 96 L94 106 L106 112 Z" fill={GOLD} stroke={GOLD_DEEP} strokeWidth="1" />
      {/* highlight */}
      <line x1="57.6" y1="40" x2="57.6" y2="120" stroke={GOLD_LITE} strokeWidth="1.4" opacity="0.7" />
    </svg>
  );
}

export function Compass({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden className={className}>
      <circle cx="60" cy="60" r="54" stroke={GOLD} strokeWidth="1.4" opacity="0.8" />
      <circle cx="60" cy="60" r="46" stroke={GOLD_DEEP} strokeWidth="0.7" strokeDasharray="2 4" opacity="0.7" />
      {/* the ticks */}
      {Array.from({ length: 32 }).map((_, i) => {
        const rad = ((i * 360) / 32 - 90) * (Math.PI / 180);
        const long = i % 4 === 0;
        return (
          <line
            key={i}
            x1={(60 + Math.cos(rad) * 46).toFixed(1)}
            y1={(60 + Math.sin(rad) * 46).toFixed(1)}
            x2={(60 + Math.cos(rad) * (long ? 38 : 42)).toFixed(1)}
            y2={(60 + Math.sin(rad) * (long ? 38 : 42)).toFixed(1)}
            stroke={GOLD_DEEP}
            strokeWidth={long ? 1.2 : 0.6}
            opacity="0.7"
          />
        );
      })}
      {/* the rose: four long points, four short */}
      <g>
        {[0, 90, 180, 270].map((a) => (
          <path key={a} d="M60 60 L54 46 L60 12 L66 46 Z" fill={GOLD} stroke={GOLD_DEEP} strokeWidth="0.7" transform={`rotate(${a} 60 60)`} />
        ))}
        {[45, 135, 225, 315].map((a) => (
          <path key={a} d="M60 60 L55 48 L60 26 L65 48 Z" fill={SEA} fillOpacity="0.55" stroke={GOLD_DEEP} strokeWidth="0.6" transform={`rotate(${a} 60 60)`} />
        ))}
      </g>
      <circle cx="60" cy="60" r="5" fill={GOLD_LITE} stroke={GOLD_DEEP} strokeWidth="0.8" />
      <circle cx="58.4" cy="58.4" r="1.4" fill={PEARL} />
    </svg>
  );
}

/** The lighthouse on the point — its beam sweeps (CSS, reduced-motion safe). */
export function Lighthouse({ className }: { className?: string }) {
  // Minted per instance: the beam gradient must not be shared between the
  // countdown's lighthouse and the footer's.
  const beam = `mrm-beam-${useId().replace(/:/g, "")}`;
  return (
    <svg viewBox="0 0 200 260" fill="none" aria-hidden className={className}>
      <defs>
        {/* Bright at the lamp, gone by the edge of the frame. Fading to a
            colour-matched zero-alpha stop, never the `transparent` keyword —
            that is rgba(0,0,0,0) and drags the cone's midtones toward grey. */}
        <linearGradient id={beam} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f2e2b8" stopOpacity="0.5" />
          <stop offset="40%" stopColor="#eeddb0" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#e8d5ac" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* the beam, pivoting at the lamp */}
      <g className="mrm-beam" style={{ transformOrigin: "100px 62px" }}>
        <path d="M100 62 L204 26 L204 98 Z" fill={`url(#${beam})`} />
        <path d="M100 62 L188 44 L188 80 Z" fill={`url(#${beam})`} opacity="0.7" />
      </g>

      {/* rock base */}
      <path d="M40 250 C48 224 62 214 100 214 C138 214 152 224 160 250 Z" fill={SEA} fillOpacity="0.3" stroke={GOLD_DEEP} strokeWidth="0.9" />
      {/* tower — tapered, with two sea-blue bands */}
      <path d="M84 92 L78 216 L122 216 L116 92 Z" fill={SHELL} stroke={GOLD_DEEP} strokeWidth="1.1" />
      <path d="M81.2 150 L118.8 150 L119.6 168 L80.4 168 Z" fill={SEA} fillOpacity="0.55" />
      <path d="M79.4 186 L120.6 186 L121.4 204 L78.6 204 Z" fill={SEA} fillOpacity="0.35" />
      {/* windows */}
      <rect x="96" y="122" width="8" height="12" rx="4" fill={SEA} fillOpacity="0.6" />
      <rect x="96" y="176" width="8" height="12" rx="4" fill={SEA} fillOpacity="0.5" />
      {/* gallery + lamp room */}
      <path d="M76 92 L124 92 L120 84 L80 84 Z" fill={GOLD} stroke={GOLD_DEEP} strokeWidth="0.9" />
      <rect x="86" y="52" width="28" height="32" fill={GOLD_LITE} fillOpacity="0.5" stroke={GOLD_DEEP} strokeWidth="1" />
      <circle cx="100" cy="66" r="7" fill={GOLD_LITE} className="mrm-lamp" />
      {/* cupola */}
      <path d="M84 52 L116 52 L100 34 Z" fill={GOLD} stroke={GOLD_DEEP} strokeWidth="0.9" />
      <line x1="100" y1="34" x2="100" y2="22" stroke={GOLD_DEEP} strokeWidth="1.6" />
      <circle cx="100" cy="20" r="3" fill={GOLD_LITE} stroke={GOLD_DEEP} strokeWidth="0.7" />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   THE SEA — gulls, surf, and the shore scene under the invitation.
   ══════════════════════════════════════════════════════════════════════════ */

/** Three gulls, drifting across the sky. */
export function Seagulls({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 90" fill="none" aria-hidden className={className}>
      <g stroke={SEA} strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.65">
        <path className="mrm-gull" d="M14 30 q10 -9 20 0 q10 -9 20 0" />
        <path className="mrm-gull-alt" d="M74 56 q8 -7 16 0 q8 -7 16 0" />
        <path className="mrm-gull" style={{ animationDelay: "-4s" }} d="M132 20 q7 -6 14 0 q7 -6 14 0" />
      </g>
    </svg>
  );
}

/** A gold-hairline surf band — two wave layers that slide past each other. */
export function SurfLine({ className }: { className?: string }) {
  const wave = (d: string, stroke: string, sw: number, op: number) => (
    <path d={d} stroke={stroke} strokeWidth={sw} opacity={op} fill="none" />
  );
  // 720-wide period, drawn twice so the slide is seamless.
  const crest = "M0 40 q45 -22 90 0 q45 22 90 0 q45 -22 90 0 q45 22 90 0 q45 -22 90 0 q45 22 90 0 q45 -22 90 0 q45 22 90 0";
  const under = "M0 52 q60 -18 120 0 q60 18 120 0 q60 -18 120 0 q60 18 120 0 q60 -18 120 0 q60 18 120 0";
  return (
    <svg viewBox="0 0 720 80" fill="none" preserveAspectRatio="none" aria-hidden className={className}>
      <g className="mrm-wave-back">
        <g>{wave(under, SEA_LITE, 2, 0.4)}</g>
        <g transform="translate(720 0)">{wave(under, SEA_LITE, 2, 0.4)}</g>
      </g>
      <g className="mrm-wave">
        <g>{wave(crest, SEA, 1.6, 0.55)}</g>
        <g transform="translate(720 0)">{wave(crest, SEA, 1.6, 0.55)}</g>
      </g>
      <g className="mrm-wave-fore">
        <g>{wave(crest, GOLD, 1, 0.5)}</g>
        <g transform="translate(720 0)">{wave(crest, GOLD, 1, 0.5)}</g>
      </g>
    </svg>
  );
}

/**
 * THE SHORE — the scene beneath the invitation: a chapel on the headland, a
 * lateen sail on the water, the couple walking the tideline, gulls overhead.
 * Rendered into a porthole arch by the view.
 */
export function ShoreScene({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const sunId = `mrm-sun-${uid}`;
  const seaId = `mrm-sea-${uid}`;
  const roadId = `mrm-road-${uid}`;
  return (
    <svg viewBox="0 0 400 320" fill="none" aria-hidden className={className}>
      <defs>
        {/* every ramp falls to a colour-matched zero-alpha stop, never the
            `transparent` keyword — that is rgba(0,0,0,0) and greys the midtones */}
        <radialGradient id={sunId}>
          <stop offset="0%" stopColor="#fff6de" stopOpacity="0.95" />
          <stop offset="42%" stopColor="#f2e2b8" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#e8d5ac" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={seaId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a9c1dd" />
          <stop offset="34%" stopColor="#7396c0" />
          <stop offset="100%" stopColor="#22406a" />
        </linearGradient>
        {/* the glints in the sun's road fade out as they come ashore */}
        <linearGradient id={roadId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff6de" stopOpacity="0.85" />
          <stop offset="70%" stopColor="#fff6de" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#f7ead0" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* the sun, low over the water: a lit core inside a soft halo */}
      <circle cx="286" cy="122" r="58" fill={`url(#${sunId})`} className="mrm-sunglow" />
      <circle cx="286" cy="122" r="14" fill="#fff6de" opacity="0.95" />

      {/* gulls */}
      <g stroke={SEA} strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.5">
        <path className="mrm-gull" d="M96 58 q8 -7 16 0 q8 -7 16 0" />
        <path className="mrm-gull-alt" d="M156 40 q6 -5 12 0 q6 -5 12 0" />
      </g>

      {/* the headland, left, with the chapel on it */}
      <path d="M0 176 C34 168 62 150 88 152 C112 154 124 168 132 178 L132 200 L0 200 Z" fill={SEA} fillOpacity="0.35" />
      <g transform="translate(46 108)">
        {/* chapel: nave, portico, bell tower with a cross */}
        <path d="M6 44 L6 20 L34 20 L34 44 Z" fill={SHELL} stroke={GOLD_DEEP} strokeWidth="0.9" />
        <path d="M4 20 L20 8 L36 20 Z" fill={SHELL} stroke={GOLD_DEEP} strokeWidth="0.9" />
        <path d="M36 44 L36 14 L50 14 L50 44 Z" fill={SHELL} stroke={GOLD_DEEP} strokeWidth="0.9" />
        <path d="M34 14 L43 2 L52 14 Z" fill={GOLD} fillOpacity="0.55" stroke={GOLD_DEEP} strokeWidth="0.8" />
        <line x1="43" y1="2" x2="43" y2="-8" stroke={GOLD_DEEP} strokeWidth="1.2" />
        <line x1="38.5" y1="-4" x2="47.5" y2="-4" stroke={GOLD_DEEP} strokeWidth="1.2" />
        <path d="M16 44 L16 32 C16 27 24 27 24 32 L24 44 Z" fill={SEA} fillOpacity="0.5" />
        <rect x="40" y="22" width="6" height="8" rx="3" fill={SEA} fillOpacity="0.55" />
      </g>
      {/* two palms on the headland */}
      {[
        [104, 150],
        [120, 158],
      ].map(([x, y], i) => (
        <g key={i} className={i ? "mrm-palm-alt" : "mrm-palm"} style={{ transformOrigin: `${x}px ${y}px` }}>
          <path d={`M${x} ${y} C${x - 3} ${y - 14} ${x - 2} ${y - 24} ${x - 5} ${y - 32}`} stroke={GOLD_DEEP} strokeWidth="1.6" fill="none" opacity="0.8" />
          {[-58, -22, 16, 52, 90].map((a) => (
            <path
              key={a}
              d={`M${x - 5} ${y - 32} q10 -6 19 -1`}
              stroke={LEAF}
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
              opacity="0.7"
              transform={`rotate(${a} ${x - 5} ${y - 32})`}
            />
          ))}
        </g>
      ))}

      {/* the sea — one graded body, deepest at the shore */}
      <rect x="0" y="196" width="400" height="66" fill={`url(#${seaId})`} />
      {/* three swell lines, catching the light */}
      <path d="M0 214 q34 -5 68 0 q34 5 68 0 q34 -5 68 0 q34 5 68 0 q34 -5 68 0 q34 5 68 0" stroke="#e8f3f9" strokeWidth="1.2" opacity="0.4" fill="none" />
      <path d="M0 232 q42 -6 84 0 q42 6 84 0 q42 -6 84 0 q42 6 84 0 q42 -6 84 0" stroke="#e8f3f9" strokeWidth="1.4" opacity="0.34" fill="none" />
      <path d="M0 250 q50 -6 100 0 q50 6 100 0 q50 -6 100 0 q50 6 100 0" stroke="#e8f3f9" strokeWidth="1.6" opacity="0.28" fill="none" />

      {/* the sun's road, widening as it comes ashore */}
      <g stroke={`url(#${roadId})`} strokeLinecap="round" fill="none">
        {[
          { y: 202, w: 9, o: 0.9 },
          { y: 209, w: 15, o: 0.75 },
          { y: 216, w: 11, o: 0.85 },
          { y: 224, w: 22, o: 0.7 },
          { y: 232, w: 16, o: 0.8 },
          { y: 240, w: 28, o: 0.6 },
          { y: 247, w: 19, o: 0.7 },
          { y: 254, w: 33, o: 0.5 },
        ].map((g, i) => {
          // the road drifts a little as it nears the shore, never a straight bar
          const cx = 286 + (i % 2 === 0 ? -2 : 3) + (g.y - 202) * 0.16;
          return (
            <line
              key={g.y}
              x1={(cx - g.w / 2).toFixed(1)}
              y1={g.y}
              x2={(cx + g.w / 2).toFixed(1)}
              y2={g.y}
              strokeWidth={i % 3 === 0 ? 2.4 : 1.7}
              opacity={g.o}
            />
          );
        })}
      </g>

      {/* the boat — a lateen sail, rocking */}
      <g className="mrm-boat" style={{ transformOrigin: "196px 214px" }}>
        <path d="M196 206 L196 168 L222 206 Z" fill={SHELL} stroke={GOLD_DEEP} strokeWidth="0.9" />
        <path d="M194 206 L194 176 L176 206 Z" fill={`var(--mrm-shell-2)`} stroke={GOLD_DEEP} strokeWidth="0.9" />
        <line x1="195" y1="168" x2="195" y2="208" stroke={GOLD_DEEP} strokeWidth="1.2" />
        <path d="M172 208 L222 208 L214 216 L180 216 Z" fill={GOLD} fillOpacity="0.75" stroke={GOLD_DEEP} strokeWidth="0.9" />
      </g>

      {/* the tideline: wet sand, foam, dry sand */}
      <path d="M0 262 q40 -8 80 0 q40 8 80 0 q40 -8 80 0 q40 8 80 0 q40 -8 80 0 L400 320 L0 320 Z" fill={`var(--mrm-sand)`} />
      <path
        className="mrm-foamline"
        d="M0 262 q40 -8 80 0 q40 8 80 0 q40 -8 80 0 q40 8 80 0 q40 -8 80 0"
        stroke={PEARL}
        strokeWidth="3"
        fill="none"
        opacity="0.85"
      />
      <path d="M0 276 q50 -7 100 0 q50 7 100 0 q50 -7 100 0 q50 7 100 0" stroke={GOLD} strokeWidth="0.9" fill="none" opacity="0.35" />

      {/* The couple, walking the tideline — silhouettes, hand in hand. Drawn
          slim and tall: at plate size the first pass\u2019s thick bodies read as two
          blobs, and a pale veil laid over her became a white sash. */}
      <g fill="var(--mrm-deep-2)" opacity="0.85">
        {/* him — jacket, tapered trousers, an arm reaching across */}
        <circle cx="176" cy="264" r="4.6" />
        <path d="M176 268.5 C172.6 269 171 272 170.8 277 C170.6 282 171.4 287 172 291 L175 291 L175.6 300 L173.6 310 L176.4 310 L178.4 300 L179 291 L181.4 291 C182 287 182.6 282 182.4 277 C182.2 272 180.4 269 176 268.5 Z" />
        <path d="M181.6 275 L192 281.5 L190.8 284 L180.6 278.2 Z" />
        {/* her — a fitted bodice into a long train sweeping behind */}
        <circle cx="197" cy="263" r="4.6" />
        <path d="M197 267.5 C193.6 268 192 271 192.2 276 C192.4 280 193 283 193.6 286 C190.4 294 206 310 214 310 L204 310 C203 302 201.6 293 201.8 286 C202.4 283 203 280 202.6 276 C202.4 271 200.6 268 197 267.5 Z" />
        <path d="M192.4 274.6 L182 281 L183.2 283.4 L193.4 277.8 Z" />
        {/* the veil, as a line rather than a shape */}
        <path
          d="M197 259.5 C203 260 205.6 267 204.6 276 C203.8 283 202.4 289 201.6 294"
          fill="none"
          stroke="var(--mrm-deep-2)"
          strokeWidth="0.9"
          opacity="0.5"
        />
      </g>
      {/* their reflection in the wet sand */}
      <g fill="var(--mrm-deep-2)" opacity="0.13" transform="translate(0 620) scale(1 -1)">
        <path d="M176 268.5 C172.6 269 171 272 170.8 277 C170.6 282 171.4 287 172 291 L175 291 L175.6 300 L173.6 310 L176.4 310 L178.4 300 L179 291 L181.4 291 C182 287 182.6 282 182.4 277 C182.2 272 180.4 269 176 268.5 Z" />
        <path d="M197 267.5 C193.6 268 192 271 192.2 276 C192.4 280 193 283 193.6 286 C190.4 294 206 310 214 310 L204 310 C203 302 201.6 293 201.8 286 C202.4 283 203 280 202.6 276 C202.4 271 200.6 268 197 267.5 Z" />
      </g>

      {/* a shell and a starfish on the dry sand */}
      <g transform="translate(38 288) scale(0.2)">{scallop(SHELL)}</g>
      <g transform="translate(330 286) rotate(18) scale(0.24)">{starfish("var(--mrm-shell-2)")}</g>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   RULES & FLOURISHES.
   ══════════════════════════════════════════════════════════════════════════ */

/** A gold rule with a small scallop at its centre — the section divider.
 * The shell is drawn at its final size rather than scaled down from the big
 * plate: at 0.17 scale that one's hairlines vanish and the shell reads as a
 * smudge on cream paper. */
export function GoldDivider({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 22" fill="none" aria-hidden className={className}>
      <line x1="4" y1="11" x2="96" y2="11" stroke={GOLD} strokeWidth="1" opacity="0.8" />
      <line x1="144" y1="11" x2="236" y2="11" stroke={GOLD} strokeWidth="1" opacity="0.8" />
      <circle cx="104" cy="11" r="1.7" fill={GOLD} opacity="0.85" />
      <circle cx="136" cy="11" r="1.7" fill={GOLD} opacity="0.85" />
      {/* the scallop, hinge down, at readable weight */}
      <g transform="translate(120 12)">
        <path
          d="M0 6 C -6.5 5.4 -10 1.6 -10 -2.6 C -10 -6.6 -5.6 -9.4 0 -9.4 C 5.6 -9.4 10 -6.6 10 -2.6 C 10 1.6 6.5 5.4 0 6 Z"
          fill={SHELL}
          stroke={GOLD}
          strokeWidth="0.9"
        />
        {[-6.2, -3.1, 0, 3.1, 6.2].map((dx, i) => (
          <path key={i} d={`M0 5.6 L${dx} ${(-7.4 + Math.abs(dx) * 0.34).toFixed(1)}`} stroke={GOLD} strokeWidth="0.6" opacity="0.6" />
        ))}
      </g>
    </svg>
  );
}

/** A symmetric flourish above a section title: two tapering gold sweeps out of a
 * central pearl, each carrying three leaves and one small rose. Drawn at final
 * size — the generic sprig, shrunk to this band, reads as a green smudge. */
export function HeadFlourish({ className }: { className?: string }) {
  const half = (dir: 1 | -1) => (
    <g transform={dir === 1 ? undefined : "translate(240 0) scale(-1 1)"}>
      {/* the sweep */}
      <path d="M120 17 C 106 17 92 14 78 11 C 66 8.5 54 8 44 10" stroke={GOLD} strokeWidth="1.2" fill="none" opacity="0.9" />
      <path d="M120 20 C 108 21 96 21 86 20" stroke={GOLD_DEEP} strokeWidth="0.8" fill="none" opacity="0.5" />
      {/* three leaves along it, falling in size outward */}
      {[
        { x: 104, y: 14.4, r: -26, w: 8.4 },
        { x: 88, y: 11.6, r: -20, w: 7 },
        { x: 72, y: 9.6, r: -12, w: 5.6 },
      ].map((l, i) => (
        <ellipse
          key={i}
          cx={l.x}
          cy={l.y}
          rx={l.w}
          ry={l.w * 0.4}
          fill={LEAF}
          fillOpacity="0.6"
          stroke={GOLD_DEEP}
          strokeWidth="0.6"
          strokeOpacity="0.85"
          transform={`rotate(${l.r} ${l.x} ${l.y})`}
        />
      ))}
      {/* one small rose, and the bud beyond it */}
      {rose(56, 10, 0.28, -14)}
      <circle cx="42" cy="10" r="2" fill={GOLD_LITE} stroke={GOLD_DEEP} strokeWidth="0.5" />
      <circle cx="34" cy="12" r="1.3" fill={GOLD} opacity="0.75" />
    </g>
  );
  return (
    <svg viewBox="0 0 240 34" fill="none" aria-hidden className={className}>
      {half(1)}
      {half(-1)}
      {/* the pearl that holds the two halves together */}
      <circle cx="120" cy="17" r="4" fill={PEARL} stroke={GOLD_DEEP} strokeWidth="0.8" />
      <circle cx="118.6" cy="15.6" r="1.2" fill="#fff" />
      <circle cx="120" cy="26" r="1.6" fill={GOLD} opacity="0.7" />
    </svg>
  );
}

/** A twisted-rope rule — the nautical trim between sections. */
export function RopeRule({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 14" fill="none" preserveAspectRatio="none" aria-hidden className={className}>
      <path d="M0 7 q10 -6 20 0 q10 6 20 0 q10 -6 20 0 q10 6 20 0 q10 -6 20 0 q10 6 20 0 q10 -6 20 0 q10 6 20 0 q10 -6 20 0 q10 6 20 0 q10 -6 20 0 q10 6 20 0" stroke={GOLD} strokeWidth="1.6" fill="none" opacity="0.7" />
      <path d="M0 7 q10 6 20 0 q10 -6 20 0 q10 6 20 0 q10 -6 20 0 q10 6 20 0 q10 -6 20 0 q10 6 20 0 q10 -6 20 0 q10 6 20 0 q10 -6 20 0 q10 6 20 0 q10 -6 20 0" stroke={GOLD_DEEP} strokeWidth="1.2" fill="none" opacity="0.45" />
    </svg>
  );
}

/** The dove with an olive sprig — used over the welcome and the families. */
export function Dove({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 120" fill="none" aria-hidden className={className}>
      {/* a soft halo */}
      <circle cx="76" cy="52" r="46" fill={GOLD_LITE} opacity="0.22" />
      {/* body + tail */}
      <path
        d="M52 66 C40 62 30 66 24 74 C34 74 40 78 44 84 C52 96 68 100 82 94 C98 88 106 74 104 60 C102 46 90 38 78 40 C66 42 56 52 52 66 Z"
        fill={PEARL}
        stroke={GOLD_DEEP}
        strokeWidth="1.4"
      />
      {/* the shaded underside, so the bird has a body and not just a contour */}
      <path
        d="M44 84 C52 96 68 100 82 94 C92 90 99 82 102 72 C94 84 78 92 62 90 C54 89 48 87 44 84 Z"
        fill={GOLD_DEEP}
        fillOpacity="0.12"
      />
      {/* upswept wing */}
      <path
        d="M74 62 C78 46 92 30 112 24 C104 38 100 50 100 62 C100 72 94 80 84 80 C76 80 72 72 74 62 Z"
        fill={SHELL}
        stroke={GOLD_DEEP}
        strokeWidth="1.4"
      />
      {/* the wing's flight feathers */}
      <path d="M82 66 C86 54 94 42 106 34" stroke={GOLD_DEEP} strokeWidth="0.8" opacity="0.6" fill="none" />
      <path d="M88 72 C92 58 98 46 108 38" stroke={GOLD_DEEP} strokeWidth="0.7" opacity="0.45" fill="none" />
      <path d="M94 76 C97 64 101 54 108 46" stroke={GOLD_DEEP} strokeWidth="0.6" opacity="0.35" fill="none" />
      {/* head + beak */}
      <circle cx="104" cy="54" r="9" fill={PEARL} stroke={GOLD_DEEP} strokeWidth="1.4" />
      <circle cx="107" cy="52" r="1.5" fill={GOLD_DEEP} />
      <path d="M113 55 L124 57 L113 60 Z" fill={GOLD} />
      {/* the olive sprig in its beak */}
      <path d="M124 58 C134 58 142 62 148 68" stroke={GOLD_DEEP} strokeWidth="1" fill="none" opacity="0.8" />
      {[
        [132, 60],
        [140, 63],
        [147, 68],
      ].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx="5.4" ry="2.2" fill={LEAF} fillOpacity="0.5" stroke={GOLD_DEEP} strokeWidth="0.6" transform={`rotate(${i % 2 ? 34 : -30} ${x} ${y})`} />
      ))}
      {/* tail feathers */}
      <path d="M24 74 L6 68 M24 74 L6 76 M24 74 L12 86" stroke={GOLD_DEEP} strokeWidth="1.3" opacity="0.8" strokeLinecap="round" />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   DRIFTING PETALS & FOAM — a whole-page decorative layer.
   Each span carries its own width and base position so that removing the
   animation (reduced motion) cannot leave an unsized SVG in normal flow.
   ══════════════════════════════════════════════════════════════════════════ */
function Petal({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden className={className}>
      <path
        d="M12 2.5 C18.5 7 19.5 15.5 12 21.5 C4.5 15.5 5.5 7 12 2.5 Z"
        fill={ROSE_LITE}
        fillOpacity="0.5"
        stroke={GOLD_DEEP}
        strokeWidth="0.6"
        strokeOpacity="0.5"
      />
      <path d="M12 5 C11.4 10 11.6 16 12 20.5" stroke={GOLD_DEEP} strokeWidth="0.45" opacity="0.4" fill="none" />
    </svg>
  );
}

function Bubble({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden className={className}>
      <circle cx="12" cy="12" r="8.4" fill={PEARL} fillOpacity="0.6" stroke={GOLD_DEEP} strokeWidth="0.55" strokeOpacity="0.45" />
      <circle cx="9.4" cy="9.4" r="2.2" fill="#fff" opacity="0.75" />
    </svg>
  );
}

export function FoamDrift({ className }: { className?: string }) {
  /* `mobile` moves a column out to the margin on a phone, where the copy runs
     nearly edge to edge (same reasoning as The Mayura's feather fall). Only the
     two outermost keep running below sm — see the media query in globals.css. */
  const bits = [
    { left: 6, mobile: -2, delay: 0, dur: 26, size: 16, rot: -20, drift: 34, driftSm: 12, kind: "petal" },
    { left: 18, delay: 7, dur: 31, size: 11, rot: 24, drift: -28, kind: "bubble" },
    { left: 30, delay: 13, dur: 28, size: 11, rot: -12, drift: 36, kind: "bubble" },
    { left: 43, delay: 4, dur: 34, size: 9, rot: 18, drift: -32, kind: "bubble" },
    { left: 55, delay: 10, dur: 27, size: 17, rot: -26, drift: 30, kind: "petal" },
    { left: 67, delay: 17, dur: 32, size: 12, rot: 14, drift: -36, kind: "bubble" },
    { left: 79, delay: 5, dur: 29, size: 10, rot: -16, drift: 32, kind: "bubble" },
    { left: 92, mobile: 99, delay: 14, dur: 30, size: 11, rot: 22, drift: -26, driftSm: -9, kind: "petal" },
  ] as Array<{
    left: number;
    mobile?: number;
    delay: number;
    dur: number;
    size: number;
    rot: number;
    drift: number;
    driftSm?: number;
    kind: string;
  }>;
  return (
    <div className={className} aria-hidden>
      {bits.map((p, i) => (
        <span
          key={i}
          className="mrm-drift"
          data-edge={p.mobile === undefined ? undefined : "1"}
          style={
            {
              // Read by the stylesheet so a media query can override the phone
              // column — an inline `left` could not be.
              ["--fx" as string]: `${p.left}%`,
              ["--fx-sm" as string]: `${p.mobile ?? p.left}%`,
              ["--drift-sm" as string]: `${p.driftSm ?? p.drift}px`,
              // Named --drift-lg, not --drift: the stylesheet picks which one
              // applies, and an inline --drift would outrank it.
              ["--drift-lg" as string]: `${p.drift}px`,
              ["--rot" as string]: `${p.rot}deg`,
              width: `${p.size}px`,
              animationDelay: `-${p.delay}s`,
              animationDuration: `${p.dur}s`,
            } as React.CSSProperties
          }
        >
          {p.kind === "petal" ? <Petal className="block h-auto w-full" /> : <Bubble className="block h-auto w-full" />}
        </span>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   THE HERO'S SEA — a watercolour surf that washes into two corners of the
   invitation plate, drawn (not tiled) so the edge stays soft at any size.
   ══════════════════════════════════════════════════════════════════════════ */
export function ShoreWash({ corner, className }: { corner: "tr" | "bl"; className?: string }) {
  const flip = corner === "bl";
  // Minted per instance so two washes never collide on one page.
  const uid = useId().replace(/:/g, "");
  const body = `mrm-wash-${uid}`;
  const feather = `mrm-feather-${uid}`;
  return (
    <svg
      viewBox="0 0 300 300"
      fill="none"
      aria-hidden
      className={className}
      style={flip ? { transform: "rotate(180deg)" } : undefined}
    >
      <defs>
        {/* the water, deepest in the corner it bleeds from */}
        <radialGradient id={body} cx="100%" cy="0%" r="118%">
          <stop offset="0%" stopColor="#4a6c96" stopOpacity="0.62" />
          <stop offset="34%" stopColor="#7d99c1" stopOpacity="0.44" />
          <stop offset="62%" stopColor="#b3c6e0" stopOpacity="0.24" />
          <stop offset="100%" stopColor="#d3dfee" stopOpacity="0" />
        </radialGradient>
        {/* a feathered edge, so the wash has no boundary of its own */}
        <radialGradient id={feather} cx="100%" cy="0%" r="112%">
          <stop offset="0%" stopColor="#fff" stopOpacity="1" />
          <stop offset="70%" stopColor="#fff" stopOpacity="0.92" />
          <stop offset="92%" stopColor="#fff" stopOpacity="0.34" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id={`${feather}-m`}>
          <rect x="0" y="0" width="300" height="300" fill={`url(#${feather})`} />
        </mask>
      </defs>

      <g mask={`url(#${feather}-m)`}>
        {/* the body of water */}
        <rect x="0" y="0" width="300" height="300" fill={`url(#${body})`} />
        {/* three crests — unbroken, and each paler than the one behind it */}
        <path
          d="M300 188 C246 194 200 180 154 158 C112 138 76 108 50 68"
          stroke="#ffffff"
          strokeWidth="2.6"
          strokeLinecap="round"
          opacity="0.5"
          fill="none"
        />
        <path
          d="M300 148 C254 152 214 138 174 118 C136 98 104 72 80 40"
          stroke="#ffffff"
          strokeWidth="1.7"
          strokeLinecap="round"
          opacity="0.34"
          fill="none"
        />
        <path
          d="M300 108 C262 110 230 98 198 80 C168 64 142 44 122 18"
          stroke="#ffffff"
          strokeWidth="1.1"
          strokeLinecap="round"
          opacity="0.22"
          fill="none"
        />
        {/* one gold sun-line where the light catches the swell */}
        <path
          d="M300 216 C240 222 192 206 146 182"
          stroke={GOLD}
          strokeWidth="1"
          opacity="0.3"
          fill="none"
        />
      </g>

      {/* a pair of gulls out over the water, outside the mask so they stay crisp */}
      <g stroke={SEA} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.45">
        <path d="M206 58 q7 -6 14 0 q7 -6 14 0" />
        <path d="M246 92 q5 -4 10 0 q5 -4 10 0" />
      </g>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   CEREMONY ICONS — matched to each rite by name, Catholic set first.
   ══════════════════════════════════════════════════════════════════════════ */
function IconChurch() {
  return (
    <g stroke={GOLD_DEEP} strokeWidth="1.3" fill="none">
      <path d="M14 44 L14 24 L34 24 L34 44 Z" fill={SEA} fillOpacity="0.14" />
      <path d="M12 24 L24 13 L36 24" />
      <path d="M24 13 L24 6 M20.5 9 L27.5 9" strokeWidth="1.6" />
      <path d="M21 44 L21 33 C21 30 27 30 27 33 L27 44" fill={GOLD} fillOpacity="0.3" />
      <path d="M10 44 L38 44" strokeWidth="1.6" />
    </g>
  );
}
function IconMass() {
  return (
    <g stroke={GOLD_DEEP} strokeWidth="1.3" fill="none">
      {/* chalice + host */}
      <circle cx="24" cy="10" r="5.4" fill={GOLD_LITE} fillOpacity="0.6" />
      <path d="M24 6.5 L24 13.5 M20.5 10 L27.5 10" strokeWidth="1" />
      <path d="M15 20 L33 20 C33 30 28 34 24 34 C20 34 15 30 15 20 Z" fill={SEA} fillOpacity="0.16" />
      <path d="M24 34 L24 40 M18 42 L30 42" />
      <path d="M17 42 C17 39 31 39 31 42" />
    </g>
  );
}
function IconRings() {
  return (
    <g stroke={GOLD_DEEP} strokeWidth="1.4" fill="none">
      <circle cx="19" cy="26" r="10" fill={GOLD} fillOpacity="0.18" />
      <circle cx="30" cy="26" r="10" fill={ROSE} fillOpacity="0.14" />
      <path d="M19 14 L16 9 L22 9 Z" fill={GOLD_LITE} fillOpacity="0.7" />
    </g>
  );
}
function IconRoce() {
  /* The Roce — the coconut-milk anointing on the eve of the wedding. */
  return (
    <g stroke={GOLD_DEEP} strokeWidth="1.3" fill="none">
      <path d="M15 20 L33 20 L31 38 C31 41 17 41 17 38 Z" fill={PEARL} fillOpacity="0.7" />
      <path d="M13 20 C13 16 35 16 35 20" />
      <path d="M20 16 C20 10 28 10 28 16" />
      <path d="M17 27 C21 25 27 25 31 27" stroke={SEA} strokeOpacity="0.6" />
      <circle cx="24" cy="8" r="2" fill={GOLD_LITE} stroke="none" />
    </g>
  );
}
function IconReception() {
  return (
    <g stroke={GOLD_DEEP} strokeWidth="1.3" fill="none">
      <path d="M13 9 L22 9 L20 21 C20 25 15 25 15 21 Z" fill={SEA} fillOpacity="0.16" />
      <path d="M17.5 25 L17.5 38 M13 38 L22 38" />
      <path d="M26 9 L35 9 L33 21 C33 25 28 25 28 21 Z" fill={ROSE} fillOpacity="0.16" />
      <path d="M30.5 25 L30.5 38 M26 38 L35 38" />
      <circle cx="24" cy="6" r="1.4" fill={GOLD} stroke="none" />
    </g>
  );
}
function IconCake() {
  return (
    <g stroke={GOLD_DEEP} strokeWidth="1.3" fill="none">
      <path d="M12 40 L36 40 L36 30 L12 30 Z" fill={PEARL} fillOpacity="0.7" />
      <path d="M15 30 L33 30 L33 22 L15 22 Z" fill={ROSE_LITE} fillOpacity="0.6" />
      <path d="M18 22 L30 22 L30 15 L18 15 Z" fill={PEARL} fillOpacity="0.7" />
      <path d="M24 15 L24 9" />
      <path d="M24 9 C22 6 26 5 24 2" stroke={GOLD} />
    </g>
  );
}
function IconDance() {
  return (
    <g stroke={GOLD_DEEP} strokeWidth="1.3" fill="none">
      <circle cx="18" cy="12" r="4" fill={SEA} fillOpacity="0.2" />
      <path d="M18 16 L18 28 M18 28 L14 40 M18 28 L23 38" />
      <path d="M18 20 L28 17" />
      <circle cx="32" cy="14" r="3.4" fill={ROSE} fillOpacity="0.25" />
      <path d="M32 17.4 C30 24 30 30 33 40 L27 40" />
      <path d="M32 21 L24 19" />
    </g>
  );
}
function IconSea() {
  return (
    <g stroke={GOLD_DEEP} strokeWidth="1.3" fill="none">
      <path d="M8 30 q8 -7 16 0 q8 7 16 0" stroke={SEA} />
      <path d="M8 38 q8 -7 16 0 q8 7 16 0" stroke={SEA} strokeOpacity="0.6" />
      <path d="M24 8 L24 24 M16 14 L24 8 L32 14" />
      <path d="M24 24 L18 24 L30 24" />
    </g>
  );
}

const ICONS: Array<{ test: RegExp; Icon: () => React.ReactElement }> = [
  { test: /roce|ros|haldi|pithi|anoint/i, Icon: IconRoce },
  { test: /mass|nuptial|church|holy|matrimony|blessing|vespers|novena/i, Icon: IconMass },
  { test: /reception|banquet|dinner|swagat|valima|after/i, Icon: IconReception },
  { test: /cake|tea|brunch|lunch|breakfast/i, Icon: IconCake },
  { test: /dance|sangeet|music|cocktail|party|ball|welcome/i, Icon: IconDance },
  { test: /beach|sundowner|cruise|sunset|shore|sea/i, Icon: IconSea },
  { test: /wedding|vow|ring|ceremony|civil|registry/i, Icon: IconRings },
];

/** Picks the closest ceremony icon for an event name (defaults to the chapel). */
export function CeremonyIcon({ name, className }: { name: string; className?: string }) {
  const match = ICONS.find((x) => x.test.test(name));
  const Icon = match?.Icon ?? IconChurch;
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden className={className}>
      <Icon />
    </svg>
  );
}
