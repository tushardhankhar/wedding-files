import type { CSSProperties } from "react";

/**
 * A theme is a named set of CSS custom properties (--w-*) applied to the
 * `.wsite` root. One stylesheet + swappable tokens = many distinct templates.
 * Add a theme by adding an entry here — no renderer changes needed.
 */
export interface Theme {
  id: string;
  name: string;
  description: string;
  /** Swatch colors for the picker gallery. */
  swatch: string[];
  /** CSS custom properties applied to the .wsite root. */
  vars: CSSProperties;
}

const SERIF = "var(--font-cormorant), Georgia, 'Times New Roman', serif";
const SANS = "var(--font-raleway), 'Segoe UI', system-ui, sans-serif";
const DEVA = "var(--font-noto-deva), var(--font-raleway), system-ui, serif";

export const THEMES: Theme[] = [
  {
    id: "royal",
    name: "Royal",
    description: "Midnight navy & antique gold, serif titles, mandala accents.",
    swatch: ["#221c33", "#b8912f", "#7a3d94"],
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
      "--w-serif": SERIF,
      "--w-sans": SANS,
      "--w-deva": DEVA,
    } as CSSProperties,
  },
  {
    id: "ivory",
    name: "Ivory Classic",
    description: "Warm cream & rosewood, soft gold hairlines, understated.",
    swatch: ["#fbf7f0", "#c2a24a", "#9c6b84"],
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
      "--w-serif": SERIF,
      "--w-sans": SANS,
      "--w-deva": DEVA,
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
