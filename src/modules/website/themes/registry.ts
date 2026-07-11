import type { CSSProperties } from "react";

/**
 * A theme = tokens (--w-* colours/fonts) PLUS a decorative signature:
 *   • heroMotif — the ornament behind the hero (mandala, temple arch, garland…)
 *   • --w-divider — the glyph used in section dividers
 *   • --w-pattern — the repeating border ribbon under the nav
 * so each wedding type looks structurally distinct, not just recoloured.
 */
export type HeroMotif =
  | "mandala"
  | "minimal"
  | "botanical"
  | "garland"
  | "temple"
  | "jharokha"
  // "Experience" themes render fully bespoke heroes and ignore HeroOrnament;
  // these literals exist only so the registry entry type-checks.
  | "neon"
  | "giftbox"
  | "celestial"
  | "doorway";

export interface Theme {
  id: string;
  name: string;
  description: string;
  swatch: string[];
  heroMotif: HeroMotif;
  vars: CSSProperties;
}

const CORMORANT = "var(--font-cormorant), Georgia, 'Times New Roman', serif";
const PLAYFAIR = "var(--font-playfair), Georgia, 'Times New Roman', serif";
const SCRIPT = "var(--font-great-vibes), 'Segoe Script', cursive";
const SANS = "var(--font-raleway), 'Segoe UI', system-ui, sans-serif";
const DEVA = "var(--font-noto-deva), var(--font-raleway), system-ui, serif";
// "Experience" theme fonts.
const SPACE = "var(--font-space-grotesk), 'Segoe UI', system-ui, sans-serif";
const FREDOKA = "var(--font-fredoka), 'Segoe UI', system-ui, sans-serif";
const NUNITO = "var(--font-nunito), var(--font-raleway), system-ui, sans-serif";
const DM_SERIF = "var(--font-dm-serif), Georgia, 'Times New Roman', serif";

// Repeating border ribbons (18px tall band), each reading as a cultural trim.
const PATTERN = {
  hairline:
    "linear-gradient(var(--w-gold-lite), var(--w-gold-lite)) center/56% 1px no-repeat",
  dots: "radial-gradient(circle, var(--w-gold) 1.5px, transparent 2px) center/16px 100% repeat-x",
  festive:
    "repeating-linear-gradient(45deg, var(--w-accent) 0 4px, var(--w-gold) 4px 8px, transparent 8px 15px)",
  temple:
    "linear-gradient(135deg, var(--w-gold) 25%, transparent 25%) 0 2px/15px 16px repeat-x, linear-gradient(225deg, var(--w-gold) 25%, transparent 25%) 0 2px/15px 16px repeat-x",
  scallop:
    "radial-gradient(circle at 9px 20px, transparent 8px, var(--w-gold) 8px 9px, transparent 10px) 0 0/18px 18px repeat-x",
};

