/**
 * THE TAQDEER — ornament set.
 *
 * Every piece here is Art Deco geometry: stepped ziggurats, sunburst fans,
 * chevrons, lozenges and fluted rules. Nothing is a playing-card suit and
 * nothing is a coin — the theme borrows the *cabinetry* of a 1920s machine, not
 * the iconography of gambling.
 *
 * All of them draw in `currentColor` so a caller sets the metal with a text
 * colour (`text-[color:var(--tqd-gold)]`) and one component serves every
 * ground. Sizes come from the caller; nothing here fixes its own width, so the
 * whole set survives the 248px-wide phone preview on the landing page.
 */

import type { CSSProperties } from "react";

type Art = { className?: string };

/**
 * The cabinet's crown — a solid stepped marquee, lacquered and brass-edged.
 *
 * Drawn as filled mass rather than an outline on purpose: a hairline ziggurat
 * floating above the case read as clip-art pasted on top. This one has a body,
 * a lit top edge and a shadow where it meets the case, so it sits ON the machine.
 */
export function DecoCrown({ className }: Art) {
  return (
    <svg
      viewBox="0 0 240 66"
      fill="none"
      className={className}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="tqd-crown-lacquer" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--tqd-wine-2)" />
          <stop offset="42%" stopColor="var(--tqd-wine)" />
          <stop offset="100%" stopColor="var(--tqd-wine-deep)" />
        </linearGradient>
        <linearGradient id="tqd-crown-brass" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--tqd-gold-deep)" />
          <stop offset="28%" stopColor="var(--tqd-gold-lite)" />
          <stop offset="52%" stopColor="var(--tqd-gold)" />
          <stop offset="78%" stopColor="var(--tqd-gold-lite)" />
          <stop offset="100%" stopColor="var(--tqd-gold-deep)" />
        </linearGradient>
      </defs>

      {/* the stepped mass */}
      <path
        d="M0 66V44h26V28h26V14h34V4h68v10h34v14h26v16h26v22Z"
        fill="url(#tqd-crown-lacquer)"
      />
      {/* the brass edge, following every step */}
      <path
        d="M0 66V44h26V28h26V14h34V4h68v10h34v14h26v16h26v22"
        stroke="url(#tqd-crown-brass)"
        strokeWidth="2"
      />
      {/* Rays rising from the case into the crown. Kept short and wide-set so
          they read as engraving behind the monogram plate rather than crowding
          into it. */}
      <g stroke="var(--tqd-gold)" strokeWidth="1.1" opacity="0.3">
        {[-50, -34, -18, 18, 34, 50].map((deg) => (
          <line
            key={deg}
            x1="120"
            y1="62"
            x2={120 + Math.sin((deg * Math.PI) / 180) * 44}
            y2={62 - Math.cos((deg * Math.PI) / 180) * 44}
          />
        ))}
      </g>
      {/* the keystone lozenge at the apex */}
      <path d="M120 7 129 16 120 25 111 16Z" fill="var(--tqd-gold)" />
      <path d="M120 11 125 16 120 21 115 16Z" fill="var(--tqd-wine-deep)" opacity="0.7" />
      {/* where the crown meets the case: a shadow, so it reads as seated */}
      <rect x="0" y="62" width="240" height="4" fill="var(--tqd-obsidian)" opacity="0.45" />
    </svg>
  );
}

/**
 * The lever. The arm lives in its own `<g>` rotating about the pivot at
 * (34, 150), driven two ways:
 *
 *   - `pull` (0–1) while a finger is on it — an inline transform, so the arm
 *     tracks the drag exactly.
 *   - `throwing` on release — the `tqd-throw` keyframes take over: the arm
 *     bottoms out, springs past centre and settles. A CSS animation outranks an
 *     inline style, so nothing needs to be un-set for the hand-off; `from` tells
 *     the keyframes which angle the finger let go at, so there is no jump.
 */
