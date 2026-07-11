import type { Metadata } from "next";
import {
  Poppins,
  Raleway,
  Cormorant_Garamond,
  Noto_Sans_Devanagari,
  Playfair_Display,
  Great_Vibes,
  Space_Grotesk,
  Fredoka,
  Nunito,
  DM_Serif_Display,
} from "next/font/google";
import "./globals.css";

// Self-hosted by next/font (no external fetch at runtime).
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

// Elegant serif display for wedding themes.
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});

// Devanagari for Hindi content on guest sites.
const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-noto-deva",
  subsets: ["devanagari"],
  weight: ["400", "500", "600"],
  display: "swap",
});

// Regal serif + elegant script for the luxury wedding themes.
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

// ── "Experience" themes (afterparty / confetti / little-miracle / shubh-aarambh) ──
// Nightclub-grade grotesque for The Afterparty. Variable → full weight range.
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

// Rounded, friendly display for The Confetti (children's birthday). Variable.
const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  display: "swap",
});

// Warm rounded body companion to Fredoka. Variable.
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
});

// High-contrast serif accent for The Little Miracle (baby shower). 400 only.
const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  // Absolute base so relative og:image / icon URLs resolve for link crawlers
  // (WhatsApp, iMessage). In production NEXT_PUBLIC_SITE_URL must be the live
  // origin — otherwise previews point at localhost and won't load.
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://jointhejashn.com"
  ),
  title: "Join the Jashn",
  description: "Make your own invitation for any Indian celebration — ₹1,599.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${raleway.variable} ${cormorant.variable} ${notoDevanagari.variable} ${playfair.variable} ${greatVibes.variable} ${spaceGrotesk.variable} ${fredoka.variable} ${nunito.variable} ${dmSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
