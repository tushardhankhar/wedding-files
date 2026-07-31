import {
  DEMO_EVENTS,
  DEMO_FAMILIES,
  IMAGES,
  PRICE,
  SHOWCASE_THEMES,
  SITE_DOMAIN,
  type ShowcaseTheme,
} from "./data";
import { PHONE_NATURAL, ThemePhone } from "./theme-card";

/**
 * The Meta (Facebook / Instagram) carousel ad deck — one paid-social creative,
 * defined once and screenshotted by `scripts/capture-ad-carousel.mjs` via
 * `/dev/ad/[slideId]`. The theme slides frame the *live* /demo site inside the
 * phone, so a redesigned theme re-exports as a new ad rather than going stale.
 *
 * Brand discipline (three colours, no more): BF Navy ground, a champagne cast of
 * the palette's white for every word, LocalFactor Yellow held back for the CTA
 * and one highlight per card. Poppins sets every heading, Raleway every
 * paragraph. The only other colours on the canvas are the theme's own, seen
 * through the phone screen — those are the product, not decoration.
 *
 * The target feel is a luxury wedding house, not a SaaS dashboard: the phone is
 * the hero, the graphics recede, and type breathes.
 */

// ── Canvas ──────────────────────────────────────────────────────────────────
/**
 * 1:1 at 2× → a 1080×1080 PNG, Meta's carousel native size. Every card in a
 * carousel must share one ratio or Meta crops the odd one out.
 */
export const AD_CANVAS = { width: 540, height: 540, scale: 2 } as const;

const PAD = 34;
/** Reserved strip along the bottom for the domain line, on the `copy` cards. */
const FOOTER = 40;
/** Breathing room above and below the phone on a `split` card. */
const PHONE_INSET = 25;

// ── Brand tokens ────────────────────────────────────────────────────────────
const NAVY = "#2f3342";
/**
 * Champagne — a warm cast of the palette's White, and the colour of every word
 * on the deck. Pure #FFFFFF on navy reads as an interface; this reads as ink on
 * an invitation card.
 */
const IVORY = "#F5EFE4";
/** LocalFactor Yellow. Spent only on the CTA and one highlight per card. */
const GOLD = "#F2DA00";
/**
 * Antique gold — the metallic the *themes* are drawn in, not the brand yellow.
 * Every small mark (the feature icons, the trust ticks) is struck in this, so
 * LocalFactor Yellow stays reserved for the CTA and the price. Six yellow icons
 * would spend the accent six times over; six gold ones read as engraving.
 */
const LEAF = "#C9A23D";

const POPPINS = "var(--font-poppins), 'Segoe UI', system-ui, sans-serif";
const RALEWAY = "var(--font-raleway), 'Segoe UI', system-ui, sans-serif";

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

/**
 * Where the warm highlight sits. One per card, walked in order, so no two
 * consecutive cards in the carousel are lit from the same corner — the deck
 * feels composed rather than templated.
 *
 * All of them hug a corner. Aimed anywhere nearer the middle the gold crosses
 * behind body copy, and gold-over-navy at low alpha turns olive.
 */