export function Lever({
  className,
  pull = 0,
  throwing = false,
  from = 0,
}: Art & { pull?: number; throwing?: boolean; from?: number }) {
  return (
    <svg viewBox="0 0 76 216" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="tqd-lever-metal" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6E5218" />
          <stop offset="18%" stopColor="var(--tqd-gold-deep)" />
          <stop offset="40%" stopColor="var(--tqd-gold-lite)" />
          <stop offset="56%" stopColor="var(--tqd-gold)" />
          <stop offset="82%" stopColor="var(--tqd-gold-deep)" />
          <stop offset="100%" stopColor="#5A420F" />
        </linearGradient>
        <radialGradient id="tqd-knob" cx="0.36" cy="0.28" r="0.8">
          <stop offset="0%" stopColor="#E8B9C6" />
          <stop offset="22%" stopColor="var(--tqd-wine-2)" />
          <stop offset="72%" stopColor="var(--tqd-wine)" />
          <stop offset="100%" stopColor="#2A0710" />
        </radialGradient>
      </defs>

      {/* The escutcheon: a stepped brass plate let into the cabinet's flank, with
          the boss at its centre. A bare circle read as a sticker; a machined
          plate is what a lever is actually bolted through. Kept as a simple
          stepped rectangle — the earlier cross-shaped one grew spurs that stuck
          out past the case and read as a separate object. */}
      <path d="M14 160h48v42H14Z" fill="var(--tqd-wine-deep)" />
      <path d="M14 160h48v42H14Z" stroke="var(--tqd-gold-deep)" strokeWidth="1.4" />
      <path d="M20 166h36v30H20Z" stroke="var(--tqd-gold-deep)" strokeWidth="0.7" opacity="0.6" />
      <circle cx="38" cy="181" r="12" fill="var(--tqd-obsidian)" opacity="0.55" />

      {/* the arm — tracking the finger, or mid-throw */}
      <g
        className={throwing ? "tqd-lever-arm tqd-throwing" : "tqd-lever-arm"}
        style={
          {
            transform: `rotate(${pull * 48}deg)`,
            transformOrigin: "38px 181px",
            "--tqd-from": `${from.toFixed(1)}deg`,
          } as CSSProperties
        }
      >
        {/* the shaft: turned brass, thick enough to look like it could take a
            pull. The old thin stick under an oversized ball was the toy look. */}
        <path d="M30 60h16v122H30Z" fill="url(#tqd-lever-metal)" />
        <rect x="35.6" y="66" width="2" height="112" fill="var(--tqd-gold-lite)" opacity="0.42" />
        {/* two ferrules, where a real shaft is collared */}
        <rect x="26" y="74" width="24" height="9" fill="url(#tqd-lever-metal)" />
        <rect x="26" y="74" width="24" height="9" stroke="#5A420F" strokeWidth="0.9" />
        <rect x="28" y="150" width="20" height="7" fill="url(#tqd-lever-metal)" />
        <rect x="28" y="150" width="20" height="7" stroke="#5A420F" strokeWidth="0.9" />
        {/* the knob — smaller relative to the shaft than before, so it reads as a
            weighted handle rather than a lollipop */}
        <circle cx="38" cy="46" r="17" fill="url(#tqd-knob)" />
        <circle cx="38" cy="46" r="17" stroke="var(--tqd-gold)" strokeWidth="2" />
        <circle cx="38" cy="46" r="13.5" stroke="var(--tqd-gold-deep)" strokeWidth="0.7" opacity="0.6" />
        <ellipse cx="32" cy="39" rx="5.2" ry="3.4" fill="#FFF" opacity="0.3" />
      </g>

      {/* the pivot cap, over the arm so the joint reads as one machine */}
      <circle cx="38" cy="181" r="9" fill="url(#tqd-lever-metal)" />
      <circle cx="38" cy="181" r="9" stroke="#5A420F" strokeWidth="1.1" />
      <circle cx="38" cy="181" r="2.6" fill="var(--tqd-obsidian)" opacity="0.7" />
    </svg>
  );
}

/** A deco rule: hairline, lozenge, hairline. The page's only divider. */
export function DecoRule({ className }: Art) {
  return (
    <svg viewBox="0 0 220 12" fill="none" className={className} aria-hidden="true">
      <line x1="0" y1="6" x2="86" y2="6" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <line x1="134" y1="6" x2="220" y2="6" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <line x1="18" y1="9.5" x2="86" y2="9.5" stroke="currentColor" strokeWidth="0.7" opacity="0.28" />
      <line x1="134" y1="9.5" x2="202" y2="9.5" stroke="currentColor" strokeWidth="0.7" opacity="0.28" />
      <path d="M110 0 118 6 110 12 102 6Z" fill="currentColor" opacity="0.85" />
      <path d="M96 6 100 3.2v5.6ZM124 6 120 3.2v5.6Z" fill="currentColor" opacity="0.55" />
    </svg>
  );
}

