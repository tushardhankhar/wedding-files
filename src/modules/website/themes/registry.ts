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
  | "caricature"
  // "Experience" themes render fully bespoke heroes and ignore HeroOrnament;
  // these literals exist only so the registry entry type-checks.
  | "neon"
  | "giftbox"
  | "celestial"
  | "doorway"
  | "seal";

export type ThemeCategory =
  | "wedding"
  | "save-the-date"
  | "party"
  | "kids-birthday"
  | "baby-shower"
  | "housewarming";

/**
 * Whether a theme has an illustration slot — a place where the couple is drawn
 * and where the client may drop their own caricature / portrait sketch instead:
 *
 *   - `false`      — no slot (the theme has no figures).
 *   - `"built-in"` — the figures are part of the theme's scene, so the slot is on
 *                    until the client switches it off (the Gulistan balcony).
 *   - `"optional"` — the theme reads complete without figures, so the slot is off
 *                    until the client turns it on (the Overture, the Muhurat).
 *
 * Truthy either way, so `supports.artwork ? …` still gates the editor and the
 * placement controls.
 */
export type ArtworkSupport = false | "built-in" | "optional";

/** Which subject (name) inputs a theme's create/edit form should show. */
export interface SubjectSpec {
  names: 0 | 1 | 2;
  labels: string[];
  extras?: Array<"age">;
  /** Both names are mandatory — save-the-dates announce a couple, so neither
   * name may be left blank (the create/edit forms mark them required). */
  required?: boolean;
}

/**
 * Which content sections/fields a theme exposes. Drives the authoring form
 * (e.g. hide the image/gallery upload when `gallery` is false) and can gate the
 * renderer — one source of truth per theme, so adding a theme is a single edit.
 */
export interface ThemeSupports {
  taglineHero: boolean;
  story: boolean;
  gallery: boolean;
  family: boolean;
  faq: boolean;
  events: boolean;
  countdown: boolean;
  /** The theme's illustration slot — turns on the artwork switch, upload and
   * placement controls in the content editor. See {@link ArtworkSupport}. */
  artwork: ArtworkSupport;
  /** Whether this occasion collects RSVPs — surfaces the RSVP prompt on the
   * site and the RSVPs report in the dashboard. Off for save-the-dates: they
   * are an early announcement ("a formal invitation will follow"), not an
   * invitation to respond to. */
  rsvp: boolean;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  swatch: string[];
  heroMotif: HeroMotif;
  vars: CSSProperties;
  /** Event category — birthdays, weddings, housewarmings… */
  category: ThemeCategory;
  /** How many names to collect and what to label them. */
  subjectSpec: SubjectSpec;
  /** Which content sections the authoring form should offer. */
  supports: ThemeSupports;
}

/** A theme's visual/token definition, before category/subject/capability
 * metadata is merged on (see THEME_META). */
type ThemeBase = Omit<Theme, "category" | "subjectSpec" | "supports">;

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

