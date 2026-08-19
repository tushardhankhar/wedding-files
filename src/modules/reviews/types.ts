/**
 * Source-agnostic review types.
 *
 * Deliberately NOT shaped like Google's API payload. Today the only provider is
 * the Places API, which caps out at five reviews and cannot paginate; the way
 * past that cap is the Google Business Profile API, which returns every review
 * under a completely different JSON shape (`starRating: "FIVE"`, `comment`,
 * `reviewer.profilePhotoUrl`, …). Normalising at the edge means that swap is one
 * new file in `server/` and nothing in the UI changes.
 */

export interface Review {
  /** Stable per review, used as the React key. */
  id: string;
  author: string;
  /** Google requires the reviewer's name and photo be shown as supplied. */
  authorPhotoUrl: string | null;
  /** Reviewer's Google Maps contributor page. */
  authorProfileUrl: string | null;
  /** 1–5. Google only ever emits whole stars. */
  rating: number;
  text: string;
  /** Pre-localised by Google ("2 months ago") — no date maths on our side. */
  relativeTime: string | null;
  /** Deep link to this review on Google. Part of the required attribution. */
  reviewUrl: string | null;
}

export interface ReviewsSnapshot {
  /** Aggregate score across all reviews, not just the ones we can show. */
  rating: number | null;
  /** Total review count on the profile — usually larger than `reviews.length`. */
  total: number;
  reviews: Review[];
  /** The business's Google Maps page, for "read all reviews on Google". */
  placeUrl: string | null;
  source: ReviewSource;
}

/**
 * `curated`: real reviews transcribed by hand into `curated-reviews.ts`. No API,
 * no billing, no five-review cap. The default.
 * `google-places`: one API key, max 5 reviews, no pagination.
 * `google-business-profile`: every review, but needs owner OAuth and Google's
 * approval of API access. Not implemented yet — see `server/index.ts`.
 */
export type ReviewSource =
  | "curated"
  | "google-places"
  | "google-business-profile";
