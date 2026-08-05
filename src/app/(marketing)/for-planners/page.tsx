import type { Metadata } from "next";
import { LandingNavbar } from "@/components/landing/navbar";
import {
  PlannerSection,
  LandingFooter,
} from "@/components/landing/sections-product";
import { GoToTop } from "@/modules/website/render/go-to-top";

/**
 * The planner pitch, moved off the landing page.
 *
 * It was 1,296px of a 16-screen mobile page, aimed at a different audience,
 * about a product marked "Coming soon", positioned after the enquiry form — so
 * every couple who came to buy an invitation paid the scroll cost of a
 * dashboard they will never use, at the point where they were closest to
 * converting. It's a good section; it was in the wrong place.
 *
 * It keeps its footer link, so planners who are looking for it still find it.
 */
export const metadata: Metadata = {
  title: "For event planners · Join the Jashn",
  description:
    "A guest operating system for Indian celebrations — every invitation, RSVP and headcount at a glance. In the works.",
};

export default function ForPlannersPage() {
  return (
    <div className="landing">
      <LandingNavbar />
      <main>
        <PlannerSection />
      </main>
      <LandingFooter />
      <GoToTop bg="#3b1022" ring="#c99a3d" />
    </div>
  );
}
