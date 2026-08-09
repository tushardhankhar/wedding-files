import { PHONE_NATURAL, ThemePhone } from "./theme-card";
import type { ShowcaseTheme } from "./data";

/**
 * Shared furniture for the paid-social creatives — the brand tokens, the type
 * scale, the backdrop and the phone mock. One copy, used by both the carousel
 * deck (`ad-carousel.tsx`) and the single feed image (`ad-post.tsx`), so a
 * creative can't drift from the brand by being defined twice.
 *
 * Brand discipline (three colours, no more): BF Navy ground, a champagne cast of
 * the palette's white for every word, LocalFactor Yellow held back for the CTA
 * and one highlight per card. Poppins sets every heading, Raleway every
 * paragraph. The only other colours on the canvas are the theme's own, seen
 * through the phone screen — those are the product, not decoration.
 */

// ── Brand tokens ────────────────────────────────────────────────────────────
export const NAVY = "#2f3342";
/**
 * Champagne — a warm cast of the palette's White, and the colour of every word
 * on the deck. Pure #FFFFFF on navy reads as an interface; this reads as ink on
 * an invitation card.
 */
export const IVORY = "#F5EFE4";
/** LocalFactor Yellow. Spent only on the CTA and one highlight per card. */
export const GOLD = "#F2DA00";
/**
 * Antique gold — the metallic the *themes* are drawn in, not the brand yellow.
 * Every small mark (the feature icons, the trust ticks) is struck in this, so
 * LocalFactor Yellow stays reserved for the CTA and the price. Six yellow icons
 * would spend the accent six times over; six gold ones read as engraving.
 */
export const LEAF = "#C9A23D";

export const POPPINS = "var(--font-poppins), 'Segoe UI', system-ui, sans-serif";
export const RALEWAY = "var(--font-raleway), 'Segoe UI', system-ui, sans-serif";

/** The graduated ground every creative sits on. One hue, four stops. */
export const GROUND = `linear-gradient(163deg, #3d4358 0%, ${NAVY} 38%, #272b39 74%, #1e2130 100%)`;

// ── Backdrop ────────────────────────────────────────────────────────────────
/**
 * Light, not pattern. The ground is one graduated navy, lit from a corner and
 * darkened into all four of them, with a pool of the theme's own warmth where
 * the phone stands. There is no ornament on it — no lattice, no arches, no dust:
 * an ad that has to compete with a wedding photograph inside the phone loses if
 * the card behind is also busy. Everything here is a gradient or grain.
 *
 * Fine paper grain gives the navy a printed tooth rather than a flat digital
 * fill. Laid on at plain low opacity rather than through `.l-grain`, whose
 * `mix-blend-mode: overlay` needs an opaque backdrop: as a top layer over the
 * phone it hit the transparent sliver at the iframe's rounded corner and blended
 * to raw rainbow noise — a speckled notch on the hero card.
 */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")";

/** Inset of the hairline frame, and the radius its corners turn on. */
const RULE_INSET = 14;
const RULE_RADIUS = 10;

/** Corner ticks: two hairlines of a rounded box, at each corner of the frame. */
const TICK = `1px solid ${IVORY}`;
const CORNERS = [
  { key: "tl", style: { top: RULE_INSET, left: RULE_INSET, borderTop: TICK, borderLeft: TICK, borderTopLeftRadius: RULE_RADIUS } },
  { key: "tr", style: { top: RULE_INSET, right: RULE_INSET, borderTop: TICK, borderRight: TICK, borderTopRightRadius: RULE_RADIUS } },
  { key: "bl", style: { bottom: RULE_INSET, left: RULE_INSET, borderBottom: TICK, borderLeft: TICK, borderBottomLeftRadius: RULE_RADIUS } },
  { key: "br", style: { bottom: RULE_INSET, right: RULE_INSET, borderBottom: TICK, borderRight: TICK, borderBottomRightRadius: RULE_RADIUS } },
];

/**
 * Everything behind the type: a vignette, the four corners weighted again, grain,
 * a directional highlight and a hairline frame. Stacked as separate layers rather
 * than one gradient so each can be tuned without disturbing the others — and all
 * of them light, none of them ornament.
 */
