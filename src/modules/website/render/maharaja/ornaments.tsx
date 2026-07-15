import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * THE MAHARAJA — original ornament system.
 * Palace arches, royal seals, fine architectural geometry and jali latticework,
 * all drawn as line-art SVG in currentColor so sections tint them via text-*.
 * No mandalas, no stock frames.
 */

/** A cusped (multi-lobed) Mughal arch path, drawn in a 100×120 box. */
const CUSPED_ARCH =
  "M10 118 V64 C10 56 14 52 18 50 C22 48 24 44 26 40 C28 36 32 34 35 32 C38 30 41 27 43 23 C45 19 47 16 50 14 C53 16 55 19 57 23 C59 27 62 30 65 32 C68 34 72 36 74 40 C76 44 78 48 82 50 C86 52 90 56 90 64 V118";

/**
 * The royal insignia: couple initials inside a cusped arch, ringed like a seal,
 * crowned with a dome finial. `initials` like "A · M".
 */
export function RoyalInsignia({
  initials,
  className,
}: {
  initials: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 140 160"
      fill="none"
      className={cn("h-28 w-auto", className)}
      aria-hidden="true"
    >
      {/* seal rings */}
      <ellipse cx="70" cy="88" rx="62" ry="66" stroke="currentColor" strokeWidth="1" opacity="0.55" />
      <ellipse cx="70" cy="88" rx="56" ry="60" stroke="currentColor" strokeWidth="0.6" opacity="0.4" />
      {/* arch */}
      <path d={CUSPED_ARCH} transform="translate(20 30)" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      {/* dome finial */}
      <path d="M70 22 C 64 30 64 36 70 40 C 76 36 76 30 70 22 Z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M70 22 V12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="70" cy="9" r="2.4" fill="currentColor" />
      {/* side stars */}
      <path d="M22 60 l2.5 5 5 2.5 -5 2.5 -2.5 5 -2.5 -5 -5 -2.5 5 -2.5 Z" fill="currentColor" opacity="0.7" transform="scale(0.7) translate(2 22)" />
      <path d="M118 60 l2.5 5 5 2.5 -5 2.5 -2.5 5 -2.5 -5 -5 -2.5 5 -2.5 Z" fill="currentColor" opacity="0.7" transform="scale(0.7) translate(80 22)" />
      {/* initials */}
      <text
        x="70"
        y="106"
        textAnchor="middle"
        fill="currentColor"
        style={{
          font: "600 34px var(--font-cormorant), Georgia, serif",
          letterSpacing: "0.08em",
        }}
      >
        {initials}
      </text>
      {/* base rule */}
      <path d="M40 138 H100" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <path d="M66 138 l4 -4 4 4 -4 4 Z" fill="currentColor" />
    </svg>
  );
}

/** Thin antique rule with a diamond centre — the theme's divider. */
export function GoldRule({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 12"
      fill="none"
      className={cn("h-3 w-56", className)}
      aria-hidden="true"
    >
      <path d="M0 6 H104" stroke="currentColor" strokeWidth="0.8" />
      <path d="M136 6 H240" stroke="currentColor" strokeWidth="0.8" />
      <path d="M120 1 l5 5 -5 5 -5 -5 Z" stroke="currentColor" strokeWidth="1" />
      <circle cx="108" cy="6" r="1.4" fill="currentColor" />
      <circle cx="132" cy="6" r="1.4" fill="currentColor" />
    </svg>
  );
}

