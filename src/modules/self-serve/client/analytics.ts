import { sendGTMEvent } from "@next/third-parties/google";
import { CURRENCY, PRICE_PAISE } from "../pricing";

/**
 * Conversion events for the self-serve funnel.
 *
 * ── Why these push to the dataLayer and nothing else ───────────────────────
 * GTM is the only tag loader in this codebase (see `(marketing)/layout.tsx`).
 * The Meta Pixel, GA4 and anything after them are configured as tags INSIDE the
 * container, triggered by the event names below. Adding `fbq(...)` here would
 * put a second loader on the page, double-count every conversion that GTM also
 * reports, and make every future pixel a code change plus a redeploy instead of
 * a click in an interface. Keep this file free of vendor SDKs.
 *
 * ── Money is in major units, and it is not the client's to decide ──────────
 * Ad platforms expect 499, not 49900 — reporting paise would tell Meta each sale
 * is worth ₹49,900 and let it bid roughly a hundred times what a buyer is worth.
 * The figure is derived from the same `PRICE_PAISE` the server charges, so the
 * number optimised on and the number banked cannot drift apart.
 *
 * ── PII stays out ──────────────────────────────────────────────────────────
 * No name, email or phone in any payload, matching the rule the enquiry form
 * already follows: sending personal data to GA4 breaches Google's terms and is
 * not needed to count a conversion. Meta's Conversions API is the exception
 * that would need hashed identifiers, and it is a server-side concern — not
 * something to smuggle into a browser payload.
 */

/** Rupees, not paise — see the note above. */
const VALUE = PRICE_PAISE / 100;

/**
 * The buyer opened Razorpay's sheet. Map to Meta's `InitiateCheckout`.
 *
 * Fired after the order exists, not when the button is clicked: a click that
 * fails to produce an order isn't a checkout, and counting it as one inflates
 * the top of the funnel and hides exactly the failure worth knowing about.
 */
export function trackBeginCheckout(orderId: string): void {
  sendGTMEvent({
    event: "begin_checkout",
    currency: CURRENCY,
    value: VALUE,
    order_id: orderId,
  });
}

/**
 * The money cleared and the invitation exists. Map to Meta's `Purchase` and
 * GA4's `purchase`. This is the event every campaign optimises on.
 *
 * `transaction_id` is Razorpay's payment id, which doubles as the deduplication
 * key: it is stable, unique, and — crucially — also available server-side in
 * `activateSignup`, so a future Conversions API call can send the same id and
 * Meta will collapse the two reports into one conversion instead of counting
 * the sale twice.
 *
 * Fired before the redirect to the dashboard on purpose. `/weddings/[id]` sits
 * outside the `(marketing)` route group and deliberately loads no tags at all,
 * so a purchase announced after navigation would be announced to nobody.
 */
export function trackPurchase(paymentId: string, themeId: string): void {
  sendGTMEvent({
    event: "purchase",
    currency: CURRENCY,
    value: VALUE,
    transaction_id: paymentId,
    // Doubles as Meta's event_id for Pixel/CAPI deduplication.
    event_id: paymentId,
    items: [
      {
        item_id: "self-serve-invitation",
        item_name: "Celebration invitation",
        item_variant: themeId,
        price: VALUE,
        quantity: 1,
      },
    ],
  });
}

/** Which theme a buyer committed to. Not a conversion — an audience signal, and
 * the only reliable read on which designs actually sell. */
export function trackSelectTheme(themeId: string, occasion: string): void {
  sendGTMEvent({ event: "select_theme", theme_id: themeId, occasion });
}

/** An account was created. Map to Meta's `CompleteRegistration`. Distinct from
 * `purchase`: it marks the point where a visitor becomes reachable, which is
 * the audience worth retargeting when they don't finish paying. */
export function trackSignUp(): void {
  sendGTMEvent({ event: "sign_up", method: "email_otp" });
}
