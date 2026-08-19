import { getReviews } from "@/modules/reviews/server";

/**
 * The rating pill that tells a visitor the reviews exist.
 *
 * The reviews section is ten-odd screens down a page most people never finish,
 * so on the old hero its only discovery route was scrolling past everything
 * else. This is the signpost: real stars, real count, and a tap that lands on
 * the section itself.
 *
 * It is a **server** component with no JavaScript of its own — the "carousel"
 * work is all in `reviews-carousel.tsx`, and there is no reason for a static
 * rating to cost the phone a hydration. It shares its data with the carousel
 * through the `cache()`-wrapped `getReviews`, so putting it on the page does not
 * buy a second Google API call.
 *
 * Renders nothing when there are no reviews — same rule as the section. A hero
 * that shows five hollow stars and "0 reviews" is worse than one that shows
 * nothing at all.
 */
export async function ReviewsBadge({
  /**
   * `dark` sits on the wine hero, `light` on ivory. Only the two tones exist
   * because those are the only two backgrounds on the page.
   */
  tone = "dark",
  className,
}: {
  tone?: "dark" | "light";
  className?: string;
}) {
  const snapshot = await getReviews();
  if (!snapshot || snapshot.rating === null) return null;

  const { rating, total } = snapshot;
  const label = `Rated ${rating.toFixed(1)} out of 5 from ${total} Google ${
    total === 1 ? "review" : "reviews"
  } — read them`;

  const skin =
    tone === "dark"
      ? "border-white/20 bg-white/10 text-[color:var(--l-ivory)] hover:border-[color:var(--l-gold-lite)] hover:bg-white/[0.16]"
      : "border-[color:var(--l-line)] bg-white text-[color:var(--l-wine)] hover:border-[color:var(--l-gold)]";

  return (
    <a
      href="#reviews"
      aria-label={label}
      // min-h-11 is the 44px minimum tap target, not decoration: at its natural
      // height this chip was ~32px, which is a miss-prone target on a phone and
      // this is a link people are meant to tap. It shrinks at sm+ where the
      // pointer is a mouse.
      className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-3.5 py-2 text-[12px] font-semibold transition-colors sm:min-h-9 ${skin} ${className ?? ""}`}
    >
      {/* aria-hidden throughout: the anchor's own aria-label already says the
          whole thing in one sentence, and a screen reader reading five
          identical star glyphs before it is pure noise. */}
      <span aria-hidden="true" className="flex items-center gap-0.5 text-[color:var(--l-saffron)]">
        {[1, 2, 3, 4, 5].map((n) => (
          <svg key={n} viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-current">
            <path d="M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.6 7.7l5.8-.8z" />
          </svg>
        ))}
      </span>
      <span aria-hidden="true">{rating.toFixed(1)}</span>
      <span aria-hidden="true" className="opacity-40">
        ·
      </span>
      {/* "on Google" rather than "Google reviews" — shorter, and it puts the
          verifiable bit last where the eye lands before the arrow. */}
      <span aria-hidden="true" className="font-medium opacity-80">
        {total} {total === 1 ? "review" : "reviews"} on Google
      </span>
      <span aria-hidden="true" className="opacity-60">
        →
      </span>
    </a>
  );
}
