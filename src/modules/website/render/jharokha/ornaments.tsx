"use client";

import { m } from "motion/react";

/**
 * THE JHAROKHA — ornament system for the full royal wedding site.
 *
 * Every decoration is hand-drawn SVG driven by the theme's --jhr-* tokens — no
 * external images — so it stays crisp at any size, recolours with the palette,
 * and animates (draw-in, sway, flicker, drift). Continuous motion lives in CSS
 * (.jhr-* classes) and collapses under prefers-reduced-motion; one-shot
 * entrances use Framer's `m`.
 *
 * Motif vocabulary: cusped jharokha arch, Ganesha, mandala, lotus, kalash,
 * diya, paisley, mango-leaf toran, hanging bells, rose garlands, a domed palace
 * mirrored in a dusk lake, an illustrated couple, lanterns, gold dividers, and
 * a ceremony-icon set (haldi / mehendi / sangeet / wedding / reception).
 */

const GOLD = "var(--jhr-gold)";
const GOLD_LITE = "var(--jhr-gold-lite)";
const ROSE = "var(--jhr-rose)";
const ROSE_DEEP = "var(--jhr-rose-deep)";
const LEAF = "var(--jhr-leaf)";

/* ── a single rose blossom (layered petals + gold heart) ─────────────────── */
function Blossom({
  cx,
  cy,
  r,
  fill = ROSE,
  petals = 6,
}: {
  cx: number;
  cy: number;
  r: number;
  fill?: string;
  petals?: number;
}) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      {Array.from({ length: petals }).map((_, i) => (
        <ellipse
          key={i}
          rx={r * 0.52}
          ry={r}
          cx={0}
          cy={-r * 0.55}
          fill={fill}
          opacity={0.92}
          transform={`rotate(${(360 / petals) * i})`}
        />
      ))}
      <circle r={r * 0.42} fill={GOLD_LITE} />
      <circle r={r * 0.18} fill={GOLD} />
    </g>
  );
}

/* ── a hanging garland cascade of roses + leaves for a top corner ─────────── */
export function FloralCascade({
  side,
  className,
}: {
  side: "left" | "right";
  className?: string;
}) {
  const nodes = [
    { x: 40, y: 26, r: 26, f: ROSE },
    { x: 96, y: 20, r: 20, f: ROSE_DEEP },
    { x: 150, y: 40, r: 24, f: ROSE },
    { x: 26, y: 88, r: 22, f: ROSE_DEEP },
    { x: 84, y: 96, r: 27, f: ROSE },
    { x: 138, y: 118, r: 18, f: ROSE_DEEP },
    { x: 44, y: 168, r: 20, f: ROSE },
    { x: 96, y: 186, r: 22, f: ROSE_DEEP },
    { x: 30, y: 246, r: 16, f: ROSE },
    { x: 74, y: 276, r: 18, f: ROSE },
    { x: 40, y: 330, r: 12, f: ROSE_DEEP },
  ];
  const leaves = [
    { x: 68, y: 54, rot: 30 },
    { x: 120, y: 78, rot: -20 },
    { x: 48, y: 128, rot: 45 },
    { x: 116, y: 150, rot: -30 },
    { x: 62, y: 214, rot: 40 },
    { x: 96, y: 236, rot: -25 },
    { x: 54, y: 300, rot: 35 },
  ];
  return (
    <svg
      viewBox="0 0 220 360"
      fill="none"
      aria-hidden
      className={className}
      style={{ transform: side === "right" ? "scaleX(-1)" : undefined }}
    >
      {[16, 62, 118, 172].map((x, i) => (
        <path
          key={`s${i}`}
          d={`M${x} 6 q ${i % 2 ? 10 : -10} ${120 + i * 26} ${i % 2 ? 4 : -4} ${190 + i * 28}`}
          stroke={LEAF}
          strokeWidth="1.4"
          opacity="0.5"
        />
      ))}
      {leaves.map((l, i) => (
        <ellipse
          key={`l${i}`}
          cx={l.x}
          cy={l.y}
          rx="6"
          ry="13"
          fill={LEAF}
          opacity="0.85"
          transform={`rotate(${l.rot} ${l.x} ${l.y})`}
        />
      ))}
      {nodes.map((n, i) => (
        <Blossom key={`b${i}`} cx={n.x} cy={n.y} r={n.r} fill={n.f} />
      ))}
    </svg>
  );
}