export function Backdrop({ bloom, tint = LEAF }: { bloom: string; tint?: string }) {
  return (
    <>
      {/* Vignette — corners dropped hard toward black so the centre carries the eye. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(112% 92% at 50% 42%, transparent 16%, #04060b 116%)",
          opacity: 0.84,
        }}
      />

      {/* And the corners again, each on its own, because a single radial can only
          be as dark at the corners as it is along the edges — this puts the
          weight in the four corners alone and leaves the edges mid-tone. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(42% 38% at 0% 0%, #04060b 0%, transparent 74%)," +
            "radial-gradient(42% 38% at 100% 0%, #04060b 0%, transparent 74%)," +
            "radial-gradient(42% 38% at 0% 100%, #04060b 0%, transparent 74%)," +
            "radial-gradient(42% 38% at 100% 100%, #04060b 0%, transparent 74%)",
          opacity: 0.46,
        }}
      />

      {/* Paper grain. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: GRAIN,
          backgroundSize: "120px 120px",
          opacity: 0.055,
        }}
      />

      {/* The card's highlight, plus a raking sheen across the whole canvas. */}
      <div
        aria-hidden="true"
        style={{
          // A champagne core under the gold, and antique gold rather than
          // LocalFactor Yellow: pure yellow at low alpha over navy turns the
          // corner olive, and an olive corner is the one thing that cannot read
          // as luxe. On a themed card the tint comes from the theme instead.
          background:
            `radial-gradient(48% 44% at ${bloom}, ${IVORY}1a 0%, ${tint}16 38%, transparent 70%),` +
            `linear-gradient(107deg, ${IVORY}0b 0%, transparent 32%, transparent 76%, ${IVORY}07 100%)`,
          position: "absolute",
          inset: 0,
        }}
      />

      {/* A single hairline frame at 22%, with a heavier tick at each corner. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: RULE_INSET,
          borderRadius: RULE_RADIUS,
          border: `1px solid ${IVORY}38`,
          pointerEvents: "none",
        }}
      />
      {CORNERS.map(({ key, style }) => (
        <div
          key={key}
          aria-hidden="true"
          style={{ position: "absolute", width: 17, height: 17, opacity: 0.55, pointerEvents: "none", ...style }}
        />
      ))}
    </>
  );
}

// ── Theme moods ─────────────────────────────────────────────────────────────
/**
 * A screenshot tells you what a theme looks like, but the card around it still
 * has to agree with it: the screens are warm (wine, cream, rose) and navy is
 * cool, and side by side they read as two unrelated pictures.
 *
 * A mood is the fix, and it is only two colours — the theme's deep ground and
 * its warm light. They light the card: a pool behind the phone, a rake across
 * the ground, and the glow the handset sits in. No drawing, no pattern.
 */
export interface Mood {
  /** The theme's deep ground, washed under the phone so inside and outside agree. */
  deep: string;
  /** The theme's warm light — gold, rose or champagne. */
  warm: string;
}

const MOODS: Partial<Record<string, Mood>> = {
  // Durbar wine under antique gold.
  maharaja: { deep: "#4A0A16", warm: "#D8AE55" },
  // Rose-tinted, like the theme's blossoms.
  jharokha: { deep: "#7A1F38", warm: "#E9B0BC" },
  // Kumkum red under temple gold.
  kalyanam: { deep: "#6B1620", warm: "#DCA83F" },
  // Illustrated ivory and gold.
  jodi: { deep: "#7A1B22", warm: "#EBCD86" },
  // Not a wedding — the warmth goes party rose rather than wine.
  confetti: { deep: "#6D2A57", warm: "#F3A7B8" },
};

/** Fallback for a themed slide with no mood of its own yet. */
const DEFAULT_MOOD: Mood = { deep: "#4A0A16", warm: "#D8AE55" };

export function moodFor(theme: ShowcaseTheme | undefined): Mood {
  return (theme && MOODS[theme.id]) ?? DEFAULT_MOOD;
}

/**
 * The warm ground: a pool of the theme's own colour where the phone stands, so
 * the burgundy behind the glass and the navy around it stop looking like two
 * unrelated pictures. Painted *under* the grain and vignette, so it reads as
 * dyed into the card rather than laid on top of it.
 */
export function ThemeGround({ mood, anchor }: { mood: Mood; anchor: string }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        background:
          // Champagne core → the theme's warm → the theme's deep ground, so the
          // light has a colour temperature instead of just a brightness.
          `radial-gradient(74% 68% at ${anchor}, ${IVORY}1c 0%, ${mood.warm}30 24%, ${mood.deep}3d 52%, transparent 82%),` +
          // …and a broad rake of the same warmth off the phone side, so the cool
          // half of the card is never *purely* cool. Without this the pool reads
          // as a spotlight on a navy wall rather than as one lit room.
          `linear-gradient(94deg, ${mood.deep}2b 0%, ${mood.warm}14 36%, transparent 74%)`,
      }}
    />
  );
}

