import "server-only";
import { serverEnv } from "@/lib/env.server";
import { sha256Hex } from "@/lib/crypto";
import { siteUrl } from "@/lib/env";
import { CURRENCY, PRICE_PAISE } from "../pricing";

/**
 * Meta Conversions API — server-side `Purchase` reporting.
 *
 * ── Why this exists at all ─────────────────────────────────────────────────
 * The browser pixel misses a large share of real sales: ad blockers, iOS
 * tracking prevention, and — the one unique to this funnel — the buyer who
 * approves a UPI payment on their phone and never returns to the tab. That last
 * case is not an edge: the invitation is created by the Razorpay webhook, on the
 * server, with no browser involved, so the pixel cannot fire even in principle.
 * Those purchases were invisible, and a campaign optimising on the survivors is
 * optimising on a biased sample of who actually buys.
 *
 * ── Deduplication is the whole trick ───────────────────────────────────────
 * Both reporters send the Razorpay payment id: the pixel as `eventID`, this as
 * `event_id`. Meta collapses them into ONE conversion. Get that wrong and every
 * purchase is counted twice, which is worse than counting none — it would look
 * like success while teaching the campaign the wrong thing.
 *
 * ── The PII exception, stated plainly ──────────────────────────────────────
 * Everywhere else in this codebase, analytics gets no personal data. Here it
 * gets email and phone, because matching is the entire point of CAPI and Meta
 * cannot attribute an anonymous server event to a person who saw an ad.
 * The limits that make that acceptable:
 *   • SHA-256 hashed before it leaves this process. Raw values never travel.
 *   • Only email and phone. No name, no event date, no guest data, nothing
 *     about the celebration itself.
 *   • Never logged. Failures log a status code, never a payload.
 *   • Off unless configured. No token, no send.
 */

const API_VERSION = "v21.0";

/** Meta requires lowercase, trimmed email before hashing. */
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Meta wants digits only, including country code, with no `+` or separators.
 * `client_phone` is free-form (that looseness is deliberate — see the schema),
 * so a bare 10-digit Indian mobile gets its country code restored; anything
 * already carrying one is left alone. A wrong country code is not a failed
 * match, it is a match against a different person's number, so this only adds
 * the prefix in the one case it can be certain about.
 */
function normalizePhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length >= 11 && digits.length <= 15) return digits;
  return null;
}

export interface PurchaseEvent {
  /** Razorpay payment id — also the deduplication key against the pixel. */
  paymentId: string;
  email: string | null;
  phone: string | null;
  themeId: string;
  /** Unix seconds. Meta rejects events older than 7 days. */
  eventTime: number;
}

/**
 * Reports one purchase. Returns true when Meta accepted it.
 *
 * Never throws: this is called from `activateSignup`, where the invitation has
 * already been created and the buyer is waiting. An analytics outage must not
 * turn a completed purchase into an error page, so every failure is swallowed
 * after logging a status.
 */
export async function reportPurchase(event: PurchaseEvent): Promise<boolean> {
  const pixelId = serverEnv.META_PIXEL_ID;
  const token = serverEnv.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !token) return false;

  const userData: Record<string, string[]> = {};
  if (event.email) userData.em = [await sha256Hex(normalizeEmail(event.email))];
  if (event.phone) {
    const phone = normalizePhone(event.phone);
    if (phone) userData.ph = [await sha256Hex(phone)];
  }
  // With nothing to match on, Meta records an unattributable conversion that
  // inflates the total without informing the optimiser. Better to send nothing.
  if (Object.keys(userData).length === 0) return false;

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: "Purchase",
        event_time: event.eventTime,
        event_id: event.paymentId,
        // "website" (not "server") because the buyer did act on the site — this
        // is the same conversion the pixel reports, which is what makes the
        // event_id dedup valid.
        action_source: "website",
        event_source_url: `${siteUrl()}/start`,
        user_data: userData,
        custom_data: {
          currency: CURRENCY,
          // Rupees, not paise — same reason as the browser event: reporting
          // 49900 would let Meta bid a hundred times what a buyer is worth.
          value: PRICE_PAISE / 100,
          content_type: "product",
          content_ids: ["self-serve-invitation"],
          content_name: "Celebration invitation",
          contents: [{ id: event.themeId, quantity: 1 }],
        },
      },
    ],
  };
  if (serverEnv.META_TEST_EVENT_CODE) {
    body.test_event_code = serverEnv.META_TEST_EVENT_CODE;
  }

  try {
    // Bounded: the buyer's redirect waits on this. A hung analytics call must
    // not hold up the page that tells them their invitation exists.
    const response = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(token)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
        signal: AbortSignal.timeout(4000),
      }
    );

    if (!response.ok) {
      // Status only. The payload carries hashed identifiers and the token is in
      // the URL — neither belongs in a log line.
      console.error(`[meta-capi] purchase rejected: HTTP ${response.status}`);
      return false;
    }
    return true;
  } catch {
    console.error("[meta-capi] purchase request failed");
    return false;
  }
}
