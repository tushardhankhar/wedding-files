/**
 * Landing page content data — kept apart from the visual components.
 */

// ── Replaceable photography slots ───────────────────────────────────────────
// Drop licensed Indian-wedding photography here (e.g. files under
// /public/landing/*.avif) and every PhotoArt placeholder upgrades itself to a
// real <img>. Until then, editorial gradient art renders in each slot.
export interface ImageSlot {
  src: string;
  alt: string;
}
export const IMAGES: Partial<Record<string, ImageSlot>> = {
  // hero:     { src: "/landing/hero-baraat.avif", alt: "Bride and groom celebrating as guests throw petals" },
  couple: { src: "/landing/couple.png", alt: "Couple celebrating on their wedding day" },
  // Live-demo screenshots power the theme gallery cards (see SHOWCASE_THEMES).
  // maharaja: { src: "/landing/themes/royal.png", alt: "The Maharaja theme — royal wine and gold wedding site" },
  // rajputana: { src: "/landing/themes/rajasthani.png", alt: "The Rajputana theme — Rajasthan heritage wedding site" },
  // gulmohar: { src: "/landing/themes/ivory.png", alt: "The Gulmohar theme — modern Indian wedding site" },
  // punjabi: { src: "/landing/themes/punjabi.png", alt: "The Anand Karaj theme — Punjabi & Sikh wedding site" },
  // south: { src: "/landing/themes/south-indian.png", alt: "The Kalyanam theme — South Indian wedding site" },
  // vow: { src: "/landing/themes/christian.png", alt: "The Vow theme — Christian & contemporary wedding site" },
  // haldi:    { src: "/landing/haldi.avif", alt: "Vibrant haldi ceremony" },
  // sangeet:  { src: "/landing/sangeet.avif", alt: "Family dancing at the sangeet" },
  // mandap:   { src: "/landing/mandap.avif", alt: "Marigold-decorated wedding mandap" },
};

// ── Guest personalisation demo ─────────────────────────────────────────────
export interface DemoEvent {
  id: string;
  name: string;
  hi: string;
  date: string;
  time: string;
  venue: string;
  /** accent used on the event card rail */
  color: string;
}

export const DEMO_EVENTS: DemoEvent[] = [
  { id: "haldi", name: "Haldi", hi: "हल्दी", date: "10 Dec", time: "10:00 AM", venue: "The Garden Lawns", color: "var(--l-saffron)" },
  { id: "mehendi", name: "Mehendi", hi: "मेहंदी", date: "10 Dec", time: "4:00 PM", venue: "The Courtyard", color: "var(--l-emerald)" },
  { id: "sangeet", name: "Sangeet", hi: "संगीत", date: "11 Dec", time: "7:00 PM", venue: "The Leela Palace", color: "var(--l-purple)" },
  { id: "wedding", name: "Wedding", hi: "विवाह", date: "12 Dec", time: "6:30 PM", venue: "The Grand Courtyard", color: "var(--l-red)" },
  { id: "reception", name: "Reception", hi: "स्वागत", date: "13 Dec", time: "8:00 PM", venue: "The Imperial Ballroom", color: "var(--l-gold)" },
];

export interface DemoFamily {
  id: string;
  label: string;
  greeting: string;
  members: string[];
  eventIds: string[];
}

export const DEMO_FAMILIES: DemoFamily[] = [
  {
    id: "sharma",
    label: "Sharma Family",
    greeting: "Namaste Sharma Family",
    members: ["Rajesh", "Neetu", "Rohan", "Riya"],
    eventIds: ["sangeet", "wedding", "reception"],
  },
  {
    id: "kapoor",
    label: "Kapoor Family",
    greeting: "Namaste Kapoor Family",
    members: ["Vikram", "Simran", "Aanya"],
    eventIds: ["haldi", "mehendi", "sangeet", "wedding", "reception"],
  },
  {
    id: "office",
    label: "Aarav’s Office",
    greeting: "Hello, Team Aarav",
    members: ["A table of 12"],
    eventIds: ["wedding", "reception"],
  },
];

// ── Theme showcase ─────────────────────────────────────────────────────────
export type ThemeCategory = "wedding" | "save-the-date" | "other";

export interface ShowcaseTheme {
  id: string;
  name: string;
  vibe: string;
  tagline: string;
  art: string; // PhotoArt recipe key
  palette: string[];
  /** Registry theme id — powers the live /demo/[themeId] preview. */
  demo: string;
  /** Occasion group — drives the theme gallery filter. */
  category: ThemeCategory;
}