/** A row of cusped arches — faint architectural line art for dark sections. */
export function ArchColonnade({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 500 130"
      fill="none"
      preserveAspectRatio="xMidYMax meet"
      className={cn("w-full", className)}
      aria-hidden="true"
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={i}
          d={CUSPED_ARCH}
          transform={`translate(${i * 100} 10)`}
          stroke="currentColor"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

/** Jali lattice texture — a repeating quatrefoil screen, very faint. */
export function Jali({ className }: { className?: string }) {
  return (
    <svg className={cn("absolute inset-0 h-full w-full", className)} aria-hidden="true">
      <defs>
        <pattern id="mhj-jali" width="36" height="36" patternUnits="userSpaceOnUse">
          <path
            d="M18 4 C 22 10 28 12 32 12 C 30 17 30 19 32 24 C 27 24 22 26 18 32 C 14 26 9 24 4 24 C 6 19 6 17 4 12 C 8 12 14 10 18 4 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.7"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#mhj-jali)" />
    </svg>
  );
}

/** Ornamental ampersand medallion used between the couple's names. */
export function AmpersandSeal({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex items-center justify-center",
        className
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 80 80" fill="none" className="absolute inset-0 h-full w-full">
        <circle cx="40" cy="40" r="37" stroke="currentColor" strokeWidth="0.9" opacity="0.6" />
        <circle cx="40" cy="40" r="31" stroke="currentColor" strokeWidth="0.6" opacity="0.4" />
        <path d="M40 3 l2 4 4 2 -4 2 -2 4 -2 -4 -4 -2 4 -2 Z" fill="currentColor" opacity="0.8" transform="scale(0.8) translate(10 -1)" />
      </svg>
      <span className="m-serif relative italic" style={{ fontSize: "1.6em" }}>
        &amp;
      </span>
    </span>
  );
}

/** Corner flourish for the ivory invitation panels. */
export function CornerFiligree({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 60"
      fill="none"
      stroke="currentColor"
      className={cn("h-12 w-12", className)}
      aria-hidden="true"
    >
      <path d="M2 58 V22 C2 10 10 2 22 2 H58" strokeWidth="1" />
      <path d="M8 58 V26 C8 15 15 8 26 8 H58" strokeWidth="0.6" opacity="0.6" />
      <path d="M2 22 C 8 24 10 28 10 33 C 14 28 14 24 12 20" strokeWidth="0.8" opacity="0.8" />
      <circle cx="22" cy="22" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * A ceremonial caparisoned elephant, facing right — drawn as line-art in
 * currentColor. Crowned with a domed howdah and pennant, draped in a scalloped
 * jhool with tassels, forehead ornament and tusks. Reads as a baraat elephant.
 */
export function RoyalElephant({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 150 120"
      fill="none"
      className={cn("h-auto w-auto", className)}
      style={style}
      aria-hidden="true"
    >
      <g
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {/* back, rump and shoulder */}
        <path d="M22 74 C 16 62 20 50 34 47 C 55 42 84 42 104 48 C 112 50 118 55 121 62" />
        {/* forehead and trunk, curling forward at the tip */}
        <path d="M121 62 C 126 60 132 62 133 69 C 134 77 130 86 127 93 C 125 98 128 101 132 99" />
        {/* chest under the head */}
        <path d="M121 62 C 119 68 116 72 112 74" />
        {/* belly and lower rump */}
        <path d="M40 82 C 60 88 90 88 108 82" />
        <path d="M22 74 C 22 78 26 82 30 82" />
        {/* ear */}
        <path d="M100 52 C 92 52 86 60 89 69 C 92 74 100 72 104 65" />
        {/* eye */}
        <circle cx="112" cy="63" r="1.1" fill="currentColor" stroke="none" />
        {/* tusk */}
        <path d="M124 82 C 127 86 132 87 135 85" />
        {/* forehead ornament */}
        <path d="M126 66 l3 5 3 -5" />
        {/* legs and feet */}
        <path d="M32 82 V102 M50 84 V103 M98 82 V103 M114 80 V102" />
        <path d="M29 102 h7 M47 103 h7 M95 103 h7 M111 102 h7" />
        {/* tail */}
        <path d="M22 68 C 15 70 13 78 17 84" />
        {/* jhool — scalloped drape with tassels */}
        <path d="M42 49 C 60 46 84 46 100 50 L 100 66 C 96 70 92 70 90 66 C 88 70 84 70 82 66 C 80 70 76 70 74 66 C 72 70 68 70 66 66 C 64 70 60 70 58 66 C 56 70 52 70 50 66 C 48 70 46 68 44 64 Z" />
        <path d="M66 66 V72 M82 66 V72 M50 66 V71" opacity="0.7" />
        {/* howdah — posts, seat, domed chhatri, finial and pennant */}
        <path d="M52 46 H88 M56 46 V34 M84 46 V34" />
        <path d="M50 34 C 58 24 82 24 90 34 Z" />
        <path d="M70 24 V17" />
        <circle cx="70" cy="15" r="2" fill="currentColor" stroke="none" />
        <path d="M70 19 h9 l-3 3 3 3 h-9" />
      </g>
    </svg>
  );
}

/**
 * A slow, seamless procession of royal elephants — a faint parade band meant to
 * sit at the foot of a dark section. Duplicated row loops with no seam; each
 * elephant ambles on a staggered beat. Honours prefers-reduced-motion via CSS.
 */
export function ElephantProcession({ className }: { className?: string }) {
  const row = (
    <div className="flex shrink-0 items-end gap-20 pr-20">
      {[0, 1, 2, 3].map((i) => (
        <RoyalElephant
          key={i}
          className="m-amble h-20 w-auto sm:h-24"
          style={{ animationDelay: `${i * 0.45}s` }}
        />
      ))}
    </div>
  );
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 hidden overflow-hidden sm:flex",
        className
      )}
      aria-hidden="true"
    >
      <div className="m-parade flex w-max">
        {row}
        {row}
      </div>
    </div>
  );
}

/** Fixed drift configuration for the marigold fall — deterministic to avoid
 *  server/client hydration mismatch (no Math.random at render). */
const MARIGOLD: Array<{ left: string; size: number; delay: string; dur: string; drift: string }> = [
  { left: "6%", size: 9, delay: "0s", dur: "13s", drift: "22px" },
  { left: "17%", size: 6, delay: "4.5s", dur: "16s", drift: "-16px" },
  { left: "28%", size: 11, delay: "2s", dur: "12s", drift: "30px" },
  { left: "39%", size: 7, delay: "7s", dur: "17s", drift: "-24px" },
  { left: "50%", size: 8, delay: "1s", dur: "14s", drift: "18px" },
  { left: "61%", size: 10, delay: "5.5s", dur: "15s", drift: "-30px" },
  { left: "72%", size: 6, delay: "3s", dur: "18s", drift: "26px" },
  { left: "83%", size: 9, delay: "8.5s", dur: "13s", drift: "-18px" },
  { left: "92%", size: 7, delay: "6s", dur: "16s", drift: "20px" },
];

/** Soft marigold blossoms drifting down — the traditional wedding flower, kept
 *  within the theme's gold so the three-colour palette holds. */
export function MarigoldFall({ className }: { className?: string }) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden="true"
    >
      {MARIGOLD.map((p, i) => (
        <span
          key={i}
          className="m-petal absolute top-0 block"
          style={
            {
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: p.delay,
              animationDuration: p.dur,
              "--drift": p.drift,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
