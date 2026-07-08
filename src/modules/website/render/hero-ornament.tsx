import type { HeroMotif } from "../themes/registry";

/**
 * The decorative signature behind the hero — different per wedding type.
 * Rendered as low-opacity gold line-art (colour/opacity set in .wsite CSS).
 */
export function HeroOrnament({ variant }: { variant: HeroMotif }) {
  if (variant === "mandala") {
    return <span className="mandala" aria-hidden="true" />;
  }

  if (variant === "minimal") {
    return (
      <svg
        className="hero-svg"
        viewBox="0 0 300 300"
        fill="none"
        stroke="currentColor"
        aria-hidden="true"
      >
        <circle cx="150" cy="150" r="128" strokeWidth="1" />
        <circle cx="150" cy="150" r="116" strokeWidth="0.5" />
      </svg>
    );
  }

  if (variant === "garland") {
    // A hanging marigold toran across the top.
    return (
      <svg
        className="hero-svg hero-garland"
        viewBox="0 0 400 96"
        preserveAspectRatio="none"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        aria-hidden="true"
      >
        <path d="M0 12 C 120 74, 280 74, 400 12" />
        {Array.from({ length: 13 }).map((_, i) => {
          const x = 12 + i * 32;
          const t = x / 400;
          const swagY = 12 + Math.sin(t * Math.PI) * 60; // follow the swag
          const len = 10 + (i % 3) * 8;
          return (
            <g key={i}>
              <line x1={x} y1={swagY} x2={x} y2={swagY + len} />
              <circle
                cx={x}
                cy={swagY + len + 4}
                r="4"
                fill="currentColor"
                stroke="none"
              />
            </g>
          );
        })}
      </svg>
    );
  }

  if (variant === "temple") {
    // A gopuram (temple tower) silhouette in tiers.
    return (
      <svg
        className="hero-svg"
        viewBox="0 0 300 300"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M70 300 L86 232 L214 232 L230 300" />
        <path d="M84 232 L98 176 L202 176 L216 232" />
        <path d="M98 176 L112 128 L188 128 L202 176" />
        <path d="M112 128 L128 92 L172 92 L188 128" />
        <path d="M150 92 L150 66" />
        <circle cx="150" cy="56" r="10" />
      </svg>
    );
  }

  if (variant === "jharokha") {
    // A cusped (multi-lobed) arch — Rajasthani.
    return (
      <svg
        className="hero-svg"
        viewBox="0 0 320 300"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M40 300 L40 130 Q40 44 160 44 Q280 44 280 130 L280 300" />
        <path d="M64 132 q12 22 24 0 q12 22 24 0 q12 22 24 0 q12 22 24 0 q12 22 24 0 q12 22 24 0 q12 22 24 0 q12 22 24 0 q12 22 24 0" />
        <path d="M160 44 L160 24" />
        <circle cx="160" cy="16" r="8" />
      </svg>
    );
  }

  // botanical (Christian) — an arch of leaves.
  return (
    <svg
      className="hero-svg"
      viewBox="0 0 400 280"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M46 280 C 46 120 354 120 354 280" />
      {Array.from({ length: 10 }).map((_, i) => {
        const t = i / 9;
        const angle = Math.PI * (1 - t); // along the arch
        const cx = 200 - Math.cos(angle) * 154;
        const cy = 200 - Math.sin(angle) * 92 + 4;
        const rot = (t - 0.5) * 150;
        return (
          <path
            key={i}
            d="M0 0 C 7 -5 7 -15 0 -20 C -7 -15 -7 -5 0 0 Z"
            transform={`translate(${cx} ${cy}) rotate(${rot})`}
          />
        );
      })}
    </svg>
  );
}
