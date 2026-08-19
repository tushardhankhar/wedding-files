import { notFound } from "next/navigation";
import { ReviewsCarousel, Stars } from "@/components/landing/reviews-carousel";
import type { Review } from "@/modules/reviews/types";

/**
 * DEV-ONLY design stage for the Google-reviews carousel.
 *
 * It exists because the live section is only ever as good as whatever Google
 * hands back that day, and it renders nothing at all without an API key — so
 * there would otherwise be no way to work on the layout, check a five-line
 * review against a fifty-word one, or see what a missing avatar does.
 *
 * The fixtures below are deliberately, visibly fake ("Fixture One", lorem-ish
 * text) so that nothing here can ever be mistaken for a real testimonial or get
 * lifted onto the marketing page. Returns 404 outside development.
 */
export const dynamic = "force-dynamic";

const FIXTURES: Review[] = [
  {
    id: "fixture-1",
    author: "Fixture One",
    authorPhotoUrl: null,
    authorProfileUrl: null,
    rating: 5,
    text: "Short one. Two lines at most, to check the card floor.",
    relativeTime: "2 weeks ago",
    reviewUrl: "https://example.com/review-1",
  },
  {
    id: "fixture-2",
    author: "Fixture Two With A Very Long Name Indeed",
    authorPhotoUrl: null,
    authorProfileUrl: null,
    rating: 4,
    text:
      "A middling-length review that runs to roughly the length most people " +
      "actually write, which is three or four lines on a phone and two on a " +
      "desktop. This is the case the card should look best in.",
    relativeTime: "a month ago",
    reviewUrl: "https://example.com/review-2",
  },
  {
    id: "fixture-3",
    author: "Fixture Three",
    authorPhotoUrl: null,
    authorProfileUrl: null,
    rating: 5,
    // Overflow case — must clamp at 8 lines without changing the card height.
    text:
      "The long one, to prove the clamp holds. ".repeat(14) +
      "And this last sentence should never be visible on the card.",
    relativeTime: "3 months ago",
    reviewUrl: "https://example.com/review-3",
  },
  {
    id: "fixture-4",
    author: "Fixture Four",
    authorPhotoUrl: null,
    authorProfileUrl: null,
    rating: 3,
    text: "A three-star review, to check the empty stars read as empty.",
    relativeTime: "5 months ago",
    reviewUrl: null,
  },
  {
    id: "fixture-5",
    author: "Fixture Five",
    authorPhotoUrl: null,
    authorProfileUrl: null,
    rating: 5,
    text:
      "The fifth and last, because the Places API will never return a sixth. " +
      "If this card is centred and the dots show five, the rail is correct.",
    relativeTime: "a year ago",
    reviewUrl: "https://example.com/review-5",
  },
];

export default async function ReviewsDevPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="landing">
      <section className="bg-[color:var(--l-ivory-2)] px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <header className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--l-gold)]">
              Reviews from Google
            </p>
            <h2 className="l-display mt-3 text-balance text-[clamp(1.7rem,4.4vw,2.6rem)] font-semibold leading-tight text-[color:var(--l-wine)]">
              What families say after their invitations go out
            </h2>
            <div className="mt-5 flex flex-col items-center gap-2">
              <div className="flex items-center gap-3">
                <span className="l-display text-3xl font-semibold text-[color:var(--l-wine)]">
                  4.8
                </span>
                <Stars rating={4.8} label="Rated 4.8 out of 5 on Google" />
              </div>
              <p className="text-sm text-[color:var(--l-ink-soft)]">
                Based on 24 Google reviews — FIXTURE DATA
              </p>
            </div>
          </header>

          <div className="mt-12">
            <ReviewsCarousel reviews={FIXTURES} />
          </div>
        </div>
      </section>
    </div>
  );
}
