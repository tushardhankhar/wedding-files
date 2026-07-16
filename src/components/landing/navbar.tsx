"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "./data";
import { UtsavLogo, UtsavMonogram } from "./logo";
import { BookNowButton } from "./book-now";

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
            <Link
              href="/demo/royal"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-gradient-to-r from-[color:var(--l-marigold)] to-[color:var(--l-pink)] px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_10px_24px_-10px_rgba(216,27,96,.7)] transition-transform hover:-translate-y-0.5"
            >
              See a live demo
            </Link>
            <BookNowButton />
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
            <BookNowButton
              label="Get Started on WhatsApp"
              className="w-full px-6 py-4 text-base"
            />
            <Link
              href="/demo/royal"
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-full bg-gradient-to-r from-[color:var(--l-marigold)] to-[color:var(--l-pink)] px-6 py-4 text-center text-base font-semibold text-white"
              onClick={() => setOpen(false)}
            >
              See a live demo
            </Link>
            <p className="flex items-center justify-center gap-2 text-center text-xs text-white/60">
              <UtsavMonogram className="h-4 w-4" />
              Make your own celebration invitation · ₹1,599
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
