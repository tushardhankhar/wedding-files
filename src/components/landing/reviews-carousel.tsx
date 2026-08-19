"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Review } from "@/modules/reviews/types";

/**
 * The moving part of the reviews band.
 *
 * Built as a real scroll container with CSS scroll-snap rather than a
 * transform-driven slider, for the same reason the theme gallery is (see
 * `.l-gallery` in globals.css): on the mid-range Android phones most of this
 * traffic arrives on, native horizontal scrolling already has momentum,
 * rubber-banding and a working scrollbar, and it keeps working while the bundle
 * is still parsing. The arrows, dots and auto-advance are enhancements layered
 * on top of something that swipes fine without them.
 *
 * Consequence worth knowing: the active index is *derived from scroll position*,
 * never the other way round. Nothing here stores "current slide" as the source
 * of truth, so a thumb-swipe and an arrow-click cannot disagree.
 */

const AUTOPLAY_MS = 6_000;

export function ReviewsCarousel({ reviews }: { reviews: Review[] }) {
  const railRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  /**
   * Auto-advance is suspended while a visitor is reading — hover, focus, or
   * touch. Someone halfway through a review being yanked to the next one is
   * worse than no motion at all.
   */
  const [engaged, setEngaged] = useState(false);

  /* ── Scroll position → active index ─────────────────────────────────────── */
  // Measures the children rather than assuming a fixed card width, so the card
  // sizing can change at any breakpoint without this maths going stale.
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const centre = rail.scrollLeft + rail.clientWidth / 2;
        const cards = Array.from(rail.children) as HTMLElement[];
        let nearest = 0;
        let best = Infinity;
        cards.forEach((card, i) => {
          const distance = Math.abs(
            card.offsetLeft + card.offsetWidth / 2 - centre
          );
          if (distance < best) {
            best = distance;
            nearest = i;
          }
        });
        setActive(nearest);
      });
    };

    rail.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      rail.removeEventListener("scroll", onScroll);
    };
  }, []);

  /* ── Imperative navigation ──────────────────────────────────────────────── */
  const goTo = useCallback((index: number) => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.children[index] as HTMLElement | undefined;
    if (!card) return;

    // Centre the target card. Scrolling the rail (not the page) — hence
    // scrollTo on the container rather than card.scrollIntoView, which would
    // also drag the whole document sideways on some browsers.
    const left =
      card.offsetLeft - (rail.clientWidth - card.offsetWidth) / 2;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    rail.scrollTo({ left, behavior: reduced ? "auto" : "smooth" });
  }, []);

  const step = useCallback(
    (delta: number) => {
      // Wraps, so the arrows never dead-end and autoplay can loop forever.
      const next = (active + delta + reviews.length) % reviews.length;
      goTo(next);
    },
    [active, goTo, reviews.length]
  );

  /* ── Auto-advance ───────────────────────────────────────────────────────── */
  useEffect(() => {
    if (engaged || reviews.length < 2) return;
    // Honour the OS setting: no unattended motion for anyone who asked for none.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = setInterval(() => {
      // A background tab still fires intervals but paints nothing, so the
      // carousel would silently race ahead and be somewhere unexpected on
      // return. Skip those ticks.
      if (document.hidden) return;
      step(1);
    }, AUTOPLAY_MS);

    return () => clearInterval(timer);
  }, [engaged, step, reviews.length]);

  const many = reviews.length > 1;

  return (
    <div
      className="relative"
      onPointerEnter={() => setEngaged(true)}
      onPointerLeave={() => setEngaged(false)}
      onFocusCapture={() => setEngaged(true)}
      onBlurCapture={() => setEngaged(false)}
      onTouchStart={() => setEngaged(true)}
    >
      <div
        ref={railRef}
        className="l-rev-rail"
        role="group"
        aria-label="Customer reviews from Google"
        // Keyboard users get the rail itself as a scrollable region; arrow keys
        // scroll it natively once focused.
        tabIndex={0}
      >
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {many && (
        <>
          {/* Arrows sit outside the rail on desktop and are hidden on phones,
              where swiping is the obvious gesture and the dots show position. */}
          <ArrowButton direction="prev" onClick={() => step(-1)} />
          <ArrowButton direction="next" onClick={() => step(1)} />

          <div className="mt-6 flex items-center justify-center gap-2.5">
            {reviews.map((review, i) => (
              <button
                key={review.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Show review ${i + 1} of ${reviews.length}`}
                aria-current={i === active}
                className={`h-2 rounded-full transition-all ${
                  i === active
                    ? "w-6 bg-[color:var(--l-gold)]"
                    : "w-2 bg-[color:var(--l-gold)]/30 hover:bg-[color:var(--l-gold)]/60"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Card ─────────────────────────────────────────────────────────────────── */

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="l-rev-card">
      <Stars rating={review.rating} />

      {/* Clamped rather than truncated in the data: the full text lives one tap
          away on Google, and a fixed clamp caps how tall the tallest card can
          push the whole rail. Six lines fits the long-but-normal review; the
          rare essay gets cut and its "on Google" link earns its place. */}
      <blockquote className="mt-4 line-clamp-6 text-[15px] leading-relaxed text-[color:var(--l-ink-soft)]">
        {review.text}
      </blockquote>

      <footer className="mt-5 flex items-center gap-3 border-t border-[color:var(--l-line)] pt-4">
        {/* Google's Places policy requires the reviewer's name and photo be
            shown as supplied, so this is a plain <img> pointed straight at
            their CDN — not proxied, not re-hosted, not run through
            next/image. */}
        {review.authorPhotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- Google requires the reviewer photo be shown as supplied, from their CDN
          <img
            src={review.authorPhotoUrl}
            alt=""
            width={40}
            height={40}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color:var(--l-ivory-2)] text-sm font-semibold text-[color:var(--l-wine)]"
          >
            {review.author.charAt(0).toUpperCase()}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[color:var(--l-wine)]">
            {review.author}
          </p>
          {review.relativeTime && (
            <p className="text-xs text-[color:var(--l-ink-soft)]">
              {review.relativeTime}
            </p>
          )}
        </div>

        {/* Deep link back to the review on Google — also part of the required
            attribution. */}
        {review.reviewUrl && (
          <a
            href={review.reviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-xs font-semibold text-[color:var(--l-gold)] underline decoration-[color:var(--l-gold)]/40 underline-offset-2 hover:decoration-[color:var(--l-gold)]"
          >
            {/* The visible label is short because it sits in a tight row; the
                screen-reader label says whose review it opens. */}
            <span className="sr-only">{`Read ${review.author}'s full review on Google`}</span>
            <span aria-hidden="true">View on Google</span>
          </a>
        )}
      </footer>
    </article>
  );
}

/* ── Stars ────────────────────────────────────────────────────────────────── */

/**
 * Whole stars only — Google never emits a fractional rating on an individual
 * review. The aggregate average is rendered as a number in the section header
 * instead, which sidesteps half-star clipping entirely.
 */
export function Stars({
  rating,
  label,
}: {
  rating: number;
  label?: string;
}) {
  const filled = Math.round(rating);
  return (
    <p
      className="flex items-center gap-0.5 text-[color:var(--l-saffron)]"
      aria-label={label ?? `${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          aria-hidden="true"
          viewBox="0 0 20 20"
          className={`h-4 w-4 ${n <= filled ? "fill-current" : "fill-current opacity-20"}`}
        >
          <path d="M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.6 7.7l5.8-.8z" />
        </svg>
      ))}
    </p>
  );
}

/* ── Arrows ───────────────────────────────────────────────────────────────── */

function ArrowButton({
  direction,
  onClick,
}: {
  direction: "prev" | "next";
  onClick: () => void;
}) {
  const prev = direction === "prev";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={prev ? "Previous review" : "Next review"}
      className={`absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[color:var(--l-line)] bg-white text-[color:var(--l-wine)] shadow-[0_10px_30px_-12px_rgba(59,16,34,.4)] transition hover:border-[color:var(--l-gold)] hover:text-[color:var(--l-gold)] lg:flex ${
        prev ? "-left-4 xl:-left-6" : "-right-4 xl:-right-6"
      }`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={prev ? "M15 18l-6-6 6-6" : "M9 6l6 6-6 6"} />
      </svg>
    </button>
  );
}
