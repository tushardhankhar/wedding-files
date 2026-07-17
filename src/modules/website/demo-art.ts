/**
 * Self-contained, palette-driven SVG art for the PUBLIC theme demos.
 *
 * The demo galleries must "feel like a real invitation" without shipping (or
 * hotlinking) real photography — matching the platform's existing "nothing
 * hotlinked, replaceable slots" convention. So each gallery image is a classy,
 * theme-coloured SVG composition encoded as a data URI: no repo binaries, no
 * external requests, works identically in `<img src>` and CSS `background-image`.
 *
 * Compositions are deliberately centered so they survive object-cover cropping
 * in every renderer (portrait, landscape and square frames all keep the subject).
 */

export interface DemoImage {
  url: string;
  caption?: { en: string; hi?: string };
}

interface Palette {
  deep: string; // primary dark / background
  deep2: string; // secondary dark (gradient partner)
  gold: string;
  goldLite: string;
  accent: string;
  light: string; // warm paper for light compositions
  ink: string; // text/line colour on light compositions
}

const W = 1200;
const H = 1500;

/** Encode an SVG string as a data URI usable anywhere a URL is (img/bg).
 * encodeURIComponent leaves "(" and ")" literal — fine in <img src>, but in CSS
 * `background-image: url(...)` the first ")" (from rgba()/translate() in the SVG)
 * closes the url() early and breaks the image. So we percent-encode parens too,
 * making the URI safe in both <img> and unquoted CSS url(). */
function uri(svg: string): string {
  const enc = encodeURIComponent(svg.replace(/\s+/g, " ").trim())
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29");
  return `data:image/svg+xml,${enc}`;
}

function frame(defs: string, body: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs}${body}</svg>`;
}

/** Soft-blur filter with a generous region so heavy blurs don't clip. */
function blur(id: string, sd: number): string {
  return `<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${sd}"/></filter>`;
}

/** A four-point sparkle star. */
function star(cx: number, cy: number, r: number, fill: string, opacity = 1): string {
  const s = r * 0.26;
  return `<path d="M${cx} ${cy - r} L${cx + s} ${cy - s} L${cx + r} ${cy} L${cx + s} ${cy + s} L${cx} ${cy + r} L${cx - s} ${cy + s} L${cx - r} ${cy} L${cx - s} ${cy - s} Z" fill="${fill}" opacity="${opacity}"/>`;
}

/* ─── Wedding compositions ────────────────────────────────────────────────────
 * The couple appears as soft backlit silhouettes — abstract enough to stay
 * tasteful and universal, human enough to read as "two people, a real moment."
 * Mixed with a ring detail and a floral crest, the set feels like a wedding
 * album: some candids of the two of them, some close-up detail shots. */

/** A tapered limb drawn as a filled tube from (sx,sy) through control (cx,cy)
 * to (ex,ey), widening from `ws` to `we`. Shares the silhouette fill so it
 * merges into the body — this is what makes arms read as arms, not sticks. */
function taper(
  sx: number, sy: number,
  cx: number, cy: number,
  ex: number, ey: number,
  ws: number, we: number,
  col: string,
  hand = true
): string {
  const nrm = (ax: number, ay: number, bx: number, by: number): [number, number] => {
    const dx = bx - ax, dy = by - ay, l = Math.hypot(dx, dy) || 1;
    return [-dy / l, dx / l];
  };
  const [a1, b1] = nrm(sx, sy, cx, cy);
  const [a2, b2] = nrm(cx, cy, ex, ey);
  const s = ws / 2, e = we / 2, m = (s + e) / 2;
  const f = (n: number) => n.toFixed(1);
  return (
    `<path d="M${f(sx + a1 * s)} ${f(sy + b1 * s)} Q${f(cx + a1 * m)} ${f(cy + b1 * m)} ${f(ex + a2 * e)} ${f(ey + b2 * e)} L${f(ex - a2 * e)} ${f(ey - b2 * e)} Q${f(cx - a1 * m)} ${f(cy - b1 * m)} ${f(sx - a1 * s)} ${f(sy - b1 * s)} Z" fill="${col}"/>` +
    (hand ? `<circle cx="${f(ex)}" cy="${f(ey)}" r="${f(we * 0.55)}" fill="${col}"/>` : "")
  );
}

