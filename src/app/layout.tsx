import type { Metadata } from "next";
import {
  Poppins,
  Raleway,
  Cormorant_Garamond,
  Noto_Sans_Devanagari,
  Playfair_Display,
  Great_Vibes,
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

export const metadata: Metadata = {
  title: "Utsav — Wedding Celebrations",
  description: "Craft and manage beautiful Indian wedding websites.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${raleway.variable} ${cormorant.variable} ${notoDevanagari.variable} ${playfair.variable} ${greatVibes.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
