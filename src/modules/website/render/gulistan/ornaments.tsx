"use client";

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

const GOLD = "var(--glt-gold)";
const GOLD_LITE = "var(--glt-gold-lite)";
const ROSE = "var(--glt-rose)";
const ROSE_DEEP = "var(--glt-rose-deep)";
const LEAF = "var(--glt-leaf)";

/* ── a single rose blossom ────────────────────────────────────────────────
 * A cupped garden rose: two staggered rings of curved petals furling toward a
 * small gold stamen, with a faint gold edge for definition. Drawn in a unit
 * space and scaled by `r`, so it stays crisp at any size. */
const PETAL = "M0 0 C -0.5 -0.46 -0.5 -1.06 0 -1.36 C 0.5 -1.06 0.5 -0.46 0 0 Z";
const PETAL_ANGLES = [0, 72, 144, 216, 288];
function Blossom({
  cx,
  cy,
  r,
  fill = ROSE,
}: {
  cx: number;
  cy: number;
  r: number;
  fill?: string;
}) {
  return (
    <g transform={`translate(${cx} ${cy}) scale(${r})`}>
      {/* outer ring — open petals */}
      {PETAL_ANGLES.map((a) => (
        <path key={`o${a}`} d={PETAL} fill={fill} opacity={0.82} transform={`rotate(${a})`} />
      ))}
      {/* inner ring — smaller, offset, furled tighter (deepens the centre) */}
      {PETAL_ANGLES.map((a) => (
        <path
          key={`i${a}`}
          d={PETAL}
          fill={fill}
          opacity={0.96}
          transform={`rotate(${a + 36}) scale(0.6)`}
        />
      ))}
      {/* gold stamen heart */}
      <circle r={0.2} fill={GOLD_LITE} />
      <circle r={0.09} fill={GOLD} />
      {/* faint gold petal edges */}
      {PETAL_ANGLES.map((a) => (
        <path
          key={`e${a}`}
          d={PETAL}
          fill="none"
          stroke={GOLD}
          strokeWidth={0.028}
          opacity={0.45}
          transform={`rotate(${a})`}
        />
      ))}
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
  // Blossoms placed along a drooping diagonal vine (viewBox 220×360).
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
      {/* trailing hanging strands (wisteria-like) */}
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
        <g key={`l${i}`} transform={`rotate(${l.rot} ${l.x} ${l.y})`}>
          <ellipse cx={l.x} cy={l.y} rx="6" ry="13" fill={LEAF} opacity="0.85" />
          <line
            x1={l.x}
            y1={l.y - 11}
            x2={l.x}
            y2={l.y + 11}
            stroke="var(--glt-cream)"
            strokeWidth="0.8"
            opacity="0.5"
          />
        </g>
      ))}
      {nodes.map((n, i) => (
        <Blossom key={`b${i}`} cx={n.x} cy={n.y} r={n.r} fill={n.f} />
      ))}
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
      <m.path
        d={arch}
        stroke={GOLD}
        strokeWidth="2.4"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.9 }}
        transition={{ duration: 1.7, ease: "easeInOut" }}
      />
      <m.path
        d={arch}
        stroke={GOLD_LITE}
        strokeWidth="0.8"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.7 }}
        transition={{ duration: 1.7, ease: "easeInOut", delay: 0.12 }}
        style={{ transform: "translateX(7px)" }}
      />
      {/* pillar bases */}
      {[20, 380].map((x) => (
        <g key={x} stroke={GOLD} strokeWidth="2" opacity="0.85">
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

/* ── a single hanging temple bell ─────────────────────────────────────────── */
function Bell({ x, len }: { x: number; len: number }) {
  return (
    <g transform={`translate(${x} 0)`} className="glt-bell">
      <line x1="0" y1="0" x2="0" y2={len} stroke={GOLD} strokeWidth="1.2" opacity="0.7" />
      <g transform={`translate(0 ${len})`}>
        <path
          d="M-9 14 C-9 2 -5 -4 0 -4 C5 -4 9 2 9 14 Z"
          fill={GOLD}
          opacity="0.95"
        />
        <path d="M-11 14 L11 14 L9 18 L-9 18 Z" fill={GOLD_LITE} />
        <circle cx="0" cy="21" r="2.4" fill={GOLD} />
        <circle cx="0" cy="-5" r="2" fill={GOLD_LITE} />
      </g>
    </g>
  );
}

/* ── a row of bells swinging under the arch ───────────────────────────────── */
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
export function Couple({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 320" fill="none" aria-hidden className={className}>
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

/* ── rose petals drifting down over the whole page (deterministic) ────────── */
export function PetalFall({ className }: { className?: string }) {
  // Fixed set → no random → SSR-stable. Each petal loops a fall+sway in CSS.
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
          className="glt-petal"
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
            <path
              d="M10 1 C15 5 18 11 10 19 C2 11 5 5 10 1 Z"
              fill={p.hue}
              opacity="0.85"
            />
            <path d="M10 4 C11 9 11 14 10 18" stroke={GOLD_LITE} strokeWidth="0.6" opacity="0.6" />
          </svg>
        </span>
      ))}
    </div>
  );
}
