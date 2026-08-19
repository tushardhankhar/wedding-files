import "server-only";
import { serverEnv } from "@/lib/env.server";
import type { Review, ReviewsSnapshot } from "../types";

/**
 * Google Places API (New) → normalised review snapshot.
 *
 * Two hard limits worth knowing before anyone tries to "fix" this file:
 *
 * 1. **Five reviews, maximum.** The `reviews` field returns Google's "most
 *    relevant" handful and there is no page token, no offset and no sort
 *    parameter. Asking for more is not a matter of the right request — the only
 *    route to the full set is the Business Profile API (owner OAuth).
 * 2. **Reviews are a billed field.** Asking for `reviews` puts the whole request
 *    in Place Details **Enterprise + Atmosphere** — the dearest SKU, ~$20-25 per
 *    1,000 with only 1,000 free requests a month (Google retired the blanket
 *    $200 credit in March 2025). Hence the day-long cache below, and the landing
 *    page prerendering on top of it: about 30 requests a month, whatever the
 *    traffic, which sits inside the free allowance.
 *
 *    That allowance is the reason REVALIDATE_SECONDS is not a knob to turn
 *    casually. Serving this uncached would bill per visitor, and a good day would
 *    clear 1,000 requests before lunch.
 *
 * Google's Places policy also forbids storing this content beyond a short
 * window, which is the other reason it is fetched-and-cached rather than
 * committed into `components/landing/data.ts` as static copy. A day-long cache
 * is comfortably inside that; a hardcoded array would not be.
 */

const PLACES_ENDPOINT = "https://places.googleapis.com/v1/places";

/**
 * Only the fields we render. The field mask is mandatory on this API and it is
 * also the billing lever — every extra field can move the request into a more
 * expensive SKU, so this list stays exactly as short as the UI needs.
 */
const FIELD_MASK = [
  "id",
  "rating",
  "userRatingCount",
  "googleMapsUri",
  "reviews",
].join(",");

/** One day. Long enough to keep the bill trivial, short enough to stay honest. */
const REVALIDATE_SECONDS = 86_400;

/** Google can be slow; the landing page's build must not hang on it. */
const TIMEOUT_MS = 6_000;

/* ── Google's wire shape (only the parts we read) ──────────────────────────── */

interface GoogleLocalizedText {
  text?: string;
}

interface GoogleAuthorAttribution {
  displayName?: string;
  uri?: string;
  photoUri?: string;
}

interface GoogleReview {
  name?: string;
  rating?: number;
  text?: GoogleLocalizedText;
  originalText?: GoogleLocalizedText;
  relativePublishTimeDescription?: string;
  authorAttribution?: GoogleAuthorAttribution;
  googleMapsUri?: string;
}

interface GooglePlaceDetails {
  id?: string;
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: GoogleReview[];
}

/* ── Normalisation ────────────────────────────────────────────────────────── */

function toReview(raw: GoogleReview, index: number): Review | null {
  // `text` is Google's translation into languageCode, `originalText` is what the
  // reviewer actually typed. Prefer the translation, fall back to the original.
  const text = (raw.text?.text ?? raw.originalText?.text ?? "").trim();
  const author = (raw.authorAttribution?.displayName ?? "").trim();

  // A review with no words is a bare star rating — nothing to put on a card.
  // Dropping it here keeps the carousel from rendering an empty quote.
  if (!text) return null;

  return {
    // `name` is the full resource path ("places/X/reviews/Y") and is unique.
    // The index is only a fallback for a payload missing it.
    id: raw.name ?? `review-${index}`,
    author: author || "A Google user",
    authorPhotoUrl: raw.authorAttribution?.photoUri ?? null,
    authorProfileUrl: raw.authorAttribution?.uri ?? null,
    rating: typeof raw.rating === "number" ? raw.rating : 0,
    text,
    relativeTime: raw.relativePublishTimeDescription ?? null,
    reviewUrl: raw.googleMapsUri ?? null,
  };
}

/**
 * Fetches the configured place. Returns `null` when unconfigured — the caller
 * treats that as "no reviews section", not as an error.
 *
 * Throws on an API failure so the caller can log it and still render the page.
 */
export async function fetchPlacesReviews(): Promise<ReviewsSnapshot | null> {
  const apiKey = serverEnv.GOOGLE_PLACES_API_KEY;
  const placeId = serverEnv.GOOGLE_PLACE_ID;
  if (!apiKey || !placeId) return null;

  const url = `${PLACES_ENDPOINT}/${encodeURIComponent(placeId)}?languageCode=en`;

  const res = await fetch(url, {
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    // Cached by Next for a day and tagged so a future admin action can call
    // `revalidateTag("google-reviews")` to pull a new review in immediately.
    next: { revalidate: REVALIDATE_SECONDS, tags: ["google-reviews"] },
  });

  if (!res.ok) {
    // Google puts the useful part (bad key, wrong place id, API not enabled) in
    // the body, so it goes into the message rather than just the status.
    const body = await res.text().catch(() => "");
    throw new Error(
      `Places API ${res.status}: ${body.slice(0, 300) || res.statusText}`
    );
  }

  const data = (await res.json()) as GooglePlaceDetails;

  return {
    rating: typeof data.rating === "number" ? data.rating : null,
    total: typeof data.userRatingCount === "number" ? data.userRatingCount : 0,
    reviews: (data.reviews ?? [])
      .map(toReview)
      .filter((r): r is Review => r !== null),
    placeUrl: data.googleMapsUri ?? null,
    source: "google-places",
  };
}