export const THEMES: Theme[] = [
  {
    id: "royal",
    name: "The Maharaja",
    description: "Midnight navy & antique gold, mandala — regal, understated.",
    swatch: ["#221c33", "#b8912f", "#7a3d94"],
    heroMotif: "mandala",
    vars: {
      "--w-navy": "#221c33",
      "--w-bg": "#f7f0e4",
      "--w-surface": "#fffdf8",
      "--w-ink": "#2b2438",
      "--w-ink-soft": "#6d6479",
      "--w-accent": "#7a3d94",
      "--w-gold": "#b8912f",
      "--w-gold-lite": "#e4c56a",
      "--w-line": "#e6dcc8",
      "--w-hero-ink": "#ffffff",
      "--w-hero-bg":
        "radial-gradient(120% 90% at 50% -10%, #46325f 0%, rgba(70,50,95,0) 55%), linear-gradient(180deg, #221c33 0%, #191426 100%)",
      "--w-serif": CORMORANT,
      "--w-sans": SANS,
      "--w-deva": DEVA,
      "--w-divider": '"✦"',
      "--w-pattern": PATTERN.hairline,
    } as CSSProperties,
  },
  {
    id: "ivory",
    name: "The Gulmohar",
    description: "Warm cream & rosewood, hairline trim — timeless, minimal.",
    swatch: ["#fbf7f0", "#c2a24a", "#9c6b84"],
    heroMotif: "minimal",
    vars: {
      "--w-navy": "#3a3348",
      "--w-bg": "#fbf7f0",
      "--w-surface": "#ffffff",
      "--w-ink": "#3a3348",
      "--w-ink-soft": "#7a7286",
      "--w-accent": "#9c6b84",
      "--w-gold": "#c2a24a",
      "--w-gold-lite": "#e8d29a",
      "--w-line": "#efe7db",
      "--w-hero-ink": "#3a3348",
      "--w-hero-bg":
        "radial-gradient(120% 90% at 50% -10%, #f6e8cf 0%, rgba(246,232,207,0) 60%), linear-gradient(180deg, #fbf5ea 0%, #f3ead9 100%)",
      "--w-serif": CORMORANT,
      "--w-sans": SANS,
      "--w-deva": DEVA,
      "--w-divider": '"❖"',
      "--w-pattern": PATTERN.hairline,
    } as CSSProperties,
  },
  {
    id: "christian",
    name: "The Vow",
    description:
      "Ivory, blush & champagne, botanical arch & hand-script — garden elegance.",
    swatch: ["#faf6ef", "#c9a86a", "#b76e79"],
    heroMotif: "botanical",
    vars: {
      "--w-navy": "#4a4038",
      "--w-bg": "#faf6ef",
      "--w-surface": "#ffffff",
      "--w-ink": "#40382f",
      "--w-ink-soft": "#8a7f72",
      "--w-accent": "#b76e79",
      "--w-gold": "#c9a86a",
      "--w-gold-lite": "#e6cf9e",
      "--w-line": "#ece2d2",
      "--w-hero-ink": "#40382f",
      "--w-hero-bg":
        "radial-gradient(120% 90% at 50% -10%, #f3e3dc 0%, rgba(243,227,220,0) 60%), linear-gradient(180deg, #fbf5ef 0%, #f4e8e2 100%)",
      "--w-serif": PLAYFAIR,
      "--w-display": SCRIPT,
      "--w-sans": SANS,
      "--w-deva": DEVA,
      "--w-divider": '"❀"',
      "--w-pattern": PATTERN.dots,
    } as CSSProperties,
  },
  {
    id: "punjabi",
    name: "The Anand Karaj",
    description:
      "Fuchsia & marigold, hanging garland — joyful, festive, luxe.",
    swatch: ["#8a1746", "#f2a71b", "#d81b60"],
    heroMotif: "garland",
    vars: {
      "--w-navy": "#8a1746",
      "--w-bg": "#fff6ec",
      "--w-surface": "#fffdf8",
      "--w-ink": "#3a2230",
      "--w-ink-soft": "#8a6b76",
      "--w-accent": "#c2185b",
      "--w-gold": "#e39a12",
      "--w-gold-lite": "#ffd36b",
      "--w-line": "#f2dcc9",
      "--w-hero-ink": "#ffffff",
      "--w-hero-bg":
        "radial-gradient(120% 100% at 50% -10%, #e0448a 0%, rgba(224,68,138,0) 55%), linear-gradient(160deg, #8a1746 0%, #c2185b 55%, #e07a12 120%)",
      "--w-serif": PLAYFAIR,
      "--w-sans": SANS,
      "--w-deva": DEVA,
      "--w-divider": '"✺"',
      "--w-pattern": PATTERN.festive,
    } as CSSProperties,
  },
  {
    id: "south-indian",
    name: "The Kalyanam",
    description:
      "Maroon & temple gold on sandal, gopuram arch — South Indian grandeur.",
    swatch: ["#5c1620", "#c69a2e", "#1f5c3d"],
    heroMotif: "temple",
    vars: {
      "--w-navy": "#5c1620",
      "--w-bg": "#fbf3e6",
      "--w-surface": "#fffdf6",
      "--w-ink": "#3a1f1a",
      "--w-ink-soft": "#836a5a",
      "--w-accent": "#1f5c3d",
      "--w-gold": "#b8860b",
      "--w-gold-lite": "#e6c56a",
      "--w-line": "#ecdcc0",
      "--w-hero-ink": "#ffffff",
      "--w-hero-bg":
        "radial-gradient(120% 100% at 50% -10%, #8a2233 0%, rgba(138,34,51,0) 55%), linear-gradient(180deg, #5c1620 0%, #3f0f18 100%)",
      "--w-serif": CORMORANT,
      "--w-sans": SANS,
      "--w-deva": DEVA,
      "--w-divider": '"✤"',
      "--w-pattern": PATTERN.temple,
    } as CSSProperties,
  },
  {
    id: "rajasthani",
    name: "The Rajputana",
    description:
      "Royal indigo, gold & vermilion, cusped jharokha arch — haveli opulence.",
    swatch: ["#1e2a5a", "#caa04a", "#b5372e"],
    heroMotif: "jharokha",
    vars: {
      "--w-navy": "#1e2a5a",
      "--w-bg": "#f7f1e3",
      "--w-surface": "#fffdf6",
      "--w-ink": "#20264a",
      "--w-ink-soft": "#6f7392",
      "--w-accent": "#b5372e",
      "--w-gold": "#c19a3e",
      "--w-gold-lite": "#e6c56a",
      "--w-line": "#e6dcc4",
      "--w-hero-ink": "#ffffff",
      "--w-hero-bg":
        "radial-gradient(120% 100% at 50% -10%, #34479a 0%, rgba(52,71,154,0) 55%), linear-gradient(180deg, #1e2a5a 0%, #141d40 100%)",
      "--w-serif": PLAYFAIR,
      "--w-sans": SANS,
      "--w-deva": DEVA,
      "--w-divider": '"❁"',
      "--w-pattern": PATTERN.scallop,
    } as CSSProperties,
  },

  /* ── "Experience" themes — non-wedding, fully bespoke interactive renderers ── */
  {
    id: "afterparty",
    name: "The Afterparty",
    description:
      "Near-black neon, VIP pass & classified location — nightlife, bachelor/ette.",
    swatch: ["#09090B", "#7C3AED", "#EC4899"],
    heroMotif: "neon",
    vars: {
      // theme-specific palette (consumed by the bespoke renderer)
      "--ap-black": "#09090B",
      "--ap-violet": "#7C3AED",
      "--ap-pink": "#EC4899",
      "--ap-lime": "#C6FF00",
      "--ap-white": "#FAFAFA",
      "--ap-glass": "rgba(255,255,255,0.06)",
      "--ap-glass-line": "rgba(255,255,255,0.14)",
      // --w-* fallback tokens (shared WebsiteView safety net)
      "--w-navy": "#09090B",
      "--w-bg": "#09090B",
      "--w-surface": "#141317",
      "--w-ink": "#FAFAFA",
      "--w-ink-soft": "#a1a1aa",
      "--w-accent": "#EC4899",
      "--w-gold": "#7C3AED",
      "--w-gold-lite": "#C6FF00",
      "--w-line": "rgba(255,255,255,0.14)",
      "--w-hero-ink": "#FAFAFA",
      "--w-hero-bg":
        "radial-gradient(90% 70% at 50% 0%, rgba(124,58,237,0.55) 0%, rgba(124,58,237,0) 60%), radial-gradient(70% 60% at 80% 20%, rgba(236,72,153,0.4) 0%, rgba(236,72,153,0) 55%), #09090B",
      "--w-serif": SPACE,
      "--w-sans": SANS,
      "--w-deva": DEVA,
      "--w-divider": '"⚡"',
      "--w-pattern":
        "repeating-linear-gradient(90deg, var(--ap-violet) 0 12px, transparent 12px 24px, var(--ap-pink) 24px 36px, transparent 36px 48px)",
    } as CSSProperties,
  },
  {
    id: "confetti",
    name: "The Confetti",
    description:
      "Sky-blue & sunshine, tap-to-open gift, balloons & star game — kids' birthdays.",
    swatch: ["#60A5FA", "#FACC15", "#FB7185"],
    heroMotif: "giftbox",
    vars: {
      "--cf-sky": "#60A5FA",
      "--cf-sun": "#FACC15",
      "--cf-coral": "#FB7185",
      "--cf-lavender": "#A78BFA",
      "--cf-cream": "#FFFDF5",
      "--w-navy": "#3b4a63",
      "--w-bg": "#FFFDF5",
      "--w-surface": "#ffffff",
      "--w-ink": "#3b4a63",
      "--w-ink-soft": "#7c88a1",
      "--w-accent": "#FB7185",
      "--w-gold": "#FACC15",
      "--w-gold-lite": "#fde68a",
      "--w-line": "#e8edf6",
      "--w-hero-ink": "#3b4a63",
      "--w-hero-bg":
        "radial-gradient(80% 70% at 50% 0%, rgba(96,165,250,0.28) 0%, rgba(96,165,250,0) 60%), radial-gradient(70% 60% at 85% 15%, rgba(167,139,250,0.28) 0%, rgba(167,139,250,0) 55%), #FFFDF5",
      "--w-serif": FREDOKA,
      "--w-sans": NUNITO,
      "--w-deva": DEVA,
      "--w-divider": '"✦"',
      "--w-pattern":
        "radial-gradient(circle, var(--cf-sun) 2px, transparent 2.5px) 0 0/22px 100% repeat-x, radial-gradient(circle, var(--cf-coral) 2px, transparent 2.5px) 11px 0/22px 100% repeat-x",
    } as CSSProperties,
  },
  {
    id: "little-miracle",
    name: "The Little Miracle",
    description:
      "Celestial night sky, wish-upon-a-star & optional reveal — baby showers, gender-neutral.",
    swatch: ["#DCEAF7", "#F6D6D6", "#C5A46D"],
    heroMotif: "celestial",
    vars: {
      "--lm-blush": "#F6D6D6",
      "--lm-cloud": "#DCEAF7",
      "--lm-cream": "#FFF9F0",
      "--lm-gold": "#C5A46D",
      "--lm-cocoa": "#594A42",
      "--lm-night": "#2b2d42",
      "--w-navy": "#2b2d42",
      "--w-bg": "#FFF9F0",
      "--w-surface": "#ffffff",
      "--w-ink": "#594A42",
      "--w-ink-soft": "#9a8a80",
      "--w-accent": "#C5A46D",
      "--w-gold": "#C5A46D",
      "--w-gold-lite": "#e0c69a",
      "--w-line": "#ece2d6",
      "--w-hero-ink": "#FFF9F0",
      "--w-hero-bg":
        "radial-gradient(90% 80% at 50% 110%, rgba(197,164,109,0.25) 0%, rgba(197,164,109,0) 55%), linear-gradient(180deg, #23263b 0%, #3a3d5a 100%)",
      "--w-serif": CORMORANT,
      "--w-display": DM_SERIF,
      "--w-sans": SANS,
      "--w-deva": DEVA,
      "--w-divider": '"✦"',
      "--w-pattern":
        "radial-gradient(circle, var(--lm-gold) 1px, transparent 1.5px) center/20px 100% repeat-x",
    } as CSSProperties,
  },
  {
    id: "shubh-aarambh",
    name: "The Shubh Aarambh",
    description:
      "Terracotta & teal, opening doors, rangoli & diyas — griha pravesh, housewarming.",
    swatch: ["#B55233", "#D99A2B", "#174C4F"],
    heroMotif: "doorway",
    vars: {
      "--sa-terracotta": "#B55233",
      "--sa-saffron": "#D99A2B",
      "--sa-ivory": "#FFF8EA",
      "--sa-teal": "#174C4F",
      "--sa-charcoal": "#342C28",
      "--w-navy": "#174C4F",
      "--w-bg": "#FFF8EA",
      "--w-surface": "#fffdf6",
      "--w-ink": "#342C28",
      "--w-ink-soft": "#8a7d6f",
      "--w-accent": "#174C4F",
      "--w-gold": "#D99A2B",
      "--w-gold-lite": "#eac06a",
      "--w-line": "#eaddc6",
      "--w-hero-ink": "#FFF8EA",
      "--w-hero-bg":
        "radial-gradient(70% 60% at 50% 40%, rgba(217,154,43,0.5) 0%, rgba(217,154,43,0) 60%), linear-gradient(180deg, #6d2f1c 0%, #B55233 100%)",
      "--w-serif": CORMORANT,
      "--w-sans": SANS,
      "--w-deva": DEVA,
      "--w-divider": '"◇"',
      "--w-pattern":
        "conic-gradient(from 45deg, var(--sa-saffron) 0 25%, transparent 0 50%, var(--sa-saffron) 0 75%, transparent 0) 0 0/16px 16px",
    } as CSSProperties,
  },
];

export const DEFAULT_THEME_ID = "royal";

export function getTheme(themeId: string | null | undefined): Theme {
  return (
    THEMES.find((t) => t.id === themeId) ??
    THEMES.find((t) => t.id === DEFAULT_THEME_ID) ??
    THEMES[0]
  );
}