/** Bride: small rounded head with a soft nape updo (no point), sloped shoulders,
 * graceful A-line gown. Feet at local (0,0). */
function brideBody(col: string): string {
  return (
    `<path d="M-70 0 C-62 -62 -38 -122 -22 -186 C-26 -240 -28 -280 -30 -296 C-22 -302 -15 -310 -9 -318 L-9 -320 L9 -320 C15 -310 22 -302 30 -296 C28 -280 26 -240 22 -186 C38 -122 62 -62 70 0 Z" fill="${col}"/>` +
    `<ellipse cx="0" cy="-318" rx="15" ry="11" fill="${col}"/>` + // soft nape updo
    `<ellipse cx="0" cy="-341" rx="16" ry="20" fill="${col}"/>` // head
  );
}

/** Groom: neat head + hair, broad sloped shoulders, tailored trousers that stay
 * full (not spindly), splitting only low. Feet at local (0,0). */
function groomBody(col: string): string {
  return (
    `<path d="M-25 0 L-25 -12 C-23 -70 -22 -120 -19 -166 C-23 -206 -29 -252 -32 -292 C-25 -300 -15 -308 -9 -314 L-9 -316 L9 -316 C15 -308 25 -300 32 -292 C29 -252 23 -206 19 -166 C22 -120 23 -70 25 -12 L25 0 L7 0 L5 -114 L-5 -114 L-7 0 Z" fill="${col}"/>` +
    `<ellipse cx="0" cy="-338" rx="16" ry="20" fill="${col}"/>` + // head
    `<path d="M-16 -342 C-14 -364 14 -364 16 -342 Z" fill="${col}"/>` // hair
  );
}

/** Embrace — standing close, his arm around her shoulders, her arm at his waist,
 * her head tilted toward him. Reads clearly as two people. */
function coupleFacing(col: string): string {
  return (
    `<g transform="translate(-36 0) rotate(4)">${brideBody(col)}</g>` +
    `<g transform="translate(40 0)">${groomBody(col)}</g>` +
    taper(8, -298, -24, -318, -54, -288, 23, 12, col) + // his arm around her shoulders
    taper(-10, -286, 8, -250, 28, -212, 19, 12, col) // her arm around his waist
  );
}

/** Side by side, his arm around her shoulder, her head resting toward him. */
function coupleStand(col: string): string {
  return (
    `<g transform="translate(-32 0) rotate(6)">${brideBody(col)}</g>` +
    `<g transform="translate(38 0)">${groomBody(col)}</g>` +
    taper(6, -298, -24, -316, -50, -286, 22, 12, col) // his arm around her shoulders
  );
}

/** First dance — her skirt swept, one pair of hands raised and joined aloft. */
function coupleDance(col: string): string {
  return (
    `<g transform="translate(-40 0)">${brideBody(col)}</g>` +
    `<g transform="translate(42 0)">${groomBody(col)}</g>` +
    taper(-10, -296, -18, -350, -2, -372, 18, 9, col, false) + // her inner arm raised
    taper(10, -292, 18, -350, 2, -372, 20, 10, col, false) + // his inner arm raised
    `<circle cx="0" cy="-373" r="9" fill="${col}"/>` + // hands joined above their heads
    taper(14, -212, -2, -202, -18, -192, 16, 11, col, false) // his hand at her waist
  );
}

/** From behind, walking away hand in hand — her veil trailing to the floor. */
function coupleBack(col: string): string {
  return (
    `<path d="M-16 -348 C-52 -240 -46 -110 -30 -4 L30 -4 C46 -110 52 -240 16 -348 C10 -362 -10 -362 -16 -348 Z" fill="${col}" opacity="0.45" transform="translate(-32 0)"/>` + // sheer veil
    `<g transform="translate(-32 0)">${brideBody(col)}</g>` +
    `<g transform="translate(40 0)">${groomBody(col)}</g>` +
    taper(-16, -178, 4, -158, 22, -176, 14, 11, col) // joined inner hands
  );
}

