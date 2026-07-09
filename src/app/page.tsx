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
  title: "Join the Utsav — The digital guest experience for Indian weddings",
  description:
    "Create a beautiful, private wedding experience where every family sees only the events they're invited to — and RSVPs in seconds. No app. No guest accounts. Just one beautiful invitation link.",
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
