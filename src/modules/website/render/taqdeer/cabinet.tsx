/**
 * THE CABINET — the machine's body, drawn as one lit object.
 *
 * WHY SVG AND NOT CSS BOXES. The first version of this was a stack of divs with
 * gradient backgrounds, and it read as a vector illustration of a slot machine
 * rather than a machine. Three things fixed that, and none of them is reachable
 * with a box model:
 *
 *  1. PROPORTION. A real machine (a Mills or a Jennings) is 24" tall by 13.5"
 *     wide — a 1.75:1 portrait — with the reel window only about a fifth of the
 *     height, sitting in the UPPER THIRD. Most of the face is the ornamented
 *     lower casting. A square cabinet with a huge reel band across its middle is
 *     the single biggest reason a drawing of one looks like a toy.
 *
 *  2. VALUE RANGE. Polished metal reads as metal because near-white specular
 *     highlights sit millimetres from near-black shadow. Mid-tone gold gradients
 *     read as paper. Every metal surface here runs the full range.
 *
 *  3. ONE LIGHT. A single source, above and slightly left. Every raised edge is
 *     lit on its top-left and shadowed on its bottom-right; every recess is the
 *     exact inverse. Consistency is what the eye reads as three-dimensional.
 *
 * The reel aperture is left EMPTY — a hole in the casting. The spinning drums
 * are DOM, positioned over it by the percentages documented on `.tqd-aperture`,
 * so the animation stays on the compositor while the frame around it stays a
 * single resolution-independent object.
 *
 * viewBox is 300 × 520. Those numbers are load-bearing: `.tqd-aperture` and
 * `--tqd-cell` are both derived from them, so changing the geometry here means
 * changing the percentages in globals.css to match.
 */

const APERTURE = { x: 52, y: 160, w: 196, h: 96 } as const;

/**
 * The drum columns are split 1 : 1.12 : 1.42 (day : month : year), not evenly —
 * a four-digit year needs the room, and equal thirds squeezed the type down to
 * something illegible. Two 5-unit mullions take 10 units, so 186 are shared out
 * in that ratio and the mullion centres fall where the columns meet.
 *
 * `.tqd-bay-glass` uses the same ratio for its grid, and the same 5-unit gap.
 * Change one and you must change the other, or the brass mullions drawn here
 * will no longer line up with the gaps between the DOM drums.
 */
const COL_RATIO = [1, 1.12, 1.42] as const;
const MULLIONS = (() => {
  const free = APERTURE.w - 10;
  const total = COL_RATIO[0] + COL_RATIO[1] + COL_RATIO[2];
  const w0 = (free * COL_RATIO[0]) / total;
  const w1 = (free * COL_RATIO[1]) / total;
  return [APERTURE.x + w0 + 2.5, APERTURE.x + w0 + 5 + w1 + 2.5] as const;
})();

