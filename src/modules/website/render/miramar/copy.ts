import type { Localized, WebsiteConfig } from "../../schema";

/**
 * THE MIRAMAR — every fixed line the theme prints.
 *
 * The theme is written copy as much as it is drawn ornament: the scripture on
 * the plate, "How We Set Sail" over the timeline, "Counting every tide" above
 * the clock. All of it is beautiful and none of it fits every couple — a Hindu
 * couple borrowing the coastal art wants neither verse, a couple marrying
 * inland wants nothing about tides. So the wording lives HERE rather than
 * inline in the renderer, and the content editor writes overrides against these
 * same keys.
 *
 * Two rules the whole file turns on:
 *
 *   - The values below ARE the demo. The editor prefills its inputs from
 *     {@link miramarCopy}, so a client opens the section already holding the
 *     wording they saw in the preview and edits it in place, rather than facing
 *     empty boxes with the real text hiding behind placeholder grey.
 *   - A cleared field means GONE, not "reset". Blank an eyebrow and the eyebrow
 *     stops printing. The exception is {@link REQUIRED}: a button, a nav link or
 *     a countdown unit with no label is a dead control, not a removed line, so
 *     those fall back to the theme's own wording.
 */

const D = (en: string, hi?: string): Localized => ({ en, hi });

export const MIRAMAR_COPY = {
  /* ── navigation ── */
  navStory: D("Our Story", "हमारी कहानी"),
  navFamily: D("Families", "परिवार"),
  navEvents: D("Celebrations", "आयोजन"),
  navGallery: D("Gallery", "गैलरी"),
  navDetails: D("Details", "विवरण"),
  navRsvp: D("RSVP", "उत्तर"),
  navMenu: D("Menu", "मेन्यू"),
  navClose: D("Close", "बंद करें"),

  /* ── the invitation plate ── */
  verse: D(
    "“No one has ever seen God; but if we love one another, God lives in us and his love is made complete in us.”",
    "“परमेश्वर को किसी ने कभी नहीं देखा; परन्तु यदि हम एक दूसरे से प्रेम रखें, तो परमेश्वर हम में बना रहता है और उसका प्रेम हम में सिद्ध होता है।”"
  ),
  verseRef: D("1 John 4:12"),
  heroTogether: D("Together with their families", "अपने परिवारों सहित"),
  heroInvite: D("invite you to the wedding of", "आपको विवाह में आमंत्रित करते हैं"),
  heroCta: D("Celebrate with us", "हमारे साथ जश्न मनाइए"),

  /* ── the guest welcome ── */
  welcomeGreeting: D("Peace be with you", "आप पर शांति हो"),
  welcomeBody: D(
    "With grateful hearts and the blessing of our families, we invite you to the church, to the shore, and to every moment in between.",
    "कृतज्ञ हृदय और अपने परिवारों के आशीर्वाद सहित, हम आपको गिरजाघर, समुद्र तट और बीच के हर पल में आमंत्रित करते हैं।"
  ),

  /* ── our story ── */
  storyEyebrow: D("Our Chronicle", "गाथा"),
  storyTitle: D("How We Set Sail", "हमारी कहानी"),

  /* ── families ── */
  familyEyebrow: D("With Blessings", "आशीर्वाद सहित"),
  familyTitle: D("Our Families", "हमारे परिवार"),
  familyGroomLabel: D("Groom's Family", "वर पक्ष"),
  familyBrideLabel: D("Bride's Family", "वधू पक्ष"),

  /* ── countdown ── */
  countdownGreeting: D("Counting every tide", "हर लहर गिनते हुए"),
  countdownDays: D("Days", "दिन"),
  countdownHours: D("Hours", "घंटे"),
  countdownMinutes: D("Minutes", "मिनट"),
  countdownSeconds: D("Seconds", "सेकंड"),

  /* ── celebrations ── */
  eventsEyebrow: D("The Celebrations", "आयोजन"),
  eventsTitle: D("The Order of Days", "समारोह"),
  eventsNote: D(
    "Only the celebrations chosen for your family appear here.",
    "यहाँ केवल वही आयोजन हैं जो आपके परिवार के लिए चुने गए हैं।"
  ),
  eventsHostedBy: D("Hosted by", "मेज़बान"),
  eventsVenueCta: D("View venue", "स्थान देखें"),
  eventsCalendarCta: D("Add to calendar", "कैलेंडर"),

  /* ── gallery ── */
  galleryEyebrow: D("The Collection", "संग्रह"),
  galleryTitle: D("Our Portraits", "हमारे चित्र"),

  /* ── details ── */
  detailsEyebrow: D("For Our Guests", "अतिथियों हेतु"),
  detailsTitle: D("Charts & Bearings", "विवरण"),
  detailsContacts: D("With love, reach us at", "स्नेह सहित, संपर्क करें"),

  /* ── RSVP ── */
  rsvpGreeting: D("Will you join us?", "क्या आप पधारेंगे?"),
  rsvpNote: D(
    "Your presence and blessings would make our celebration complete.",
    "आपकी उपस्थिति और आशीर्वाद हमारे उत्सव को पूर्ण बनाएंगे।"
  ),
  rsvpAccept: D("Joyfully accept", "सहर्ष स्वीकार"),
  rsvpDecline: D("Regretfully decline", "क्षमा करें"),
  rsvpHowMany: D("How many?", "कितने?"),
  rsvpYourName: D("Your name", "आपका नाम"),
  rsvpPartySize: D("Guests in your party", "आपके साथ कितने लोग"),
  rsvpWhichEvents: D("Celebrations you will attend", "आप किन आयोजनों में पधारेंगे"),
  rsvpSend: D("Send our response", "उत्तर भेजें"),
  rsvpSave: D("Save changes", "बदलाव सहेजें"),
  rsvpEdit: D("Edit my RSVP", "उत्तर बदलें"),
  rsvpNotAttending: D("Not attending", "नहीं आ रहे"),
  rsvpGuestsSuffix: D("guest(s)", "अतिथि"),

  /* ── the thank-you, once a response is recorded ── */
  thanksTitle: D("Thank you", "धन्यवाद"),
  thanksLine: D("We shall see you by the sea", "समुद्र किनारे मिलते हैं"),
  thanksNote: D("Your response has been received", "आपका उत्तर प्राप्त हो गया है"),

  /* ── footer ── */
  footerVerse: D("“Whither thou goest, I will go.”", "“जहाँ तू जाएगा, वहीं मैं भी जाऊँगी।”"),
  footerVerseRef: D("Ruth 1:16"),
  footerCredit: D("Crafted with love · Jashn", "प्रेम से बनाया गया · जश्न"),
} satisfies Record<string, Localized>;

