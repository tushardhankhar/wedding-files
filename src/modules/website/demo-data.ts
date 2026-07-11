import type { WeddingEvent } from "@/modules/events/types";
import type { WebsiteConfig } from "./schema";
import type { SiteWedding } from "./render/build";

/**
 * Sample wedding fed to the PUBLIC theme demo (/demo/[themeId]). Entirely
 * fictional — no real wedding data is ever rendered publicly.
 */

export const DEMO_SITE_WEDDING = {
  title: "Aarav & Meera",
  name1: "Aarav",
  name2: "Meera",
  eventDate: "2026-12-12",
};

const stamp = { createdAt: "", updatedAt: "" };

export const DEMO_SITE_EVENTS: WeddingEvent[] = [
  {
    id: "demo-haldi",
    weddingId: "demo",
    name: "Haldi",
    nameHi: "हल्दी",
    eventDate: "2026-12-10",
    startTime: "10:00",
    venueName: "The Garden Lawns",
    venueAddress: "Jai Mahal Palace, Jaipur",
    mapsUrl: "https://maps.google.com/?q=Jai+Mahal+Palace+Jaipur",
    description: "Dress code: bright yellows & marigold tones.",
    descriptionHi: "परिधान: चटख पीले और गेंदे के रंग।",
    sortOrder: 0,
    ...stamp,
  },
  {
    id: "demo-mehendi",
    weddingId: "demo",
    name: "Mehendi",
    nameHi: "मेहंदी",
    eventDate: "2026-12-10",
    startTime: "16:00",
    venueName: "The Courtyard",
    venueAddress: "Jai Mahal Palace, Jaipur",
    mapsUrl: "https://maps.google.com/?q=Jai+Mahal+Palace+Jaipur",
    description: "An afternoon of henna, folk songs and chaat counters.",
    descriptionHi: "मेहंदी, लोकगीत और चाट की एक शाम।",
    sortOrder: 1,
    ...stamp,
  },
  {
    id: "demo-sangeet",
    weddingId: "demo",
    name: "Sangeet",
    nameHi: "संगीत",
    eventDate: "2026-12-11",
    startTime: "19:00",
    venueName: "The Leela Palace Ballroom",
    venueAddress: "The Leela Palace, Jaipur",
    mapsUrl: "https://maps.google.com/?q=The+Leela+Palace+Jaipur",
    description: "Dress code: Indian cocktail. Bring your best moves.",
    descriptionHi: "परिधान: इंडियन कॉकटेल। अपने बेहतरीन ठुमके लाइए।",
    sortOrder: 2,
    ...stamp,
  },
  {
    id: "demo-wedding",
    weddingId: "demo",
    name: "The Wedding",
    nameHi: "विवाह",
    eventDate: "2026-12-12",
    startTime: "18:30",
    venueName: "The Grand Courtyard",
    venueAddress: "Amber Fort Road, Jaipur",
    mapsUrl: "https://maps.google.com/?q=Amber+Fort+Jaipur",
    description: "Baraat at sunset, pheras under the stars.",
    descriptionHi: "सूर्यास्त पर बारात, सितारों तले फेरे।",
    sortOrder: 3,
    ...stamp,
  },
  {
    id: "demo-reception",
    weddingId: "demo",
    name: "Reception",
    nameHi: "स्वागत समारोह",
    eventDate: "2026-12-13",
    startTime: "20:00",
    venueName: "The Imperial Ballroom",
    venueAddress: "MI Road, Jaipur",
    mapsUrl: "https://maps.google.com/?q=MI+Road+Jaipur",
    description: "Dinner, toasts and one last dance.",
    descriptionHi: "भोज, शुभकामनाएँ और एक आख़िरी नृत्य।",
    sortOrder: 4,
    ...stamp,
  },
];

