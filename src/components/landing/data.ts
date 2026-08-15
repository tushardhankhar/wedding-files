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
  { id: "rajmahal", name: "The Rajmahal", vibe: "Palace · Cinematic", tagline: "The doors open for you.", art: "rajmahal", palette: ["#3E2612", "#C08F3F", "#7C2230"], demo: "rajmahal", category: "wedding" },
  { id: "maharaja", name: "The Maharaja", vibe: "Royal Indian", tagline: "Written in gold.", art: "maharaja", palette: ["#40060f", "#c99a3d", "#7a1226"], demo: "royal", category: "wedding" },
  { id: "jharokha", name: "The Jharokha", vibe: "Royal · Romantic", tagline: "A palace of love.", art: "jharokha", palette: ["#7a1f38", "#c9a24a", "#f8dbe0"], demo: "jharokha", category: "wedding" },
  { id: "mayura", name: "The Mayura", vibe: "Peacock · Colourful", tagline: "Where colours dance.", art: "mayura", palette: ["#0e6e6e", "#c9a23f", "#d81b60"], demo: "mayura", category: "wedding" },
  { id: "jodi", name: "The Jodi", vibe: "Illustrated · Ivory & gold", tagline: "Drawn for the two of you.", art: "jodi", palette: ["#FEFAEF", "#C29B4E", "#7A1B22"], demo: "jodi", category: "wedding" },
  { id: "dak", name: "The Dak", vibe: "Postcard & stamps", tagline: "Posted with love.", art: "dak", palette: ["#182233", "#B4894A", "#A8332B"], demo: "dak", category: "wedding" },
  // { id: "rajputana", name: "The Rajputana", vibe: "Rajasthan heritage", tagline: "Where heritage becomes celebration.", art: "rajputana", palette: ["#f3e6d2", "#c96f3b", "#8e5a2b"], demo: "rajasthani", category: "wedding" }, // temporarily disabled
  { id: "gulmohar", name: "The Gulmohar", vibe: "Modern Indian", tagline: "Colour in full bloom.", art: "gulmohar", palette: ["#d81b60", "#f4917f", "#fce3c8"], demo: "ivory", category: "wedding" },
  { id: "anand-karaj", name: "The Anand Karaj", vibe: "Punjabi & Sikh", tagline: "Two souls. One path.", art: "punjabi", palette: ["#fdf1dd", "#f5a623", "#c99a3d"], demo: "punjabi", category: "wedding" },
  { id: "kalyanam", name: "The Kalyanam", vibe: "South Indian", tagline: "Sacred. Timeless. Beautiful.", art: "south", palette: ["#5c1620", "#b8860b", "#1f5c3d"], demo: "south-indian", category: "wedding" },
  { id: "vow", name: "The Vow", vibe: "Christian & contemporary", tagline: "Forever starts here.", art: "vow", palette: ["#f5f2ea", "#aebfa5", "#d8c49a"], demo: "christian", category: "wedding" },
  { id: "taqdeer", name: "The Taqdeer", vibe: "Save the Date · Art Deco", tagline: "Pull the lever. Meet the date.", art: "taqdeer", palette: ["#54132C", "#C9A44C", "#0B0709"], demo: "taqdeer", category: "save-the-date" },
  { id: "overture", name: "The Overture", vibe: "Save the Date", tagline: "Mark your calendars.", art: "overture", palette: ["#0e3b2c", "#c9a23f", "#f7f0e0"], demo: "save-the-date", category: "save-the-date" },
  { id: "muhurat", name: "The Muhurat", vibe: "Save the Date · Indian", tagline: "The auspicious date is set.", art: "muhurat", palette: ["#4a0d1f", "#c9a23f", "#f7f0e0"], demo: "muhurat", category: "save-the-date" },
  { id: "gulistan", name: "The Gulistan", vibe: "Save the Date · Romantic", tagline: "Two hearts, one beginning.", art: "gulistan", palette: ["#f6d3d9", "#c9a24a", "#7a1f38"], demo: "gulistan", category: "save-the-date" },
  // Beyond weddings — interactive celebration themes.
  { id: "afterparty", name: "The Afterparty", vibe: "Bachelor / Bachelorette", tagline: "You're on the list.", art: "afterparty", palette: ["#09090B", "#7C3AED", "#EC4899"], demo: "afterparty", category: "other" },
  { id: "confetti", name: "The Confetti", vibe: "Kids' birthday", tagline: "Let the magic begin.", art: "confetti", palette: ["#60A5FA", "#FACC15", "#FB7185"], demo: "confetti", category: "other" },
  { id: "little-miracle", name: "The Little Miracle", vibe: "Baby shower & naming", tagline: "A wish upon a star.", art: "little-miracle", palette: ["#DCEAF7", "#F6D6D6", "#C5A46D"], demo: "little-miracle", category: "other" },
  { id: "shubh-aarambh", name: "The Shubh Aarambh", vibe: "Griha Pravesh & puja", tagline: "A new door opens.", art: "shubh-aarambh", palette: ["#5C2113", "#9C3B21", "#C79A3D"], demo: "shubh-aarambh", category: "other" },
];