export type MiramarCopyKey = keyof typeof MIRAMAR_COPY;
export type MiramarCopy = Record<MiramarCopyKey, Localized>;

/** Lines whose element cannot survive being empty — a button with no label, a
 * nav item with nothing to click, a countdown number with no unit under it.
 * Blanking one of these restores the theme's wording instead of printing a
 * void. Everything else is free to be cleared away. */
const REQUIRED = new Set<MiramarCopyKey>([
  "navMenu",
  "navClose",
  "heroCta",
  "familyGroomLabel",
  "familyBrideLabel",
  "countdownDays",
  "countdownHours",
  "countdownMinutes",
  "countdownSeconds",
  "eventsVenueCta",
  "eventsCalendarCta",
  "rsvpAccept",
  "rsvpDecline",
  "rsvpHowMany",
  "rsvpYourName",
  "rsvpPartySize",
  "rsvpWhichEvents",
  "rsvpSend",
  "rsvpSave",
  "rsvpEdit",
]);

/** Whether a line has anything to print in either language. The renderer asks
 * this before drawing the element around it, so a cleared field takes its
 * flourish, its rule and its wrapper with it rather than leaving a gap. */
export function hasCopy(v: Localized | undefined): v is Localized {
  return Boolean(v && (v.en.trim() || v.hi?.trim()));
}

const BLANK: Localized = { en: "" };

/** The editor's shape: everything optional, keys it does not know about kept
 * out of the renderer's way. */
export type MiramarCopyOverrides = Partial<Record<string, Localized>>;

function merge(stored: MiramarCopyOverrides | undefined): MiramarCopy {
  const out = {} as MiramarCopy;
  for (const key of Object.keys(MIRAMAR_COPY) as MiramarCopyKey[]) {
    const own = stored?.[key];
    if (hasCopy(own)) out[key] = { en: own.en, hi: own.hi?.trim() ? own.hi : undefined };
    else if (!own || REQUIRED.has(key)) out[key] = MIRAMAR_COPY[key];
    else out[key] = BLANK; // written, and written empty — the client removed it
  }
  return out;
}

/**
 * The wording this invitation actually prints.
 *
 * `hero.tagline` is the older, one-field way to replace the scripture, and
 * invitations saved before this section existed still carry theirs. It keeps
 * winning until the client writes a verse here — including the part where a
 * custom tagline hides "1 John 4:12", which is not the reference for a line the
 * couple wrote themselves.
 */
export function miramarCopy(config: WebsiteConfig): MiramarCopy {
  const stored = config.themeCopy?.miramar as MiramarCopyOverrides | undefined;
  const copy = merge(stored);
  const tagline = config.hero?.tagline;
  if (hasCopy(tagline) && !stored?.verse) {
    copy.verse = tagline;
    if (!stored?.verseRef) copy.verseRef = BLANK;
  }
  return copy;
}

/* ── the editor's field list ───────────────────────────────────────────────
 * Grouped the way the page is read, top to bottom, so someone editing "How We
 * Set Sail" can find it by remembering where it sits on the site rather than by
 * hunting an alphabetical list of forty keys. */
