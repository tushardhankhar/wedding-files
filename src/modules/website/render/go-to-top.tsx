"use client";

import { useEffect, useState } from "react";

/**
 * A floating "back to top" button, shared by every themed guest site. Appears
 * (fade + rise + scale) once the guest scrolls past the hero, gently bobs its
 * arrow, lifts on hover, and smooth-scrolls to the top on click. Theme-aware:
 * the caller passes the theme's deep `bg` and `ring` (gold) so it always suits
 * the palette. Honours prefers-reduced-motion (no bob, instant scroll).
 */
export function GoToTop({ bg = "#221c33", ring = "#b8912f" }: { bg?: string; ring?: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setShow(window.scrollY > 480));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const toTop = () => {
    const reduce =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={toTop}
      className={`gtt${show ? " gtt-on" : ""}`}
      style={{
        background: bg,
        boxShadow: `0 0 0 1px ${ring}66, 0 12px 28px -10px rgba(0,0,0,0.55)`,
      }}
    >
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        aria-hidden="true"
        className="gtt-arrow"
        fill="none"
        stroke={ring}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 19V7" />
        <path d="M6 12l6-6 6 6" />
      </svg>
    </button>
  );
}