// ── Calls to action ────────────────────────────────────────────────────────
// Both CTAs name the outcome rather than the mechanic: people click "see what
// your guests see" and "get my invitation website" far more readily than "see a
// live demo" and "get started", which describe the click instead of the reward.
// The short forms exist only for the navbar, where the long labels plus four
// nav links overflow the bar.
export const DEMO_CTA = "See what your guests see";
export const DEMO_CTA_SHORT = "See a guest's view";
export const BUY_CTA = "Get my invitation website";
export const BUY_CTA_SHORT = "Get my website";

// ── Pricing ────────────────────────────────────────────────────────────────
// Simple, transparent pricing. PRICE is the flagship invitation price and is
// referenced by the hero, navbar, sticky bar, final CTA and the checkout copy.
//
// ⚠️ PRICE must equal `PRICE_LABEL` in `modules/self-serve/pricing.ts`, which is
// what the buyer is actually charged at /start. That constant is the source of
// truth for the CHARGE; this one is the source of truth for the PAGE. They are
// separate on purpose — marketing copy shouldn't be able to reprice a payment —
// but a page that advertises one number and bills another is the fastest way to
// lose someone at the moment they'd decided to trust you. Change both together.
export const PRICE = "₹99";

/**
 * The standing price, shown struck through beside {@link PRICE}.
 *
 * ₹99 with nothing beside it reads as cheap; ₹99 beside ₹1,599 reads as a
 * deal, and it is the number every other surface — the comparison table, the
 * ads — has been anchoring against all along. Delete this and the introductory
 * offer stops looking like an offer.
 */
export const PRICE_WAS = "₹1,599";

/**
 * What a visitor is mentally comparing the price against. Nobody arrives with a
 * price for "invitation website" in their head, so the number floats free and
 * lands as either random or expensive; anchored against the printed cards they
 * were always going to buy, it reads as a rounding error.
 *
 * These are the two claims on this page that aren't verifiable in one click, so
 * they have to stay defensible: `note` must stay a range, and the range must be
 * one a real printer's quote lands inside. A buyer who prices cards at ₹8,000
 * and reads ₹40,000 stops trusting everything else on the page.
 *
 * Ranges confirmed by the owner 2026-08-04. Re-check them if you start selling
 * into a market with different printing costs.
 */
export const PRICE_ANCHORS: { label: string; note: string; amount: string }[] = [
  {
    label: "Printed cards for 300 guests",
    note: "₹40–₹150 a card, plus courier",
    amount: "₹12,000–₹45,000",
  },
  {
    label: "A designer-built wedding website",
    note: "typical freelance quote",
    amount: "₹15,000–₹50,000",
  },
  {
    label: "Your invitation website on Jashn",
    note: "one-time, everything included",
    amount: PRICE,
  },
];

// What the price covers beyond the feature list — the terms a buyer otherwise
// has to ask for before they'll commit (hosting, edits, guest limits, support).
// Shown once under all three plans, because they're identical across plans.
export const PLAN_TERMS: string[] = [
  "Live in minutes — you build it yourself",
  "Unlimited guests & unlimited events",
  "Edit it as often as you like",
  "Your link stays live for 12 months",
  "WhatsApp support while you build",
  "One-time price — no subscription",
  // Repeated here as well as in its own band: the guarantee's whole job is to
  // be on screen at the moment the price is, and the band sits three sections
  // higher. See GUARANTEE for the terms this is shorthand for.
  "7-day full refund — no reasons needed",
];

// Honest reasons to trust a brand-new brand. Deliberately no customer counts or
// review stars: we don't have real ones yet, and inventing them is both a lie
// and the easiest thing on a page to get caught on. Every claim here is
// verifiable by the visitor in one click.
export const TRUST_SIGNALS: string[] = [
  `${SHOWCASE_THEMES.length} designer themes`,
  "Open any demo — no signup",
  "Bilingual: English + हिंदी",
  "Made in India",
];

export const PLAN_INCLUDES: string[] = [
  "Your own bilingual celebration website (EN + हिं)",
  "Designer themes for every occasion",
  "Unlimited events, big and small",
  "Personal invitation links for every family",
  "Selective events — each family sees only theirs",
  "Guest RSVP, event by event",
  "Photo gallery, story, venue maps, countdown, music & FAQ",
  "One private link, shared on WhatsApp",
];