// 1 · Golden hour — backlit couple facing each other against a sunset.
function goldenHour(p: Palette): string {
  const defs =
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.deep2}"/><stop offset="0.52" stop-color="${p.accent}" stop-opacity="0.9"/><stop offset="1" stop-color="${p.goldLite}"/></linearGradient>` +
    `<radialGradient id="sun" cx="50%" cy="76%" r="44%"><stop offset="0" stop-color="#ffffff" stop-opacity="0.95"/><stop offset="34%" stop-color="${p.goldLite}" stop-opacity="0.85"/><stop offset="100%" stop-color="${p.goldLite}" stop-opacity="0"/></radialGradient>` +
    blur("s", 42);
  const orbs = [
    [300, 430, 120, p.goldLite, 0.35],
    [930, 350, 150, p.gold, 0.3],
    [760, 230, 80, p.goldLite, 0.45],
    [220, 700, 90, p.gold, 0.28],
  ] as const;
  return frame(
    defs,
    `<rect width="${W}" height="${H}" fill="url(#sky)"/>` +
      `<rect width="${W}" height="${H}" fill="url(#sun)"/>` +
      `<g filter="url(#s)">${orbs
        .map(([x, y, r, c, o]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity="${o}"/>`)
        .join("")}</g>` +
      `<rect x="0" y="1168" width="${W}" height="${H - 1168}" fill="${p.deep}" opacity="0.22"/>` +
      `<ellipse cx="600" cy="1176" rx="200" ry="26" fill="${p.deep}" opacity="0.28"/>` +
      `<g transform="translate(600 1168) scale(1.55)">${coupleFacing(p.deep)}</g>`
  );
}

// 2 · Under the mandap — a lit arch with a hanging toran, couple beneath.
function mandap(p: Palette): string {
  const defs =
    `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.deep2}"/><stop offset="1" stop-color="${p.deep}"/></linearGradient>` +
    `<radialGradient id="glow" cx="50%" cy="60%" r="48%"><stop offset="0" stop-color="${p.goldLite}" stop-opacity="0.6"/><stop offset="100%" stop-color="${p.goldLite}" stop-opacity="0"/></radialGradient>`;
  const archPath = `M300 1330 L300 700 C300 430 470 300 600 300 C730 300 900 430 900 700 L900 1330`;
  const toran = Array.from({ length: 13 }, (_, i) => {
    const t = i / 12;
    const x = 300 + t * 600;
    const yBase = 300 + Math.pow(Math.abs(t - 0.5) * 2, 1.6) * 400;
    const drop = 26 + (i % 2) * 14;
    return `<circle cx="${x.toFixed(0)}" cy="${(yBase + drop).toFixed(0)}" r="9" fill="${i % 2 ? p.accent : p.goldLite}" opacity="0.9"/><line x1="${x.toFixed(0)}" y1="${yBase.toFixed(0)}" x2="${x.toFixed(0)}" y2="${(yBase + drop - 9).toFixed(0)}" stroke="${p.gold}" stroke-width="2" opacity="0.6"/>`;
  }).join("");
  return frame(
    defs,
    `<rect width="${W}" height="${H}" fill="url(#bg)"/>` +
      `<ellipse cx="600" cy="960" rx="360" ry="440" fill="url(#glow)"/>` +
      `<path d="${archPath}" fill="none" stroke="${p.gold}" stroke-width="4" opacity="0.9"/>` +
      `<path d="${archPath}" fill="none" stroke="${p.goldLite}" stroke-width="1" opacity="0.7" transform="translate(0 14)"/>` +
      toran +
      star(600, 288, 20, p.goldLite) +
      `<ellipse cx="600" cy="1322" rx="150" ry="20" fill="#000" opacity="0.22"/>` +
      `<g transform="translate(600 1316) scale(1.15)">${coupleStand(p.deep)}</g>` +
      `<rect x="240" y="1330" width="720" height="4" fill="${p.gold}" opacity="0.7"/>`
  );
}