const BLOOMS = ["86% -4%", "6% 98%", "98% 96%", "-2% 4%", "50% 104%"] as const;

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
interface Mood {
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

function moodFor(theme: ShowcaseTheme | undefined): Mood {
  return (theme && MOODS[theme.id]) ?? DEFAULT_MOOD;
}

/**
 * The warm ground: a pool of the theme's own colour where the phone stands, so
 * the burgundy behind the glass and the navy around it stop looking like two
 * unrelated pictures. Painted *under* the grain and vignette, so it reads as
 * dyed into the card rather than laid on top of it.
 */
function ThemeGround({ mood, anchor }: { mood: Mood; anchor: string }) {
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

// ── Deck ────────────────────────────────────────────────────────────────────

/**
 * How a card arranges itself:
 *   - `photo` — full-bleed photography under a navy scrim, copy over it. Opens
 *     the deck on feeling rather than on UI.
 *   - `split` — phone left, copy right. The workhorse; every theme card.
 *   - `hero`  — copy across the top, phone below bleeding off the bottom edge.
 *   - `copy`  — type only, centred. For the cards that must be read, not looked at.
 */
type AdLayout = "photo" | "split" | "hero" | "copy";

export interface AdSlide {
  /** Numbered so the exported PNGs sort into carousel order in Finder. */
  id: string;
  layout: AdLayout;
  /** Showcase theme whose live demo fills the phone. Required for `split`/`hero`. */
  themeId?: string;
  /**
   * CSS selector inside the phone's live site to click before the shot, for the
   * themes that open on a gate. A still of a closed gift box advertises a locked
   * door instead of the invitation behind it.
   */
  openWith?: string;
  /** Key into `IMAGES`. Required for `photo`. */
  image?: string;
  eyebrow?: string;
  /**
   * `\n` is a deliberate line break — headlines are hand-broken, never orphaned.
   * `*asterisks*` set one phrase in gold; at most one per card.
   */
  headline: string;
  sub?: string;
  /** Feature list. Each line is carried by its own icon — see `ICONS`. */
  bullets?: { icon: IconName; text: string }[];
  /** Renders the per-family invite diagram (the `copy` layout only). */
  families?: boolean;
  /** Renders the four objection-killers (the `copy` layout only). */
  trust?: boolean;
  /** Struck-through anchor price beside the live one, for the closing card. */
  deal?: { was: string; now: string };
  /** Big gold button. */
  cta?: string;
  /** Quiet line under the button. */
  footnote?: string;
  /** Small pill bottom-right — the nudge to keep swiping. */
  cue?: string;
}

/**
 * Seven beats, nine cards: problem, solution, features (two — the second is the
 * one nobody else does), designer themes (three), beyond weddings, then the
 * offer and the CTA together on the close.
 */
export const AD_SLIDES: AdSlide[] = [
  {
    id: "01-problem",
    layout: "photo",
    image: "couple",
    eyebrow: "Join the Jashn",
    headline: "Nobody scrolls back\nfor a *forwarded JPEG*.",
    sub: "The day is unforgettable. The invitation gets buried under three hundred WhatsApp messages.",
    cue: "Swipe",
  },
  {
    id: "02-solution",
    layout: "hero",
    themeId: "maharaja",
    eyebrow: "The invitation, reimagined",
    headline: "Your shaadi card,\nas a *website*.",
    sub: "One link your guests open in a single tap — live, designed, and never out of date.",
    cue: "Swipe",
  },
  {
    id: "03-features",
    layout: "split",
    themeId: "jodi",
    eyebrow: "What you get",
    headline: "One link.\nThe whole\nshaadi.",
    // One icon per line: at a thumb's-length scroll the icons are read before
    // the words, so the card is scannable before it is legible.
    bullets: [
      { icon: "calendar", text: "Every event, haldi to reception" },
      { icon: "rsvp", text: "RSVP, event by event" },
      { icon: "pin", text: "Venue maps & directions" },
      { icon: "camera", text: "Story & photo gallery" },
      { icon: "hourglass", text: "Live countdown" },
      { icon: "globe", text: "Bilingual — English + हिंदी" },
    ],
  },
  {
    id: "04-families",
    layout: "copy",
    eyebrow: "The part nobody else does",
    headline: "Every family gets\ntheir *own* link.",
    sub: "500 guests don’t attend the same five events — so each family opens an invitation with only theirs on it.",
    families: true,
  },
  {
    id: "05-maharaja",
    layout: "split",
    themeId: "maharaja",
    eyebrow: "Designer themes",
    headline: "The Maharaja",
    sub: "Midnight navy and antique gold, for the wedding that wants to feel like a durbar.",
  },
  {
    id: "06-jharokha",
    layout: "split",
    themeId: "jharokha",
    eyebrow: "Designer themes",
    headline: "The Jharokha",
    sub: "A carved palace window that opens as your guests scroll. Romantic, and quietly grand.",
  },
  {
    id: "07-kalyanam",
    layout: "split",
    themeId: "kalyanam",
    eyebrow: "Designer themes",
    headline: "The Kalyanam",
    sub: "Temple arches, kumkum red and gold — a South Indian wedding, start to finish.",
  },
  {
    id: "08-beyond",
    layout: "split",
    themeId: "confetti",
    openWith: "button.cf-btn",
    eyebrow: "Not only weddings",
    headline: "Birthdays.\nBaby showers.\nGriha pravesh.",
    sub: "Same link, same ease — themes built for every celebration in the family.",
  },
  {
    id: "09-offer",
    layout: "copy",
    eyebrow: "Launch offer · limited time",
    headline: "",
    deal: { was: "₹2,199", now: PRICE },
    sub: "The complete invitation — every event, every family, one private link.",
    // The four things people ask before they buy, answered on the buying card.
    trust: true,
    // Counted, not claimed — the deck can't outdate the gallery.
    footnote: `${SHOWCASE_THEMES.length} designer themes · every occasion`,
    cta: "See a live demo",
  },
];

export function findAdSlide(id: string) {
  return AD_SLIDES.find((s) => s.id === id);
}

function themeFor(slide: AdSlide): ShowcaseTheme | undefined {
  return SHOWCASE_THEMES.find((t) => t.id === slide.themeId);
}

// ── Pieces ──────────────────────────────────────────────────────────────────

/**
 * Headline type: `\n` is a hard break, `*phrase*` is set in gold. Everything
 * else is champagne — the gold is a single accent, not the voice of the card.
 */
function Headline({ text, size }: { text: string; size: number }) {
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
          <span key={i} style={{ color: GOLD }}>
            {part.slice(1, -1)}
          </span>
        ) : (
          part
        ),
      )}
    </h1>
  );
}