// ── Type ────────────────────────────────────────────────────────────────────

/**
 * Headline type: `\n` is a hard break, `*phrase*` is set in gold. Everything
 * else is champagne — the gold is a single accent, not the voice of the card.
 *
 * `foil`, off by default, swaps the flat gold tint for a metallic gradient
 * fill — a bevelled-foil look reserved for the hero-scale creatives where the
 * gold phrase carries the whole card, rather than the norm every headline
 * reaches for.
 */
export function Headline({ text, size, foil = false }: { text: string; size: number; foil?: boolean }) {
  return (
    <h1
      style={{
        fontFamily: POPPINS,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1.1,
        letterSpacing: "-0.02em",
        color: IVORY,
        whiteSpace: "pre-line",
      }}
    >
      {text.split(/(\*[^*]+\*)/g).map((part, i) =>
        part.length > 2 && part.startsWith("*") && part.endsWith("*") ? (
          <span
            key={i}
            style={
              foil
                ? {
                    backgroundImage: `linear-gradient(180deg, #fbe89a 0%, ${GOLD} 40%, #b6862b 78%, #8a6420 100%)`,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                  }
                : { color: GOLD }
            }
          >
            {part.slice(1, -1)}
          </span>
        ) : (
          part
        ),
      )}
    </h1>
  );
}

export function Eyebrow({ text }: { text: string }) {
  return (
    <p
      style={{
        fontFamily: POPPINS,
        fontWeight: 600,
        fontSize: 9.5,
        letterSpacing: "0.32em",
        textTransform: "uppercase",
        color: IVORY,
        opacity: 0.46,
      }}
    >
      {text}
    </p>
  );
}

export function Body({ text, size = 13.5 }: { text: string; size?: number }) {
  return (
    <p style={{ fontFamily: RALEWAY, fontSize: size, lineHeight: 1.66, color: IVORY, opacity: 0.66 }}>
      {text}
    </p>
  );
}

/** A hairline that fades out — the deck's only ornament between blocks. */
export function Rule({ centred = false }: { centred?: boolean }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: 46,
        height: 1,
        flex: "none",
        alignSelf: centred ? "center" : "flex-start",
        background: centred
          ? `linear-gradient(90deg, ${GOLD}00, ${GOLD}, ${GOLD}00)`
          : `linear-gradient(90deg, ${GOLD}, ${GOLD}00)`,
        opacity: 0.75,
      }}
    />
  );
}

// ── Icons ───────────────────────────────────────────────────────────────────
/**
 * Line icons for the feature lists — hairline, 18px grid, drawn rather than set
 * as emoji: a colour emoji on this card would be the loudest thing on it and
 * would render differently on every device Meta serves the ad to.
 */