// 3 · First dance — a spotlit couple mid-turn on a dark floor.
function firstDance(p: Palette): string {
  const defs =
    `<radialGradient id="bg" cx="50%" cy="58%" r="70%"><stop offset="0" stop-color="${p.deep2}"/><stop offset="1" stop-color="${p.deep}"/></radialGradient>` +
    `<radialGradient id="spot" cx="50%" cy="62%" r="40%"><stop offset="0" stop-color="${p.goldLite}" stop-opacity="0.85"/><stop offset="60%" stop-color="${p.gold}" stop-opacity="0.35"/><stop offset="100%" stop-color="${p.gold}" stop-opacity="0"/></radialGradient>`;
  const stars = [
    [280, 360, 12],
    [900, 300, 14],
    [980, 620, 10],
    [220, 620, 11],
    [820, 900, 9],
  ] as const;
  return frame(
    defs,
    `<rect width="${W}" height="${H}" fill="url(#bg)"/>` +
      `<rect width="${W}" height="${H}" fill="url(#spot)"/>` +
      `<ellipse cx="600" cy="1200" rx="260" ry="40" fill="${p.deep}" opacity="0.5"/>` +
      `<g transform="translate(600 1180) scale(1.5)">${coupleDance(p.deep)}</g>` +
      stars.map(([x, y, r]) => star(x, y, r, p.goldLite, 0.8)).join("")
  );
}

// 4 · Just the two of us — walking away together down a warm path.
function walkingAway(p: Palette): string {
  const defs =
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.deep2}"/><stop offset="0.6" stop-color="${p.accent}" stop-opacity="0.8"/><stop offset="1" stop-color="${p.goldLite}"/></linearGradient>` +
    `<radialGradient id="haze" cx="50%" cy="60%" r="40%"><stop offset="0" stop-color="${p.goldLite}" stop-opacity="0.8"/><stop offset="100%" stop-color="${p.goldLite}" stop-opacity="0"/></radialGradient>`;
  return frame(
    defs,
    `<rect width="${W}" height="${H}" fill="url(#sky)"/>` +
      `<rect width="${W}" height="${H}" fill="url(#haze)"/>` +
      // receding path
      `<path d="M540 1160 L660 1160 L900 1500 L300 1500 Z" fill="${p.light}" opacity="0.35"/>` +
      `<ellipse cx="600" cy="1166" rx="120" ry="16" fill="${p.deep}" opacity="0.25"/>` +
      `<g transform="translate(600 1158) scale(1.2)">${coupleBack(p.deep)}</g>`
  );
}

// 3 · In bloom — a botanical laurel crest on warm paper (wedding stationery).
function botanical(p: Palette): string {
  const defs = `<linearGradient id="bg" x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="${p.light}"/></linearGradient>`;
  const bloom = (x: number, y: number, c: string, r = 24) =>
    Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2;
      const bx = (x + Math.cos(a) * r * 0.62).toFixed(0);
      const by = (y + Math.sin(a) * r * 0.62).toFixed(0);
      return `<ellipse cx="${bx}" cy="${by}" rx="${(r * 0.5).toFixed(0)}" ry="${(r * 0.9).toFixed(0)}" fill="${c}" opacity="0.92" transform="rotate(${((a * 180) / Math.PI).toFixed(0)} ${bx} ${by})"/>`;
    }).join("") + `<circle cx="${x}" cy="${y}" r="${(r * 0.42).toFixed(0)}" fill="${p.gold}"/>`;
  // Leaves along each laurel branch: [x, y, angle°] in local (pre-mirror) coords.
  const leafSpots: Array<[number, number, number]> = [
    [-30, -120, -38], [-15, -180, 160], [-58, -230, -48], [-40, -300, 165],
    [-82, -340, -54], [-64, -410, 168], [-104, -450, -60], [-88, -520, 172],
    [-122, -560, -70], [-108, -620, 176], [-134, -668, -82],
  ];
  const branch = (flip: number) =>
    `<g transform="translate(600 1170) scale(${flip} 1)">` +
    `<path d="M0 0 C -30 -260 -120 -500 -150 -740" fill="none" stroke="${p.accent}" stroke-width="5" opacity="0.55"/>` +
    leafSpots
      .map(
        ([x, y, a], i) =>
          `<ellipse cx="0" cy="0" rx="13" ry="40" fill="${i % 3 === 0 ? p.gold : p.accent}" opacity="0.8" transform="translate(${x} ${y}) rotate(${a})"/>`
      )
      .join("") +
    `</g>`;
  return frame(
    defs,
    `<rect width="${W}" height="${H}" fill="url(#bg)"/>` +
      `<rect x="70" y="70" width="${W - 140}" height="${H - 140}" fill="none" stroke="${p.gold}" stroke-width="2" opacity="0.4"/>` +
      `<rect x="86" y="86" width="${W - 172}" height="${H - 172}" fill="none" stroke="${p.gold}" stroke-width="1" opacity="0.3"/>` +
      branch(1) +
      branch(-1) +
      // tied bouquet at the base
      bloom(600, 1120, p.accent, 40) +
      bloom(524, 1150, p.goldLite, 30) +
      bloom(676, 1150, p.gold, 30) +
      `<path d="M585 1160 Q600 1230 615 1160" fill="none" stroke="${p.gold}" stroke-width="4" opacity="0.7"/>` +
      `<path d="M600 1180 L560 1320 M600 1180 L640 1320" stroke="${p.gold}" stroke-width="3" opacity="0.5"/>` +
      // monogram crown
      `<circle cx="600" cy="470" r="70" fill="none" stroke="${p.gold}" stroke-width="1.5" opacity="0.6"/>` +
      star(600, 470, 30, p.accent, 0.7) +
      `<circle cx="600" cy="360" r="5" fill="${p.gold}" opacity="0.7"/>`
  );
}

