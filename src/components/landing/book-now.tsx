"use client";

import { cn } from "@/lib/utils";
import { env } from "@/lib/env";

/** Pre-filled WhatsApp message the booking chat opens with. */
const BOOKING_MESSAGE =
  "Hi Join the Jashn! 🎉 I'd like to book my celebration invitation.\n\n" +
  "Names: \nEvent date: \nOccasion / theme (if decided): ";

/**
 * Builds the WhatsApp link from NEXT_PUBLIC_WHATSAPP_NUMBER, which may be a bare
 * international number (919876543210) or a full chat link (https://wa.me/…).
 * It ALWAYS opens WhatsApp with the pre-filled message — never the enquiry
 * form. Until a number is set it opens WhatsApp's "choose a contact" screen
 * (wa.me with no recipient); once set, it opens that chat directly.
 */
export function bookingHref(): string {
  const raw = (env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").trim();
  const text = encodeURIComponent(BOOKING_MESSAGE);
  if (!raw) return `https://wa.me/?text=${text}`;
  if (/^https?:\/\//i.test(raw)) {
    const sep = raw.includes("?") ? "&" : "?";
    return `${raw}${sep}text=${text}`;
  }
  const digits = raw.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}?text=${text}`;
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.69 8.24-8.23 8.24Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.48-1.38-1.73-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43l-.48-.01c-.16 0-.43.06-.65.31-.22.25-.86.84-.86 2.05 0 1.21.88 2.38 1 2.54.12.16 1.72 2.62 4.16 3.68.58.25 1.04.4 1.39.51.58.19 1.11.16 1.53.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29Z" />
    </svg>
  );
}

/**
 * Prominent "Book Now" call-to-action that opens a WhatsApp chat with a
 * pre-filled booking message. On-brand emerald so it reads as distinct from the
 * pink "See a live demo" CTA and clearly signals WhatsApp.
 */
export function BookNowButton({
  className,
  label = "Get Started",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <a
      href={bookingHref()}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--l-emerald)] px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_10px_24px_-10px_rgba(8,127,91,.7)] transition-transform hover:-translate-y-0.5",
        className
      )}
    >
      <WhatsAppIcon className="h-4 w-4" />
      {label}
    </a>
  );
}