export type PricingPlan = {
  id: string;
  name: string;
  price: string;
  /** Standing price, struck through beside `price`. Marks an offer as an offer. */
  was?: string;
  note: string;
  blurb: string;
  features: string[];
  featured?: boolean;
  badge?: string;
  /** Render first in the single-column mobile stack. */
  mobileFirst?: boolean;
  /** Buyable at /start. Anything else opens WhatsApp instead. */
  selfServe?: boolean;
};

/**
 * What's on sale — currently ONE thing.
 *
 * During the introductory offer there is a single ₹99 product, so the page
 * shows a single card. The three-plan row is parked in {@link PARKED_PLANS}
 * rather than deleted: a ₹1,099 Save the Date and a ₹2,199 bundle sitting
 * beside a ₹99 full invitation don't describe a choice, they describe a
 * mistake, and nobody buys the lesser product when the better one costs less.
 *
 * To end the offer: restore the parked entries here, set `price` back to
 * {@link PRICE_WAS}, drop `was`, and put {@link PRICE} back to ₹1,599 — keeping
 * it in step with `modules/self-serve/pricing.ts`, which sets the real charge.
 */
export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "invitation",
    name: "The Full Invitation",
    price: PRICE,
    was: PRICE_WAS,
    note: "introductory offer · one-time · for weddings & every other celebration",
    blurb: "Everything your guests need, in one private link.",
    features: PLAN_INCLUDES,
    featured: true,
    badge: "Everything included",
    mobileFirst: true,
    selfServe: true,
  },
];

/**
 * The plans withdrawn for the duration of the ₹99 offer. Kept here so bringing
 * them back is a copy-paste rather than an archaeology exercise. Their prices
 * are the pre-offer ones and would need revisiting alongside {@link PRICE}.
 */
export const PARKED_PLANS: PricingPlan[] = [
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
    id: "bundle",
    name: "Invitation + Save the Date",
    price: "₹2,199",
    note: "one-time · save ₹499",
    blurb: "Both, together — share your date now, invite later.",
    features: [
      "Everything in the Full Invitation",
      "A matching Save the Date site",
      "Announce now, send the full invite later",
      "One theme & story, start to finish",
    ],
    badge: "Save ₹499",
  },
];

// ── Risk reversal ──────────────────────────────────────────────────────────
/**
 * The single largest unanswered objection on the page: "what if I pay to
 * a brand I've never heard of and it's rubbish?" There is no review count, no
 * years-in-business and no logo wall to answer it with, so the answer has to be
 * a promise the business actually keeps.
 *
 * BUSINESS COMMITMENT — approved by the owner 2026-08-04. This is the one block
 * on the page that creates an obligation rather than describing the product, so
 * treat the wording as load-bearing: the refund window is deliberately tied to
 * the period before guest links go out, which is what makes it cheap to honour.
 * Anyone editing this is changing what support has to do, not just what the
 * page says — the page must never promise something support won't.
 */
export const GUARANTEE = {
  title: "If you don't love it, you don't pay for it.",
  body:
    "Build your invitation, look at it on your own phone, and if it isn't what you hoped for, tell us within 7 days and we'll refund you in full. No forms, no reasons needed — just a message on the same WhatsApp chat you started in.",
  chips: ["7-day full refund", "No subscription, ever", "No card details on this site"],
};

/**
 * What actually happens after the green button. Tapping it launches WhatsApp,
 * which is a bigger, stranger step than a click — people hesitate at it because
 * they can't picture the other side: who answers, how fast, whether they're
 * about to be sold to on a call. Naming the next three moves removes the only
 * unknown left at the point of conversion.
 *
 * The "few hours" reply window is a promise a human has to keep — approved by
 * the owner 2026-08-04. Widen it here the day that stops being true; a missed
 * reply promise costs more than a slower one ever would.
 */
export const NEXT_STEPS: { title: string; body: string }[] = [
  {
    title: "You send one message",
    body: "The chat opens with your details half-written. Add your names and your date, hit send.",
  },
  {
    title: "We reply within a few hours",
    body: "A real person, not a bot. We'll confirm your theme, your events and the price — no call unless you want one.",
  },
  {
    title: "Your invitation goes live",
    body: "You get your own login, fill in your story, events and photos, and share the link on WhatsApp the same day.",
  },
];

