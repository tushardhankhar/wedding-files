import type { CSSProperties } from "react";

/**
 * THE COUPLE — the drawn figures a theme shows in its illustration slot until the
 * client uploads a caricature of their own (see {@link resolveArtwork}).
 *
 * One drawing, re-coloured per theme: every fill comes in through {@link
 * CoupleColors}, so the Overture's cream-on-emerald and the Muhurat's ivory-on-
 * maroon are the same figures wearing each theme's palette. The Gulistan keeps
 * its own pair — they lean on that scene's balustrade and are cut for it.
 *
 * Proportions come from the demo-art silhouettes (`demo-art.ts`), which were
 * tuned until two people read as two people at thumbnail size; the attire, drapes
 * and jewellery are layered on top of those same bodies. Detail is deliberately
 * restrained: inside a cameo this renders about 160px tall, where anything finer
 * than a 2px dot disappears.
 *
 * Feet sit on the bottom of the 300×380 viewBox, so the slot can anchor the
 * drawing to its floor exactly as it anchors an upload.
 */

export interface CoupleColors {
  skin: string;
  hair: string;
  /** The groom's sherwani. */
  attireA: string;
  /** The bride's lehenga. */
  attireB: string;
  /** Her choli + his collar — a deeper tone of the attire, for shape. */
  bodice: string;
  /** Her dupatta and his stole. */
  drape: string;
  gold: string;
  goldLite: string;
  /** The pool of shade the two of them stand in. */
  shadow: string;
}

/**
 * A tapered limb as a filled tube from (sx,sy) through (cx,cy) to (ex,ey),
 * widening from `ws` to `we` — an arm reads as an arm rather than a stick, and
 * shares the sleeve's fill so it merges into the body. Ported from the
 * silhouette art's `taper`, minus the hand (drawn separately here, in skin).
 */
function taper(
  sx: number, sy: number,
  cx: number, cy: number,
  ex: number, ey: number,
  ws: number, we: number
): string {
  const nrm = (ax: number, ay: number, bx: number, by: number): [number, number] => {
    const dx = bx - ax, dy = by - ay, l = Math.hypot(dx, dy) || 1;
    return [-dy / l, dx / l];
  };
  const [a1, b1] = nrm(sx, sy, cx, cy);
  const [a2, b2] = nrm(cx, cy, ex, ey);
  const s = ws / 2, e = we / 2, m = (s + e) / 2;
  const f = (n: number) => n.toFixed(1);
  return `M${f(sx + a1 * s)} ${f(sy + b1 * s)} Q${f(cx + a1 * m)} ${f(cy + b1 * m)} ${f(ex + a2 * e)} ${f(ey + b2 * e)} L${f(ex - a2 * e)} ${f(ey - b2 * e)} Q${f(cx - a1 * m)} ${f(cy - b1 * m)} ${f(sx - a1 * s)} ${f(sy - b1 * s)} Z`;
}

/** Embroidery scattered over her skirt — placed by hand, never random, so the
 * server and the client agree. */
const BUTI: Array<[number, number]> = [
  [-42, -68], [-16, -104], [8, -80], [32, -116], [-30, -142],
  [20, -152], [46, -54], [-54, -42], [0, -56], [-8, -180],
];

/** Bride — flared lehenga, gold-banded hem, a dupatta pinned at the crown and
 * falling down her outer side. Feet at local (0,0). */