const ICONS = {
  calendar: (
    <>
      <rect x="2.6" y="4.8" width="12.8" height="10.6" rx="1.7" />
      <path d="M2.6 8.3h12.8M6 3v3.2M12 3v3.2" />
    </>
  ),
  rsvp: (
    <>
      <circle cx="9" cy="9" r="6.6" />
      <path d="M6 9.2 8.2 11.4 12.4 6.9" />
    </>
  ),
  pin: (
    <>
      <path d="M9 15.7s5-4.9 5-8.4A5 5 0 0 0 4 7.3c0 3.5 5 8.4 5 8.4Z" />
      <circle cx="9" cy="7.2" r="1.9" />
    </>
  ),
  camera: (
    <>
      <rect x="1.8" y="5.5" width="14.4" height="9.3" rx="2.2" />
      <circle cx="9" cy="10.1" r="3" />
      <path d="M6.5 5.5 7.4 3.7h3.2l.9 1.8" />
    </>
  ),
  hourglass: (
    <>
      <path d="M5 2.7h8M5 15.3h8" />
      <path d="M6.1 2.7v2.6L9 9l-2.9 3.7v2.6M11.9 2.7v2.6L9 9l2.9 3.7v2.6" />
    </>
  ),
  globe: (
    <>
      <circle cx="9" cy="9" r="6.6" />
      <path d="M2.4 9h13.2" />
      <path d="M9 2.4c3.4 3.7 3.4 9.5 0 13.2-3.4-3.7-3.4-9.5 0-13.2Z" />
    </>
  ),
  /** WhatsApp, as a chat bubble with a tail — the mark itself is trademarked. */
  chat: (
    <>
      <path d="M15.3 8.6a6.1 6.1 0 0 1-9 5.4l-3 .9.9-3a6.1 6.1 0 1 1 11.1-3.3Z" />
      <path d="M6.4 8.6h5.2M6.4 11h3.4" />
    </>
  ),
  check: <path d="M3.4 9.6 6.9 13.1 14.6 5" />,
} as const;

export type IconName = keyof typeof ICONS;

export function Icon({ name, size = 15, color = LEAF, opacity = 1 }: {
  name: IconName;
  size?: number;
  color?: string;
  opacity?: number;
}) {
  return (
    <svg
      viewBox="0 0 18 18"
      width={size}
      height={size}
      aria-hidden="true"
      style={{ flex: "none", opacity }}
      fill="none"
      stroke={color}
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ICONS[name]}
    </svg>
  );
}

// ── The phone ───────────────────────────────────────────────────────────────
/**
 * The live theme, scaled to a given height and pinned to the top-left of its box,
 * standing in a pool of warm light.
 *
 * At scale 1 the transform is dropped rather than written as `scale(1)`: any
 * transform promotes the iframe to its own compositing layer, and Chrome then
 * rasterises one corner square, leaving a white notch outside the screen's
 * rounded clip.
 */
export function Phone({ theme, scale, mood }: { theme: ShowcaseTheme; scale: number; mood: Mood }) {
  const inner = (
    <div
      style={{
        width: PHONE_NATURAL.width,
        height: PHONE_NATURAL.height,
        ...(scale === 1
          ? null
          : { transform: `scale(${scale})`, transformOrigin: "top left" }),
      }}
    >
      <ThemePhone theme={theme} capture />
    </div>
  );

  return (
    <div
      style={{
        position: "relative",
        // The spotlight below sits at z-index -1; isolating keeps it from sliding
        // behind the card's own backdrop layers.
        isolation: "isolate",
        width: PHONE_NATURAL.width * scale,
        height: PHONE_NATURAL.height * scale,
        flex: "none",
      }}
    >
      {/* A spotlight thrown from behind the handset, in the theme's own warmth.
          It lifts the phone off the navy — without it the black frame sinks into
          the ground and the card reads flat — and because it is tinted by the
          theme rather than neutral, the warm screen and the cool card stop
          looking like two photographs stuck together.
          Two rules keep the iframe off its own compositing layer, which would
          rasterise a square corner and leave a white notch outside the screen's
          rounded clip: the light is ordered by a negative z-index rather than by
          promoting the phone above it, and its softness comes from the gradient's
          falloff, never from `filter: blur` — a filtered sibling overlapping the
          iframe promotes the iframe too. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: "-20% -36%",
          zIndex: -1,
          borderRadius: "50%",
          background:
            `radial-gradient(closest-side, ${IVORY}2b 0%, ${mood.warm}26 30%, ${mood.deep}1c 56%, transparent 82%)`,
        }}
      />
      {inner}
    </div>
  );
}
