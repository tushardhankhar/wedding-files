import type { Metadata } from "next";
import { LandingNavbar } from "@/components/landing/navbar";
import { LandingHero } from "@/components/landing/hero";
import { GuestPersonalisationDemo } from "@/components/landing/guest-demo";
import { Marquee } from "@/components/landing/marquee";
// BrandStatement is available from this module — re-add it to the import and
// uncomment its <BrandStatement /> below to restore the section.
import { ThemeShowcase } from "@/components/landing/sections-story";
import { ProcessFlow } from "@/components/landing/process-flow";
import {
  PricingPreview,
  LandingFooter,
} from "@/components/landing/sections-product";
import { EnquirySection } from "@/components/landing/enquiry";
import { ConfidenceBand, FaqSection } from "@/components/landing/faq";
import { ReviewsSection } from "@/components/landing/reviews";
import { ReviewsBadge } from "@/components/landing/reviews-badge";
import { StickyCta } from "@/components/landing/sticky-cta";
import { GoToTop } from "@/modules/website/render/go-to-top";

const TITLE = "Join the Jashn — Personal invitation websites for every celebration · ₹499";
const DESCRIPTION =
  "Build your own bilingual invitation website for any celebration — weddings, birthdays, baby showers, housewarmings & more. Share one private WhatsApp link, and every family gets an invitation made just for them, showing only the events they're invited to. Introductory price, ₹499. No app, no guest accounts.";

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
        {/* Narrative: what it is (hero) → what you'll create (themes) → why
            it's different (per-family personalisation) → how it works
            (process) → supporting features → reassurance → the offer.
            Themes lead right after the hero since it's the first thing a
            visitor wants to see; the personalisation demo follows because
            it's the only claim on the page a JPEG invitation card can't
            match.
            (ExperiencePreview, CouplesSection, RealitySection, FinalCta and
            FeatureStory were removed as redundant; their components remain in
            the codebase.) */}
        {/* The badge is rendered here, not inside the hero: it needs the live
            Google rating from getReviews(), and the hero is a client component.
            Both call sites share one API request via the cache() wrapper. */}
        <LandingHero ratingBadge={<ReviewsBadge tone="dark" />} />
        <ThemeShowcase />
        <div className="border-y border-[color:var(--l-gold)]/20 bg-[color:var(--l-wine)] text-[color:var(--l-ivory)]">
          <Marquee
            items={[
              "Weddings",
              "Sangeet",
              "Birthdays",
              "Baby Showers",
              "Griha Pravesh",
              "Anniversaries",
              "Naming Days",
            ]}
          />
        </div>
        <GuestPersonalisationDemo />
        <ProcessFlow />
        {/* <BrandStatement /> — commented out per request */}
        {/* Objections before the number. A visitor who reaches the price still
            wondering whether it's a subscription, who builds the site, or what
            happens if it's rubbish doesn't ask — they leave. So the
            look-before-you-buy band and the FAQ land first, and the price
            arrives at someone who has run out of reasons to go. ("What happens
            next" is a strip inside the pricing section — it's only ever wanted
            with a thumb over the button.) */}
        <ConfidenceBand />
        <FaqSection />
        {/* Last thing before the number, and the only claim on this page we
            don't make ourselves. Renders nothing at all when there are no real
            Google reviews to show — see components/landing/reviews.tsx. */}
        <ReviewsSection />
        <PricingPreview />
        <EnquirySection />
        {/* PrivacySection was folded into the personalisation demo, which was
            already proving the same point interactively; PlannerSection moved
            to /for-planners. Both components still exist. */}
      </main>
      <LandingFooter />
      {/* Back-to-top — deep wine circle + gold arrow to match the landing. */}
      <GoToTop bg="#3b1022" ring="#c99a3d" />
      {/* Phone-only buy bar — the page is ~14 screens tall and everything
          between the hero and the pricing had no way to act on it. */}
      <StickyCta />
    </div>
  );
}