// Marketed as on the way — not sold yet. Declared above FAQS because an FAQ
// answer reads from it, and a `const` referenced before its declaration is a
// module-evaluation crash, not a lint warning.
export const COMING_SOON: string[] = [
  "a planner dashboard with guest analytics",
  "dietary & logistics collection",
  "custom domains",
  "video heroes",
];

// ── Objection-handling FAQ ─────────────────────────────────────────────────
/**
 * Every question here is one a cold visitor asks silently and then leaves
 * over. Ordered by how often it kills the sale, not by topic: what do I get,
 * who builds it, is it really one payment, will my family cope, can I change it.
 *
 * Rendered as native <details> so the answers are in the HTML for search
 * engines and for anyone whose JS hasn't run, and mirrored into FAQPage
 * structured data by the component.
 */
export const FAQS: { q: string; a: string }[] = [
  {
    q: `What exactly do I get for ${PRICE}?`,
    a: "Your own invitation website on its own link — a designer theme, a live countdown, your story, every event with date, time, venue and a Google Maps link, a photo gallery, per-event RSVP, an FAQ for your guests, and a private link for each family. It's bilingual (English + हिंदी) and it works on every phone with no app to download. One payment covers all of it for 12 months.",
  },
  {
    q: "Do I build it, or do you?",
    a: "You do — and it takes minutes, not evenings. You get a login, fill in your names, dates, events and photos in a simple form, and pick a theme. There's nothing to design and nothing to install. We're on WhatsApp the whole time you're building, and if you'd rather we set it up from a list you send us, just ask in the chat.",
  },
  {
    q: "Is this a subscription? Will I be charged again?",
    a: `No. ${PRICE} is a single payment. Your link stays live for 12 months from the day you publish it, with unlimited edits and unlimited guests in that time. We don't store card details on this website and there's nothing to cancel.`,
  },
  {
    q: "How quickly can it be live?",
    a: "The same day. Most people go from their first WhatsApp message to a shareable link inside an hour, because you're filling in your own details rather than waiting on a designer's queue. If your date is this week, say so in the chat and we'll prioritise it.",
  },
  {
    q: "Do my guests need an app or an account?",
    a: "No. They tap the link in WhatsApp and the invitation opens in their phone's browser — no download, no sign-up, no password. That's deliberate: anything a 70-year-old relative has to install is an invitation that doesn't get opened.",
  },
  {
    q: "Can different families see different events?",
    a: "Yes, and it's the reason most people choose us. You group your guests — Sharma family, office, college friends — tick which events each group is invited to, and each group gets its own private link. A group that isn't invited to the Haldi never sees that a Haldi exists. No awkward conversations.",
  },
  {
    q: "Can I still change things after I've sent the link out?",
    a: "Yes. Edit anything — a venue change, a new time, extra photos, another event — and every guest who opens the link sees the update instantly. The link itself never changes, so nothing you've already shared breaks.",
  },
  {
    q: "What if my relatives aren't comfortable with websites?",
    a: "They don't have to be. The link opens like any other WhatsApp message and reads top to bottom like a card. Every event has a one-tap map link and a one-tap RSVP, and the whole thing can be read in Hindi. If someone still can't get in, message us and we'll help them.",
  },
  {
    q: "Is my guest list private?",
    a: "Yes. There's no public guest directory and no shared page — every family reaches your invitation through their own private link, which you can revoke at any time. Your guest list is never shown to your guests, and your invitation is never indexed by search engines.",
  },
  {
    q: "Can I use it for something that isn't a wedding?",
    a: "Yes — birthdays, baby showers, griha pravesh, anniversaries, naming ceremonies, engagement parties, and a save-the-date on its own. There are themes built specifically for each, and the same per-family privacy works for all of them.",
  },
  {
    q: "How do I pay?",
    a: "In the WhatsApp chat, by UPI or bank transfer, after we've confirmed exactly what you're getting. Nothing is charged from this website and you'll never be asked for card details here.",
  },
  {
    q: "What if I don't like it?",
    a: `${GUARANTEE.body}`,
  },
  // Moved out of a "Coming soon" chip row that used to sit directly under the
  // price. The same list is a liability there and an asset here: volunteering
  // your limits when someone asks reads as honesty; volunteering them at the
  // moment of payment reads as a warning.
  {
    q: "Is there anything it can't do yet?",
    a: `Yes, and we'd rather tell you now: ${COMING_SOON.join(", ")} are all on the way but not built yet. Everything described on this page works today — if something you need isn't here, ask us in the chat before you pay and we'll tell you honestly whether we can do it.`,
  },
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
  // Ahead of Contact deliberately: someone reaching for the nav with a question
  // is looking for an answer, not a form, and the FAQ closes far more of them
  // than an enquiry that has to wait a day for a reply.
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#enquire" },
];
