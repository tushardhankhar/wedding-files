import { getReviews } from "@/modules/reviews/server";
import { ReviewsCarousel, Stars } from "./reviews-carousel";

/**
 * Real Google reviews, on the way to the price.
 *
 * Placed immediately before the pricing section, after the FAQ. The page already
 * answers objections before showing a number (see the comments in
 * `app/(marketing)/page.tsx`); this is the last thing a visitor reads before the
 * button, and it is the only claim on the page not made by us.
 *
 * Renders **nothing** when there are no reviews to show — no key configured, no
 * written reviews on the profile, Google having a bad afternoon. There is
 * deliberately no placeholder copy and no sample testimonial: an invented review
 * on a page selling to families is not a design decision, it is a lie, and an
 * empty band is better than a fake one.
 *
 * Two modes, and the wording changes between them. With the live Places feed,
 * everything visible is a required part of Google's attribution: the reviewer's
 * name and photo as supplied, a link to each review, and a route through to the
 * profile. With hand-transcribed reviews (`curated`) there are no photos and no
 * per-review links, so the section drops the "Reviews from Google" framing and
 * offers the listing instead — see the `live` flag below.
 */
export async function ReviewsSection() {
  const snapshot = await getReviews();
  if (!snapshot) return null;

  const { rating, total, reviews, placeUrl, source } = snapshot;

  /**
   * A curated section is quotes we typed out; a Places section is a live feed
   * Google served this morning. Only the second one gets to say so.
   *
   * The distinction is small on screen and large in substance: "Reviews from
   * Google" over hand-copied text implies a verification that isn't happening.
   * The curated wording claims only what is true, and the button underneath
   * sends anyone who wants proof to the listing itself.
   */
  const live = source !== "curated";
  // Not "What families say" — the heading below already says that, and an
  // eyebrow that repeats the h2 reads like a template someone forgot to fill in.
  const eyebrow = live ? "Reviews from Google" : "In their words";

  return (
    <section
      id="reviews"
      className="bg-[color:var(--l-ivory-2)] px-5 py-20 sm:px-8 sm:py-24"
      aria-labelledby="reviews-heading"
    >
      <div className="mx-auto max-w-5xl">
        <header className="text-center" data-reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--l-gold)]">
            {eyebrow}
          </p>
          <h2
            id="reviews-heading"
            className="l-display mt-3 text-balance text-[clamp(1.7rem,4.4vw,2.6rem)] font-semibold leading-tight text-[color:var(--l-wine)]"
          >
            What families say after their invitations go out
          </h2>

          {/* The aggregate covers every review on the profile, not only the
              handful the API will hand over — so it is the honest headline
              number and the count says where it comes from. */}
          {rating !== null && (
            <div className="mt-5 flex flex-col items-center gap-2">
              <div className="flex items-center gap-3">
                <span className="l-display text-3xl font-semibold text-[color:var(--l-wine)]">
                  {rating.toFixed(1)}
                </span>
                <Stars
                  rating={rating}
                  label={`Rated ${rating.toFixed(1)} out of 5 on Google`}
                />
              </div>
              <p className="text-sm text-[color:var(--l-ink-soft)]">
                {total === 1
                  ? "Based on 1 Google review"
                  : `Based on ${total} Google reviews`}
              </p>
            </div>
          )}
        </header>

        <div className="mt-12" data-reveal>
          <ReviewsCarousel reviews={reviews} />
        </div>

        {/* Always shown when there's a listing to point at — not only when more
            reviews exist there. On a curated section this button is the only
            thing standing between "quotes on a website" and something a visitor
            can actually check, so it earns its place even at parity. */}
        {placeUrl && (
          <p className="mt-8 text-center">
            <a
              href={placeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--l-wine)]/20 bg-white px-6 py-3 text-sm font-semibold text-[color:var(--l-wine)] transition hover:border-[color:var(--l-gold)] hover:text-[color:var(--l-gold)]"
            >
              {total > reviews.length
                ? `Read all ${total} reviews on Google`
                : "Read them on Google"}
              <span aria-hidden="true">→</span>
            </a>
          </p>
        )}
      </div>
    </section>
  );
}