const THEME_BASES: ThemeBase[] = [
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
  // Temporarily disabled — The Rajputana is hidden for now.
  // {
  //   id: "rajasthani",
  //   name: "The Rajputana",
  //   description:
  //     "Royal indigo, gold & vermilion, cusped jharokha arch — haveli opulence.",
  //   swatch: ["#1e2a5a", "#caa04a", "#b5372e"],
  //   heroMotif: "jharokha",
  //   vars: {
  //     "--w-navy": "#1e2a5a",
  //     "--w-bg": "#f7f1e3",
  //     "--w-surface": "#fffdf6",
  //     "--w-ink": "#20264a",
  //     "--w-ink-soft": "#6f7392",
  //     "--w-accent": "#b5372e",
  //     "--w-gold": "#c19a3e",
  //     "--w-gold-lite": "#e6c56a",
  //     "--w-line": "#e6dcc4",
  //     "--w-hero-ink": "#ffffff",
  //     "--w-hero-bg":
  //       "radial-gradient(120% 100% at 50% -10%, #34479a 0%, rgba(52,71,154,0) 55%), linear-gradient(180deg, #1e2a5a 0%, #141d40 100%)",
  //     "--w-serif": PLAYFAIR,
  //     "--w-sans": SANS,
  //     "--w-deva": DEVA,
  //     "--w-divider": '"❁"',
  //     "--w-pattern": PATTERN.scallop,
  //   } as CSSProperties,
  // },

  {
    id: "save-the-date",
    name: "The Overture",
    description:
      "Save the Date — deep emerald & animated gold foil, live countdown, add-to-calendar. Traditional, elegant.",
    swatch: ["#0e3b2c", "#c9a23f", "#f7f0e0"],
    heroMotif: "seal",
    vars: {
      "--std-emerald": "#0e3b2c",
      "--std-emerald-2": "#124a37",
      "--std-gold": "#c9a23f",
      "--std-gold-lite": "#e8cd7e",
      "--std-ivory": "#f7f0e0",
      "--w-navy": "#0e3b2c",
      "--w-bg": "#0e3b2c",
      "--w-surface": "#124a37",
      "--w-ink": "#f7f0e0",
      "--w-ink-soft": "#c8d6cd",
      "--w-accent": "#c9a23f",
      "--w-gold": "#c9a23f",
      "--w-gold-lite": "#e8cd7e",
      "--w-line": "rgba(201,162,63,0.25)",
      "--w-hero-ink": "#f7f0e0",
      "--w-hero-bg":
        "radial-gradient(90% 70% at 50% 0%, rgba(201,162,63,0.25), transparent 55%), linear-gradient(180deg, #0e3b2c 0%, #082018 100%)",
      "--w-serif": CORMORANT,
      "--w-display": SCRIPT,
      "--w-sans": SANS,
      "--w-deva": DEVA,
      "--w-divider": '"✦"',
      "--w-pattern": PATTERN.hairline,
    } as CSSProperties,
  },

  {
    id: "muhurat",
    name: "The Muhurat",
    description:
      "Save the Date — royal maroon & antique gold, a rotating mandala seal & hanging toran, live countdown. Traditional Indian, elegant & luxe.",
    swatch: ["#4a0d1f", "#c9a23f", "#f7f0e0"],
    heroMotif: "seal",
    vars: {
      "--mht-maroon": "#4a0d1f",
      "--mht-maroon-2": "#6a132b",
      "--mht-gold": "#c9a23f",
      "--mht-gold-lite": "#e8cd7e",
      "--mht-ivory": "#f7f0e0",
      "--w-navy": "#4a0d1f",
      "--w-bg": "#4a0d1f",
      "--w-surface": "#6a132b",
      "--w-ink": "#f7f0e0",
      "--w-ink-soft": "#e4c9b8",
      "--w-accent": "#c9a23f",
      "--w-gold": "#c9a23f",
      "--w-gold-lite": "#e8cd7e",
      "--w-line": "rgba(201,162,63,0.25)",
      "--w-hero-ink": "#f7f0e0",
      "--w-hero-bg":
        "radial-gradient(90% 70% at 50% 0%, rgba(201,162,63,0.28), transparent 55%), linear-gradient(180deg, #4a0d1f 0%, #2c0712 100%)",
      "--w-serif": CORMORANT,
      "--w-display": SCRIPT,
      "--w-sans": SANS,
      "--w-deva": DEVA,
      "--w-divider": '"✦"',
      "--w-pattern": PATTERN.hairline,
    } as CSSProperties,
  },

  {
    id: "gulistan",
    name: "The Gulistan",
    description:
      "Save the Date — blush rose & antique gold, a cusped Mughal arch, cascading roses, a palace at dusk & the couple on the balcony. Romantic, elegant & luxe.",
    swatch: ["#f4dcdf", "#c0a05a", "#6e1f34"],
    heroMotif: "jharokha",
    vars: {
      /* Dusty, low-chroma blush — the roses read as antique botanical
       * illustration rather than bubblegum, and gold stays the only saturated
       * accent. --glt-gold-deep is the one gold dark enough to read as text on
       * the ivory ground. */
      "--glt-blush": "#fbeaea",
      "--glt-blush-2": "#f2d6da",
      "--glt-cream": "#fdf5ec",
      "--glt-champagne": "#f3e2c8",
      "--glt-rose": "#d49aa8",
      "--glt-rose-deep": "#b3778a",
      "--glt-saffron": "#d99f52",
      "--glt-maroon": "#6e1f34",
      "--glt-maroon-2": "#551227",
      "--glt-gold": "#c0a05a",
      "--glt-gold-lite": "#e4cd92",
      "--glt-gold-deep": "#96742c",
      "--glt-leaf": "#9aa98a",
      "--glt-ink": "#5a2436",
      "--glt-ink-soft": "#93697a",
      "--glt-skin": "#e9c3ad",
      "--glt-hair": "#3c2230",
      "--glt-palace": "#c093a4",
      "--glt-palace-far": "#d7aebc",
      "--glt-lantern-glass": "rgba(228,205,146,0.20)",
      "--w-navy": "#6e1f34",
      "--w-bg": "#fbeaea",
      "--w-surface": "#fdf5ec",
      "--w-ink": "#5a2436",
      "--w-ink-soft": "#93697a",
      "--w-accent": "#b3778a",
      "--w-gold": "#c0a05a",
      "--w-gold-lite": "#e4cd92",
      "--w-line": "rgba(192,160,90,0.28)",
      "--w-hero-ink": "#6e1f34",
      "--w-hero-bg":
        "radial-gradient(90% 70% at 50% 0%, rgba(255,250,244,0.92), transparent 60%), linear-gradient(180deg, #fdf5f0 0%, #f4d9de 100%)",
      "--w-serif": PLAYFAIR,
      "--w-display": SCRIPT,
      "--w-sans": SANS,
      "--w-deva": DEVA,
      "--w-divider": '"✦"',
      "--w-pattern": PATTERN.dots,
    } as CSSProperties,
  },

  {
    id: "jharokha",
    name: "The Jharokha",
    description:
      "A luxury royal wedding — blush, champagne & antique gold, cusped Mughal arches, cascading roses, temple bells & a palace at dusk. Sabyasachi-inspired, cinematic & handcrafted.",
    swatch: ["#7a1f38", "#c9a24a", "#f8dbe0"],
    heroMotif: "jharokha",
    vars: {
      "--jhr-ivory": "#fdf6ec",
      "--jhr-ivory-2": "#f8ecdb",
      "--jhr-blush": "#f8dbe0",
      "--jhr-blush-2": "#f3c7d0",
      "--jhr-champagne": "#f3e2c8",
      "--jhr-rose": "#df93a6",
      "--jhr-rose-deep": "#c56f88",
      "--jhr-saffron": "#e2a24a",
      "--jhr-gold": "#c9a24a",
      "--jhr-gold-lite": "#e8cd7e",
      "--jhr-gold-deep": "#a67c2e",
      "--jhr-maroon": "#7a1f38",
      "--jhr-maroon-2": "#5e1329",
      "--jhr-maroon-3": "#3f0c1e",
      "--jhr-ink": "#4a2230",
      "--jhr-ink-soft": "#8a5a68",
      "--jhr-leaf": "#8fa87a",
      "--jhr-skin": "#e9c3ad",
      "--jhr-hair": "#3c2230",
      "--jhr-palace": "#c98aa0",
      "--jhr-palace-far": "#d9a9ba",
      "--jhr-lantern-glass": "rgba(232,205,126,0.22)",
      "--w-navy": "#7a1f38",
      "--w-bg": "#fdf6ec",
      "--w-surface": "#fffaf2",
      "--w-ink": "#4a2230",
      "--w-ink-soft": "#8a5a68",
      "--w-accent": "#c56f88",
      "--w-gold": "#c9a24a",
      "--w-gold-lite": "#e8cd7e",
      "--w-line": "rgba(201,162,74,0.3)",
      "--w-hero-ink": "#fdf6ec",
      "--w-hero-bg":
        "radial-gradient(90% 70% at 50% 0%, rgba(201,162,74,0.35), transparent 60%), linear-gradient(180deg, #7a1f38 0%, #3f0c1e 100%)",
      "--w-serif": PLAYFAIR,
      "--w-display": SCRIPT,
      "--w-sans": SANS,
      "--w-deva": DEVA,
      "--w-divider": '"✦"',
      "--w-pattern": PATTERN.dots,
    } as CSSProperties,
  },

  {
    id: "mayura",
    name: "The Mayura",
    description:
      "A vibrant peacock wedding — teal, marigold & rani-pink on ivory, hand-drawn peacocks, marigold torans, a golden mandap & an illustrated bride & groom. Colourful, festive & traditional.",
    swatch: ["#0e6e6e", "#c9a23f", "#d81b60"],
    heroMotif: "mandala",
    vars: {
      "--myr-ivory": "#fdf4e3",
      "--myr-ivory-2": "#f7ead0",
      "--myr-champagne": "#f4e6c6",
      "--myr-teal": "#0e6e6e",
      "--myr-teal-2": "#0a4a4a",
      "--myr-teal-3": "#063231",
      "--myr-blue": "#12668f",
      "--myr-leaf": "#4f9d5d",
      "--myr-pink": "#d81b60",
      "--myr-pink-deep": "#a01048",
      "--myr-saffron": "#ef9a1e",
      "--myr-marigold": "#f4b400",
      "--myr-gold": "#c9a23f",
      "--myr-gold-lite": "#ecd07a",
      "--myr-gold-deep": "#a67c2e",
      "--myr-ink": "#193c3b",
      "--myr-ink-soft": "#5f7d7a",
      "--myr-skin": "#e9c3ad",
      "--myr-hair": "#2a1a20",
      "--myr-palace": "#d9b24a",
      "--myr-palace-far": "#e7cd85",
      "--w-navy": "#0a4a4a",
      "--w-bg": "#fdf4e3",
      "--w-surface": "#fffaf0",
      "--w-ink": "#193c3b",
      "--w-ink-soft": "#5f7d7a",
      "--w-accent": "#d81b60",
      "--w-gold": "#c9a23f",
      "--w-gold-lite": "#ecd07a",
      "--w-line": "rgba(201,162,63,0.3)",
      "--w-hero-ink": "#fdf4e3",
      "--w-hero-bg":
        "radial-gradient(90% 70% at 50% 0%, rgba(201,162,63,0.35), transparent 60%), linear-gradient(180deg, #0e6e6e 0%, #063231 100%)",
      "--w-serif": PLAYFAIR,
      "--w-display": SCRIPT,
      "--w-sans": SANS,
      "--w-deva": DEVA,
      "--w-divider": '"✦"',
      "--w-pattern": PATTERN.dots,
    } as CSSProperties,
  },

  {
    id: "jodi",
    name: "The Jodi",
    description:
      "A painted invitation leaf — ivory paper inside a gold keyline, the couple standing in a mehrab arch at its foot. Antique gold and oxblood, symmetric and quiet. Their own portrait can take the arch.",
    swatch: ["#FEFAEF", "#C29B4E", "#7A1B22"],
    heroMotif: "caricature",
    vars: {
      /* Read off the theme's own illustration (see render/jodi/ART.md), so the
       * type and the painting share one palette: the artwork's paper, its
       * antique-gold embroidery and the oxblood of her lehenga. Three colours,
       * ivory · gold · oxblood; the sage and emerald are the bouquet's, used in
       * hairline doses only.
       *
       * `--jdi-paper` is the artwork's paper EXACTLY. The plate ships as an
       * opaque rectangle rather than a matted cut-out, so wherever it sits the
       * ground has to be this value or its edges show. */
      "--jdi-paper": "#FEFAEF",
      "--jdi-champ": "#FBF2DF",
      "--jdi-champ-2": "#F2E3C6",
      "--jdi-champ-3": "#FDF7EA",
      "--jdi-cream": "#FDF8EE",
      "--jdi-ivory": "#F9F1E1",
      "--jdi-ivory-2": "#F3E8D2",
      "--jdi-mandala": "#C29B4E",
      "--jdi-mandala-2": "#9A7526",
      "--jdi-maroon": "#7A1B22",
      "--jdi-maroon-2": "#5A1218",
      "--jdi-maroon-3": "#3D0C11",
      "--jdi-gold": "#C29B4E",
      "--jdi-gold-lite": "#E3C88A",
      "--jdi-gold-deep": "#9A7526",
      "--jdi-sage": "#97A177",
      "--jdi-sage-deep": "#6B7550",
      "--jdi-haveli": "#E3CDA6",
      "--jdi-haveli-2": "#CDB183",
      "--jdi-haveli-3": "#AE9160",
      "--jdi-elephant": "#B7A98C",
      "--jdi-elephant-2": "#877B62",
      /* The footer garden's two flowers. Both stay inside the theme's three
       * colours — marigold gold and an oxblood bloom. The emerald these started
       * as read as teal at size and was the one thing on the page that broke the
       * palette. */
      "--jdi-bloom": "#C9A24A",
      "--jdi-bloom-2": "#7A1B22",
      "--jdi-ink": "#4A2A22",
      "--jdi-ink-soft": "#8A6A5C",
      /* Tokens the fallback illustration draws with, so the placeholder art
       * recolours with the theme until licensed artwork is dropped in. */
      "--jdi-lehenga": "#7A1B22",
      "--jdi-lehenga-2": "#5A1218",
      "--jdi-sherwani": "#FBF3E4",
      "--jdi-sherwani-2": "#EFDFC2",
      "--jdi-dupatta": "#E3C88A",
      "--jdi-hair": "#2E1C16",
      "--jdi-skin": "#E9C3A2",
      "--w-navy": "#5A1218",
      "--w-bg": "#F9F1E1",
      "--w-surface": "#FDF8EE",
      "--w-ink": "#4A2A22",
      "--w-ink-soft": "#8A6A5C",
      "--w-accent": "#7A1B22",
      "--w-gold": "#C29B4E",
      "--w-gold-lite": "#E3C88A",
      "--w-line": "rgba(194,155,78,0.34)",
      "--w-hero-ink": "#4A2A22",
      "--w-hero-bg":
        "radial-gradient(80% 50% at 50% 0%, rgba(255,255,255,0.9), transparent 62%), linear-gradient(180deg, #FEFAEF 0%, #F3E8D2 100%)",
      "--w-serif": CORMORANT,
      "--w-display": PLAYFAIR,
      "--w-sans": SANS,
      "--w-deva": DEVA,
      "--w-divider": '"❁"',
      "--w-pattern": PATTERN.dots,
    } as CSSProperties,
  },

  {
    id: "dak",
    name: "The Dak",
    description:
      "An airmail postcard from the couple — aged card stock, perforated postage stamps, wax postmarks and a stamp for every celebration. Vintage philatelic, elegant & luxurious.",
    swatch: ["#182233", "#B4894A", "#A8332B"],
    heroMotif: "seal",
    vars: {
      /* Three inks only — postal navy · brass · vermilion — over aged stock.
       * (Vermilion is rationed: postmarks, the airmail chevron and the wax
       * seal. Everything else is navy, brass or paper.) */
      "--dak-ink": "#182233",
      "--dak-ink-2": "#25324A",
      "--dak-ink-3": "#0D131E",
      "--dak-paper": "#F5EDDC",
      "--dak-paper-2": "#ECE1C9",
      "--dak-surface": "#FBF6EA",
      "--dak-gold": "#B4894A",
      "--dak-gold-lite": "#E3C88A",
      "--dak-gold-deep": "#8A6526",
      "--dak-red": "#A8332B",
      "--dak-red-deep": "#7C231D",
      "--dak-text": "#23293A",
      "--dak-text-soft": "#6C7385",
      "--w-navy": "#182233",
      "--w-bg": "#F5EDDC",
      "--w-surface": "#FBF6EA",
      "--w-ink": "#23293A",
      "--w-ink-soft": "#6C7385",
      "--w-accent": "#A8332B",
      "--w-gold": "#B4894A",
      "--w-gold-lite": "#E3C88A",
      "--w-line": "rgba(180,137,74,0.3)",
      "--w-hero-ink": "#F5EDDC",
      "--w-hero-bg":
        "radial-gradient(90% 70% at 50% 0%, rgba(180,137,74,0.22), transparent 60%), linear-gradient(180deg, #25324A 0%, #0D131E 100%)",
      "--w-serif": CORMORANT,
      "--w-display": PLAYFAIR,
      "--w-sans": SANS,
      "--w-deva": DEVA,
      "--w-divider": '"✦"',
      "--w-pattern": PATTERN.dots,
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
      "Rosewood & brass, opening doors, rangoli & diyas — griha pravesh, housewarming.",
    swatch: ["#5C2113", "#9C3B21", "#C79A3D"],
    heroMotif: "doorway",
    vars: {
      /* Three-colour system: rosewood · brass · ivory (ink + a rare deep teal). */
      "--sa-terracotta": "#9C3B21", // rosewood — display type, primary
      "--sa-rosewood-deep": "#5C2113",
      "--sa-espresso": "#2C1108",
      "--sa-saffron": "#C79A3D", // brass — decorative strokes & rules
      "--sa-gold-lite": "#EBC77A", // brass on dark grounds
      "--sa-gold-deep": "#8A6114", // brass dark enough to read on ivory
      "--sa-ivory": "#FAF4E9",
      "--sa-cream": "#F3E8D5",
      "--sa-surface": "#FFFBF2",
      "--sa-teal": "#123F3E",
      "--sa-charcoal": "#2B221B",
      "--w-navy": "#5C2113",
      "--w-bg": "#FAF4E9",
      "--w-surface": "#FFFBF2",
      "--w-ink": "#2B221B",
      "--w-ink-soft": "#6B5A4B",
      "--w-accent": "#9C3B21",
      "--w-gold": "#C79A3D",
      "--w-gold-lite": "#EBC77A",
      "--w-line": "#E6D7BD",
      "--w-hero-ink": "#FAF4E9",
      "--w-hero-bg":
        "radial-gradient(80% 60% at 50% 30%, rgba(199,154,61,0.30) 0%, rgba(199,154,61,0) 62%), linear-gradient(180deg, #2C1108 0%, #5C2113 55%, #7A2E19 100%)",
      "--w-serif": CORMORANT,
      "--w-sans": SANS,
      "--w-deva": DEVA,
      "--w-divider": '"◇"',
      "--w-pattern":
        "conic-gradient(from 45deg, var(--sa-saffron) 0 25%, transparent 0 50%, var(--sa-saffron) 0 75%, transparent 0) 0 0/16px 16px",
    } as CSSProperties,
  },
];

const WEDDING_SUBJECT: SubjectSpec = {
  names: 2,
  labels: ["Partner one", "Partner two"],
};
const WEDDING_SUPPORTS: ThemeSupports = {
  taglineHero: true,
  story: true,
  gallery: true,
  family: true,
  faq: true,
  events: true,
  countdown: true,
  artwork: false,
  rsvp: true,
};
/** Non-wedding baseline: countdown only; each theme turns on what it needs.
 * `rsvp` stays off here so save-the-dates (which use this bare baseline) never
 * ask for a response; occasions that do collect RSVPs turn it back on. */
const MINIMAL_SUPPORTS: ThemeSupports = {
  taglineHero: false,
  story: false,
  gallery: false,
  family: false,
  faq: false,
  events: false,
  countdown: true,
  artwork: false,
  rsvp: false,
};

/** Category + subject + capability metadata, merged onto THEME_BASES below.
 * Adding a theme = add its base literal above and one entry here. */
const THEME_META: Record<
  string,
  Pick<Theme, "category" | "subjectSpec" | "supports">
> = {
  royal: { category: "wedding", subjectSpec: WEDDING_SUBJECT, supports: WEDDING_SUPPORTS },
  ivory: { category: "wedding", subjectSpec: WEDDING_SUBJECT, supports: WEDDING_SUPPORTS },
  christian: { category: "wedding", subjectSpec: WEDDING_SUBJECT, supports: WEDDING_SUPPORTS },
  punjabi: { category: "wedding", subjectSpec: WEDDING_SUBJECT, supports: WEDDING_SUPPORTS },
  "south-indian": { category: "wedding", subjectSpec: WEDDING_SUBJECT, supports: WEDDING_SUPPORTS },
  // rajasthani: { category: "wedding", subjectSpec: WEDDING_SUBJECT, supports: WEDDING_SUPPORTS }, // The Rajputana — temporarily disabled
  "save-the-date": {
    category: "save-the-date",
    subjectSpec: { names: 2, labels: ["Name", "Second name"], required: true },
    // Typographic on its own; the couple can be added inside the arched niche.
    supports: { ...MINIMAL_SUPPORTS, artwork: "optional" },
  },
  muhurat: {
    category: "save-the-date",
    subjectSpec: { names: 2, labels: ["Name", "Second name"], required: true },
    // Typographic on its own; the couple can be added inside the mandala.
    supports: { ...MINIMAL_SUPPORTS, artwork: "optional" },
  },
  gulistan: {
    category: "save-the-date",
    subjectSpec: { names: 2, labels: ["Name", "Second name"], required: true },
    // The couple on the balcony is part of the scene, so the slot starts on.
    supports: { ...MINIMAL_SUPPORTS, artwork: "built-in" },
  },
  jharokha: {
    category: "wedding",
    subjectSpec: WEDDING_SUBJECT,
    supports: WEDDING_SUPPORTS,
  },
  mayura: {
    category: "wedding",
    subjectSpec: WEDDING_SUBJECT,
    supports: WEDDING_SUPPORTS,
  },
  jodi: {
    category: "wedding",
    subjectSpec: WEDDING_SUBJECT,
    // The painted couple IS the theme, so the slot is on by default: a client's
    // own caricature or portrait sketch stands in the mehrab arch in their place.
    supports: { ...WEDDING_SUPPORTS, artwork: "built-in" },
  },
  dak: {
    category: "wedding",
    subjectSpec: WEDDING_SUBJECT,
    supports: WEDDING_SUPPORTS,
  },
  afterparty: {
    category: "party",
    subjectSpec: { names: 1, labels: ["Guest of honour"] },
    supports: { ...MINIMAL_SUPPORTS, events: true, rsvp: true },
  },
  confetti: {
    category: "kids-birthday",
    subjectSpec: { names: 1, labels: ["Child's name"], extras: ["age"] },
    supports: { ...MINIMAL_SUPPORTS, gallery: true, rsvp: true },
  },
  "little-miracle": {
    category: "baby-shower",
    subjectSpec: { names: 2, labels: ["Parent one", "Parent two"] },
    supports: { ...MINIMAL_SUPPORTS, gallery: true, events: true, rsvp: true },
  },
  "shubh-aarambh": {
    category: "housewarming",
    subjectSpec: { names: 1, labels: ["Family name"] },
    supports: { ...MINIMAL_SUPPORTS, events: true, rsvp: true },
  },
};

export const THEMES: Theme[] = THEME_BASES.map((t) => {
  const meta = THEME_META[t.id];
  if (!meta) throw new Error(`registry: no THEME_META for theme "${t.id}"`);
  return { ...t, ...meta };
});

export const DEFAULT_THEME_ID = "royal";

export function getTheme(themeId: string | null | undefined): Theme {
  return (
    THEMES.find((t) => t.id === themeId) ??
    THEMES.find((t) => t.id === DEFAULT_THEME_ID) ??
    THEMES[0]
  );
}

/* ── Celebration categories ──────────────────────────────────────────────────
 * The first-class grouping shown in the "New invitation" wizard. Each category
 * holds one or more themes (add more themes per category over time — they show
 * up here automatically). Order = display order in the occasion picker. */
export interface CategoryInfo {
  id: ThemeCategory;
  label: string;
  blurb: string;
  emoji: string;
  /** Lowercase occasion word for inline copy — "the {noun} of …", "New {noun}". */
  noun: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: "wedding", label: "Wedding", blurb: "The full multi-event celebration.", emoji: "💍", noun: "wedding" },
  { id: "save-the-date", label: "Save the Date", blurb: "An elegant early announcement.", emoji: "✦", noun: "save the date" },
  { id: "kids-birthday", label: "Kids' Birthday", blurb: "Playful, interactive & magical.", emoji: "🎂", noun: "birthday" },
  { id: "baby-shower", label: "Baby Shower", blurb: "Dreamy & celestial. Gender-neutral.", emoji: "🌙", noun: "baby shower" },
  { id: "housewarming", label: "Housewarming", blurb: "Griha Pravesh, puja & family.", emoji: "🪔", noun: "housewarming" },
  { id: "party", label: "Party", blurb: "Bachelor/ette & nightlife.", emoji: "⚡", noun: "party" },
];

