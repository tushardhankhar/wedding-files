import type { Metadata } from "next";
import { LandingNavbar } from "@/components/landing/navbar";
import { LandingHero } from "@/components/landing/hero";
import { GuestPersonalisationDemo } from "@/components/landing/guest-demo";
import { Marquee } from "@/components/landing/marquee";
import {
  BrandStatement,
  HowItWorks,
  ExperiencePreview,
  ThemeShowcase,
} from "@/components/landing/sections-story";
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

export const metadata: Metadata = {
  title: "Join the Jashn — Make your own Indian wedding invitation for ₹1,599",
  description:
    "Design your own bilingual wedding website in minutes — add your names, events and photos yourself, then share one private link on WhatsApp. Every family sees only the events they're invited to, and RSVPs in seconds. One price, ₹1,599. No app, no guest accounts.",
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
        <HowItWorks />
        <ExperiencePreview />
        <ThemeShowcase />
        <FeatureStory />
        <CouplesSection />
        <PlannerSection />
        <PrivacySection />
        <RealitySection />
        <PricingPreview />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  );
}
