import { UtsavMonogram } from "./logo";
import { PRICE, SHOWCASE_THEMES, SITE_DOMAIN, type ShowcaseTheme } from "./data";
import {
  Backdrop,
  GOLD,
  Headline,
  Icon,
  IVORY,
  LEAF,
  POPPINS,
  Phone,
  RALEWAY,
  ThemeGround,
  moodFor,
  type IconName,
} from "./ad-kit";

/**
 * The premium banner — a 16:9 hoarding-scale creative. A billboard is read at
 * a glance from a moving car, not scrolled past on a feed, so this version
 * cuts everything a driver can't absorb in that glance: a five-word feature
 * list became three icons, a two-sentence headline became two words, the
 * price seal became a whisper. What's left is oversized on purpose — the
 * phones and the headline are the only two things competing for attention,
 * and they're sized to both win.
 *
 * Same palette as before — durbar wine, antique gold, champagne ivory — but
 * with fewer distinct ornaments (one arch mark, one corner bracket, rotated)
 * rather than three, because restraint is what reads as expensive at this
 * scale, not density.
 */

// 960×540 at 1.75× → 1680×945, a clean 16:9 at the scale a launch-grade
// hoarding graphic is expected to ship in.
export const AD_BILLBOARD_CANVAS = { width: 960, height: 540, scale: 1.75 } as const;

const PAD = 38;
/** Width of the left copy column — narrow on purpose, so the two-word
 *  headline can run large without the phones giving up their room. */
const COL_WIDTH = 440;

/** Durbar wine, lit from the top-left the way the Maharaja theme's own hero is. */
const WINE_GROUND = "linear-gradient(158deg, #6b1a2a 0%, #4A0A16 34%, #300a12 66%, #1a0509 100%)";
/** The pill's own ink — wine rather than the ad kit's navy, so the seal reads as struck from the same card. */
const WINE_INK = "#3a0a14";

function themeById(id: string): ShowcaseTheme | undefined {
  return SHOWCASE_THEMES.find((t) => t.id === id);
}

/**
 * Three themes, back-to-front, chosen for visibly different moods (royal wine,
 * rose-romantic, temple gold) so the fan reads as "range" at a glance, at
 * roughly 30% larger than the first cut of this ad — big enough to be the
 * card's actual hero rather than an illustration beside the copy.
 *
 * Left/right positions are solved so the two side phones' centres sit
 * equidistant either side of the hero's centre — get this wrong (as the first
 * cut did, by 14px) and the fan visibly leans to one side.
 */
const FAN: { id: string; scale: number; left: number; top: number; rotate: number; z: number }[] = [
  { id: "jharokha", scale: 0.572, left: 463, top: 165, rotate: -9, z: 1 },
  { id: "maharaja", scale: 0.806, left: 600, top: 53, rotate: 0, z: 3 },
  { id: "kalyanam", scale: 0.572, left: 799, top: 165, rotate: 9, z: 1 },
];

/** One word each — a driver reads an icon before a phrase. */
const BADGES: { icon: IconName; text: string }[] = [
  { icon: "rsvp", text: "RSVP" },
  { icon: "hourglass", text: "Timeline" },
  { icon: "camera", text: "Gallery" },
];

/** Smaller than the wide banner's — a corner signature, not competing with the headline for weight. */
function Wordmark() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <UtsavMonogram className="h-[20px] w-[20px]" stroke={GOLD} bud={IVORY} />
      <span style={{ fontFamily: POPPINS, fontWeight: 600, fontSize: 15, letterSpacing: "0.01em", color: IVORY }}>
        Join the <span style={{ color: GOLD }}>Jashn</span>
      </span>
    </div>
  );
}

function EyebrowLg({ text }: { text: string }) {
  return (
    <p
      style={{
        fontFamily: POPPINS,
        fontWeight: 600,
        fontSize: 13.5,
        letterSpacing: "0.34em",
        textTransform: "uppercase",
        color: IVORY,
        opacity: 0.56,
        margin: 0,
      }}
    >
      {text}
    </p>
  );
}