function Bride({ c }: { c: CoupleColors }) {
  return (
    <g>
      {/* the dupatta, pinned at her crown and falling behind her — sheer, so it
          reads as fabric rather than as a gold ribbon */}
      <path
        d="M-13 -350 C-27 -342 -38 -318 -43 -288 C-49 -244 -52 -184 -55 -128 C-56 -104 -57 -86 -57 -72 L-45 -70 C-45 -86 -44 -106 -43 -126 C-41 -180 -38 -236 -33 -276 C-29 -304 -22 -326 -7 -336 Z"
        fill={c.drape}
        opacity="0.62"
      />
      <path
        d="M-13 -350 C-27 -342 -38 -318 -43 -288 C-49 -244 -52 -184 -55 -128 C-56 -104 -57 -86 -57 -72"
        fill="none"
        stroke={c.goldLite}
        strokeWidth="1.1"
        opacity="0.6"
      />
      {/* the veil's fringe, so it ends rather than stops */}
      {[-55, -51, -47].map((x, i) => (
        <path key={x} d={`M${x} ${-72 + i} L${x + 0.5} ${-64 + i}`} stroke={c.goldLite} strokeWidth="0.9" opacity="0.55" />
      ))}

      {/* lehenga */}
      <path
        d="M-70 0 C-62 -62 -38 -122 -22 -186 C-26 -240 -28 -280 -30 -296 C-22 -302 -15 -310 -9 -318 L-9 -320 L9 -320 C15 -310 22 -302 30 -296 C28 -280 26 -240 22 -186 C38 -122 62 -62 70 0 Z"
        fill={c.attireB}
      />
      {/* choli — a deeper tone above the waist gives the skirt its flare */}
      <path
        d="M-30 -296 C-22 -302 -15 -310 -9 -318 L-9 -320 L9 -320 C15 -310 22 -302 30 -296 C29 -278 28 -262 27 -250 L-27 -250 C-28 -262 -29 -278 -30 -296 Z"
        fill={c.bodice}
      />
      {/* gold waistband */}
      <path d="M-27.5 -252 L27.5 -252 L27 -241 L-27 -241 Z" fill={c.gold} opacity="0.85" />
      {/* hem bands */}
      <path d="M-66 -12 Q0 -30 66 -12" fill="none" stroke={c.gold} strokeWidth="3.4" opacity="0.9" />
      <path d="M-61 -28 Q0 -46 61 -28" fill="none" stroke={c.goldLite} strokeWidth="1.6" opacity="0.75" />
      {BUTI.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.2" fill={c.gold} opacity="0.5" />
      ))}

      {/* nape bun, head, centre-parted hair, braid over the far shoulder */}
      <ellipse cx="0" cy="-318" rx="15" ry="11" fill={c.hair} />
      <ellipse cx="0" cy="-341" rx="16" ry="20" fill={c.skin} />
      <path
        d="M-17 -344 C-18 -366 18 -366 17 -344 C12 -354 7 -349 0 -349 C-7 -349 -12 -354 -17 -344 Z"
        fill={c.hair}
      />
      <path
        d="M-15 -334 C-25 -318 -29 -298 -27 -274 C-25 -260 -21 -254 -18 -256 C-23 -270 -23 -292 -14 -316 Z"
        fill={c.hair}
      />

      {/* maang tikka, jhumkas, necklace */}
      <circle cx="0" cy="-358" r="2.6" fill={c.goldLite} />
      <circle cx="-16.5" cy="-331" r="2.4" fill={c.goldLite} />
      <circle cx="16.5" cy="-331" r="2.4" fill={c.goldLite} />
      <path d="M-11 -316 Q0 -303 11 -316" fill="none" stroke={c.gold} strokeWidth="2" />
      <circle cx="0" cy="-301" r="2.8" fill={c.goldLite} />
    </g>
  );
}

/** Groom — long sherwani over churidar, a stole down his outer side, safa with a
 * kalgi. Feet at local (0,0). */
