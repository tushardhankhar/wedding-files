import type { Metadata } from "next";
import {
  Poppins,
  Raleway,
  Cormorant_Garamond,
  Noto_Sans_Devanagari,
  Tiro_Devanagari_Hindi,
  Playfair_Display,
  Marcellus,
  Great_Vibes,
  Rouge_Script,
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

// Elegant serif display for wedding themes. Loaded as the variable font so the
// whole 300–700 range is available from one file: a monumental heading set in
// 300 reads far more expensive than the same heading in 600, and small caps
// still want 600. Real italics too — the themes lean on italic serif for their
// pull quotes, and a synthesised oblique gives that away instantly.
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

// Roman inscriptional caps — the lettering of engraved stone and struck coins.
// Used by The Maharaja for every uppercase label, so its microtype reads as
// carved rather than as a sans-serif set very wide.
const marcellus = Marcellus({
  variable: "--font-marcellus",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

// Devanagari for Hindi content on guest sites.
const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-noto-deva",
  subsets: ["devanagari"],
  weight: ["400", "500", "600"],
  display: "swap",
});

// Serif Devanagari for Hindi *display* type on the luxury themes. Noto Sans
// stays for body copy; headlines get a face with contrast and stroke modulation
// so a Hindi headline carries the same weight as its English counterpart.
const tiroDevanagari = Tiro_Devanagari_Hindi({
  variable: "--font-tiro-deva",
  subsets: ["devanagari"],
  weight: ["400"],
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

// The Miramar's script. Great Vibes sets its capital A as a swash form with an
// ascender loop — beautiful in isolation, but on a page whose whole job is to
// print two names it reads as a lowercase "a", so "Angelus" came out "angelus".
//
// Rouge Script keeps the romantic weight Great Vibes had — the plate goes pale
// under a thin face, which is why Pinyon Script (tried first) was wrong — while
// drawing its capital A with a clear peaked stroke that cannot be misread.
// Wider per character than Great Vibes; see NAME_FIT in miramar-view, and
// measure in the browser before changing that constant.
const rougeScript = Rouge_Script({
  variable: "--font-rouge",
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
  description: "Make your own invitation for any Indian celebration — ₹299.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${raleway.variable} ${cormorant.variable} ${marcellus.variable} ${notoDevanagari.variable} ${tiroDevanagari.variable} ${playfair.variable} ${greatVibes.variable} ${rougeScript.variable} ${spaceGrotesk.variable} ${fredoka.variable} ${nunito.variable} ${dmSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