/* ── the cusped jharokha arch that frames the hero ────────────────────────── */
export function ArchFrame({ className }: { className?: string }) {
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
      <m.path
        d={arch}
        stroke={GOLD}
        strokeWidth="2.4"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.9 }}
        transition={{ duration: 2.2, ease: "easeInOut" }}
      />
      <m.path
        d={arch}
        stroke={GOLD_LITE}
        strokeWidth="0.8"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.7 }}
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

/* ── a small line-art Ganesha (auspicious, tops the invitation) ───────────── */
export function Ganesha({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden className={className}>
      <g stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M60 14 L52 30 L68 30 Z" fill={GOLD_LITE} opacity="0.85" />
        <circle cx="60" cy="12" r="2.4" fill={GOLD} />
        <circle cx="60" cy="52" r="20" />
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

/* ── a concentric mandala (slow-spinning section backdrop) ────────────────── */
export function Mandala({ className }: { className?: string }) {
  const rings = [
    { n: 16, d: "M100 100 C 94 68 94 40 100 22 C 106 40 106 68 100 100 Z", w: 0.8, o: 0.4 },
    { n: 12, d: "M100 100 C 93 78 93 60 100 50 C 107 60 107 78 100 100 Z", w: 1, o: 0.55 },
    { n: 24, d: "M100 100 L100 30", w: 0.4, o: 0.2 },
  ];
  return (
    <svg viewBox="0 0 200 200" fill="none" aria-hidden className={className}>
      <g stroke={GOLD}>
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
        <path d="M60 64 C54 44 54 26 60 12 C66 26 66 44 60 64 Z" fill={GOLD_LITE} fillOpacity="0.25" />
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
        {/* mango leaves fanning from the rim */}
        {[-40, -22, 0, 22, 40].map((a, i) => (
          <path
            key={i}
            d="M40 44 C34 30 36 16 40 8 C44 16 46 30 40 44 Z"
            fill={LEAF}
            fillOpacity="0.8"
            transform={`rotate(${a} 40 44)`}
          />
        ))}
        {/* coconut */}
        <circle cx="40" cy="14" r="8" fill={GOLD_LITE} fillOpacity="0.5" />
        {/* pot */}
        <path
          d="M24 46 C18 52 18 78 26 92 C30 98 50 98 54 92 C62 78 62 52 56 46 Z"
          fill="var(--jhr-saffron)"
          fillOpacity="0.35"
        />
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
      {/* flame glow + flame */}
      <ellipse cx="40" cy="28" rx="12" ry="16" fill={GOLD_LITE} opacity="0.28" className="jhr-glow" />
      <path d="M40 44 C33 36 35 22 40 12 C45 22 47 36 40 44 Z" fill={GOLD_LITE} className="jhr-flame" />
      <path d="M40 42 C36 36 37 26 40 18 C43 26 44 36 40 42 Z" fill="#fff6df" className="jhr-flame" />
      {/* lamp body */}
      <path d="M12 48 C12 44 20 44 40 44 C60 44 68 44 68 48 C68 60 56 66 40 66 C24 66 12 60 12 48 Z" fill="var(--jhr-saffron)" fillOpacity="0.5" stroke={GOLD} strokeWidth="1.6" />
      <path d="M8 50 Q40 62 72 50" stroke={GOLD} strokeWidth="1.4" opacity="0.7" fill="none" />
    </svg>
  );
}

/* ── a paisley (buta) flourish ────────────────────────────────────────────── */
export function Paisley({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 90" fill="none" aria-hidden className={className}>
      <g stroke={GOLD} strokeWidth="1.4" fill="none">
        <path d="M30 86 C10 74 8 44 24 26 C36 12 52 16 52 34 C52 50 34 52 30 40 C28 32 36 30 40 36" fill={GOLD_LITE} fillOpacity="0.18" />
        <path d="M30 78 C16 68 15 46 26 32" opacity="0.6" />
        <circle cx="34" cy="40" r="2" fill={GOLD} stroke="none" />
        <circle cx="26" cy="54" r="1.6" fill={GOLD} stroke="none" />
      </g>
    </svg>
  );
}

/* ── a mango-leaf toran (auspicious doorway string) ───────────────────────── */
export function MangoToran({ className }: { className?: string }) {
  const n = 15;
  return (
    <svg viewBox="0 0 400 46" fill="none" preserveAspectRatio="none" aria-hidden className={className}>
      <path d="M0 6 Q200 26 400 6" stroke={GOLD} strokeWidth="1.4" fill="none" opacity="0.8" />
      {Array.from({ length: n }).map((_, i) => {
        const x = 12 + i * ((400 - 24) / (n - 1));
        const t = (x - 200) / 200;
        const y = 6 + 18 * (1 - t * t);
        const len = i % 2 ? 20 : 30;
        return (
          <g key={i}>
            <path
              d={`M${x} ${y} C${x - 6} ${y + len * 0.5} ${x - 5} ${y + len} ${x} ${y + len} C${x + 5} ${y + len} ${x + 6} ${y + len * 0.5} ${x} ${y} Z`}
              fill={LEAF}
              fillOpacity="0.85"
            />
            <line x1={x} y1={y} x2={x} y2={y + len} stroke="var(--jhr-gold-deep)" strokeWidth="0.6" />
          </g>
        );
      })}
    </svg>
  );
}

/* ── a hanging temple bell ────────────────────────────────────────────────── */
function Bell({ x, len }: { x: number; len: number }) {
  return (
    <g transform={`translate(${x} 0)`} className="jhr-bell">
      <line x1="0" y1="0" x2="0" y2={len} stroke={GOLD} strokeWidth="1.2" opacity="0.7" />
      <g transform={`translate(0 ${len})`}>
        <path d="M-9 14 C-9 2 -5 -4 0 -4 C5 -4 9 2 9 14 Z" fill={GOLD} opacity="0.95" />
        <path d="M-11 14 L11 14 L9 18 L-9 18 Z" fill={GOLD_LITE} />
        <circle cx="0" cy="21" r="2.4" fill={GOLD} />
        <circle cx="0" cy="-5" r="2" fill={GOLD_LITE} />
      </g>
    </g>
  );
}

export function HangingBells({ className }: { className?: string }) {
  const bells = [
    { x: 30, len: 40 },
    { x: 80, len: 62 },
    { x: 210, len: 62 },
    { x: 260, len: 40 },
  ];
  return (
    <svg viewBox="0 0 290 90" fill="none" aria-hidden className={className}>
      {bells.map((b, i) => (
        <Bell key={i} x={b.x} len={b.len} />
      ))}
    </svg>
  );
}

/* ── the palace + dusk lake behind the couple ─────────────────────────────── */
export function PalaceScene({ className }: { className?: string }) {
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
      {skyline(196, "var(--jhr-palace-far)", 0.55)}
      {skyline(200, "var(--jhr-palace)", 0.92)}
      {Array.from({ length: 40 }).map((_, i) => (
        <circle
          key={i}
          cx={40 + i * 19}
          cy={182 + (i % 3) * 6}
          r={i % 4 === 0 ? 2 : 1.3}
          fill={GOLD_LITE}
          className="jhr-twinkle"
          style={{ animationDelay: `${(i % 7) * 0.4}s` }}
        />
      ))}
      {/* birds drifting over the palace */}
      <g stroke={GOLD} strokeWidth="1.2" opacity="0.5" fill="none" className="jhr-birds">
        <path d="M120 90 q6 -6 12 0 q6 -6 12 0" />
        <path d="M150 104 q5 -5 10 0 q5 -5 10 0" />
        <path d="M96 112 q4 -4 8 0 q4 -4 8 0" />
      </g>
      <g transform="translate(0 400) scale(1 -1)" opacity="0.28">
        {skyline(200, "var(--jhr-palace)", 0.9)}
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
export function Couple({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 320" fill="none" aria-hidden className={className}>
      <g stroke={GOLD} opacity="0.8">
        <line x1="10" y1="300" x2="290" y2="300" strokeWidth="3" />
        <line x1="10" y1="266" x2="290" y2="266" strokeWidth="2" />
        {Array.from({ length: 13 }).map((_, i) => (
          <line key={i} x1={22 + i * 21} y1="268" x2={22 + i * 21} y2="299" strokeWidth="2" />
        ))}
      </g>
      {/* groom — cream sherwani */}
      <g>
        <path
          d="M110 300 C104 250 104 200 112 168 C116 150 128 142 140 142 C152 142 162 152 165 170 C170 205 168 255 164 300 Z"
          fill="var(--jhr-champagne)"
          stroke="var(--jhr-gold)"
          strokeWidth="1.4"
        />
        <path
          d="M162 176 C182 172 198 176 206 190 C199 190 190 190 182 194 C174 198 168 196 162 190 Z"
          fill="var(--jhr-champagne)"
          stroke="var(--jhr-gold)"
          strokeWidth="1.2"
        />
        <rect x="132" y="120" width="16" height="18" fill="var(--jhr-champagne)" />
        <circle cx="140" cy="108" r="18" fill="var(--jhr-skin)" />
        <path d="M122 106 C122 92 132 84 140 84 C148 84 158 92 158 106 C150 98 130 98 122 106 Z" fill="var(--jhr-hair)" />
        {[[128, 200], [140, 220], [150, 240], [132, 250], [146, 270]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1.6" fill="var(--jhr-gold)" opacity="0.7" />
        ))}
      </g>
      {/* bride — blush lehenga + dupatta */}
      <g>
        <path
          d="M150 300 C150 250 156 210 168 186 C174 174 186 172 194 174 C204 176 210 188 214 210 C220 244 222 274 224 300 Z"
          fill="var(--jhr-rose)"
          stroke="var(--jhr-gold)"
          strokeWidth="1.4"
        />
        <path
          d="M180 158 C196 150 214 156 222 176 C214 176 206 180 200 188 C194 180 186 168 180 158 Z"
          fill="var(--jhr-rose-deep)"
          opacity="0.9"
          stroke="var(--jhr-gold)"
          strokeWidth="1"
        />
        <rect x="180" y="132" width="13" height="16" fill="var(--jhr-skin)" />
        <circle cx="186" cy="122" r="16" fill="var(--jhr-skin)" />
        <path
          d="M172 118 C170 104 178 96 186 96 C194 96 202 104 200 118 C202 150 198 186 190 210 C188 186 184 150 186 128 C182 150 180 186 178 208 C172 184 170 148 172 118 Z"
          fill="var(--jhr-hair)"
        />
        <circle cx="186" cy="106" r="2.4" fill="var(--jhr-gold-lite)" />
        {[[176, 220], [190, 236], [202, 252], [184, 262], [198, 280], [172, 250]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1.6" fill="var(--jhr-gold)" opacity="0.75" />
        ))}
        <path d="M152 296 Q188 288 222 296" stroke="var(--jhr-gold-lite)" strokeWidth="2" />
      </g>
    </svg>
  );
}

/* ── a hanging garden lantern with a flickering flame ─────────────────────── */
export function Lantern({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 150" fill="none" aria-hidden className={className}>
      <line x1="40" y1="0" x2="40" y2="22" stroke={GOLD} strokeWidth="1.4" opacity="0.7" />
      <g stroke={GOLD} strokeWidth="2" strokeLinejoin="round">
        <path d="M26 30 L40 18 L54 30 Z" fill={GOLD_LITE} opacity="0.9" />
        <path d="M24 30 L56 30 L52 104 L28 104 Z" fill="var(--jhr-lantern-glass)" />
        <line x1="34" y1="30" x2="36" y2="104" />
        <line x1="46" y1="30" x2="44" y2="104" />
        <line x1="26" y1="52" x2="54" y2="52" opacity="0.6" />
        <line x1="26" y1="80" x2="54" y2="80" opacity="0.6" />
        <path d="M26 104 L54 104 L48 116 L32 116 Z" fill={GOLD_LITE} opacity="0.9" />
        <line x1="40" y1="116" x2="40" y2="132" />
        <circle cx="40" cy="136" r="4" fill={GOLD} />
      </g>
      <circle cx="40" cy="66" r="16" fill={GOLD_LITE} opacity="0.28" className="jhr-glow" />
      <path d="M40 78 C34 72 36 62 40 54 C44 62 46 72 40 78 Z" fill={GOLD_LITE} className="jhr-flame" />
      <path d="M40 76 C37 72 38 66 40 60 C42 66 43 72 40 76 Z" fill="#fff6df" className="jhr-flame" />
    </svg>
  );
}

/* ── an ornamental gold divider (paisley/lotus centre) ────────────────────── */
export function GoldDivider({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 24" fill="none" aria-hidden className={className}>
      <g stroke={GOLD} strokeWidth="1.4" fill="none">
        <line x1="8" y1="12" x2="96" y2="12" opacity="0.7" />
        <line x1="164" y1="12" x2="252" y2="12" opacity="0.7" />
        <path d="M96 12 q10 -7 20 0 q-10 7 -20 0 Z" fill={GOLD} fillOpacity="0.25" />
        <path d="M164 12 q-10 -7 -20 0 q10 7 20 0 Z" fill={GOLD} fillOpacity="0.25" />
        <circle cx="130" cy="12" r="6" fill={GOLD_LITE} fillOpacity="0.4" />
        <path d="M130 4 L130 20 M122 12 L138 12 M124 6 L136 18 M136 6 L124 18" opacity="0.7" />
        <circle cx="102" cy="12" r="1.6" fill={GOLD} stroke="none" />
        <circle cx="158" cy="12" r="1.6" fill={GOLD} stroke="none" />
      </g>
    </svg>
  );
}

/* ── a corner floral filigree for cards & sections ────────────────────────── */
export function CornerVine({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 90 90" fill="none" aria-hidden className={className}>
      <g stroke={GOLD} strokeWidth="1.3" fill="none">
        <path d="M4 4 C4 34 14 54 44 60 M4 4 C34 4 54 14 60 44" opacity="0.8" />
        <path d="M4 4 C22 10 30 18 34 34" opacity="0.5" />
      </g>
      <g fill={ROSE}>
        <circle cx="60" cy="44" r="4" />
        <circle cx="44" cy="60" r="4" />
        <circle cx="52" cy="52" r="3" fill={ROSE_DEEP} />
      </g>
      <circle cx="60" cy="44" r="1.6" fill={GOLD_LITE} />
      <circle cx="44" cy="60" r="1.6" fill={GOLD_LITE} />
    </svg>
  );
}

/* ── rose petals drifting down the page (deterministic → SSR-stable) ──────── */
export function PetalFall({ className }: { className?: string }) {
  const petals = [
    { left: 6, delay: 0, dur: 15, size: 15, hue: ROSE, drift: 24 },
    { left: 17, delay: 5, dur: 19, size: 11, hue: ROSE_DEEP, drift: -20 },
    { left: 28, delay: 9, dur: 17, size: 13, hue: ROSE, drift: 30 },
    { left: 39, delay: 2, dur: 21, size: 10, hue: ROSE_DEEP, drift: -26 },
    { left: 50, delay: 7, dur: 16, size: 16, hue: ROSE, drift: 22 },
    { left: 61, delay: 12, dur: 20, size: 12, hue: ROSE_DEEP, drift: -30 },
    { left: 72, delay: 3, dur: 18, size: 14, hue: ROSE, drift: 26 },
    { left: 83, delay: 8, dur: 22, size: 10, hue: ROSE_DEEP, drift: -22 },
    { left: 92, delay: 11, dur: 15, size: 13, hue: ROSE, drift: 28 },
    { left: 46, delay: 14, dur: 19, size: 11, hue: ROSE, drift: -24 },
  ];
  return (
    <div className={className} aria-hidden>
      {petals.map((p, i) => (
        <span
          key={i}
          className="jhr-petal"
          style={
            {
              left: `${p.left}%`,
              animationDelay: `-${p.delay}s`,
              animationDuration: `${p.dur}s`,
              ["--drift" as string]: `${p.drift}px`,
            } as React.CSSProperties
          }
        >
          <svg viewBox="0 0 20 20" width={p.size} height={p.size} fill="none">
            <path d="M10 1 C15 5 18 11 10 19 C2 11 5 5 10 1 Z" fill={p.hue} opacity="0.85" />
            <path d="M10 4 C11 9 11 14 10 18" stroke={GOLD_LITE} strokeWidth="0.6" opacity="0.6" />
          </svg>
        </span>
      ))}
    </div>
  );
}

/* ── ceremony icons — matched to each rite by name ────────────────────────── */
function IconHaldi() {
  // marigold bloom
  return (
    <g stroke={GOLD} strokeWidth="1.5" fill="none">
      {Array.from({ length: 12 }).map((_, i) => (
        <ellipse key={i} cx="24" cy="12" rx="3" ry="6" fill="var(--jhr-saffron)" fillOpacity="0.5" transform={`rotate(${i * 30} 24 24)`} />
      ))}
      <circle cx="24" cy="24" r="5" fill={GOLD_LITE} />
    </g>
  );
}
function IconMehendi() {
  // henna paisley on a palm
  return (
    <g stroke={GOLD} strokeWidth="1.5" fill="none">
      <path d="M24 42 C12 34 10 20 20 12 C28 6 38 12 36 22 C34 30 24 30 24 22" fill={LEAF} fillOpacity="0.2" />
      <circle cx="24" cy="24" r="2" fill={GOLD} stroke="none" />
      <path d="M24 34 C18 30 17 22 22 17" opacity="0.7" />
    </g>
  );
}
function IconSangeet() {
  // dholak + notes
  return (
    <g stroke={GOLD} strokeWidth="1.5" fill="none">
      <ellipse cx="20" cy="26" rx="9" ry="11" fill="var(--jhr-rose)" fillOpacity="0.3" />
      <ellipse cx="20" cy="26" rx="9" ry="11" />
      <path d="M11 26 L29 26" opacity="0.6" />
      <circle cx="34" cy="16" r="3" fill={GOLD} stroke="none" />
      <path d="M37 16 L37 6 L41 8" />
    </g>
  );
}
function IconWedding() {
  // agni — sacred fire in a kund
  return (
    <g stroke={GOLD} strokeWidth="1.5" fill="none">
      <path d="M24 8 C20 16 27 18 24 26 C30 22 30 14 24 8 Z" fill="var(--jhr-saffron)" fillOpacity="0.6" />
      <path d="M24 16 C22 20 26 22 24 26" />
      <path d="M12 30 L36 30 L32 40 L16 40 Z" fill={GOLD} fillOpacity="0.2" />
      <path d="M14 30 L34 30" />
    </g>
  );
}
function IconReception() {
  // toast — two glasses
  return (
    <g stroke={GOLD} strokeWidth="1.5" fill="none">
      <path d="M14 10 L22 10 L20 22 C20 26 16 26 16 22 Z" fill="var(--jhr-rose)" fillOpacity="0.3" />
      <path d="M18 26 L18 38 M14 38 L22 38" />
      <path d="M26 10 L34 10 L32 22 C32 26 28 26 28 22 Z" fill="var(--jhr-rose)" fillOpacity="0.3" />
      <path d="M30 26 L30 38 M26 38 L34 38" />
      <circle cx="24" cy="8" r="1.4" fill={GOLD} stroke="none" />
    </g>
  );
}

const ICONS: Array<{ test: RegExp; Icon: () => React.ReactElement }> = [
  { test: /haldi|pithi/i, Icon: IconHaldi },
  { test: /mehendi|mehndi|henna/i, Icon: IconMehendi },
  { test: /sangeet|sangam|music|dance|cocktail/i, Icon: IconSangeet },
  { test: /reception|swagat|swagat|valima|after/i, Icon: IconReception },
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
