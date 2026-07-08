import { Mandala } from "./motifs";

// Lotus mark: three full, rounded petals (filled) sitting on a fan of curved
// lines — matching the shared emblem. Petals give body so it doesn't read thin;
// the fan carries the "with lines" look.
const FULL_PETAL = "M0 -2 C 13 -18 12 -38 0 -52 C -12 -38 -13 -18 0 -2 Z";
const FAN_LINES = [
  "M0 0 C -6 -16 -12 -30 -14 -42",
  "M0 0 C -12 -10 -26 -18 -36 -26",
  "M0 0 C -16 -4 -34 -6 -48 -4",
];

function LotusLine({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="-54 -58 108 64"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {/* filled petals */}
      <g fill="currentColor" stroke="none">
        <path d={FULL_PETAL} />
        <path d={FULL_PETAL} transform="rotate(34)" />
        <path d={FULL_PETAL} transform="rotate(-34)" />
      </g>
      {/* fanning base lines (mirrored) */}
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
      >
        {FAN_LINES.map((d) => (
          <path key={d} d={d} vectorEffect="non-scaling-stroke" />
        ))}
        <g transform="scale(-1,1)">
          {FAN_LINES.map((d) => (
            <path key={d} d={d} vectorEffect="non-scaling-stroke" />
          ))}
        </g>
      </g>
    </svg>
  );
}

/**
 * App-wide ambient background: a warm glow from the top, two slowly turning
 * corner mandalas, and a soft row of lotuses rising from the bottom edge —
 * all very faint. Fixed and non-interactive.
 */
export function PageDecor() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(55% 45% at 50% -10%, color-mix(in oklch, var(--primary) 12%, transparent), transparent 70%)",
        }}
      />
      <Mandala className="spin-slow -right-28 -top-28 h-96 w-96 opacity-[0.06]" />
      <Mandala className="spin-slow -bottom-32 -left-28 h-[30rem] w-[30rem] opacity-[0.05]" />

      {/* A single large line-art lotus rising from the bottom to mid-screen. */}
      <LotusLine
        className="absolute bottom-0 left-1/2 w-auto -translate-x-1/2 text-[color:var(--gold-deep)] opacity-[0.16]"
        style={{
          height: "min(50vh, 540px)",
          WebkitMaskImage: "linear-gradient(to top, #000 55%, transparent 100%)",
          maskImage: "linear-gradient(to top, #000 55%, transparent 100%)",
        }}
      />
    </div>
  );
}

/**
 * A few marigold/purple petals drifting upward — decorative, used on the
 * invitation stage. Deterministic positions so there's no hydration mismatch.
 */
export function FloatingPetals({ count = 9 }: { count?: number }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="absolute bottom-[-12px] block rounded-full"
          style={{
            left: `${(i * 11 + 6) % 100}%`,
            height: i % 3 === 0 ? "8px" : "6px",
            width: i % 3 === 0 ? "8px" : "6px",
            background: i % 2 ? "var(--gold)" : "var(--primary)",
            opacity: 0,
            animation: `utsav-float ${13 + (i % 5) * 3}s linear ${i * 1.6}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