function Eyebrow({ text }: { text: string }) {
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

function Body({ text, size = 13.5 }: { text: string; size?: number }) {
  return (
    <p style={{ fontFamily: RALEWAY, fontSize: size, lineHeight: 1.66, color: IVORY, opacity: 0.66 }}>
      {text}
    </p>
  );
}

/** A hairline that fades out — the deck's only ornament between blocks. */
function Rule({ centred = false }: { centred?: boolean }) {
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

/**
 * Line icons for the feature list — hairline, 18px grid, drawn rather than set
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
  check: <path d="M3.4 9.6 6.9 13.1 14.6 5" />,
} as const;

export type IconName = keyof typeof ICONS;

function Icon({ name, size = 15, color = LEAF, opacity = 1 }: {
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

function Bullets({ items }: { items: { icon: IconName; text: string }[] }) {
  return (
    <ul style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {items.map((item) => (
        <li key={item.text} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ display: "flex", marginTop: 2 }}>
            <Icon name={item.icon} opacity={0.92} />
          </span>
          <span
            style={{ fontFamily: RALEWAY, fontSize: 12.5, lineHeight: 1.5, color: IVORY, opacity: 0.82 }}
          >
            {item.text}
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * The four questions every buyer asks before paying, answered where they ask
 * them — on the offer card. Two by two rather than a single row: four items in
 * a line at this width forces the type down to a size nobody reads on a phone.
 */
const TRUST = [
  "Works on WhatsApp",
  "No app required",
  "RSVP included",
  "Opens in the browser",
] as const;

function TrustGrid() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "10px 18px",
        width: "100%",
        textAlign: "left",
      }}
    >
      {TRUST.map((item) => (
        <div key={item} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="check" size={13} />
          <span
            style={{
              fontFamily: POPPINS,
              fontWeight: 500,
              fontSize: 11.5,
              letterSpacing: "0.01em",
              color: IVORY,
              opacity: 0.88,
            }}
          >
            {item}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Chip colour per event. Brighter than the landing page's `--l-*` jewel tones,
 * which are mixed for ink on ivory and go to mud on navy.
 *
 * Colour is spent on the dot and a breath of tint only — the label stays
 * champagne like every other word on the deck. That is what keeps five chips
 * from turning the card into a pie chart: you read the *pattern* of colours in
 * an instant, and the type still belongs to the brand.
 */
const EVENT_TINTS: Partial<Record<string, string>> = {
  haldi: "#F0A93B", // turmeric
  mehendi: "#4FBE8E", // henna
  sangeet: "#B190C1", // brand Softer Purple
  wedding: "#E4586E", // kumkum
  reception: "#E8C877", // champagne gold
};

function EventChip({ id, name }: { id: string; name: string }) {
  const tint = EVENT_TINTS[id] ?? IVORY;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 9px 4px 8px",
        borderRadius: 999,
        border: `1px solid ${tint}59`,
        background: `${tint}1c`,
        fontFamily: POPPINS,
        fontWeight: 600,
        fontSize: 10.5,
        letterSpacing: "0.02em",
        color: IVORY,
        whiteSpace: "nowrap",
      }}
    >
      <span
        aria-hidden="true"
        style={{ width: 6, height: 6, flex: "none", borderRadius: 999, background: tint }}
      />
      {name}
    </span>
  );
}