/** A stepped deco arch — the frame around a section heading or a portrait. */
export function DecoArch({ className }: Art) {
  return (
    <svg viewBox="0 0 120 72" fill="none" className={className} aria-hidden="true">
      <path
        d="M6 72V30h12V18h14V8h36v10h14v12h12v42"
        stroke="currentColor"
        strokeWidth="1.4"
        opacity="0.75"
      />
      <path
        d="M18 72V38h10V26h10V18h24v8h10v12h10v34"
        stroke="currentColor"
        strokeWidth="0.9"
        opacity="0.4"
      />
      <path d="M60 44 66 50 60 56 54 50Z" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

/** The big background sunburst behind the cabinet — restrained, wide-set rays. */
export function Sunburst({ className, rays = 28 }: Art & { rays?: number }) {
  return (
    <svg viewBox="0 0 400 400" fill="none" className={className} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.1">
        {Array.from({ length: rays }).map((_, i) => {
          const a = (i / rays) * Math.PI * 2;
          return (
            <line
              key={i}
              x1={200 + Math.cos(a) * 42}
              y1={200 + Math.sin(a) * 42}
              x2={200 + Math.cos(a) * 196}
              y2={200 + Math.sin(a) * 196}
              opacity={i % 2 === 0 ? 0.5 : 0.2}
            />
          );
        })}
      </g>
      <circle cx="200" cy="200" r="42" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
      <circle cx="200" cy="200" r="60" stroke="currentColor" strokeWidth="0.7" opacity="0.22" />
    </svg>
  );
}

/** A deco fan — a quarter sunburst, used in facing pairs to flank type. */
export function DecoFan({ className, flip = false }: Art & { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 60 40"
      fill="none"
      className={className}
      aria-hidden="true"
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      <g stroke="currentColor" strokeWidth="1.1">
        {[0, 14, 28, 42, 56, 70, 84].map((deg, i) => (
          <line
            key={deg}
            x1="4"
            y1="38"
            x2={4 + Math.cos((deg * Math.PI) / 180) * 52}
            y2={38 - Math.sin((deg * Math.PI) / 180) * 34}
            opacity={0.62 - i * 0.055}
          />
        ))}
      </g>
      <path d="M0 38h58" stroke="currentColor" strokeWidth="1" opacity="0.45" />
    </svg>
  );
}

/** The monogram medallion — an octagonal deco plate carrying the initials. */
export function Monogram({ initials, className }: Art & { initials: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className} aria-hidden="true">
      <path
        d="M38 4h44l34 34v44l-34 34H38L4 82V38Z"
        fill="var(--tqd-wine-deep)"
        stroke="var(--tqd-gold)"
        strokeWidth="1.6"
      />
      <path
        d="M41 13h38l28 28v38l-28 28H41L13 79V41Z"
        stroke="var(--tqd-gold)"
        strokeWidth="0.8"
        opacity="0.5"
      />
      <g stroke="var(--tqd-gold)" strokeWidth="0.8" opacity="0.35">
        <line x1="60" y1="18" x2="60" y2="30" />
        <line x1="60" y1="90" x2="60" y2="102" />
        <line x1="18" y1="60" x2="30" y2="60" />
        <line x1="90" y1="60" x2="102" y2="60" />
      </g>
      <text
        x="60"
        y="60"
        textAnchor="middle"
        dominantBaseline="central"
        fill="var(--tqd-gold-lite)"
        style={{
          fontFamily: "var(--font-marcellus), Georgia, serif",
          fontSize: initials.length > 3 ? "20px" : "26px",
          letterSpacing: "0.08em",
        }}
      >
        {initials}
      </text>
    </svg>
  );
}



/** The pay-line marker either side of the reel window — a machined arrowhead. */
export function PayLineMark({ className, flip = false }: Art & { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 14 20"
      fill="none"
      className={className}
      aria-hidden="true"
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      <path d="M0 2 12 10 0 18Z" fill="currentColor" opacity="0.9" />
      <path d="M0 6 6 10 0 14Z" fill="var(--tqd-obsidian)" opacity="0.55" />
    </svg>
  );
}
