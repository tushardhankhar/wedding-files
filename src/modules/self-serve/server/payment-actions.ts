"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/modules/auth/server/user";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { PRICE_PAISE, CURRENCY } from "../pricing";
import {
  createOrder,
  isValidCheckoutSignature,
  razorpayCredentials,
} from "./razorpay";
import { activateSignup } from "./activate";
import { mapSignupRow, SIGNUP_COLUMNS, type PendingSignupRow } from "../types";

export type OrderState =
  | {
      ok: true;
      orderId: string;
      keyId: string;
      amount: number;
      currency: string;
      /** Prefill for Razorpay's checkout form. */
      name: string;
      email: string;
      phone: string;
    }
  | { ok: false; error: string };

const NOT_CONFIGURED =
  "Online payment isn't set up yet. Please message us on WhatsApp and we'll get you started.";

/**
 * Creates a Razorpay order for the caller's draft and returns what the browser
 * checkout needs.
 *
 * Server Actions are reachable by direct POST, so identity is re-established
 * here and the draft is looked up BY THE CALLER'S OWN user id — the signup id
 * is never taken from the request. The amount likewise comes from the server's
 * `PRICE_PAISE`; nothing about the price crosses the wire inbound.
 *
 * Re-runnable on purpose: clicking Pay again (or editing details and returning)
 * mints a fresh order and overwrites the stored id. Unpaid Razorpay orders
 * simply expire, and the alternative — reusing a stale order after the buyer
 * changed their date — would bill for something other than what is on screen.
 */
export async function createOrderAction(): Promise<OrderState> {
  const user = await requireUser();

  const credentials = razorpayCredentials();
  if (!credentials) return { ok: false, error: NOT_CONFIGURED };

  // Service client: `razorpay_order_id` is a server-owned column, revoked from
  // `authenticated` by migration 0022, so the user-scoped client cannot write
  // it. Scoped explicitly to this user's own draft.
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("pending_signups")
    .select(SIGNUP_COLUMNS)
    .eq("user_id", user.id)
    .eq("status", "draft")
    .maybeSingle();

  if (error || !data) {
    return { ok: false, error: "We couldn't find your details. Please fill them in again." };
  }
  const draft = mapSignupRow(data as PendingSignupRow);

  try {
    const order = await createOrder(credentials, draft.id);
    await supabase
      .from("pending_signups")
      .update({ razorpay_order_id: order.id, amount_paise: PRICE_PAISE })
      .eq("id", draft.id);

    return {
      ok: true,
      orderId: order.id,
      keyId: credentials.keyId,
      amount: PRICE_PAISE,
      currency: CURRENCY,
      name: draft.contactName,
      email: user.email ?? "",
      phone: draft.contactPhone,
    };
  } catch {
    return {
      ok: false,
      error: "We couldn't start the payment. Please try again in a moment.",
    };
  }
}

export type VerifyState =
  | { ok: true; weddingId: string }
  | { ok: false; error: string };

/**
 * The fast path: Razorpay's browser checkout hands back a signed
 * (order, payment) pair on success, and this verifies it and activates
 * immediately so the buyer lands in their dashboard rather than on a spinner.
 *
 * The webhook is the backstop for a closed tab, not the primary route — but
 * both funnel into the same idempotent `activateSignup`, so whichever arrives
 * second is harmless. This also means the whole flow can be tested locally,
 * where Razorpay cannot reach a webhook URL at all.
 */
export async function verifyPaymentAction(
  orderId: string,
  paymentId: string,
  signature: string
): Promise<VerifyState> {
  await requireUser();

  const credentials = razorpayCredentials();
  if (!credentials) return { ok: false, error: NOT_CONFIGURED };

  const valid = await isValidCheckoutSignature(
    credentials,
    orderId,
    paymentId,
    signature
  );
  if (!valid) {
    return {
      ok: false,
      error: "We couldn't verify that payment. If you were charged, message us and we'll sort it out.",
    };
  }

  const result = await activateSignup(orderId, paymentId);
  if (!result) {
    return {
      ok: false,
      error: "That payment doesn't match a pending invitation. Please contact us.",
    };
  }

  revalidatePath("/dashboard");
  return { ok: true, weddingId: result.weddingId };
}