const CATEGORY_INFO: Record<ThemeCategory, CategoryInfo> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c])
) as Record<ThemeCategory, CategoryInfo>;

/** The occasion category for a theme id (falls back to the default theme). */
export function occasionCategory(themeId: string | null | undefined): CategoryInfo {
  return CATEGORY_INFO[getTheme(themeId).category];
}

/** Human label for a theme's occasion, e.g. "Save the Date". */
export function occasionLabel(themeId: string | null | undefined): string {
  return occasionCategory(themeId).label;
}

/** Lowercase occasion noun for a theme, e.g. "save the date", "birthday". */
export function occasionNoun(themeId: string | null | undefined): string {
  return occasionCategory(themeId).noun;
}

/**
 * The link-share / invite sentence for an occasion, grammatically tuned per
 * category (weddings read "the wedding of A & B"; a save-the-date reads
 * "Save the date for A & B"; the rest are possessive).
 */
export function occasionInvite(
  themeId: string | null | undefined,
  names: string
): string {
  const { id } = occasionCategory(themeId);
  switch (id) {
    case "wedding":
      return `You're invited to the wedding of ${names}.`;
    case "save-the-date":
      return `Save the date for ${names}.`;
    case "kids-birthday":
      return `You're invited to ${names}'s birthday!`;
    case "baby-shower":
      return `You're invited to ${names}'s baby shower.`;
    case "housewarming":
      return `You're invited to ${names}'s housewarming.`;
    case "party":
      return `You're invited to ${names}'s party.`;
  }
}

/** Themes belonging to a category, in registry order. */
export function themesForCategory(cat: ThemeCategory): Theme[] {
  return THEMES.filter((t) => t.category === cat);
}