/**
 * The selective-invite idea, drawn from the same demo data the landing page
 * uses: three families, three different guest lists.
 *
 * Named events as coloured chips rather than a grey line of text — the whole
 * feature is that the *rows differ*, and three rows of different-coloured chips
 * say that before a word is read.
 */
function FamilyDiagram() {
  const event = (id: string) => DEMO_EVENTS.find((e) => e.id === id);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
      {DEMO_FAMILIES.map((family) => (
        <div
          key={family.id}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 7,
            padding: "10px 13px 11px",
            borderRadius: 12,
            border: `1px solid ${IVORY}1f`,
            background: `${IVORY}08`,
          }}
        >
          <p
            style={{
              fontFamily: POPPINS,
              fontWeight: 600,
              fontSize: 11.5,
              letterSpacing: "0.03em",
              color: IVORY,
            }}
          >
            {family.label}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {family.eventIds.map((id) => (
              <EventChip key={id} id={id} name={event(id)?.name ?? id} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Struck anchor price beside the live one. */
function Deal({ was, now }: { was: string; now: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 16 }}>
      <span
        style={{
          fontFamily: POPPINS,
          fontWeight: 500,
          fontSize: 31,
          letterSpacing: "-0.01em",
          color: IVORY,
          opacity: 0.42,
          textDecoration: "line-through",
          textDecorationThickness: 2,
        }}
      >
        {was}
      </span>
      <span
        style={{
          fontFamily: POPPINS,
          fontWeight: 700,
          fontSize: 82,
          lineHeight: 1,
          letterSpacing: "-0.03em",
          color: GOLD,
        }}
      >
        {now}
      </span>
    </div>
  );
}

function CtaButton({ label }: { label: string }) {
  return (
    <div
      style={{
        padding: "16px 38px",
        borderRadius: 999,
        // Lit from above, and seated on its own warm shadow.
        background: `linear-gradient(177deg, #FFF07A 0%, ${GOLD} 46%, #D8C300 100%)`,
        boxShadow: `0 14px 28px -16px ${GOLD}5c, 0 3px 8px -4px #00000059, inset 0 1px 0 ${IVORY}96`,
        fontFamily: POPPINS,
        fontWeight: 700,
        fontSize: 18,
        letterSpacing: "0.01em",
        color: NAVY,
      }}
    >
      {label}
    </div>
  );
}

/**
 * The live theme, scaled to a given height and pinned to the top-left of its box,
 * standing in a pool of warm light.
 *
 * At scale 1 the transform is dropped rather than written as `scale(1)`: any
 * transform promotes the iframe to its own compositing layer, and Chrome then
 * rasterises one corner square, leaving a white notch outside the screen's
 * rounded clip.
 */
function Phone({ theme, scale, mood }: { theme: ShowcaseTheme; scale: number; mood: Mood }) {
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

function SwipeCue({ text, bottom }: { text: string; bottom: number }) {
  return (
    <div
      style={{
        position: "absolute",
        right: PAD,
        bottom,
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 15px",
        borderRadius: 999,
        border: `1px solid ${IVORY}3d`,
        background: `${NAVY}b3`,
        fontFamily: POPPINS,
        fontWeight: 600,
        fontSize: 10.5,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: IVORY,
      }}
    >
      {text}
      <span aria-hidden="true" style={{ fontSize: 13, lineHeight: 1, color: GOLD }}>
        →
      </span>
    </div>
  );
}

/**
 * Everything behind the type: a vignette, the four corners weighted again, grain,
 * a directional highlight and a hairline frame. Stacked as separate layers rather
 * than one gradient so each can be tuned without disturbing the others — and all
 * of them light, none of them ornament.
 */
function Backdrop({ bloom, tint = LEAF }: { bloom: string; tint?: string }) {
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

// ── The slide ───────────────────────────────────────────────────────────────

export function AdSlideCard({ slide }: { slide: AdSlide }) {
  const { width, height } = AD_CANVAS;
  const theme = themeFor(slide);
  const photo = slide.image ? IMAGES[slide.image] : undefined;
  /**
   * Tallest phone that clears its inset. The `copy` cards keep a footer strip for
   * the domain line, but a card with a phone gives that strip to the product and
   * moves the domain to the top corner instead.
   */
  const splitScale = (height - PHONE_INSET * 2) / PHONE_NATURAL.height;
  const domainAtBottom = slide.layout === "copy";

  const mood = moodFor(theme);
  /**
   * Where the light falls: on a `split` the phone stands left of centre, on a
   * `hero` it rises out of the bottom edge — so the pool of theme colour follows
   * the handset rather than sitting at the centre of the canvas.
   */
  const lit = slide.layout === "hero" ? "50% 76%" : "26% 52%";

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        overflow: "hidden",
        // One hue, four stops: a deep navy that graduates like dyed silk.
        background: `linear-gradient(163deg, #3d4358 0%, ${NAVY} 38%, #272b39 74%, #1e2130 100%)`,
      }}
    >
      {slide.layout === "photo" && photo && (
        // Photography first, so the scrim and the backdrop's own layers stack on
        // top of it. Inset past the frame on every side: the source has a caption
        // and rounded corners baked in, and this crops them out of shot.
        //
        // A plain <img>, not next/image: this only ever renders on the dev-only
        // capture stage, where an optimiser that defers or swaps the source is a
        // blank frame in the screenshot.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo.src}
          alt=""
          style={{
            position: "absolute",
            top: "-6%",
            left: "-8%",
            width: "116%",
            // Preflight's `img { max-width: 100% }` would clamp the 116% back to
            // the canvas width and leave a bare strip down the right edge.
            maxWidth: "none",
            height: "123%",
            objectFit: "cover",
            objectPosition: "50% 26%",
          }}
        />
      )}

      {/* Scrim: the photo stays warm through the middle and goes to near-solid
          navy under the copy, so the type never fights the picture. */}
      {slide.layout === "photo" && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            // Read bottom-up: near-solid navy under the copy, opening to almost
            // clear across the couple's faces, with just enough veil at the very
            // top to hold the domain line.
            background:
              `linear-gradient(0deg, #1b1e29fc 0%, #1b1e29f2 34%, ${NAVY}b8 48%, ${NAVY}40 66%, ${NAVY}38 86%, #1b1e29b3 100%)`,
          }}
        />
      )}

      {/* The theme's warmth, dyed into the ground before any texture goes on. */}
      {theme && <ThemeGround mood={mood} anchor={lit} />}

      <Backdrop
        bloom={BLOOMS[Math.max(0, AD_SLIDES.indexOf(slide)) % BLOOMS.length]}
        tint={theme ? mood.warm : undefined}
      />

      {slide.layout === "photo" && (
        <div
          // Anchored to the bottom so the couple's faces own the top of the frame
          // — the picture has to carry the card before a word is read.
          style={{
            position: "absolute",
            inset: `auto ${PAD}px ${PAD + 6}px ${PAD}px`,
            display: "flex",
            flexDirection: "column",
            gap: 15,
            maxWidth: 336,
          }}
        >
          {slide.eyebrow && <Eyebrow text={slide.eyebrow} />}
          <Headline text={slide.headline} size={32} />
          <Rule />
          {slide.sub && <Body text={slide.sub} />}
        </div>
      )}

      {slide.layout === "split" && theme && (
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 20,
            width,
            height,
            padding: `0 ${PAD}px 0 18px`,
          }}
        >
          <Phone theme={theme} scale={splitScale} mood={mood} />
          {/* Centred, but inside a band that stops short of the domain line at the
              top corner — so a four-bullet card and a one-line card both read as
              deliberately placed, and neither ever collides with it. */}
          <div
            style={{
              display: "flex",
              flex: 1,
              flexDirection: "column",
              justifyContent: "center",
              gap: 15,
              alignSelf: "stretch",
              paddingTop: 72,
              paddingBottom: 24,
            }}
          >
            {slide.eyebrow && <Eyebrow text={slide.eyebrow} />}
            <Headline text={slide.headline} size={slide.headline.length > 24 ? 26 : 30} />
            <Rule />
            {slide.sub && <Body text={slide.sub} size={13} />}
            {slide.bullets && <Bullets items={slide.bullets} />}
          </div>
        </div>
      )}

      {slide.layout === "hero" && theme && (
        <>
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              padding: `${PAD + 8}px ${PAD}px 0`,
            }}
          >
            {slide.eyebrow && <Eyebrow text={slide.eyebrow} />}
            <Headline text={slide.headline} size={45} />
            <Rule />
            {slide.sub && (
              <div style={{ maxWidth: 330 }}>
                <Body text={slide.sub} size={14} />
              </div>
            )}
          </div>
          {/* Cropped by the canvas on purpose: a phone running off the edge
              reads as "there is more here" and earns the swipe. Unscaled — a
              fractional transform leaves white slivers at the rounded corners. */}
          <div style={{ position: "absolute", left: "50%", top: 262, marginLeft: -PHONE_NATURAL.width / 2 }}>
            <Phone theme={theme} scale={1} mood={mood} />
          </div>
        </>
      )}

      {slide.layout === "copy" && (
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            gap: 18,
            width,
            height: height - FOOTER,
            padding: `${PAD}px ${PAD + 16}px 0`,
          }}
        >
          {slide.eyebrow && <Eyebrow text={slide.eyebrow} />}
          {slide.headline && <Headline text={slide.headline} size={36} />}
          {slide.deal && <Deal was={slide.deal.was} now={slide.deal.now} />}
          {/* The families card earns its ornament from the chips below instead —
              a rule as well would be one horizontal line too many. */}
          {!slide.deal && !slide.families && <Rule centred />}
          {slide.sub && (
            <div style={{ maxWidth: 384 }}>
              <Body text={slide.sub} size={13.5} />
            </div>
          )}
          {slide.families && (
            <div style={{ marginTop: 4, width: 428, textAlign: "left" }}>
              <FamilyDiagram />
            </div>
          )}
          {slide.trust && (
            <div style={{ marginTop: 2, width: 372 }}>
              <TrustGrid />
            </div>
          )}
          {slide.cta && (
            <div style={{ marginTop: 8 }}>
              <CtaButton label={slide.cta} />
            </div>
          )}
          {slide.footnote && (
            <p
              style={{
                marginTop: 2,
                fontFamily: POPPINS,
                fontWeight: 500,
                fontSize: 10.5,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: IVORY,
                opacity: 0.42,
              }}
            >
              {slide.footnote}
            </p>
          )}
        </div>
      )}

      {slide.cue && <SwipeCue text={slide.cue} bottom={domainAtBottom ? FOOTER + 6 : PAD - 4} />}

      {/* The domain runs along the bottom of the `copy` cards. Everywhere else the
          product owns the bottom edge, so it sits opposite the eyebrow instead. */}
      <p
        style={
          domainAtBottom
            ? {
                position: "absolute",
                insetInline: 0,
                bottom: Math.round(FOOTER / 2) - 8,
                textAlign: "center",
              }
            : { position: "absolute", right: PAD, top: PAD + 8 }
        }
      >
        <span
          style={{
            fontFamily: POPPINS,
            fontWeight: 600,
            fontSize: 10,
            letterSpacing: "0.34em",
            textTransform: "uppercase",
            color: IVORY,
            opacity: 0.5,
          }}
        >
          {SITE_DOMAIN}
        </span>
      </p>
    </div>
  );
}
