import type { Metadata } from "next";
import { LandingNavbar } from "@/components/landing/navbar";
import { LandingHero } from "@/components/landing/hero";
import { GuestPersonalisationDemo } from "@/components/landing/guest-demo";
import { Marquee } from "@/components/landing/marquee";
import {
  BrandStatement,
  ExperiencePreview,
  ThemeShowcase,
} from "@/components/landing/sections-story";
import { ProcessFlow } from "@/components/landing/process-flow";
import {
  FeatureStory,
  CouplesSection,
  PlannerSection,
  PrivacySection,
  RealitySection,
  PricingPreview,
  FinalCta,
  LandingFooter,
} from "@/components/landing/sections-product";
import { EnquirySection } from "@/components/landing/enquiry";

const TITLE = "Join the Jashn — Make your own Indian wedding invitation for ₹1,599";
const DESCRIPTION =
  "Design your own bilingual wedding website in minutes — add your names, events and photos yourself, then share one private link on WhatsApp. Every family sees only the events they're invited to, and RSVPs in seconds. One price, ₹1,599. No app, no guest accounts.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  // Brand logo shown when the landing link is shared (WhatsApp/iMessage/etc.).
  // Guest wedding links keep their own couple monogram via the per-wedding
  // opengraph-image route — this only applies to the marketing site "/".
  openGraph: {
    type: "website",
    siteName: "Join the Jashn",
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    images: [
      { url: "/og-jashn.jpg", width: 1080, height: 1080, alt: "Join the Jashn" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-jashn.jpg"],
  },
};

export default function LandingPage() {
  return (
    <div className="landing">
      <LandingNavbar />
      <main>
        <LandingHero />
        <BrandStatement />
        <div className="border-y border-[color:var(--l-gold)]/20 bg-[color:var(--l-wine)] text-[color:var(--l-ivory)]">
          <Marquee
            items={[
              "Haldi",
              "Mehendi",
              "Sangeet",
              "Cocktail",
              "The Wedding",
              "Reception",
              "Vidaai",
            ]}
          />
        </div>
        <GuestPersonalisationDemo />
        <ProcessFlow />
        <ExperiencePreview />
        <ThemeShowcase />
        <FeatureStory />
        <CouplesSection />
        <PlannerSection />
        <PrivacySection />
        <RealitySection />
        <PricingPreview />
        <EnquirySection />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  );
}