// 4 · Bound — two interlaced rings over a deep glow.
function rings(p: Palette): string {
  const defs =
    `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.deep2}"/><stop offset="1" stop-color="${p.deep}"/></linearGradient>` +
    `<radialGradient id="glow" cx="50%" cy="48%" r="42%"><stop offset="0" stop-color="${p.gold}" stop-opacity="0.4"/><stop offset="100%" stop-color="${p.gold}" stop-opacity="0"/></radialGradient>`;
  const cy = 720;
  return frame(
    defs,
    `<rect width="${W}" height="${H}" fill="url(#bg)"/>` +
      `<circle cx="600" cy="${cy}" r="360" fill="url(#glow)"/>` +
      `<circle cx="510" cy="${cy}" r="150" fill="none" stroke="${p.gold}" stroke-width="14"/>` +
      `<circle cx="510" cy="${cy}" r="150" fill="none" stroke="${p.goldLite}" stroke-width="3" opacity="0.7" transform="rotate(-30 510 ${cy})" stroke-dasharray="120 800"/>` +
      `<circle cx="690" cy="${cy}" r="150" fill="none" stroke="${p.gold}" stroke-width="14"/>` +
      `<circle cx="690" cy="${cy}" r="150" fill="none" stroke="${p.goldLite}" stroke-width="3" opacity="0.7" transform="rotate(150 690 ${cy})" stroke-dasharray="120 800"/>` +
      star(600, 470, 26, p.goldLite) +
      star(360, 640, 15, p.goldLite, 0.7) +
      star(860, 820, 18, p.goldLite, 0.7) +
      star(600, 990, 12, p.goldLite, 0.6)
  );
}

/* ─── Kids' birthday (Confetti) ──────────────────────────────────────────── */

function balloons(c: { sky: string; sun: string; coral: string; lavender: string; cream: string }): string {
  const defs = `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="${c.cream}"/></linearGradient>`;
  const set = [
    [430, 470, c.coral],
    [600, 380, c.sky],
    [770, 480, c.sun],
    [510, 600, c.lavender],
    [690, 610, c.coral],
    [600, 520, c.sky],
  ] as const;
  const balloonsSvg = set
    .map(
      ([x, y, col]) =>
        `<ellipse cx="${x}" cy="${y}" rx="78" ry="96" fill="${col}"/><ellipse cx="${x - 22}" cy="${y - 30}" rx="18" ry="26" fill="#fff" opacity="0.4"/><path d="M${x} ${y + 96} Q${x + 20} ${y + 260} 600 1150" fill="none" stroke="#c9b79a" stroke-width="2" opacity="0.6"/><path d="M${x - 8} ${y + 96} L${x + 8} ${y + 96} L${x} ${y + 112} Z" fill="${col}"/>`
    )
    .join("");
  const confetti = Array.from({ length: 34 }, (_, i) => {
    const cols = [c.sky, c.sun, c.coral, c.lavender];
    const x = (i * 211) % W;
    const y = 780 + ((i * 173) % 620);
    const rot = (i * 47) % 360;
    return `<rect x="${x}" y="${y}" width="18" height="10" rx="2" fill="${cols[i % 4]}" opacity="0.85" transform="rotate(${rot} ${x} ${y})"/>`;
  }).join("");
  return frame(defs, `<rect width="${W}" height="${H}" fill="url(#bg)"/>${balloonsSvg}${confetti}`);
}

