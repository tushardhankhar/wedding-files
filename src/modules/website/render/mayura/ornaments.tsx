"use client";

import { m } from "motion/react";

/**
 * THE MAYURA — ornament system for the colourful peacock wedding site.
 *
 * Every decoration is hand-drawn SVG driven by the theme's --myr-* tokens — no
 * external images — so it stays crisp at any size, recolours with the palette
 * and animates (draw-in, sway, shimmer, drift). Continuous motion lives in CSS
 * (.myr-* classes) and collapses under prefers-reduced-motion; one-shot
 * entrances use Framer's `m`.
 *
 * Motif vocabulary: the peacock (mayura) & its eye-feather, a cusped mandala
 * arch, Ganesha, marigold-&-leaf toran, hanging brass lamps, lotus, kalash,
 * diya, a golden mandap skyline, an illustrated bride & groom, gold dividers
 * and a ceremony-icon set (haldi / mehendi / sangeet / wedding / reception).
 */

const GOLD = "var(--myr-gold)";
const GOLD_LITE = "var(--myr-gold-lite)";
const GOLD_DEEP = "var(--myr-gold-deep)";
const TEAL = "var(--myr-teal)";
const BLUE = "var(--myr-blue)";
const GREEN = "var(--myr-leaf)";
const PINK = "var(--myr-pink)";
const SAFFRON = "var(--myr-saffron)";