export interface MiramarCopyField {
  key: MiramarCopyKey;
  label: string;
  multiline?: boolean;
}
export interface MiramarCopyGroup {
  title: string;
  hint?: string;
  fields: MiramarCopyField[];
}

export const MIRAMAR_COPY_GROUPS: MiramarCopyGroup[] = [
  {
    title: "The invitation",
    hint: "The plate itself — the scripture, the lines above the names, the button under them.",
    fields: [
      { key: "verse", label: "Scripture / opening quote", multiline: true },
      { key: "verseRef", label: "Reference under it (clear to hide)" },
      { key: "heroTogether", label: "Line above the names" },
      { key: "heroInvite", label: "Second line above the names" },
      { key: "heroCta", label: "Button under the date" },
    ],
  },
  {
    title: "Welcome",
    hint: "Shown to a guest opening their own invitation link.",
    fields: [
      { key: "welcomeGreeting", label: "Greeting (script)" },
      { key: "welcomeBody", label: "Welcome message", multiline: true },
    ],
  },
  {
    title: "Our story",
    fields: [
      { key: "storyEyebrow", label: "Small line above the heading" },
      { key: "storyTitle", label: "Heading" },
    ],
  },
  {
    title: "Families",
    fields: [
      { key: "familyEyebrow", label: "Small line above the heading" },
      { key: "familyTitle", label: "Heading" },
      { key: "familyGroomLabel", label: "Left column label" },
      { key: "familyBrideLabel", label: "Right column label" },
    ],
  },
  {
    title: "Countdown",
    fields: [
      { key: "countdownGreeting", label: "Line above the clock (script)" },
      { key: "countdownDays", label: "Days" },
      { key: "countdownHours", label: "Hours" },
      { key: "countdownMinutes", label: "Minutes" },
      { key: "countdownSeconds", label: "Seconds" },
    ],
  },
  {
    title: "Celebrations",
    fields: [
      { key: "eventsEyebrow", label: "Small line above the heading" },
      { key: "eventsTitle", label: "Heading" },
      { key: "eventsNote", label: "Note to guests under the heading", multiline: true },
      { key: "eventsHostedBy", label: "“Hosted by” label" },
      { key: "eventsVenueCta", label: "Venue link" },
      { key: "eventsCalendarCta", label: "Calendar link" },
    ],
  },
  {
    title: "Gallery",
    fields: [
      { key: "galleryEyebrow", label: "Small line above the heading" },
      { key: "galleryTitle", label: "Heading" },
    ],
  },
  {
    title: "Details",
    fields: [
      { key: "detailsEyebrow", label: "Small line above the heading" },
      { key: "detailsTitle", label: "Heading" },
      { key: "detailsContacts", label: "Label above the phone numbers" },
    ],
  },
  {
    title: "RSVP",
    fields: [
      { key: "rsvpGreeting", label: "Question (script)" },
      { key: "rsvpNote", label: "Line under it", multiline: true },
      { key: "rsvpAccept", label: "Accept button" },
      { key: "rsvpDecline", label: "Decline button" },
      { key: "rsvpHowMany", label: "“How many?” label" },
      { key: "rsvpYourName", label: "Name field label" },
      { key: "rsvpPartySize", label: "Party size field label" },
      { key: "rsvpWhichEvents", label: "Event picker label" },
      { key: "rsvpSend", label: "Send button" },
      { key: "rsvpSave", label: "Save button" },
      { key: "rsvpEdit", label: "Edit link" },
      { key: "rsvpNotAttending", label: "“Not attending” summary" },
      { key: "rsvpGuestsSuffix", label: "Guest count suffix" },
    ],
  },
  {
    title: "After they reply",
    fields: [
      { key: "thanksTitle", label: "Thank-you (script)" },
      { key: "thanksLine", label: "Line under it" },
      { key: "thanksNote", label: "Confirmation note" },
    ],
  },
  {
    title: "Navigation",
    hint: "Clear a link to drop it from the menu.",
    fields: [
      { key: "navStory", label: "Our story" },
      { key: "navFamily", label: "Families" },
      { key: "navEvents", label: "Celebrations" },
      { key: "navGallery", label: "Gallery" },
      { key: "navDetails", label: "Details" },
      { key: "navRsvp", label: "RSVP" },
      { key: "navMenu", label: "Menu button (phones)" },
      { key: "navClose", label: "Close button (phones)" },
    ],
  },
  {
    title: "Footer",
    fields: [
      { key: "footerVerse", label: "Closing quote", multiline: true },
      { key: "footerVerseRef", label: "Reference under it (clear to hide)" },
      { key: "footerCredit", label: "Last line" },
    ],
  },
];

export const MIRAMAR_COPY_KEYS = MIRAMAR_COPY_GROUPS.flatMap((g) =>
  g.fields.map((f) => f.key)
);