/** Icon and a single word — no feature-list sentences, this is glanced at from a car. */
function BadgeRow() {
  return (
    <div style={{ display: "flex", gap: 22 }}>
      {BADGES.map((b) => (
        <div key={b.icon} style={{ display: "flex", alignItems: "center", gap: 7 }}>
          {/* Antique gold, not brand yellow — the mark is engraving, not the CTA. */}
          <Icon name={b.icon} size={18} color={LEAF} opacity={0.95} />
          <span style={{ fontFamily: RALEWAY, fontSize: 15, color: IVORY, opacity: 0.8, whiteSpace: "nowrap" }}>
            {b.text}
          </span>
        </div>
      ))}
    </div>
  );
}

/** A struck flourish between blocks — fading ticks either side of a diamond. */
function OrnateRule() {
  return (
    <div aria-hidden="true" style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ width: 40, height: 1, background: `linear-gradient(90deg, ${LEAF}00, ${LEAF})`, opacity: 0.85 }} />
      <span
        style={{
          width: 7,
          height: 7,
          transform: "rotate(45deg)",
          border: `1.4px solid ${LEAF}`,
          opacity: 0.95,
          flex: "none",
        }}
      />
      <span style={{ width: 40, height: 1, background: `linear-gradient(90deg, ${LEAF}, ${LEAF}00)`, opacity: 0.85 }} />
    </div>
  );
}

/**
 * A simplified Mughal-arch silhouette — onion dome, flanking chattris, twin
 * minarets — struck at low opacity in each corner. Not a screenshot of any
 * particular monument, just the family of shapes every theme's own art
 * (`registry.ts`) already draws on, so the mark reads as "ours" rather than
 * borrowed from any one reference.
 */
function MonumentMark({
  flip = false,
  opacity = 0.13,
  width = 260,
  height = 208,
}: {
  flip?: boolean;
  opacity?: number;
  width?: number;
  height?: number;
}) {
  return (
    <svg
      viewBox="0 0 200 160"
      width={width}
      height={height}
      aria-hidden="true"
      style={{ transform: flip ? "scaleX(-1)" : undefined }}
      fill="none"
      stroke={LEAF}
      strokeWidth={1.3}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <g opacity={opacity}>
        <rect x="55" y="86" width="90" height="58" />
        <path d="M85 144 V110 Q85 96 100 96 Q115 96 115 110 V144" />
        <path d="M78 86 Q78 46 100 40 Q122 46 122 86" />
        <path d="M100 40 V27" />
        <circle cx="100" cy="24" r="2.6" />
        <path d="M58 86 Q58 74 66 72 Q74 74 74 86" />
        <path d="M126 86 Q126 74 134 72 Q142 74 142 86" />
        <rect x="18" y="60" width="10" height="84" />
        <path d="M18 60 Q23 47 28 60" />
        <circle cx="23" cy="44" r="1.9" />
        <rect x="172" y="60" width="10" height="84" />
        <path d="M172 60 Q177 47 182 60" />
        <circle cx="177" cy="44" r="1.9" />
        <path d="M14 144 H186" />
        <path d="M6 154 H194" />
      </g>
    </svg>
  );
}

/**
 * A struck corner bracket — a rounded double line plus a small diamond at the
 * joint. Rotating one asset four ways (rather than drawing four bespoke
 * corners, or layering in a second ornament family) keeps the frame quiet —
 * one accent, repeated, rather than several competing for attention.
 */
function CornerBracket({ rotate }: { rotate: number }) {
  return (
    <svg
      viewBox="0 0 54 54"
      width={54}
      height={54}
      aria-hidden="true"
      style={{ transform: `rotate(${rotate}deg)` }}
      fill="none"
    >
      <path d="M3 50 V13 Q3 3 13 3 H50" stroke={LEAF} strokeWidth={1.4} opacity={0.9} />
      <path d="M11 50 V21 Q11 11 21 11 H50" stroke={LEAF} strokeWidth={1} opacity={0.5} />
      <rect x="9.5" y="9.5" width="5" height="5" transform="rotate(45 12 12)" fill={LEAF} opacity={0.9} />
    </svg>
  );
}