/* ── one peacock eye-feather, pointing "down" from its local origin ────────── */
function EyeFeather({
  x = 0,
  y = 0,
  rot = 0,
  len = 150,
  mid = TEAL,
  crest = BLUE,
  className,
}: {
  x?: number;
  y?: number;
  rot?: number;
  len?: number;
  mid?: string;
  crest?: string;
  className?: string;
}) {
  const tip = len;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`} className={className}>
      {/* barbs feathering off the quill */}
      {Array.from({ length: 11 }).map((_, i) => {
        const yy = (tip - 26) * ((i + 1) / 12);
        const w = 5 + (yy / tip) * 13;
        return (
          <path
            key={i}
            d={`M0 ${yy.toFixed(1)} L${-w.toFixed(1)} ${(yy + 9).toFixed(1)} M0 ${yy.toFixed(1)} L${w.toFixed(1)} ${(yy + 9).toFixed(1)}`}
            stroke={GREEN}
            strokeWidth="1.1"
            opacity="0.65"
          />
        );
      })}
      {/* quill */}
      <path d={`M0 0 C -2 ${tip * 0.4} 2 ${tip * 0.7} 0 ${tip - 24}`} stroke={GOLD_DEEP} strokeWidth="1.4" fill="none" />
      {/* the eye — layered oval, heart-crescent, gold pupil */}
      <g transform={`translate(0 ${tip - 12})`}>
        <ellipse cx="0" cy="0" rx="14" ry="18" fill={GREEN} opacity="0.92" />
        <ellipse cx="0" cy="1" rx="10.5" ry="13.5" fill={mid} />
        <path d="M0 -9 C 8.5 -6 9.5 4 0 10.5 C -9.5 4 -8.5 -6 0 -9 Z" fill={crest} />
        <ellipse cx="0" cy="1" rx="4.6" ry="6.2" fill={GOLD} />
        <ellipse cx="0" cy="0.5" rx="2" ry="3" fill={GOLD_DEEP} />
        <circle cx="-1.2" cy="-1.2" r="1" fill={GOLD_LITE} />
      </g>
    </g>
  );
}

/** A single peacock feather (used for dividers, accents & the drifting fall). */
export function PeacockFeather({ className }: { className?: string }) {
  return (
    <svg viewBox="-20 0 40 170" fill="none" aria-hidden className={className}>
      <EyeFeather len={150} />
    </svg>
  );
}

/* ── the peacock (mayura) — perched, tail cascading down a column ──────────── */
export function Peacock({ side, className }: { side: "left" | "right"; className?: string }) {
  // A full fan of eye-feathers spilling down and outward, in alternating jewels.
  const PINK_C = "var(--myr-pink)";
  const tail = [
    { a: -36, len: 146, mid: TEAL, crest: BLUE },
    { a: -28, len: 168, mid: BLUE, crest: TEAL },
    { a: -20, len: 188, mid: TEAL, crest: PINK_C },
    { a: -12, len: 204, mid: BLUE, crest: TEAL },
    { a: -4, len: 216, mid: TEAL, crest: BLUE },
    { a: 4, len: 220, mid: BLUE, crest: TEAL },
    { a: 12, len: 216, mid: TEAL, crest: BLUE },
    { a: 20, len: 204, mid: BLUE, crest: PINK_C },
    { a: 28, len: 186, mid: TEAL, crest: TEAL },
    { a: 36, len: 166, mid: BLUE, crest: TEAL },
    { a: 44, len: 144, mid: TEAL, crest: BLUE },
  ];
  return (
    <svg
      viewBox="0 0 200 380"
      fill="none"
      aria-hidden
      className={className}
      style={{ transform: side === "right" ? "scaleX(-1)" : undefined }}
    >
      {/* tail fan — behind the body, origin near the lower body */}
      <g className="myr-plume">
        {tail.map((t, i) => (
          <EyeFeather key={i} x={96} y={132} rot={t.a} len={t.len} mid={t.mid} crest={t.crest} />
        ))}
      </g>

      {/* body */}
      <path
        d="M96 132 C74 120 70 92 84 74 C96 58 116 58 126 74 C136 90 132 118 112 132 C108 140 100 140 96 132 Z"
        fill={TEAL}
        stroke={GOLD}
        strokeWidth="1.3"
      />
      <path d="M92 118 C88 104 92 92 102 86" stroke={GOLD_LITE} strokeWidth="1" opacity="0.6" fill="none" />

      {/* neck + head */}
      <path d="M112 82 C124 66 128 48 122 34 C120 30 116 30 114 34 C110 48 104 66 100 80 Z" fill={BLUE} stroke={GOLD} strokeWidth="1.1" />
      <circle cx="118" cy="30" r="11" fill={BLUE} stroke={GOLD} strokeWidth="1.1" />
      <circle cx="121" cy="28" r="2.2" fill={GOLD_LITE} />
      {/* beak */}
      <path d="M129 30 L140 27 L130 34 Z" fill={SAFFRON} />
      {/* crest — three stalks with dots */}
      {[-10, 0, 10].map((dx, i) => (
        <g key={i}>
          <line x1="118" y1="20" x2={118 + dx * 0.8} y2="6" stroke={GOLD} strokeWidth="1" />
          <circle cx={118 + dx * 0.8} cy="6" r="2.4" fill={GREEN} stroke={GOLD} strokeWidth="0.6" />
        </g>
      ))}
      {/* a couple of wing accents */}
      {[[104, 108], [96, 120]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="2" fill={GOLD_LITE} opacity="0.8" />
      ))}
    </svg>
  );
}

/* ── the cusped mandala arch that frames the hero ─────────────────────────── */
export function MandalaArch({ className }: { className?: string }) {
  const arch =
    "M20 600 V220 C20 156 42 124 70 108 " +
    "C92 96 100 76 108 54 C118 78 136 92 158 94 " +
    "C180 96 194 82 200 58 C206 82 220 96 242 94 " +
    "C264 92 282 78 292 54 C300 76 308 96 330 108 " +
    "C358 124 380 156 380 220 V600";
  return (
    <svg viewBox="0 0 400 620" fill="none" preserveAspectRatio="none" aria-hidden className={className}>
      <m.path
        d={arch}
        stroke={GOLD}
        strokeWidth="2.6"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.92 }}
        transition={{ duration: 2.2, ease: "easeInOut" }}
      />
      <m.path
        d={arch}
        stroke={TEAL}
        strokeWidth="0.9"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.6 }}
        transition={{ duration: 2.2, ease: "easeInOut", delay: 0.15 }}
        style={{ transform: "translateX(7px)" }}
      />
      {[20, 380].map((x) => (
        <g key={x} stroke={GOLD} strokeWidth="2" opacity="0.85">
          <line x1={x - 12} y1="600" x2={x + 12} y2="600" />
          <line x1={x - 8} y1="586" x2={x + 8} y2="586" />
        </g>
      ))}
    </svg>
  );
}

/* ── a kalash finial with a fan of peacock feathers (crowns the hero) ─────── */
export function Finial({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 150" fill="none" aria-hidden className={className}>
      {/* three feathers fanning upward from the kalash mouth */}
      <g className="myr-plume">
        {[-24, 0, 24].map((a, i) => (
          <EyeFeather
            key={i}
            x={70}
            y={92}
            rot={180 + a}
            len={78}
            mid={i === 1 ? TEAL : BLUE}
            crest={i === 1 ? BLUE : TEAL}
          />
        ))}
      </g>
      {/* kalash */}
      <g stroke={GOLD} strokeWidth="1.6" strokeLinejoin="round">
        <path d="M54 96 C48 102 48 124 56 134 C60 138 80 138 84 134 C92 124 92 102 86 96 Z" fill={SAFFRON} fillOpacity="0.5" />
        <path d="M52 96 L88 96" strokeWidth="2" />
        <path d="M56 110 Q70 116 84 110" opacity="0.7" />
        <path d="M58 124 Q70 130 82 124" opacity="0.5" />
        <path d="M62 134 L78 134" strokeWidth="2" />
      </g>
    </svg>
  );
}

/* ── a symmetric gold flourish with a peacock-eye centre (section headings) ── */
export function HeadFlourish({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 48" fill="none" aria-hidden className={className}>
      <g stroke={GOLD} strokeWidth="1.4" fill="none" opacity="0.85">
        <path d="M110 24 C 82 24 72 13 44 15 C 22 16 16 25 24 31 C 30 35 38 31 36 25" />
        <path d="M110 24 C 138 24 148 13 176 15 C 198 16 204 25 196 31 C 190 35 182 31 184 25" />
        <path d="M64 24 q -6 -9 -16 -9" opacity="0.5" />
        <path d="M156 24 q 6 -9 16 -9" opacity="0.5" />
      </g>
      <g>
        <ellipse cx="44" cy="15" rx="4" ry="5" fill={TEAL} /><ellipse cx="44" cy="15" rx="1.8" ry="2.4" fill={GOLD} />
        <ellipse cx="176" cy="15" rx="4" ry="5" fill={TEAL} /><ellipse cx="176" cy="15" rx="1.8" ry="2.4" fill={GOLD} />
      </g>
      <g transform="translate(110 24)">
        <ellipse rx="10" ry="12" fill={GREEN} opacity="0.9" />
        <ellipse rx="7.5" ry="9.5" fill={TEAL} />
        <path d="M0 -7 C 6 -4 6.5 3 0 8 C -6.5 3 -6 -4 0 -7 Z" fill={BLUE} />
        <ellipse rx="3.4" ry="4.6" fill={GOLD} />
        <circle r="1.4" fill={GOLD_DEEP} />
      </g>
    </svg>
  );
}

/* ── a small line-art Ganesha (auspicious, tops the invitation) ───────────── */
export function Ganesha({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden className={className}>
      <g stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M60 14 L52 30 L68 30 Z" fill={SAFFRON} opacity="0.7" />
        <circle cx="60" cy="12" r="2.4" fill={GOLD} />
        <circle cx="60" cy="52" r="20" fill={TEAL} fillOpacity="0.12" />
        <path d="M40 46 C28 40 24 54 30 64 C36 72 44 66 44 60" />
        <path d="M80 46 C92 40 96 54 90 64 C84 72 76 66 76 60" />
        <circle cx="34" cy="55" r="3" fill={GOLD} stroke="none" />
        <circle cx="86" cy="55" r="3" fill={GOLD} stroke="none" />
        <circle cx="53" cy="49" r="1.6" fill={GOLD} stroke="none" />
        <circle cx="67" cy="49" r="1.6" fill={GOLD} stroke="none" />
        <line x1="60" y1="42" x2="60" y2="50" />
        <path d="M60 56 C60 70 50 74 46 84 C43 92 50 98 58 94" />
        <path d="M52 66 L48 74" />
        <path d="M68 66 L72 74" />
        <path d="M36 100 Q60 86 84 100 Q60 112 36 100 Z" fill={SAFFRON} opacity="0.4" strokeWidth="1.4" />
      </g>
    </svg>
  );
}

/* ── a concentric mandala (slow-spinning section backdrop) ────────────────── */
export function Mandala({ className }: { className?: string }) {
  const rings = [
    { n: 16, d: "M100 100 C 94 68 94 40 100 22 C 106 40 106 68 100 100 Z", w: 0.8, o: 0.4 },
    { n: 12, d: "M100 100 C 93 78 93 60 100 50 C 107 60 107 78 100 100 Z", w: 1, o: 0.55 },
    { n: 24, d: "M100 100 L100 30", w: 0.4, o: 0.2 },
  ];
  return (
    <svg viewBox="0 0 200 200" fill="none" aria-hidden className={className}>
      <g stroke={TEAL}>
        <circle cx="100" cy="100" r="84" strokeWidth="0.6" opacity="0.22" />
        <circle cx="100" cy="100" r="52" strokeWidth="0.6" opacity="0.22" />
        <circle cx="100" cy="100" r="30" strokeWidth="0.6" opacity="0.22" />
        {rings.map((ring, ri) =>
          Array.from({ length: ring.n }).map((_, i) => (
            <path
              key={`${ri}-${i}`}
              d={ring.d}
              strokeWidth={ring.w}
              opacity={ring.o}
              stroke={ri === 1 ? GOLD : TEAL}
              transform={`rotate(${(360 / ring.n) * i} 100 100)`}
            />
          ))
        )}
        <circle cx="100" cy="100" r="4" fill={GOLD} stroke="none" />
      </g>
    </svg>
  );
}

/* ── a lotus bloom (line-art) ─────────────────────────────────────────────── */
export function Lotus({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 70" fill="none" aria-hidden className={className}>
      <g stroke={GOLD} strokeWidth="1.6" strokeLinejoin="round" fill="none">
        <path d="M60 64 C54 44 54 26 60 12 C66 26 66 44 60 64 Z" fill={PINK} fillOpacity="0.22" />
        <path d="M60 64 C44 48 38 32 40 18 C52 26 58 44 60 60" />
        <path d="M60 64 C76 48 82 32 80 18 C68 26 62 44 60 60" />
        <path d="M60 64 C34 56 20 44 16 32 C34 34 50 48 60 62" />
        <path d="M60 64 C86 56 100 44 104 32 C86 34 70 48 60 62" />
        <path d="M8 64 Q60 54 112 64" strokeWidth="1.2" opacity="0.7" />
      </g>
    </svg>
  );
}

/* ── a kalash (sacred pot with coconut & mango leaves) ────────────────────── */
export function Kalash({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 110" fill="none" aria-hidden className={className}>
      <g stroke={GOLD} strokeWidth="1.6" strokeLinejoin="round">
        {[-40, -22, 0, 22, 40].map((a, i) => (
          <path key={i} d="M40 44 C34 30 36 16 40 8 C44 16 46 30 40 44 Z" fill={GREEN} fillOpacity="0.8" transform={`rotate(${a} 40 44)`} />
        ))}
        <circle cx="40" cy="14" r="8" fill={SAFFRON} fillOpacity="0.55" />
        <path d="M24 46 C18 52 18 78 26 92 C30 98 50 98 54 92 C62 78 62 52 56 46 Z" fill={TEAL} fillOpacity="0.35" />
        <path d="M22 46 L58 46" />
        <path d="M26 60 Q40 66 54 60" opacity="0.7" />
        <path d="M28 74 Q40 80 52 74" opacity="0.5" />
        <path d="M28 96 L52 96" strokeWidth="2" />
      </g>
    </svg>
  );
}

/* ── a diya (oil lamp) with a live flame ──────────────────────────────────── */
export function Diya({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 70" fill="none" aria-hidden className={className}>
      <ellipse cx="40" cy="28" rx="12" ry="16" fill={GOLD_LITE} opacity="0.28" className="myr-glow" />
      <path d="M40 44 C33 36 35 22 40 12 C45 22 47 36 40 44 Z" fill={GOLD_LITE} className="myr-flame" />
      <path d="M40 42 C36 36 37 26 40 18 C43 26 44 36 40 42 Z" fill="#fff6df" className="myr-flame" />
      <path d="M12 48 C12 44 20 44 40 44 C60 44 68 44 68 48 C68 60 56 66 40 66 C24 66 12 60 12 48 Z" fill={SAFFRON} fillOpacity="0.5" stroke={GOLD} strokeWidth="1.6" />
      <path d="M8 50 Q40 62 72 50" stroke={GOLD} strokeWidth="1.4" opacity="0.7" fill="none" />
    </svg>
  );
}

/* ── a marigold-&-leaf toran (auspicious doorway string) ──────────────────── */
export function MarigoldToran({ className }: { className?: string }) {
  const n = 15;
  return (
    <svg viewBox="0 0 400 54" fill="none" preserveAspectRatio="none" aria-hidden className={className}>
      <path d="M0 6 Q200 30 400 6" stroke={GREEN} strokeWidth="1.6" fill="none" opacity="0.8" />
      {Array.from({ length: n }).map((_, i) => {
        const x = 12 + i * ((400 - 24) / (n - 1));
        const t = (x - 200) / 200;
        const y = 6 + 22 * (1 - t * t);
        const marigold = i % 2 === 0;
        const drop = marigold ? 20 : 12;
        return (
          <g key={i}>
            <line x1={x} y1={y} x2={x} y2={y + drop} stroke={GREEN} strokeWidth="0.8" opacity="0.7" />
            {marigold ? (
              <g transform={`translate(${x} ${y + drop + 8})`} className="myr-bud">
                {Array.from({ length: 10 }).map((_, k) => (
                  <ellipse key={k} cx="0" cy="-5" rx="2.4" ry="5" fill={SAFFRON} opacity="0.9" transform={`rotate(${k * 36})`} />
                ))}
                <circle r="3" fill={GOLD_LITE} />
              </g>
            ) : (
              <path d={`M${x} ${y + drop} C${x - 4} ${y + drop + 4} ${x - 4} ${y + drop + 12} ${x} ${y + drop + 14} C${x + 4} ${y + drop + 12} ${x + 4} ${y + drop + 4} ${x} ${y + drop} Z`} fill={GREEN} opacity="0.85" />
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ── a hanging brass lamp (hanging diya lantern) with a flame ─────────────── */
export function HangingLamp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 150" fill="none" aria-hidden className={className}>
      <line x1="40" y1="0" x2="40" y2="20" stroke={GOLD} strokeWidth="1.4" opacity="0.7" />
      <g stroke={GOLD} strokeWidth="1.8" strokeLinejoin="round">
        <path d="M22 30 C22 24 58 24 58 30 C58 42 48 48 40 48 C32 48 22 42 22 30 Z" fill={TEAL} fillOpacity="0.35" />
        <path d="M26 30 L54 30" />
        {/* chains */}
        <line x1="24" y1="30" x2="40" y2="20" opacity="0.7" />
        <line x1="56" y1="30" x2="40" y2="20" opacity="0.7" />
        {/* bowl + finial */}
        <path d="M28 48 C28 62 34 72 40 72 C46 72 52 62 52 48 Z" fill={SAFFRON} fillOpacity="0.45" />
        <line x1="40" y1="72" x2="40" y2="86" />
        <circle cx="40" cy="90" r="4" fill={GOLD} />
      </g>
      <ellipse cx="40" cy="40" rx="9" ry="12" fill={GOLD_LITE} opacity="0.3" className="myr-glow" />
      <path d="M40 50 C34 44 36 34 40 26 C44 34 46 44 40 50 Z" fill={GOLD_LITE} className="myr-flame" />
      <path d="M40 48 C37 44 38 38 40 32 C42 38 43 44 40 48 Z" fill="#fff6df" className="myr-flame" />
    </svg>
  );
}

/* ── an ornamental gold divider with a peacock-feather centre ──────────────── */
export function GoldDivider({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 24" fill="none" aria-hidden className={className}>
      <g stroke={GOLD} strokeWidth="1.4" fill="none">
        <line x1="8" y1="12" x2="104" y2="12" opacity="0.7" />
        <line x1="156" y1="12" x2="252" y2="12" opacity="0.7" />
        <path d="M104 12 q10 -6 20 0 q-10 6 -20 0 Z" fill={GOLD} fillOpacity="0.25" stroke="none" />
        <path d="M156 12 q-10 -6 -20 0 q10 6 20 0 Z" fill={GOLD} fillOpacity="0.25" stroke="none" />
        <circle cx="102" cy="12" r="1.6" fill={GOLD} stroke="none" />
        <circle cx="158" cy="12" r="1.6" fill={GOLD} stroke="none" />
      </g>
      {/* the eye at the centre */}
      <g transform="translate(130 12)">
        <ellipse cx="0" cy="0" rx="8" ry="9" fill={GREEN} opacity="0.9" />
        <ellipse cx="0" cy="0" rx="6" ry="7" fill={TEAL} />
        <ellipse cx="0" cy="0" rx="3" ry="4" fill={GOLD} />
        <circle cx="0" cy="0" r="1.4" fill={GOLD_DEEP} />
      </g>
    </svg>
  );
}

/* ── a corner peacock-vine filigree for cards & sections ──────────────────── */
export function CornerVine({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 90 90" fill="none" aria-hidden className={className}>
      <g stroke={GOLD} strokeWidth="1.3" fill="none">
        <path d="M4 4 C4 34 14 54 44 60 M4 4 C34 4 54 14 60 44" opacity="0.8" />
        <path d="M4 4 C22 10 30 18 34 34" opacity="0.5" />
      </g>
      <g>
        <ellipse cx="60" cy="44" rx="4" ry="5" fill={TEAL} />
        <ellipse cx="60" cy="44" rx="1.8" ry="2.4" fill={GOLD} />
        <ellipse cx="44" cy="60" rx="4" ry="5" fill={TEAL} />
        <ellipse cx="44" cy="60" rx="1.8" ry="2.4" fill={GOLD} />
      </g>
      <circle cx="52" cy="52" r="3" fill={PINK} />
    </svg>
  );
}

/* ── the golden mandap skyline behind the couple ──────────────────────────── */
export function MandapScene({ className }: { className?: string }) {
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
      {dome(400, base, 120, 96, "c")}
      {dome(270, base, 84, 70, "l1")}
      {dome(530, base, 84, 70, "r1")}
      {dome(150, base, 64, 54, "l2")}
      {dome(650, base, 64, 54, "r2")}
      {dome(60, base, 44, 40, "l3")}
      {dome(740, base, 44, 40, "r3")}
      <rect x="20" y={base - 26} width="760" height="26" />
    </g>
  );
  return (
    <svg viewBox="0 0 800 360" fill="none" aria-hidden className={className} preserveAspectRatio="xMidYMax slice">
      {skyline(196, "var(--myr-palace-far)", 0.5)}
      {skyline(200, "var(--myr-palace)", 0.95)}
      {Array.from({ length: 40 }).map((_, i) => (
        <circle
          key={i}
          cx={40 + i * 19}
          cy={182 + (i % 3) * 6}
          r={i % 4 === 0 ? 2 : 1.3}
          fill={GOLD_LITE}
          className="myr-twinkle"
          style={{ animationDelay: `${(i % 7) * 0.4}s` }}
        />
      ))}
      <g stroke={GOLD} strokeWidth="1.2" opacity="0.5" fill="none" className="myr-birds">
        <path d="M120 90 q6 -6 12 0 q6 -6 12 0" />
        <path d="M150 104 q5 -5 10 0 q5 -5 10 0" />
        <path d="M96 112 q4 -4 8 0 q4 -4 8 0" />
      </g>
      <g transform="translate(0 400) scale(1 -1)" opacity="0.22">
        {skyline(200, "var(--myr-palace)", 0.9)}
      </g>
    </svg>
  );
}

/* ── the bride & groom, front-facing, in festive colour ───────────────────── */
export function Couple({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 320" fill="none" aria-hidden className={className}>
      {/* ground line */}
      <g stroke={GOLD} opacity="0.75">
        <line x1="20" y1="300" x2="280" y2="300" strokeWidth="3" />
        <path d="M40 300 Q150 288 260 300" strokeWidth="1.4" fill="none" opacity="0.6" />
      </g>

      {/* ── GROOM (left) — cream sherwani, teal safa, gold work ── */}
      <g>
        {/* churidar legs */}
        <path d="M92 300 L96 236 L112 236 L110 300 Z" fill="var(--myr-champagne)" stroke={GOLD} strokeWidth="1" />
        <path d="M114 300 L112 236 L128 236 L124 300 Z" fill="var(--myr-champagne)" stroke={GOLD} strokeWidth="1" />
        {/* sherwani coat */}
        <path
          d="M86 240 C82 196 84 168 96 150 C102 140 116 136 124 136 C132 136 146 140 152 150 C164 168 166 196 162 240 Z"
          fill="var(--myr-ivory)"
          stroke={GOLD}
          strokeWidth="1.4"
        />
        {/* teal stole (dupatta) over one shoulder */}
        <path d="M124 138 C140 148 150 172 150 210 C150 232 148 240 148 240 L160 240 C162 196 158 160 140 142 Z" fill={TEAL} opacity="0.9" stroke={GOLD} strokeWidth="0.8" />
        {/* placket + buttons */}
        <line x1="124" y1="142" x2="124" y2="236" stroke={GOLD} strokeWidth="1" opacity="0.7" />
        {[158, 176, 194, 212].map((y, i) => (
          <circle key={i} cx="124" cy={y} r="1.8" fill={GOLD} />
        ))}
        {/* arms at sides */}
        <path d="M92 156 C82 172 80 196 84 216 L92 214 C90 194 92 172 100 158 Z" fill="var(--myr-ivory)" stroke={GOLD} strokeWidth="1" />
        <path d="M156 156 C166 172 168 196 164 216 L156 214 C158 194 156 172 148 158 Z" fill="var(--myr-ivory)" stroke={GOLD} strokeWidth="1" />
        {/* neck + head */}
        <rect x="118" y="120" width="14" height="18" fill="var(--myr-skin)" />
        <circle cx="125" cy="110" r="15" fill="var(--myr-skin)" />
        {/* beard */}
        <path d="M113 110 C113 124 137 124 137 110 C133 118 117 118 113 110 Z" fill="var(--myr-hair)" opacity="0.9" />
        {/* safa (turban) with kalgi */}
        <path d="M110 104 C110 88 140 88 140 104 C140 96 132 92 125 92 C118 92 110 96 110 104 Z" fill={PINK} stroke={GOLD} strokeWidth="1" />
        <path d="M110 104 Q125 96 140 104" stroke={GOLD} strokeWidth="1" fill="none" />
        <path d="M138 100 L150 96" stroke={PINK} strokeWidth="4" strokeLinecap="round" />
        <line x1="126" y1="90" x2="126" y2="80" stroke={GOLD} strokeWidth="1.2" />
        <circle cx="126" cy="78" r="2.6" fill={GOLD_LITE} stroke={GOLD} strokeWidth="0.6" />
      </g>

      {/* ── BRIDE (right) — rani-pink lehenga, gold border, dupatta ── */}
      <g>
        {/* flaring lehenga */}
        <path
          d="M150 300 C150 250 156 206 170 182 C176 172 190 168 198 168 C206 168 220 172 226 182 C240 206 246 252 250 300 Z"
          fill={PINK}
          stroke={GOLD}
          strokeWidth="1.4"
        />
        <path d="M150 300 Q200 288 250 300" stroke={GOLD_LITE} strokeWidth="3" fill="none" />
        <path d="M164 262 Q200 252 236 262" stroke={GOLD} strokeWidth="1" fill="none" opacity="0.6" />
        {/* choli */}
        <path d="M182 170 C178 156 184 146 198 146 C212 146 218 156 214 170 Z" fill="var(--myr-pink-deep)" stroke={GOLD} strokeWidth="1" />
        {/* dupatta draped over head + across */}
        <path d="M176 128 C168 150 168 176 182 188 L176 172 C170 156 172 140 182 130 Z" fill={SAFFRON} opacity="0.85" stroke={GOLD} strokeWidth="0.7" />
        <path d="M220 130 C230 140 232 156 226 172 L220 188 C234 176 234 150 226 128 Z" fill={SAFFRON} opacity="0.85" stroke={GOLD} strokeWidth="0.7" />
        {/* arms with bangles */}
        <path d="M182 158 C172 172 170 194 176 212 L184 210 C180 192 182 172 190 160 Z" fill="var(--myr-skin)" />
        <path d="M214 158 C224 172 226 194 220 212 L212 210 C216 192 214 172 206 160 Z" fill="var(--myr-skin)" />
        {[200, 206].map((y, i) => (
          <g key={i}>
            <path d={`M175 ${y} L185 ${y - 1}`} stroke={GOLD} strokeWidth="1.4" />
            <path d={`M213 ${y} L223 ${y - 1}`} stroke={GOLD} strokeWidth="1.4" />
          </g>
        ))}
        {/* neck + head */}
        <rect x="192" y="128" width="12" height="16" fill="var(--myr-skin)" />
        <circle cx="198" cy="118" r="14" fill="var(--myr-skin)" />
        {/* hair + dupatta crown */}
        <path d="M184 116 C182 100 190 92 198 92 C206 92 214 100 212 116 C208 106 188 106 184 116 Z" fill="var(--myr-hair)" />
        <path d="M182 112 C182 102 214 102 214 112 C214 104 206 98 198 98 C190 98 182 104 182 112 Z" fill={SAFFRON} opacity="0.9" stroke={GOLD} strokeWidth="0.8" />
        {/* maang tikka + earrings + necklace */}
        <line x1="198" y1="104" x2="198" y2="112" stroke={GOLD} strokeWidth="1" />
        <circle cx="198" cy="113" r="2" fill={GOLD_LITE} />
        <circle cx="188" cy="122" r="1.6" fill={GOLD} />
        <circle cx="208" cy="122" r="1.6" fill={GOLD} />
        <path d="M190 138 Q198 146 206 138" stroke={GOLD} strokeWidth="1.4" fill="none" />
        {/* bindi */}
        <circle cx="198" cy="112" r="1.4" fill="var(--myr-pink-deep)" />
      </g>

      {/* a shared varmala (garland) arc between them */}
      <path d="M120 150 C150 130 176 130 204 150" stroke={SAFFRON} strokeWidth="3.4" fill="none" opacity="0.85" strokeLinecap="round" />
      {Array.from({ length: 9 }).map((_, i) => {
        const t = i / 8;
        const x = 120 + t * 84;
        const y = 150 - Math.sin(t * Math.PI) * 20;
        return <circle key={i} cx={x} cy={y} r="2.4" fill={i % 2 ? GOLD_LITE : SAFFRON} />;
      })}
    </svg>
  );
}

/* ── peacock feathers drifting down the page (deterministic → SSR-stable) ──── */
export function FeatherFall({ className }: { className?: string }) {
  const feathers = [
    { left: 7, delay: 0, dur: 20, size: 20, rot: -18, drift: 30 },
    { left: 19, delay: 6, dur: 25, size: 15, rot: 22, drift: -26 },
    { left: 31, delay: 11, dur: 22, size: 18, rot: -10, drift: 34 },
    { left: 44, delay: 3, dur: 27, size: 13, rot: 16, drift: -30 },
    { left: 56, delay: 9, dur: 21, size: 21, rot: -24, drift: 28 },
    { left: 68, delay: 15, dur: 26, size: 16, rot: 12, drift: -34 },
    { left: 80, delay: 4, dur: 23, size: 18, rot: -14, drift: 30 },
    { left: 91, delay: 12, dur: 24, size: 14, rot: 20, drift: -24 },
  ];
  return (
    <div className={className} aria-hidden>
      {feathers.map((p, i) => (
        <span
          key={i}
          className="myr-feather"
          style={
            {
              left: `${p.left}%`,
              width: `${p.size}px`,
              animationDelay: `-${p.delay}s`,
              animationDuration: `${p.dur}s`,
              ["--drift" as string]: `${p.drift}px`,
              ["--rot" as string]: `${p.rot}deg`,
            } as React.CSSProperties
          }
        >
          <PeacockFeather className="block h-auto w-full" />
        </span>
      ))}
    </div>
  );
}

/* ── ceremony icons — matched to each rite by name ────────────────────────── */
function IconHaldi() {
  return (
    <g stroke={GOLD} strokeWidth="1.5" fill="none">
      {Array.from({ length: 12 }).map((_, i) => (
        <ellipse key={i} cx="24" cy="12" rx="3" ry="6" fill={SAFFRON} fillOpacity="0.55" transform={`rotate(${i * 30} 24 24)`} />
      ))}
      <circle cx="24" cy="24" r="5" fill={GOLD_LITE} />
    </g>
  );
}
function IconMehendi() {
  return (
    <g stroke={GOLD} strokeWidth="1.5" fill="none">
      <path d="M24 42 C12 34 10 20 20 12 C28 6 38 12 36 22 C34 30 24 30 24 22" fill={GREEN} fillOpacity="0.2" />
      <circle cx="24" cy="24" r="2" fill={GOLD} stroke="none" />
      <path d="M24 34 C18 30 17 22 22 17" opacity="0.7" />
    </g>
  );
}
function IconSangeet() {
  return (
    <g stroke={GOLD} strokeWidth="1.5" fill="none">
      <ellipse cx="20" cy="26" rx="9" ry="11" fill={PINK} fillOpacity="0.3" />
      <ellipse cx="20" cy="26" rx="9" ry="11" />
      <path d="M11 26 L29 26" opacity="0.6" />
      <circle cx="34" cy="16" r="3" fill={GOLD} stroke="none" />
      <path d="M37 16 L37 6 L41 8" />
    </g>
  );
}
function IconWedding() {
  return (
    <g stroke={GOLD} strokeWidth="1.5" fill="none">
      <path d="M24 8 C20 16 27 18 24 26 C30 22 30 14 24 8 Z" fill={SAFFRON} fillOpacity="0.6" />
      <path d="M24 16 C22 20 26 22 24 26" />
      <path d="M12 30 L36 30 L32 40 L16 40 Z" fill={TEAL} fillOpacity="0.2" />
      <path d="M14 30 L34 30" />
    </g>
  );
}
function IconReception() {
  return (
    <g stroke={GOLD} strokeWidth="1.5" fill="none">
      <path d="M14 10 L22 10 L20 22 C20 26 16 26 16 22 Z" fill={TEAL} fillOpacity="0.3" />
      <path d="M18 26 L18 38 M14 38 L22 38" />
      <path d="M26 10 L34 10 L32 22 C32 26 28 26 28 22 Z" fill={TEAL} fillOpacity="0.3" />
      <path d="M30 26 L30 38 M26 38 L34 38" />
      <circle cx="24" cy="8" r="1.4" fill={GOLD} stroke="none" />
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