export const DEMO_SITE_CONFIG: WebsiteConfig = {
  story: {
    milestones: [
      {
        when: "2019",
        title: { en: "A chance meeting", hi: "एक अनोखी मुलाक़ात" },
        text: {
          en: "A crowded chai stall in Bangalore, one shared umbrella, and a conversation that didn't end.",
          hi: "बेंगलुरु की एक चाय की टपरी, एक छतरी और एक बातचीत जो कभी ख़त्म ही नहीं हुई।",
        },
      },
      {
        when: "2023",
        title: { en: "The proposal", hi: "प्रस्ताव" },
        text: {
          en: "On a rooftop in Udaipur, under fairy lights and a full moon.",
          hi: "उदयपुर की एक छत पर, रोशनी और पूरे चाँद के नीचे।",
        },
      },
      {
        when: "2026",
        title: { en: "Forever begins", hi: "हमेशा की शुरुआत" },
        text: {
          en: "And now, we'd love for you to celebrate with us.",
          hi: "और अब, हम चाहते हैं कि आप हमारे साथ जश्न मनाएँ।",
        },
      },
    ],
  },
  family: {
    groups: [
      {
        name: { en: "The Kapoors", hi: "कपूर परिवार" },
        members: { en: "Mr. & Mrs. Kapoor" },
        relation: { en: "Parents of the bride", hi: "वधू के माता-पिता" },
      },
      {
        name: { en: "The Mehtas", hi: "मेहता परिवार" },
        members: { en: "Mr. & Mrs. Mehta" },
        relation: { en: "Parents of the groom", hi: "वर के माता-पिता" },
      },
    ],
  },
  faq: {
    items: [
      {
        q: { en: "What should I wear?", hi: "क्या पहनें?" },
        a: {
          en: "Each event lists its dress code above. When in doubt, Indian festive is always perfect.",
          hi: "हर आयोजन का परिधान ऊपर दिया गया है। संशय हो तो भारतीय पारंपरिक परिधान सर्वोत्तम है।",
        },
      },
      {
        q: { en: "Where should I stay?", hi: "कहाँ ठहरें?" },
        a: {
          en: "We've blocked rooms at Jai Mahal Palace at a special rate — mention \"Aarav & Meera\" when booking.",
          hi: "जय महल पैलेस में विशेष दर पर कमरे आरक्षित हैं — बुकिंग के समय \"आरव और मीरा\" बताएँ।",
        },
      },
      {
        q: { en: "Can I bring my kids?", hi: "क्या बच्चों को ला सकते हैं?" },
        a: {
          en: "Absolutely — your whole family is invited. Please include them in your RSVP.",
          hi: "बिल्कुल — आपका पूरा परिवार आमंत्रित है। कृपया उन्हें अपने उत्तर में शामिल करें।",
        },
      },
    ],
  },
  footer: {
    hashtag: "AaravKiMeera",
    contacts: [
      { name: "Rohan", phone: "+91 98xxx xxxxx" },
      { name: "Riya", phone: "+91 97xxx xxxxx" },
    ],
  },
};

/* ────────────────────────────────────────────────────────────────────────────
 * "Experience" theme demos — each non-wedding theme gets its own fictional
 * sample (host, date, timeline, and theme-specific interactive content). The
 * bespoke renderers read config.experience.<theme>; the wedding-level fields
 * (names, dateLabel, events) still power the shared shell / countdown.
 * ──────────────────────────────────────────────────────────────────────────── */

interface DemoDataset {
  wedding: SiteWedding;
  events: WeddingEvent[];
}

const ev = (
  id: string,
  name: string,
  startTime: string | null,
  extra: Partial<WeddingEvent> = {}
): WeddingEvent => ({
  id,
  weddingId: "demo",
  name,
  nameHi: null,
  eventDate: extra.eventDate ?? null,
  startTime,
  venueName: null,
  venueAddress: null,
  mapsUrl: null,
  description: null,
  descriptionHi: null,
  sortOrder: 0,
  ...stamp,
  ...extra,
});

// 7 · The Afterparty
const AFTERPARTY: DemoDataset = {
  wedding: {
    title: "Rohan's Last Night of Freedom",
    name1: "Rohan",
    name2: null,
    eventDate: "2026-08-15",
    config: {
      experience: {
        afterparty: {
          eventTitle: { en: "ROHAN'S LAST NIGHT OF FREEDOM" },
          guestLabel: "THE CREW",
          passTier: "VIP ACCESS",
          location: {
            venue: "KITTY SU",
            city: "MUMBAI",
            mapsUrl: "https://maps.google.com/?q=Kitty+Su+Mumbai",
          },
          partyRule: {
            en: "WHAT HAPPENS AT THE PARTY, STAYS AT THE PARTY.",
          },
        },
      },
      footer: { hashtag: "RohanUnfiltered" },
    } as Record<string, unknown>,
  },
  events: [
    ev("ap-1", "Pre Drinks", "20:00", { eventDate: "2026-08-15" }),
    ev("ap-2", "Dinner", "22:00", { eventDate: "2026-08-15" }),
    ev("ap-3", "The Chaos Begins", "23:30", { eventDate: "2026-08-15" }),
    ev("ap-4", "What Happens Here Stays Here", null, {
      eventDate: "2026-08-16",
    }),
  ],
};