export function Cabinet({
  className,
  monogram,
}: {
  className?: string;
  monogram: string;
}) {
  return (
    <svg
      viewBox="0 0 300 520"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        {/* Brass, lit from above. Five stops: specular, light, body, shade,
            shadow — the full range is what makes it read as metal. */}
        <linearGradient id="tqd-brass-v" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF9E6" />
          <stop offset="12%" stopColor="#F3DCA4" />
          <stop offset="42%" stopColor="var(--tqd-gold)" />
          <stop offset="76%" stopColor="#8A6B24" />
          <stop offset="100%" stopColor="#4A3510" />
        </linearGradient>
        {/* The same brass across a convex face: dark at both edges, hot in the
            middle-left where the light lands. */}
        <linearGradient id="tqd-brass-h" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4A3510" />
          <stop offset="10%" stopColor="#9C7A2C" />
          <stop offset="30%" stopColor="#FFF6DC" />
          <stop offset="46%" stopColor="var(--tqd-gold-lite)" />
          <stop offset="68%" stopColor="var(--tqd-gold)" />
          <stop offset="88%" stopColor="#7A5C1E" />
          <stop offset="100%" stopColor="#3A2A0C" />
        </linearGradient>
        {/* Wine lacquer over a domed casting. */}
        <linearGradient id="tqd-lacquer-h" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1E0509" />
          <stop offset="9%" stopColor="#4A1026" />
          <stop offset="30%" stopColor="var(--tqd-wine-2)" />
          <stop offset="52%" stopColor="var(--tqd-wine)" />
          <stop offset="80%" stopColor="#3C0C1B" />
          <stop offset="100%" stopColor="#170406" />
        </linearGradient>
        {/* The plinth. Deliberately darker than the body — wine-2 at the top
            read as magenta and pulled the eye to the floor of the machine. */}
        <linearGradient id="tqd-lacquer-v" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4C1024" />
          <stop offset="46%" stopColor="#33091A" />
          <stop offset="100%" stopColor="#170406" />
        </linearGradient>
        {/* A recess: dark where the light is occluded at the top, faintly lit
            at the bottom where it bounces back. The inverse of a raised edge. */}
        <linearGradient id="tqd-recess" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#080204" />
          <stop offset="55%" stopColor="#1A0710" />
          <stop offset="100%" stopColor="#3A1420" />
        </linearGradient>
        <radialGradient id="tqd-rivet" cx="0.34" cy="0.3" r="0.75">
          <stop offset="0%" stopColor="#FFF8E4" />
          <stop offset="45%" stopColor="var(--tqd-gold)" />
          <stop offset="100%" stopColor="#4A3510" />
        </radialGradient>
        <radialGradient id="tqd-jackpot" cx="0.5" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#FFF6DE" />
          <stop offset="55%" stopColor="#E8CE92" />
          <stop offset="100%" stopColor="#A88434" />
        </radialGradient>
        {/* the pool of shadow the machine stands in */}
        <radialGradient id="tqd-contact" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#000" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ── the contact shadow, so the machine sits in space ──────────────── */}
      <ellipse cx="150" cy="512" rx="140" ry="17" fill="url(#tqd-contact)" />

      {/* ══ THE CASTING ═══════════════════════════════════════════════════════
          One silhouette: arched deco crown, stepped shoulders, a body that
          widens to the plinth. Drawn once as brass (the outer edge) and again
          inset as lacquer, which is what gives the casting its thickness. */}
      <path
        d="M150 14c-14 0-24 5-31 13l-14 17H74c-8 0-13 5-13 12v20H44c-9 0-14 5-14 13v355h240V89c0-8-5-13-14-13h-17V56c0-7-5-12-13-12h-31l-14-17c-7-8-17-13-31-13Z"
        fill="url(#tqd-brass-h)"
      />
      {/* the lacquered face, inset — the brass now reads as the casting's edge */}
      <path
        d="M150 24c-11 0-19 4-25 11l-15 19H80c-5 0-8 3-8 8v22H50c-6 0-9 3-9 9v331h218V93c0-6-3-9-9-9h-22V62c0-5-3-8-8-8h-30l-15-19c-6-7-14-11-25-11Z"
        fill="url(#tqd-lacquer-h)"
      />
      {/* the top highlight running along the crown's edge */}
      <path
        d="M150 24c-11 0-19 4-25 11l-15 19"
        stroke="#FFF6DC"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M150 24c11 0 19 4 25 11l15 19"
        stroke="var(--tqd-gold-lite)"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.45"
      />

      {/* ── the crown: jackpot window + monogram plate ────────────────────── */}
      <g>
        {/* the jackpot glass, recessed */}
        <rect x="112" y="46" width="76" height="26" rx="2" fill="url(#tqd-recess)" />
        <rect x="112" y="46" width="76" height="26" rx="2" stroke="#2A0710" strokeWidth="2" />
        <rect
          x="114.5"
          y="48.5"
          width="71"
          height="21"
          rx="1"
          fill="url(#tqd-jackpot)"
          opacity="0.9"
        />
        {/* the lit glass has a reflection across its upper half */}
        <path d="M114.5 48.5h71v9H114.5Z" fill="#FFF" opacity="0.28" />
        <text
          x="150"
          y="60"
          textAnchor="middle"
          dominantBaseline="central"
          fill="#4A2418"
          style={{
            fontFamily: "var(--font-marcellus), Georgia, serif",
            // In viewBox units, so it scales with the machine automatically.
            fontSize: "17px",
            letterSpacing: "0.14em",
          }}
        >
          {monogram}
        </text>
        {/* brass bezel, lit top / shadowed bottom */}
        <path d="M111 45h78" stroke="#FFF9E6" strokeWidth="1.4" opacity="0.8" />
        <path d="M111 73h78" stroke="#2A1A06" strokeWidth="1.4" opacity="0.9" />
      </g>

      {/* ── the shoulder band above the reels ────────────────────────────────
          A raised brass rail: lit line on top, shadow line beneath. The column
          names are HTML, laid over this band so they stay legible and bilingual. */}
      <g>
        <rect x="41" y="118" width="218" height="26" fill="url(#tqd-brass-v)" />
        <path d="M41 118h218" stroke="#FFF9E6" strokeWidth="1.5" opacity="0.85" />
        <path d="M41 144h218" stroke="#2A1A06" strokeWidth="2" opacity="0.85" />
        {/* engine-turned flutes across the rail */}
        <g stroke="#4A3510" strokeWidth="0.6" opacity="0.28">
          {Array.from({ length: 44 }).map((_, i) => (
            <line key={i} x1={44 + i * 5} y1="120" x2={44 + i * 5} y2="142" />
          ))}
        </g>
        {[52, 248].map((x) => (
          <circle key={x} cx={x} cy="131" r="3.4" fill="url(#tqd-rivet)" />
        ))}
      </g>

      {/* ══ THE REEL APERTURE ═════════════════════════════════════════════════
          A hole in the casting. Nothing is painted inside it — the drums show
          through from the DOM layer beneath. What IS painted is the bezel that
          surrounds it and the shadow the casting throws onto the drums. */}
      <g>
        {/* the bezel: a raised brass frame, four edges lit consistently */}
        <rect
          x={APERTURE.x - 9}
          y={APERTURE.y - 9}
          width={APERTURE.w + 18}
          height={APERTURE.h + 18}
          rx="2"
          fill="url(#tqd-brass-v)"
        />
        {/* the bezel's own outer edges */}
        <path
          d={`M${APERTURE.x - 9} ${APERTURE.y - 9}h${APERTURE.w + 18}`}
          stroke="#FFF9E6"
          strokeWidth="1.6"
          opacity="0.9"
        />
        <path
          d={`M${APERTURE.x - 9} ${APERTURE.y + APERTURE.h + 9}h${APERTURE.w + 18}`}
          stroke="#241704"
          strokeWidth="2"
          opacity="0.9"
        />
        {/* the aperture itself, cut out */}
        <rect
          x={APERTURE.x}
          y={APERTURE.y}
          width={APERTURE.w}
          height={APERTURE.h}
          fill="#000"
        />
        {/* The two mullions between the drums. NOT at even thirds: the columns
            are split 1 : 1.12 : 1.42, because a four-digit year needs far more
            room than a two-digit day and equal thirds forced the drum type down
            to a size nobody could read. These centres are derived from that
            split and must match `.tqd-bay-glass`'s grid-template-columns. */}
        {[MULLIONS[0], MULLIONS[1]].map((x) => (
          <g key={x}>
            <rect x={x - 2.5} y={APERTURE.y} width="5" height={APERTURE.h} fill="url(#tqd-brass-v)" />
            <path d={`M${x - 2.5} ${APERTURE.y}v${APERTURE.h}`} stroke="#FFF6DC" strokeWidth="0.8" opacity="0.55" />
            <path d={`M${x + 2.5} ${APERTURE.y}v${APERTURE.h}`} stroke="#241704" strokeWidth="0.8" opacity="0.7" />
          </g>
        ))}
        {/* rivets at the bezel's corners */}
        {[
          [APERTURE.x - 4.5, APERTURE.y - 4.5],
          [APERTURE.x + APERTURE.w + 4.5, APERTURE.y - 4.5],
          [APERTURE.x - 4.5, APERTURE.y + APERTURE.h + 4.5],
          [APERTURE.x + APERTURE.w + 4.5, APERTURE.y + APERTURE.h + 4.5],
        ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.6" fill="url(#tqd-rivet)" />
        ))}
      </g>

      {/* ── the award card: an engraved panel under the reels ─────────────── */}
      <g>
        <rect x="52" y="278" width="196" height="52" rx="1.5" fill="url(#tqd-recess)" />
        <path d="M52 278h196" stroke="#241704" strokeWidth="1.6" opacity="0.9" />
        <path d="M52 330h196" stroke="var(--tqd-gold-lite)" strokeWidth="1.2" opacity="0.4" />
        <rect x="56" y="282" width="188" height="44" rx="1" stroke="var(--tqd-gold-deep)" strokeWidth="0.8" opacity="0.55" />
      </g>

      {/* ── the lower casting: where the ornament lives ───────────────────── */}
      <g>
        {/* a deco fountain — stepped chevrons rising from the payout cup */}
        <g stroke="var(--tqd-gold)" strokeWidth="1.6" opacity="0.5">
          <path d="M92 400 150 348 208 400" />
          <path d="M104 400 150 359 196 400" opacity="0.72" />
          <path d="M116 400 150 370 184 400" opacity="0.5" />
        </g>
        {/* the keystone lozenge */}
        <path d="M150 336 161 348 150 360 139 348Z" fill="url(#tqd-brass-v)" />
        <path d="M150 340 157 348 150 356 143 348Z" fill="#2A0710" opacity="0.6" />
        {/* fluted pilasters flanking it */}
        {[62, 226].map((x) => (
          <g key={x}>
            <rect x={x} y="344" width="12" height="70" fill="url(#tqd-brass-v)" opacity="0.5" />
            <g stroke="#241704" strokeWidth="0.7" opacity="0.5">
              <line x1={x + 3} y1="346" x2={x + 3} y2="412" />
              <line x1={x + 6} y1="346" x2={x + 6} y2="412" />
              <line x1={x + 9} y1="346" x2={x + 9} y2="412" />
            </g>
            <path d={`M${x} 344h12`} stroke="#FFF6DC" strokeWidth="1" opacity="0.55" />
          </g>
        ))}
      </g>

      {/* ── the payout cup: a real recess with a lip ──────────────────────── */}
      <g>
        <rect x="104" y="412" width="92" height="28" rx="2" fill="url(#tqd-recess)" />
        <path d="M104 412h92" stroke="#180508" strokeWidth="2.4" />
        {/* the lip catches the light on its upper face */}
        <path d="M100 440h100l-4 8h-92Z" fill="url(#tqd-brass-v)" />
        <path d="M100 440h100" stroke="#FFF9E6" strokeWidth="1.4" opacity="0.85" />
        <path d="M104 448h92" stroke="#241704" strokeWidth="1.6" opacity="0.9" />
      </g>

      {/* ── the base rail and plinth ──────────────────────────────────────── */}
      <g>
        <rect x="41" y="462" width="218" height="10" fill="url(#tqd-brass-v)" />
        <path d="M41 462h218" stroke="#FFF9E6" strokeWidth="1.3" opacity="0.8" />
        {/* the plinth oversails the body, as a wooden base does */}
        <path d="M22 472h256v34H22Z" fill="url(#tqd-lacquer-v)" />
        <path d="M22 472h256" stroke="var(--tqd-gold-lite)" strokeWidth="1.5" opacity="0.6" />
        <path d="M22 506h256" stroke="#000" strokeWidth="2" opacity="0.6" />
        {/* reeding along the plinth */}
        <g stroke="#000" strokeWidth="0.7" opacity="0.3">
          {Array.from({ length: 62 }).map((_, i) => (
            <line key={i} x1={26 + i * 4.1} y1="476" x2={26 + i * 4.1} y2="502" />
          ))}
        </g>
      </g>

      {/* ── the casting's outer keyline, drawn last so it stays crisp ─────── */}
      <path
        d="M150 14c-14 0-24 5-31 13l-14 17H74c-8 0-13 5-13 12v20H44c-9 0-14 5-14 13v355h240V89c0-8-5-13-14-13h-17V56c0-7-5-12-13-12h-31l-14-17c-7-8-17-13-31-13Z"
        stroke="#2A1A06"
        strokeWidth="1.2"
        opacity="0.7"
      />
    </svg>
  );
}

/**
 * The aperture's geometry, exported so the CSS that positions the DOM reel bay
 * over it can be checked against the drawing rather than guessed at.
 *
 *   left   = 52 / 300  = 17.3333%
 *   top    = 160 / 520 = 30.7692%
 *   width  = 196 / 300 = 65.3333%
 *   height = 96 / 300  = 32% of the machine's WIDTH (the SVG scales by width)
 */
export const APERTURE_GEOMETRY = APERTURE;
