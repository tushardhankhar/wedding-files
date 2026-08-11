/**
 * THE RAJMAHAL — drawn ornament.
 *
 * Deliberately small. This theme's illustration is photographic-grade painted
 * artwork (see art.tsx), and hand-drawn SVG placed next to it always loses — so
 * nothing here tries to depict anything the paintings already depict. What lives
 * in this file is *structural* ornament: rules, arches, lattice and crests that
 * frame type and divide sections, in the same antique gold as the stonework.
 *
 * Everything is a flat currentColor/var() shape so it inherits the palette, and
 * everything is aria-hidden — none of it carries meaning.
 */

export function GoldRule({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 12"
      className={`rjm-rule ${className}`}
      fill="none"
      aria-hidden
      preserveAspectRatio="xMidYMid meet"
    >
      <path d="M4 6h84" stroke="currentColor" strokeWidth="1" opacity=".55" />
      <path d="M152 6h84" stroke="currentColor" strokeWidth="1" opacity=".55" />
      <path
        d="M120 1.5 126 6l-6 4.5L114 6z"
        fill="currentColor"
        opacity=".9"
      />
      <circle cx="100" cy="6" r="1.6" fill="currentColor" opacity=".7" />
      <circle cx="140" cy="6" r="1.6" fill="currentColor" opacity=".7" />
    </svg>
  );
}

/**
 * The cusped (multi-foil) arch that every opening in the source paintings uses.
 * Drawn as an outline so it can sit over artwork as a frame, or be filled to
 * become a solid mehrab.
 *
 * The cusp count is odd on purpose — an even count puts a join at the crown
 * instead of a point, which is the tell of a generated arch.
 */
export function CuspedArch({
  className = "",
  filled = false,
}: {
  className?: string;
  filled?: boolean;
}) {
  // 9 lobes sweeping from springing line to crown and back down.
  const d =
    "M2 120 L2 62 " +
    "Q2 50 10 46 Q18 42 22 32 Q28 20 40 18 Q52 16 58 8 Q64 0 72 0 " +
    "Q80 0 86 8 Q92 16 104 18 Q116 20 122 32 Q126 42 134 46 Q142 50 142 62 " +
    "L142 120";
  return (
    <svg
      viewBox="0 0 144 120"
      className={`rjm-arch ${className}`}
      aria-hidden
      preserveAspectRatio="none"
    >
      <path
        d={d}
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={filled ? 0 : 1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Jaali — the pierced stone lattice. Rendered as a tiling <pattern> so a band of
 * any width costs the same, and kept at a low opacity: at full strength it
 * vibrates against the painted stonework.
 */
export function JaaliBand({
  className = "",
  id = "rjm-jaali",
}: {
  className?: string;
  id?: string;
}) {
  return (
    <svg className={`rjm-jaali ${className}`} aria-hidden>
      <defs>
        <pattern id={id} width="26" height="26" patternUnits="userSpaceOnUse">
          <path
            d="M13 0 L26 13 L13 26 L0 13 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
          <circle cx="13" cy="13" r="3" fill="none" stroke="currentColor" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/** Small crest set above a section title — a lotus bud between two curls. */
export function Crest({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 28" className={`rjm-crest ${className}`} aria-hidden fill="none">
      <path
        d="M32 3c3 6 7 8 7 13a7 7 0 0 1-14 0c0-5 4-7 7-13z"
        fill="currentColor"
        opacity=".92"
      />
      <path
        d="M24 22c-6 0-9-3-11-7 5-1 9 1 11 7zM40 22c6 0 9-3 11-7-5-1-9 1-11 7z"
        fill="currentColor"
        opacity=".6"
      />
      <path d="M4 24h16M44 24h16" stroke="currentColor" strokeWidth="1" opacity=".45" />
    </svg>
  );
}

/** A hanging temple bell — used to punctuate the toran band. */
export function Bell({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 40" className={className} aria-hidden fill="none">
      <path d="M12 2v6" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M12 8c5 0 8 4 8 9v9H4v-9c0-5 3-9 8-9z"
        fill="currentColor"
        opacity=".9"
      />
      <path d="M4 26h16l2 3H2z" fill="currentColor" />
      <circle cx="12" cy="33" r="2.4" fill="currentColor" opacity=".8" />
    </svg>
  );
}

/**
 * The numeral plate behind each countdown unit — an arched stone cartouche.
 * Separate from CuspedArch because this one is a closed shape with a base.
 */
export function Cartouche({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 120" className={className} aria-hidden preserveAspectRatio="none">
      <path
        d="M6 118V46q0-14 12-20Q30 20 36 10q6-8 14-8t14 8q6 10 18 16 12 6 12 20v72z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Corner bracket — the carved stone corbel that sits at the corners of framed
 * content. Mirror it with CSS transforms rather than drawing four variants.
 */
export function CornerBracket({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden fill="none">
      <path
        d="M2 2h18q-6 4-8 10-2 6-8 8V2z"
        fill="currentColor"
        opacity=".85"
      />
      <path d="M2 24q10-2 14-8t8-14" stroke="currentColor" strokeWidth="1" opacity=".5" />
    </svg>
  );
}
