import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { insertWithUniqueSlug } from "@/modules/weddings/server/slug";
import {
  mapSignupRow,
  SIGNUP_COLUMNS,
  type PendingSignupRow,
} from "../types";
import { PRICE_PAISE } from "../pricing";

/**
 * ⚠️ This module is the ONLY place a `weddings` row is created without an admin.
 *
 * It runs on the service-role client, which bypasses RLS — including the
 * `weddings_insert` policy that otherwise requires `is_admin()`. That is the
 * point: a self-serve buyer never gains insert rights of their own, so the
 * admin-only invariant in `ARCHITECTURE.md` survives. As with `guest-access`,
 * the service client provides no protection itself — the authorization is the
 * code around it, and here that is a verified Razorpay signature (checked by
 * the caller) plus the atomic claim below.
 *
 * Both callers — the browser return path and the webhook — race by design, and
 * either may arrive first or twice. Everything here is therefore idempotent.
 */

export interface ActivationResult {
  weddingId: string;
  /** False when this call found the signup already activated by the other path. */
  created: boolean;
}

/**
 * Turns a paid signup into a real invitation.
 *
 * Step 1 is the whole concurrency story: a single conditional UPDATE moves the
 * row out of `draft`, and Postgres guarantees exactly one caller sees a row
 * come back. The loser reads the already-attached `wedding_id` instead. Without
 * that, a webhook arriving while the browser is still redirecting would create
 * a second invitation and charge-free duplicate sites would pile up.
 */
export async function activateSignup(
  orderId: string,
  paymentId: string
): Promise<ActivationResult | null> {
  const supabase = createSupabaseServiceClient();

  // ── 1. Claim the signup, atomically ──────────────────────────────────────
  const { data: claimed, error: claimError } = await supabase
    .from("pending_signups")
    .update({
      status: "paid",
      razorpay_payment_id: paymentId,
      amount_paise: PRICE_PAISE,
    })
    .eq("razorpay_order_id", orderId)
    .eq("status", "draft")
    .select(SIGNUP_COLUMNS)
    .maybeSingle();

  if (claimError) throw claimError;

  if (!claimed) {
    // Already processed (or the order id is unknown to us). Report the existing
    // invitation so a duplicate delivery still redirects the buyer correctly.
    const { data: existing } = await supabase
      .from("pending_signups")
      .select("wedding_id")
      .eq("razorpay_order_id", orderId)
      .maybeSingle();

    return existing?.wedding_id
      ? { weddingId: existing.wedding_id as string, created: false }
      : null;
  }

  const signup = mapSignupRow(claimed as PendingSignupRow);

  // ── 2. Create the invitation ─────────────────────────────────────────────
  // created_by and client_id are the same person: nobody handed this one over.
  //
  // Note the columns set at INSERT — title, slug, theme_id and client_phone.
  // The `weddings_name_lock` trigger is BEFORE UPDATE, so writing them here is
  // unimpeded, while every later attempt by the buyer to change them is still
  // refused. That is what lets self-serve keep the planner-only lock intact.
  const wedding = await insertWithUniqueSlug<{ id: string }>(signup.title, (slug) =>
    supabase
      .from("weddings")
      .insert({
        created_by: signup.userId,
        client_id: signup.userId,
        slug,
        title: signup.title,
        theme_id: signup.themeId,
        name1: signup.name1,
        name2: signup.name2,
        event_date: signup.eventDate,
        client_phone: signup.contactPhone,
        config: signup.eventTime ? { eventTime: signup.eventTime } : {},
      })
      .select("id")
      .single()
  );

  // ── 3. Link the two, so a repeat delivery is answerable ──────────────────
  await supabase
    .from("pending_signups")
    .update({ wedding_id: wedding.id })
    .eq("id", signup.id);

  return { weddingId: wedding.id, created: true };
}
