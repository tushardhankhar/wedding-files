import { type NextRequest } from "next/server";
import { isValidWebhookSignature } from "@/modules/self-serve/server/razorpay";
import { activateSignup } from "@/modules/self-serve/server/activate";

/**
 * Razorpay payment webhook — the backstop that finishes a purchase when the
 * buyer's browser doesn't.
 *
 * The happy path is `verifyPaymentAction`, which runs while the buyer is still
 * on the page. This exists for the tab that gets closed on the UPI approval
 * screen, the phone that loses signal, the app-switch that never comes back.
 * Both routes call the same idempotent `activateSignup`, so a duplicate
 * delivery — which Razorpay will retry — produces one invitation, not two.
 *
 * Configure in the Razorpay dashboard against `payment.captured`, using the
 * webhook secret stored in `RAZORPAY_WEBHOOK_SECRET`.
 */

/** Only the fields we actually read; the payload carries far more. */
interface WebhookPayload {
  event?: string;
  payload?: {
    payment?: {
      entity?: { id?: string; order_id?: string };
    };
  };
}

export async function POST(request: NextRequest) {
  // The signature covers the EXACT bytes Razorpay sent, so the raw text is read
  // first and parsed only after it verifies. Re-serializing the JSON would
  // change spacing and key order and never reproduce the digest.
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature || !(await isValidWebhookSignature(rawBody, signature))) {
    // 400, not 200: an unverifiable delivery is not something to acknowledge.
    return new Response("Invalid signature", { status: 400 });
  }

  let event: WebhookPayload;
  try {
    event = JSON.parse(rawBody) as WebhookPayload;
  } catch {
    return new Response("Malformed payload", { status: 400 });
  }

  if (event.event !== "payment.captured") {
    // Acknowledge everything else. Razorpay retries on a non-2xx, so returning
    // an error for events we simply don't handle would earn us a retry storm.
    return new Response("Ignored", { status: 200 });
  }

  const payment = event.payload?.payment?.entity;
  if (!payment?.order_id || !payment.id) {
    return new Response("Ignored", { status: 200 });
  }

  try {
    await activateSignup(payment.order_id, payment.id);
  } catch (error) {
    // A 500 asks Razorpay to retry, which is what we want for a transient
    // database failure — the payment is real and the invitation is owed.
    console.error("[razorpay] activation failed", error);
    return new Response("Activation failed", { status: 500 });
  }

  return new Response("OK", { status: 200 });
}
