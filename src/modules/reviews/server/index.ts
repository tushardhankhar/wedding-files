import "server-only";
import { cache } from "react";
import { serverEnv } from "@/lib/env.server";
import { fetchCuratedReviews } from "./curated";
import { fetchPlacesReviews } from "./google-places";
import type { ReviewsSnapshot, ReviewSource } from "../types";

/**
 * The one entry point the UI calls. Everything about *where* reviews come from
 * stops here.
 *
 * Three readers, in ascending order of what Google demands for them:
 *
 *   curated                  real reviews typed into `curated-reviews.ts`. No
 *                            API, no billing, no cap on how many. THE DEFAULT.
 *   google-places            live, self-updating, but needs a Cloud project, a
 *                            billing account (India: a refundable ₹1,000
 *                            deposit) and returns at most five reviews, ever.
 *   google-business-profile  every review, but the account has to own the
 *                            listing, complete an OAuth grant, and be approved
 *                            for API access by Google — which is an
 *                            application, not a checkbox. Not built.
 *
 * `curated` is the default because it is the only one that works with nothing
 * configured, and because five reviews behind a deposit is a worse deal than ten
 * reviews typed out by hand. Switch with REVIEWS_SOURCE when that changes.
 *
 * Every reader normalises to `ReviewsSnapshot`, so the UI cannot tell them apart
 * except by reading `snapshot.source` — which it does only to get the wording
 * right (a curated section must not claim to be a live Google feed).
 */

const PROVIDERS: Record<
  ReviewSource,
  (() => Promise<ReviewsSnapshot | null>) | null
> = {
  curated: fetchCuratedReviews,
  "google-places": fetchPlacesReviews,
  // Awaiting owner OAuth + Google's approval of Business Profile API access.
  // Implement as `./google-business-profile.ts` exporting the same signature and
  // normalising to `ReviewsSnapshot` — its wire shape is entirely different
  // (`starRating: "FIVE"`, `comment`, `reviewer.profilePhotoUrl`).
  "google-business-profile": null,
};

/**
 * Reviews for the landing page, or `null` when there is nothing to show.
 *
 * Wrapped in React's `cache()` because two places on the page need this now —
 * the hero's rating badge and the carousel itself — and `reviews` is the most
 * expensive field Google sells. One call per request, shared, whichever renders
 * first. (Next's fetch cache would very likely collapse them anyway, but
 * "likely" is not what you want standing between a marketing page and a metered
 * API.)
 *
 * Never throws. A missing API key, a Google outage, a revoked key and a listing
 * with no written reviews all resolve to `null`, and the caller renders no
 * section at all. A marketing page that 500s because a third party is having a
 * bad afternoon is a worse outcome than a page with one fewer band on it.
 */
export const getReviews = cache(async function getReviews(): Promise<ReviewsSnapshot | null> {
  const provider = PROVIDERS[serverEnv.REVIEWS_SOURCE];

  if (!provider) {
    console.warn(
      `[reviews] source "${serverEnv.REVIEWS_SOURCE}" is not implemented yet — skipping.`
    );
    return null;
  }

  try {
    const snapshot = await provider();
    // Unconfigured is the quiet, expected case: an empty curated array, or a
    // Places build with no credentials (local dev and previews run without).
    if (!snapshot) return null;
    // A profile can carry a star average with no written reviews behind it.
    // There is no carousel to build out of that.
    if (snapshot.reviews.length === 0) return null;
    return snapshot;
  } catch (error) {
    // Logged, not thrown — see the docstring. Surfaces in `vercel logs`.
    console.error("[reviews] fetch failed, hiding the section:", error);
    return null;
  }
});