export const SHOWCASE_THEMES: ShowcaseTheme[] = [
  { id: "maharaja", name: "The Maharaja", vibe: "Royal Indian", tagline: "Written in gold.", art: "maharaja", palette: ["#40060f", "#c99a3d", "#7a1226"], demo: "royal", category: "wedding" },
  { id: "jharokha", name: "The Jharokha", vibe: "Royal · Romantic", tagline: "A palace of love.", art: "jharokha", palette: ["#7a1f38", "#c9a24a", "#f8dbe0"], demo: "jharokha", category: "wedding" },
  // { id: "rajputana", name: "The Rajputana", vibe: "Rajasthan heritage", tagline: "Where heritage becomes celebration.", art: "rajputana", palette: ["#f3e6d2", "#c96f3b", "#8e5a2b"], demo: "rajasthani", category: "wedding" }, // temporarily disabled
  { id: "gulmohar", name: "The Gulmohar", vibe: "Modern Indian", tagline: "Colour in full bloom.", art: "gulmohar", palette: ["#d81b60", "#f4917f", "#fce3c8"], demo: "ivory", category: "wedding" },
  { id: "anand-karaj", name: "The Anand Karaj", vibe: "Punjabi & Sikh", tagline: "Two souls. One path.", art: "punjabi", palette: ["#fdf1dd", "#f5a623", "#c99a3d"], demo: "punjabi", category: "wedding" },
  { id: "kalyanam", name: "The Kalyanam", vibe: "South Indian", tagline: "Sacred. Timeless. Beautiful.", art: "south", palette: ["#5c1620", "#b8860b", "#1f5c3d"], demo: "south-indian", category: "wedding" },
  { id: "vow", name: "The Vow", vibe: "Christian & contemporary", tagline: "Forever starts here.", art: "vow", palette: ["#f5f2ea", "#aebfa5", "#d8c49a"], demo: "christian", category: "wedding" },
  { id: "overture", name: "The Overture", vibe: "Save the Date", tagline: "Mark your calendars.", art: "overture", palette: ["#0e3b2c", "#c9a23f", "#f7f0e0"], demo: "save-the-date", category: "save-the-date" },
  { id: "muhurat", name: "The Muhurat", vibe: "Save the Date · Indian", tagline: "The auspicious date is set.", art: "muhurat", palette: ["#4a0d1f", "#c9a23f", "#f7f0e0"], demo: "muhurat", category: "save-the-date" },
  { id: "gulistan", name: "The Gulistan", vibe: "Save the Date · Romantic", tagline: "Two hearts, one beginning.", art: "gulistan", palette: ["#f6d3d9", "#c9a24a", "#7a1f38"], demo: "gulistan", category: "save-the-date" },
  // Beyond weddings — interactive celebration themes.
  { id: "afterparty", name: "The Afterparty", vibe: "Bachelor / Bachelorette", tagline: "You're on the list.", art: "afterparty", palette: ["#09090B", "#7C3AED", "#EC4899"], demo: "afterparty", category: "other" },
  { id: "confetti", name: "The Confetti", vibe: "Kids' birthday", tagline: "Let the magic begin.", art: "confetti", palette: ["#60A5FA", "#FACC15", "#FB7185"], demo: "confetti", category: "other" },
  { id: "little-miracle", name: "The Little Miracle", vibe: "Baby shower & naming", tagline: "A wish upon a star.", art: "little-miracle", palette: ["#DCEAF7", "#F6D6D6", "#C5A46D"], demo: "little-miracle", category: "other" },
  { id: "shubh-aarambh", name: "The Shubh Aarambh", vibe: "Griha Pravesh & puja", tagline: "A new door opens.", art: "shubh-aarambh", palette: ["#B55233", "#D99A2B", "#174C4F"], demo: "shubh-aarambh", category: "other" },
];

// ── Pricing ────────────────────────────────────────────────────────────────
// Simple, transparent pricing. PRICE remains the flagship invitation price and
// is still referenced by the hero, navbar & final CTA.
export const PRICE = "₹1,599";

export const PLAN_INCLUDES: string[] = [
  "Your own bilingual celebration website (EN + हिं)",
  "Designer themes for every occasion",
  "Unlimited events, big and small",
  "Personal invitation links for every family",
  "Selective events — each family sees only theirs",
  "Guest RSVP, event by event",
  "Photo gallery, story, venue maps, countdown & FAQ",
  "One private link, shared on WhatsApp",
];

// The three ways to buy. The bundle is highlighted as the best value.
export type PricingPlan = {
  id: string;
  name: string;
  price: string;
  note: string;
  blurb: string;
  features: string[];
  featured?: boolean;
  badge?: string;
};

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "save-the-date",
    name: "Save the Date",
    price: "₹1,099",
    note: "one-time",
    blurb: "Announce your date, beautifully.",
    features: [
      "Designer save-the-date site (EN + हिं)",
      "Your date, venue city & live countdown",
      "One private link, shared on WhatsApp",
      "Upgrade to the full invitation anytime",
    ],
  },
  {
    id: "invitation",
    name: "Wedding/ Other Events Invitation",
    price: PRICE,
    note: "one-time",
    blurb: "The complete invitation — everything, in one link.",
    features: PLAN_INCLUDES,
  },
  {
    id: "bundle",
    name: "Wedding + Save the Date",
    price: "₹2,199",
    note: "one-time · save ₹499",
    blurb: "Both, together — share your date now, invite later.",
    features: [
      "Everything in the Wedding Invitation",
      "A matching Save the Date site",
      "Announce now, send the full invite later",
      "One theme & story, start to finish",
    ],
    featured: true,
    badge: "Best value",
  },
];

// Marketed as on the way — surfaced with a "Coming soon" tag, not sold yet.
export const COMING_SOON: string[] = [
  "Planner dashboard & guest analytics",
  "Dietary & logistics collection",
  "Custom domain",
  "Video hero",
];

// ── Built around how Indian weddings actually work ─────────────────────────
export const REALITY_NOTES: string[] = [
  "Because an invitation is often for a family, not an email address.",
  "Because 500 guests don’t attend the same five events.",
  "Because “Sharma uncle ke kitne log aa rahe hain?” should not require six phone calls.",
];

// ── Brand contact details ──────────────────────────────────────────────────
export const SITE_URL = "https://jointhejashn.com";
export const SITE_DOMAIN = "jointhejashn.com";
export const CONTACT_EMAIL = "hello@jointhejashn.com";

// ── Navigation ─────────────────────────────────────────────────────────────
export const NAV_LINKS: { label: string; href: string }[] = [
  { label: "Themes", href: "#themes" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#enquire" },
];
