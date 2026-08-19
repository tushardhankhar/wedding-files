import "server-only";
import {
  CURATED_PLACE_URL,
  CURATED_RATING,
  CURATED_REVIEWS,
  CURATED_TOTAL,
} from "../curated-reviews";
import type { ReviewsSnapshot } from "../types";

/**
 * Hand-transcribed reviews → the same snapshot the Places reader produces.
 *
 * There is no network call and nothing to configure, which is the entire point:
 * Google's Cloud onboarding wants a project, a billing account and a refundable
 * ₹1,000 deposit before it will return a single review, and the Places API then
 * caps the result at five. Typing the real reviews into `curated-reviews.ts`
 * skips all of that and lifts the cap.
 *
 * What it gives up: the reviews don't update themselves, the rating has to be
 * kept in step with the listing by hand, and there are no per-review deep links
 * or reviewer photos. The section links to the public Google profile instead, so
 * a visitor can still check the quotes against the source.
 *
 * Reads as a `Promise` purely to match the provider signature in `index.ts` —
 * the two sources have to be interchangeable.
 */
export async function fetchCuratedReviews(): Promise<ReviewsSnapshot | null> {
  if (CURATED_REVIEWS.length === 0) return null;

  return {
    rating: CURATED_RATING,
    // The listing's real count, or the number quoted here if that's all there
    // is. Never less than what's on screen, which would make the "read all N"
    // button claim there are fewer reviews than the visitor can already see.
    total: Math.max(CURATED_TOTAL, CURATED_REVIEWS.length),
    reviews: CURATED_REVIEWS,
    placeUrl: CURATED_PLACE_URL,
    source: "curated",
  };
}
