import "server-only";
import { serverEnv } from "@/lib/env.server";
import { hmacSha256Hex, timingSafeEqualHex } from "@/lib/crypto";
import { CURRENCY, PRICE_PAISE } from "../pricing";

/**
 * Razorpay, over plain `fetch`.
 *
 * There is deliberately no `razorpay` npm package here: the whole surface we
 * need is one POST to create an order and two HMAC checks, both of which
 * `lib/crypto.ts` already provides (`hmacSha256Hex`, `timingSafeEqualHex`).
 * The official SDK is a Node-only wrapper around the same REST calls and would
 * add a dependency to verify signatures we can verify in four lines.
 */

const API_BASE = "https://api.razorpay.com/v1";

export interface RazorpayCredentials {
  keyId: string;
  keySecret: string;
}

/**
 * Credentials, or null when checkout has not been configured in this
 * environment. Callers surface that as a friendly "payments aren't set up yet"
 * rather than a crash — same degradation the R2 and Resend integrations use.
 */
export function razorpayCredentials(): RazorpayCredentials | null {
  const { RAZORPAY_KEY_ID: keyId, RAZORPAY_KEY_SECRET: keySecret } = serverEnv;
  if (!keyId || !keySecret) return null;
  return { keyId, keySecret };
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
}

/**
 * Creates an order for the fixed self-serve price.
 *
 * The amount is read from `PRICE_PAISE` here, inside the server module — it is
 * never a parameter. A checkout that accepts an amount from its caller is one
 * crafted request away from selling a ₹99 product for ₹1, and making it a
 * parameter is what would let that request exist.
 *
 * `receipt` and `notes` both carry the signup id so a payment can be traced
 * back to its draft from the Razorpay dashboard as well as from our own tables.
 */
export async function createOrder(
  credentials: RazorpayCredentials,
  signupId: string
): Promise<RazorpayOrder> {
  const auth = Buffer.from(
    `${credentials.keyId}:${credentials.keySecret}`
  ).toString("base64");

  const response = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: PRICE_PAISE,
      currency: CURRENCY,
      // Razorpay caps receipts at 40 characters; a uuid is 36.
      receipt: signupId,
      notes: { pending_signup_id: signupId },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Razorpay order creation failed (${response.status}): ${body}`);
  }

  return (await response.json()) as RazorpayOrder;
}

/**
 * Verifies the signature Razorpay's browser checkout hands back on success.
 * Signed with the KEY SECRET over "<order_id>|<payment_id>".
 *
 * This is what makes the fast path trustworthy: without it, anything could POST
 * an order id back to us and claim it was paid.
 */
export async function isValidCheckoutSignature(
  credentials: RazorpayCredentials,
  orderId: string,
  paymentId: string,
  signature: string
): Promise<boolean> {
  const expected = await hmacSha256Hex(
    credentials.keySecret,
    `${orderId}|${paymentId}`
  );
  return timingSafeEqualHex(expected, signature);
}

/**
 * Verifies a webhook delivery. Signed with the WEBHOOK secret (a different
 * value from the key secret) over the EXACT raw request body — which is why the
 * route handler must read `await request.text()` and never a re-serialized JSON
 * object, whose key order or spacing would not reproduce the same digest.
 */
export async function isValidWebhookSignature(
  rawBody: string,
  signature: string
): Promise<boolean> {
  const secret = serverEnv.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = await hmacSha256Hex(secret, rawBody);
  return timingSafeEqualHex(expected, signature);
}
