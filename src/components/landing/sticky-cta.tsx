"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { sendGTMEvent } from "@next/third-parties/google";
import { PRICE } from "./data";

/**
 * The always-there way to buy, pinned to the bottom of the screen on phones.
 *
 * Why this exists: the landing page is ~16 screens tall on a 390×844 phone, and
 * before this component there was exactly one buy button in the first ten of
 * them — the hero's, at 0.9 screens. The next one was in the pricing cards at
 * 10.4 screens. So a visitor who read the personalisation demo, the themes, the
 * how-it-works and the features — i.e. someone doing everything a warm lead
 * does — spent nine and a half screens with no way to act on it, and the only
 * thing on screen to click was the back-to-top button.
 *
 * Design constraints this shape is answering:
 *
 *  - **It must not cover the hero.** A bar that's up at scroll 0 steals the
 *    first impression and the two CTAs already there. It arrives once the hero
 *    is behind you.
 *  - **It must not compete with the real buy buttons.** When the pricing cards
 *    or the enquiry form are on screen the visitor already has a bigger, better
 *    target, and two live CTAs in one viewport reads as nagging. The bar
 *    withdraws while either is visible (see `#pricing`/`#enquire` observer).
 *  - **It must carry the price.** A naked "Get my website" asks for a decision
 *    while hiding the number the decision turns on. Repeating the price next to
 *    the button also keeps the ad's promise on screen for the whole scroll.
 *  - **It must not sit on the back-to-top button.** `.gtt` is fixed 22px off the
 *    bottom edge; the bar publishes its height so the shared button lifts above
 *    it, exactly as the theme demo's dock already does.
 *
 * Desktop keeps the navbar's own CTAs, which are always visible — so this is
 * phone-only.
 */
export function StickyCta() {
  const [show, setShow] = useState(false);

  // Reveal once the hero is behind us.
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() =>
        setShow(window.scrollY > window.innerHeight * 0.85),
      );
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Stand down while a section with its own primary CTA owns the screen.
  const [yielded, setYielded] = useState(false);
  useEffect(() => {
    const targets = ["pricing", "enquire"]
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!targets.length) return;
    const seen = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) seen.add(e.target);
          else seen.delete(e.target);
        }
        setYielded(seen.size > 0);
      },
      // Only yield once the section is properly on screen, not as its first
      // pixel crosses the fold — otherwise the bar flickers out and back in
      // through the long gap between a pricing heading and its buttons.
      { threshold: 0.12 },
    );
    for (const t of targets) io.observe(t);
    return () => io.disconnect();
  }, []);

  const on = show && !yielded;

  // Publish the bar's height so `.gtt` can lift clear of it. Kept in sync with
  // `on` rather than measured, because the bar is a fixed 4.5rem and a hidden
  // bar must give the space back.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("has-sticky-cta", on);
    return () => root.classList.remove("has-sticky-cta");
  }, [on]);

  return (
    <div
      // aria-hidden while parked: the same two destinations are in the hero,
      // the navbar menu and the pricing cards, so a screen-reader user loses
      // nothing, and an off-screen focusable button is a keyboard trap.
      aria-hidden={!on}
      className={`sticky-cta${on ? " sticky-cta-on" : ""} lg:hidden`}
    >
      <div className="flex items-center gap-2.5 px-3.5">
        <div className="min-w-0 flex-1">
          <p className="l-display text-[15px] font-semibold leading-none text-[color:var(--l-ivory)]">
            {PRICE}
          </p>
          <p className="mt-1 truncate text-[10px] leading-none text-white/60">
            one-time · live today
          </p>
        </div>

        <Link
          href="/demo/royal"
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={on ? undefined : -1}
          onClick={() => sendGTMEvent({ event: "demo_click", cta_label: "sticky_bar" })}
          className="flex h-11 flex-none items-center rounded-full border border-white/30 px-4 text-[13px] font-semibold text-[color:var(--l-ivory)]"
        >
          See a demo
        </Link>

        {/* Was the WhatsApp chat. On a phone this bar is the last thing between
            a decided visitor and a purchase, so it now goes straight to
            checkout; the chat stays one tap away in the menu and the hero. */}
        <Link
          href="/start"
          tabIndex={on ? undefined : -1}
          onClick={() =>
            sendGTMEvent({
              event: "self_serve_start",
              cta_label: "Get mine",
              cta_from: "sticky_bar",
            })
          }
          className="flex h-11 flex-none items-center gap-1.5 rounded-full bg-[color:var(--l-pink)] px-4 text-[13px] font-semibold text-white shadow-[0_10px_24px_-10px_rgba(216,27,96,.8)]"
        >
          Get mine
        </Link>
      </div>
    </div>
  );
}