/** The CTA and, below it, the site — the two things worth a driver's second glance. */
function OfferBlock() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, alignSelf: "flex-start" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "22px 34px",
          borderRadius: 999,
          background: `linear-gradient(180deg, #fbe89a 0%, ${GOLD} 46%, #cfa617 100%)`,
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ fontFamily: POPPINS, fontWeight: 700, fontSize: 21, letterSpacing: "0.02em", color: WINE_INK }}>
          GET YOUR WEBSITE
        </span>
        <span style={{ fontFamily: POPPINS, fontWeight: 700, fontSize: 22, color: WINE_INK }}>→</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, whiteSpace: "nowrap" }}>
        {/* White and roughly twice the wide banner's size — the one detail a
            driver actually has to retain after the light turns green. */}
        <span style={{ fontFamily: POPPINS, fontWeight: 600, fontSize: 27, color: IVORY }}>{SITE_DOMAIN}</span>
        {/* The price, kept — but a whisper, not a seal. Luxury doesn't lead with
            the number; it mentions it once, quietly, after the domain. */}
        <span style={{ fontFamily: RALEWAY, fontSize: 13.5, color: GOLD, opacity: 0.75 }}>
          Starting at {PRICE}
        </span>
      </div>
    </div>
  );
}

export function AdBillboardCard() {
  const { width, height } = AD_BILLBOARD_CANVAS;
  const heroMood = moodFor(themeById("maharaja"));

  return (
    <div style={{ position: "relative", width, height, overflow: "hidden", background: WINE_GROUND }}>
      {/* Warmth pooled behind the fan on the right, same device as the range ad —
          here it's barely a lift, since the ground is already the theme's own
          wine rather than a cool navy it has to warm up. */}
      <ThemeGround mood={heroMood} anchor="74% 56%" />

      {/* A second, tighter pool centred on the hero phone alone — the "soft gold
          glow" a product shot this size needs to lift off the ground instead of
          just standing on lit wine. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 480,
          top: 60,
          width: 320,
          height: 420,
          background: `radial-gradient(closest-side, ${heroMood.warm}30 0%, transparent 72%)`,
        }}
      />

      {/* One arch mark, both bottom corners — the wide banner's second, larger
          copy on the right is gone: at this phone size it only ever hid behind
          the fan anyway, so it was ornament nobody could see. */}
      <div style={{ position: "absolute", left: -30, bottom: -30 }}>
        <MonumentMark />
      </div>

      <Backdrop bloom="74% -14%" tint={heroMood.warm} />

      {/* One bracket, struck into all four corners by rotation — the reference's
          leaf-branch corners were cut; two ornament families at this scale
          competed with the headline instead of framing it. */}
      <div style={{ position: "absolute", top: 16, left: 16 }}>
        <CornerBracket rotate={0} />
      </div>
      <div style={{ position: "absolute", top: 16, right: 16 }}>
        <CornerBracket rotate={90} />
      </div>
      <div style={{ position: "absolute", bottom: 16, right: 16 }}>
        <CornerBracket rotate={180} />
      </div>
      <div style={{ position: "absolute", bottom: 16, left: 16 }}>
        <CornerBracket rotate={270} />
      </div>

      {/* Left copy column. Wordmark pinned to the top as a signature; the
          headline block centred in the space below it, offer pinned to the
          bottom — a composed hero stack rather than floating pieces. */}
      <div
        style={{
          position: "absolute",
          left: PAD,
          top: PAD - 2,
          bottom: PAD - 2,
          width: COL_WIDTH,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Wordmark />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 20 }}>
          <EyebrowLg text="Luxury Wedding Websites" />
          {/* Two words, two colours — white states the subject, gold states the
              promise, and that's the only accent this headline spends. */}
          <Headline text={"YOUR WEDDING\n*BEGINS HERE*"} size={58} foil />
          <OrnateRule />
          <BadgeRow />
        </div>

        <OfferBlock />
      </div>

      {/* Right: three live themes, fanned and shown whole, oversized enough to
          be the card's actual subject rather than an illustration beside it. */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0 }}>
        {FAN.map(({ id, scale, left, top, rotate, z }) => {
          const theme = themeById(id);
          if (!theme) return null;
          return (
            <div key={id} style={{ position: "absolute", left, top, zIndex: z, transform: `rotate(${rotate}deg)` }}>
              <Phone theme={theme} scale={scale} mood={moodFor(theme)} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
