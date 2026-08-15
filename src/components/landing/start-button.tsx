"use client";

import Link from "next/link";
import { sendGTMEvent } from "@next/third-parties/google";
import { cn } from "@/lib/utils";
import { PRICE_LABEL } from "@/modules/self-serve/pricing";

/**
 * The self-serve call to action — the primary way to buy, and the only filled
 * gold element on the page.
 *
 * It sits beside `BookNowButton`, which is now the secondary path for people
 * who would rather we set it up for them. Both are tracked, and deliberately
 * with DIFFERENT event names: the whole reason to build self-serve is to learn
 * how many buyers never needed a conversation, and one shared event name would
 * hide exactly that.
 *
 * ── Why gold, and why two tones ────────────────────────────────────────────
 * Gold is the one bright hue on this page not already spoken for — pink and
 * marigold belong to the demo, emerald to WhatsApp — and against the wine
 * ground it carries the highest luminance contrast available. But gold on the
 * scrolled navbar's ivory would be nearly invisible, so the button takes the
 * background it sits on as a prop rather than picking one colour and losing
 * half the page. A primary CTA that stops being the brightest thing on screen
 * has stopped being a primary CTA.
 *
 * The price is in the label on purpose. A CTA that hides the number asks for a
 * decision while withholding the thing the decision turns on — and at
 * {@link PRICE_LABEL} the number is the most persuasive asset we have.
 */
export function StartButton({
  className,
  label = `Create mine · ${PRICE_LABEL}`,
  from,
  tone = "gold",
}: {
  className?: string;
  label?: string;
  /** Which surface the click came from — navbar, hero, sticky, pricing. */
  from?: string;
  /** `gold` for dark grounds (hero, wine sections); `wine` for ivory ones. */
  tone?: "gold" | "wine";
}) {
  return (
    <Link
      href="/start"
      onClick={() =>
        sendGTMEvent({
          event: "self_serve_start",
          cta_label: label,
          cta_from: from ?? "unknown",
        })
      }
      className={cn(
        "l-cta-sheen relative inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-bold transition-transform hover:-translate-y-0.5",
        tone === "gold"
          ? "bg-gradient-to-b from-[color:var(--l-gold-lite)] to-[color:var(--l-gold)] text-[color:var(--l-wine)] shadow-[0_10px_26px_-8px_rgba(232,200,119,.75)]"
          : "bg-[color:var(--l-wine)] text-[color:var(--l-gold-lite)] shadow-[0_10px_24px_-10px_rgba(59,16,34,.8)]",
        className
      )}
    >
      {label}
    </Link>
  );
}