function confettiBurst(c: { sky: string; sun: string; coral: string; lavender: string; cream: string }): string {
  const defs = `<radialGradient id="bg" cx="50%" cy="42%" r="75%"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="${c.sky}" stop-opacity="0.25"/></radialGradient>`;
  const cols = [c.sky, c.sun, c.coral, c.lavender];
  const bits = Array.from({ length: 90 }, (_, i) => {
    const a = (i / 90) * Math.PI * 2;
    const d = 120 + ((i * 53) % 560);
    const x = 600 + Math.cos(a) * d;
    const y = 700 + Math.sin(a) * d * 0.9;
    const rot = (i * 61) % 360;
    return i % 3 === 0
      ? `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="7" fill="${cols[i % 4]}" opacity="0.9"/>`
      : `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="20" height="9" rx="2" fill="${cols[i % 4]}" opacity="0.9" transform="rotate(${rot} ${x.toFixed(0)} ${y.toFixed(0)})"/>`;
  }).join("");
  return frame(
    defs,
    `<rect width="${W}" height="${H}" fill="url(#bg)"/>${bits}${star(600, 700, 60, c.sun, 0.9)}`
  );
}

/* ─── Baby shower (Little Miracle) ───────────────────────────────────────── */

function starryNight(c: { cloud: string; blush: string; gold: string; night: string; cream: string }): string {
  const defs =
    `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.night}"/><stop offset="1" stop-color="#3a3d5a"/></linearGradient>` +
    `<mask id="cr"><rect width="${W}" height="${H}" fill="#000"/><circle cx="600" cy="560" r="150" fill="#fff"/><circle cx="668" cy="520" r="140" fill="#000"/></mask>`;
  const stars = [
    [300, 360, 16],
    [860, 420, 14],
    [420, 640, 10],
    [780, 720, 12],
    [560, 900, 14],
    [340, 960, 10],
    [900, 980, 12],
  ] as const;
  return frame(
    defs,
    `<rect width="${W}" height="${H}" fill="url(#bg)"/>` +
      `<rect width="${W}" height="${H}" fill="${c.gold}" mask="url(#cr)"/>` +
      `<ellipse cx="420" cy="1120" rx="150" ry="52" fill="${c.cloud}" opacity="0.85"/><ellipse cx="520" cy="1100" rx="120" ry="46" fill="${c.cloud}" opacity="0.85"/>` +
      stars.map(([x, y, r]) => star(x, y, r, c.blush, 0.95)).join("") +
      Array.from({ length: 46 }, (_, i) => `<circle cx="${(i * 149) % W}" cy="${(i * 271) % H}" r="2.4" fill="#fff" opacity="0.6"/>`).join("")
  );
}

function softClouds(c: { cloud: string; blush: string; gold: string; night: string; cream: string }): string {
  const defs = `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.cloud}"/><stop offset="1" stop-color="${c.cream}"/></linearGradient>`;
  const cloud = (x: number, y: number, s: number) =>
    `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="120" ry="60" fill="#fff"/><ellipse cx="-90" cy="20" rx="70" ry="44" fill="#fff"/><ellipse cx="90" cy="20" rx="70" ry="44" fill="#fff"/><ellipse cx="0" cy="34" rx="150" ry="40" fill="#fff"/></g>`;
  const stars = [
    [300, 380, 14, c.gold],
    [880, 460, 12, c.blush],
    [520, 300, 10, c.gold],
    [720, 1120, 12, c.blush],
    [360, 1080, 10, c.gold],
  ] as const;
  return frame(
    defs,
    `<rect width="${W}" height="${H}" fill="url(#bg)"/>` +
      cloud(380, 560, 1.1) +
      cloud(820, 780, 0.85) +
      cloud(560, 980, 1.25) +
      stars.map(([x, y, r, col]) => star(x, y, r, col, 0.9)).join("") +
      `<circle cx="600" cy="720" r="6" fill="${c.gold}" opacity="0.7"/>`
  );
}

/* ─── Theme palettes (hand-tuned from the registry swatches) ──────────────── */