// 8 · The Confetti
const CONFETTI: DemoDataset = {
  wedding: {
    title: "Aarav is turning 6",
    name1: "Aarav",
    name2: null,
    eventDate: "2026-08-02",
    config: {
      experience: {
        confetti: {
          childName: "Aarav",
          age: 6,
          surprise: { en: "A little surprise is waiting for you", hi: "एक छोटा सा सरप्राइज़ आपका इंतज़ार कर रहा है" },
          secretStar: { en: "You found a secret star!" },
          cards: [
            { icon: "🎂", label: { en: "Birthday" }, value: { en: "Aarav turns 6" } },
            { icon: "📍", label: { en: "Venue" }, value: { en: "FunCity, Bandra" } },
            { icon: "🕐", label: { en: "Time" }, value: { en: "4:00 PM onwards" } },
            { icon: "🎈", label: { en: "Theme" }, value: { en: "Space Explorers" } },
          ],
        },
      },
    } as Record<string, unknown>,
  },
  events: [ev("cf-1", "The Party", "16:00", { eventDate: "2026-08-02", venueName: "FunCity", venueAddress: "Bandra, Mumbai" })],
};

// 9 · The Little Miracle
const LITTLE_MIRACLE: DemoDataset = {
  wedding: {
    title: "Aisha & Kabir",
    name1: "Aisha",
    name2: "Kabir",
    eventDate: "2026-09-20",
    config: {
      experience: {
        littleMiracle: {
          parents: "Aisha & Kabir",
          title: { en: "A little miracle is on the way" },
          wishPrompt: { en: "Make a wish for the little one" },
          genderReveal: {
            enabled: true,
            reveal: { en: "The surprise continues 🤍" },
            accent: "#C5A46D",
          },
        },
      },
    } as Record<string, unknown>,
  },
  events: [
    ev("lm-1", "Godh Bharai", "11:00", {
      eventDate: "2026-09-20",
      venueName: "Home",
      venueAddress: "Koregaon Park, Pune",
    }),
    ev("lm-2", "Lunch & Blessings", "13:00", { eventDate: "2026-09-20" }),
  ],
};

// 10 · The Shubh Aarambh
const SHUBH_AARAMBH: DemoDataset = {
  wedding: {
    title: "The Sharma Family",
    name1: null,
    name2: null,
    eventDate: "2026-08-30",
    config: {
      experience: {
        shubhAarambh: {
          familyName: { en: "The Sharma Family", hi: "शर्मा परिवार" },
          title: { en: "Griha Pravesh", hi: "गृह प्रवेश" },
          blessing: {
            en: "Welcome to our new home",
            hi: "नए घर में आपका स्वागत है",
          },
          rangoliColors: ["#D99A2B", "#B55233", "#174C4F", "#C2185B", "#2E7D32", "#7C3AED"],
        },
      },
      footer: { hashtag: "SharmaGrihaPravesh" },
    } as Record<string, unknown>,
  },
  events: [
    ev("sa-1", "Ganesh Puja", "09:00", { eventDate: "2026-08-30", nameHi: "गणेश पूजा" }),
    ev("sa-2", "Griha Pravesh", "10:30", { eventDate: "2026-08-30", nameHi: "गृह प्रवेश" }),
    ev("sa-3", "Satyanarayan Katha", "12:00", { eventDate: "2026-08-30", nameHi: "सत्यनारायण कथा" }),
    ev("sa-4", "Prasad & Lunch", "13:30", {
      eventDate: "2026-08-30",
      nameHi: "प्रसाद और भोजन",
      venueName: "12 Sunrise Villa",
      venueAddress: "Whitefield, Bengaluru",
      mapsUrl: "https://maps.google.com/?q=Whitefield+Bengaluru",
    }),
  ],
};

const EXPERIENCE_DEMOS: Record<string, DemoDataset> = {
  afterparty: AFTERPARTY,
  confetti: CONFETTI,
  "little-miracle": LITTLE_MIRACLE,
  "shubh-aarambh": SHUBH_AARAMBH,
};

/** Sample wedding/experience data for a demo theme. Falls back to the wedding
 * sample for the six wedding themes. */
export function getDemoData(themeId: string): DemoDataset {
  return (
    EXPERIENCE_DEMOS[themeId] ?? {
      wedding: {
        ...DEMO_SITE_WEDDING,
        name1: DEMO_SITE_WEDDING.name1,
        name2: DEMO_SITE_WEDDING.name2,
        config: DEMO_SITE_CONFIG as Record<string, unknown>,
      },
      events: DEMO_SITE_EVENTS,
    }
  );
}
