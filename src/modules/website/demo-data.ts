import type { WeddingEvent } from "@/modules/events/types";
import type { WebsiteConfig } from "./schema";

/**
 * Sample wedding fed to the PUBLIC theme demo (/demo/[themeId]). Entirely
 * fictional — no real wedding data is ever rendered publicly.
 */

export const DEMO_SITE_WEDDING = {
  title: "Aarav & Meera",
  partnerOneName: "Aarav",
  partnerTwoName: "Meera",
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
