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
