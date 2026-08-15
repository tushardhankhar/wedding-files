"use client";

import Link from "next/link";
import { sendGTMEvent } from "@next/third-parties/google";
import { cn } from "@/lib/utils";
import { PRICE_LABEL } from "@/modules/self-serve/pricing";

/**
 * The self-serve call to action — the primary way to buy.
 *
 * It sits beside `BookNowButton`, which is now the secondary path for people
 * who would rather we set it up for them. Both are tracked, and deliberately
 * with DIFFERENT event names: the whole reason to build self-serve is to learn
 * how many buyers never needed a conversation, and one shared event name would
 * hide exactly that.
 *
 * The price is in the label on purpose. A CTA that hides the number moves the
 * decision to a page the visitor has to load first, and at {@link PRICE_LABEL}
 * the number is the most persuasive thing on the button.
 */
export function StartButton({
  className,
  label = `Create mine · ${PRICE_LABEL}`,
  from,
}: {
  className?: string;
  label?: string;
  /** Which surface the click came from — navbar, hero, sticky, pricing. */
  from?: string;
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
        "inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--l-wine)] px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_10px_24px_-10px_rgba(122,31,61,.7)] transition-transform hover:-translate-y-0.5",
        className
      )}
    >
      {label}
    </Link>
  );
}
