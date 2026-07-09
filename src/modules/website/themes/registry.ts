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
  | "jharokha";

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
];

export const DEFAULT_THEME_ID = "royal";

export function getTheme(themeId: string | null | undefined): Theme {
  return (
    THEMES.find((t) => t.id === themeId) ??
    THEMES.find((t) => t.id === DEFAULT_THEME_ID) ??
    THEMES[0]
  );
}