const PALETTES: Record<string, Palette> = {
  royal: { deep: "#191426", deep2: "#46325f", gold: "#b8912f", goldLite: "#e4c56a", accent: "#7a3d94", light: "#f7f0e4", ink: "#2b2438" },
  ivory: { deep: "#2b2536", deep2: "#3a3348", gold: "#c2a24a", goldLite: "#e8d29a", accent: "#9c6b84", light: "#fbf7f0", ink: "#3a3348" },
  christian: { deep: "#354438", deep2: "#7e9278", gold: "#c9a86a", goldLite: "#e6cf9e", accent: "#b76e79", light: "#faf6ef", ink: "#40382f" },
  punjabi: { deep: "#8a1746", deep2: "#c2185b", gold: "#e39a12", goldLite: "#ffd36b", accent: "#d81b60", light: "#fff6ec", ink: "#3a2230" },
  "south-indian": { deep: "#3f0f18", deep2: "#5c1620", gold: "#c69a2e", goldLite: "#e6c56a", accent: "#1f5c3d", light: "#fbf3e6", ink: "#3a1f1a" },
  rajasthani: { deep: "#141d40", deep2: "#34479a", gold: "#c19a3e", goldLite: "#e6c56a", accent: "#b5372e", light: "#f7f1e3", ink: "#20264a" },
  "save-the-date": { deep: "#082018", deep2: "#124a37", gold: "#c9a23f", goldLite: "#e8cd7e", accent: "#c9a23f", light: "#f7f0e0", ink: "#0e3b2c" },
  mayura: { deep: "#063231", deep2: "#0e6e6e", gold: "#c9a23f", goldLite: "#ecd07a", accent: "#d81b60", light: "#fdf4e3", ink: "#193c3b" },
};

const CONFETTI_C = { sky: "#60A5FA", sun: "#FACC15", coral: "#FB7185", lavender: "#A78BFA", cream: "#FFFDF5" };
const MIRACLE_C = { cloud: "#DCEAF7", blush: "#F6D6D6", gold: "#C5A46D", night: "#2b2d42", cream: "#FFF9F0" };

/** Wedding gallery: six moods, coloured to the theme, with album-style captions. */
const WEDDING_CAPTIONS: Array<{ en: string; hi: string }> = [
  { en: "Golden hour", hi: "ढलती शाम" },
  { en: "Under the mandap", hi: "मंडप तले" },
  { en: "Our first dance", hi: "पहला नृत्य" },
  { en: "Just the two of us", hi: "बस हम दो" },
  { en: "Two hearts, one vow", hi: "दो दिल, एक वचन" },
  { en: "Sealed with love", hi: "प्यार की मुहर" },
];

export function weddingGallery(themeId: string): DemoImage[] {
  const p = PALETTES[themeId] ?? PALETTES.royal;
  const builders = [goldenHour, mandap, firstDance, walkingAway, rings, botanical];
  return builders.map((b, i) => ({ url: uri(b(p)), caption: WEDDING_CAPTIONS[i] }));
}

const CONFETTI_CAPTIONS = [
  { en: "Balloon magic", hi: "गुब्बारों का जादू" },
  { en: "Let the party pop!", hi: "जश्न शुरू!" },
  { en: "Cake & confetti", hi: "केक और कन्फ़ेटी" },
];

export function confettiGallery(): DemoImage[] {
  return [
    { url: uri(balloons(CONFETTI_C)), caption: CONFETTI_CAPTIONS[0] },
    { url: uri(confettiBurst(CONFETTI_C)), caption: CONFETTI_CAPTIONS[1] },
    { url: uri(balloons(CONFETTI_C)), caption: CONFETTI_CAPTIONS[2] },
  ];
}

const MIRACLE_CAPTIONS = [
  { en: "Wish upon a star", hi: "तारे से एक मन्नत" },
  { en: "On cloud nine", hi: "बादलों पर सवार" },
  { en: "Almost here", hi: "बस आने ही वाला है" },
];

export function littleMiracleGallery(): DemoImage[] {
  return [
    { url: uri(starryNight(MIRACLE_C)), caption: MIRACLE_CAPTIONS[0] },
    { url: uri(softClouds(MIRACLE_C)), caption: MIRACLE_CAPTIONS[1] },
    { url: uri(starryNight(MIRACLE_C)), caption: MIRACLE_CAPTIONS[2] },
  ];
}
