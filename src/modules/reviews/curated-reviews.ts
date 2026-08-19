import type { Review } from "./types";

/**
 * ── THE FILE YOU EDIT ──────────────────────────────────────────────────────
 *
 * Real Google reviews, transcribed by hand. This is what the landing-page
 * carousel reads by default: no API key, no Google Cloud project, no billing
 * account, and none of the Places API's five-review ceiling.
 *
 * The one rule: **every review here must be one someone actually left.**
 *
 * Copy the words as written — don't polish the grammar, don't merge two reviews
 * into a better one, don't write the review you wish someone had left. The
 * carousel sits directly above the price on a page selling to families; an
 * invented review there isn't marketing, it's a lie to someone about to hand
 * over money, and it's the kind of lie that gets noticed when a visitor clicks
 * through to the Google listing and can't find it.
 *
 * Fixing a typo or trimming a rambling review with an ellipsis is fine.
 * Inventing a sentence is not.
 *
 * Leave the array empty and the whole section disappears from the page. That is
 * the correct state until there are real reviews to put in it.
 */

/**
 * The public Google Maps page for the business, so visitors can check the quotes
 * against the source. Requires no API and no billing.
 *
 * This is the canonical `?cid=` form rather than a `g.page/r/…` short link. The
 * share link Google offers is `https://g.page/r/CcL0fq--AtYIEAE/review`, which
 * opens the *write a review* dialog — right for asking a customer for one, wrong
 * for sending a visitor to read them. The id in that link decodes to the CID
 * below, which opens the listing itself.
 *
 * Set to `null` if there is no public listing; the "read them on Google" button
 * then doesn't render.
 */
export const CURATED_PLACE_URL: string | null =
  "https://www.google.com/maps?cid=636699415330878658";

/**
 * The headline numbers, read straight off the Google listing.
 *
 * Deliberately NOT computed from the reviews below. The average of five
 * hand-picked five-star reviews is 5.0, which would overstate a real 4.7 — so
 * these are the true figures from the profile and the array below is a sample of
 * it. `total` is the review count on the listing, not the number quoted here;
 * when it exceeds what's in the array, the section shows a "read all N on
 * Google" button.
 *
 * Update these when the listing moves. Set `rating` to `null` to hide the
 * star-average block entirely.
 */
export const CURATED_RATING: number | null = null;
export const CURATED_TOTAL = 0;

/**
 * The reviews themselves, in the order they should appear.
 *
 * Fields, per entry:
 *   id            any unique string — used as the React key
 *   author        the reviewer's name as it appears on Google
 *   rating        1–5, whole numbers
 *   text          their words
 *   relativeTime  when, in whatever form reads naturally: "2 months ago",
 *                 "March 2026", or null to show nothing
 *
 * `authorPhotoUrl` / `authorProfileUrl` / `reviewUrl` stay null: we have no
 * licence to re-host someone's Google profile photo, and there's no per-review
 * deep link without the API. Cards fall back to a monogram, which is why the
 * layout was built to survive a missing avatar.
 */
export const CURATED_REVIEWS: Review[] = [
  // Paste real reviews here. Template:
  //
  // {
  //   id: "priya-2026-03",
  //   author: "Priya Sharma",
  //   rating: 5,
  //   text: "Their exact words, copied from Google.",
  //   relativeTime: "March 2026",
  //   authorPhotoUrl: null,
  //   authorProfileUrl: null,
  //   reviewUrl: null,
  // },
];