function Groom({ c }: { c: CoupleColors }) {
  return (
    <g>
      {/* churidar + torso */}
      <path
        d="M-25 0 L-25 -12 C-23 -70 -22 -120 -19 -166 C-23 -206 -29 -252 -32 -292 C-25 -300 -15 -308 -9 -314 L-9 -316 L9 -316 C15 -308 25 -300 32 -292 C29 -252 23 -206 19 -166 C22 -120 23 -70 25 -12 L25 0 L7 0 L5 -114 L-5 -114 L-7 0 Z"
        fill={c.attireA}
      />
      {/* juttis */}
      <ellipse cx="-15" cy="-2" rx="8" ry="4" fill={c.hair} opacity="0.85" />
      <ellipse cx="15" cy="-2" rx="8" ry="4" fill={c.hair} opacity="0.85" />

      {/* the sherwani itself — same cream, drawn in gold line, so it reads as a
          coat over the churidar rather than a change of colour */}
      <path
        d="M-31 -290 C-25 -299 -15 -307 -9 -313 L9 -313 C15 -307 25 -299 31 -290 C28 -248 25 -198 27 -150 C29 -128 31 -110 32 -96 L-32 -96 C-31 -110 -29 -128 -27 -150 C-25 -198 -28 -248 -31 -290 Z"
        fill={c.attireA}
        stroke={c.gold}
        strokeWidth="1.1"
      />
      <path d="M-3 -300 L-3 -104" stroke={c.gold} strokeWidth="0.8" opacity="0.45" />
      {[-286, -262, -238, -214].map((y) => (
        <circle key={y} cx="-3" cy={y} r="1.8" fill={c.goldLite} />
      ))}
      <path d="M-32 -100 L32 -100" stroke={c.goldLite} strokeWidth="1.4" opacity="0.6" />
      {/* mandarin collar */}
      <path d="M-10 -314 L10 -314 L7 -299 L-7 -299 Z" fill={c.attireA} stroke={c.gold} strokeWidth="0.9" />

      {/* stole, hugging his outer edge so it never reads as a second placket */}
      <path
        d="M18 -304 C27 -297 30 -282 29 -262 C28 -232 27 -196 25 -164 L15 -164 C17 -196 19 -232 19 -264 C19 -280 17 -294 13 -300 Z"
        fill={c.drape}
        opacity="0.85"
      />
      <path d="M15 -170 L26 -170" stroke={c.goldLite} strokeWidth="1.5" opacity="0.85" />

      {/* head + safa with a kalgi */}
      <ellipse cx="0" cy="-338" rx="16" ry="20" fill={c.skin} />
      <path
        d="M-20 -340 C-25 -364 -10 -379 6 -377 C20 -375 27 -362 22 -346 C13 -353 -8 -352 -20 -340 Z"
        fill={c.bodice}
        stroke={c.gold}
        strokeWidth="1.1"
      />
      <path d="M-15 -346 C-6 -357 8 -358 19 -351" fill="none" stroke={c.gold} strokeWidth="0.9" opacity="0.6" />
      <path d="M-17 -352 C-8 -363 6 -365 17 -358" fill="none" stroke={c.gold} strokeWidth="0.9" opacity="0.45" />
      <path d="M18 -368 C23 -380 29 -387 33 -390" fill="none" stroke={c.gold} strokeWidth="1.4" />
      <circle cx="33" cy="-391" r="2.6" fill={c.goldLite} />
      <circle cx="17" cy="-366" r="3" fill={c.goldLite} />
    </g>
  );
}

export function CoupleIllustration({
  colors: c,
  className,
  style,
}: {
  colors: CoupleColors;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg viewBox="0 0 300 380" fill="none" aria-hidden className={className} style={style}>
      <g transform="translate(152 368)">
        {/* the shade they stand in — without it they float */}
        <ellipse cx="-10" cy="2" rx="94" ry="9" fill={c.shadow} opacity="0.3" />

        {/* His arm, drawn before her so it passes behind her shoulders: only the
            length between them shows, and that is enough to read as an embrace.
            Laid across the front of her instead, a pale sleeve reads at this size
            as a blot on her bodice — and a bare forearm over his sherwani reads
            worse. */}
        <path d={taper(20, -304, 0, -308, -30, -300, 13, 10)} fill={c.attireA} />

        <g transform="translate(-32 0)">
          <Bride c={c} />
        </g>
        <g transform="translate(38 0)">
          <Groom c={c} />
        </g>
      </g>
    </svg>
  );
}
