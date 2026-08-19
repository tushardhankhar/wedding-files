"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { NAV_LINKS, DEMO_CTA, DEMO_CTA_SHORT, BUY_CTA, BUY_CTA_SHORT, PRICE } from "./data";
import { UtsavLogo, UtsavMonogram } from "./logo";
import { BookNowButton } from "./book-now";
import { StartButton } from "./start-button";

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkTone = scrolled
    ? "text-[color:var(--l-wine)]/80 hover:text-[color:var(--l-wine)]"
    : "text-[color:var(--l-ivory)]/85 hover:text-white";

  // Gold underline that grows from the left on hover / keyboard focus.
  const underline =
    "relative after:pointer-events-none after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-[color:var(--l-gold)] after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-100 focus-visible:after:scale-x-100";

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow] duration-500",
          scrolled
            ? "border-b border-[color:var(--l-line)] bg-[color:var(--l-ivory)]/92 shadow-[0_8px_30px_-18px_rgba(59,16,34,.35)] backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
        )}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
          <Link href="/" aria-label="Join the Jashn — home">
            <UtsavLogo tone={scrolled ? "dark" : "light"} />
          </Link>

          {/* Desktop links */}
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={cn(
                  "text-[13px] font-medium tracking-wide transition-colors",
                  linkTone,
                  underline
                )}
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            {/* <a
              href="#pricing"
              className={cn("text-[13px] font-medium transition-colors", linkTone, underline)}
            >
              ₹1,599, all in
            </a> */}
            {/* Demo drops to a ghost button so exactly ONE thing in this bar is
                filled. Two saturated pills side by side made the visitor rank
                them, and the one they were ranking against was the one that
                earns money — the demo was the brightest element on screen and
                the buy button the dimmest. */}
            <Link
              href="/demo/royal"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "rounded-full border px-5 py-2.5 text-[13px] font-semibold transition-colors",
                scrolled
                  ? "border-[color:var(--l-line)] text-[color:var(--l-wine)] hover:border-[color:var(--l-gold)]"
                  : "border-white/30 text-[color:var(--l-ivory)] hover:border-[color:var(--l-gold-lite)]"
              )}
            >
              {/* Short forms here: the full labels plus four nav links overflow
                  the bar at the narrow end of the lg breakpoint. */}
              {DEMO_CTA_SHORT}
            </Link>
            {/* Self-serve is the primary action. The WhatsApp path is one scroll
                away in the hero and the pricing cards; a third button overflows
                this bar at the narrow end of the lg breakpoint.
                The tone follows the bar: gold reads loudest over the wine hero,
                but would wash out once the bar turns ivory. */}
            <StartButton
              from="navbar"
              tone={scrolled ? "wine" : "gold"}
              label={`${BUY_CTA_SHORT} · ${PRICE}`}
            />
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-full border lg:hidden",
              scrolled
                ? "border-[color:var(--l-line)] text-[color:var(--l-wine)]"
                : "border-white/30 text-[color:var(--l-ivory)]"
            )}
            aria-expanded={open}
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
              <path d="M1 1h16M1 7h16M1 13h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </header>

      {/* Full-screen mobile menu */}
      {open ? (
        <div
          className="fixed inset-0 z-[60] flex flex-col bg-[color:var(--l-wine)] p-6 duration-300 animate-in fade-in lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div className="flex items-center justify-between">
            <UtsavLogo tone="light" />
            <button
              type="button"
              aria-label="Close menu"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 text-[color:var(--l-ivory)]"
              onClick={() => setOpen(false)}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <nav className="mt-12 flex flex-col gap-6" aria-label="Primary mobile">
            {NAV_LINKS.map((l, i) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="l-display text-3xl font-medium text-[color:var(--l-ivory)] duration-500 animate-in fade-in slide-in-from-bottom-3"
                style={{ animationDelay: `${80 + i * 60}ms` }}
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="mt-auto space-y-4 pb-4">
            <StartButton
              from="mobile_menu"
              label={BUY_CTA}
              className="w-full px-6 py-4 text-base"
            />
            <Link
              href="/demo/royal"
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-full bg-gradient-to-r from-[color:var(--l-marigold)] to-[color:var(--l-pink)] px-6 py-4 text-center text-base font-semibold text-white"
              onClick={() => setOpen(false)}
            >
              {DEMO_CTA}
            </Link>
            {/* There is room to keep both here, so the menu is where the
                "rather not do it yourself" path stays reachable on a phone.
                Now filled in WhatsApp green rather than a transparent outline:
                in a full-screen wine menu a ghost button is the quietest thing
                on screen, which is the wrong weight for the option most people
                who open this menu are actually looking for. */}
            <BookNowButton
              label="Chat on WhatsApp"
              className="w-full px-6 py-4 text-base"
            />
            <p className="flex items-center justify-center gap-2 text-center text-xs text-white/60">
              <UtsavMonogram className="h-4 w-4" />
              Make your own celebration invitation · {PRICE}
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
