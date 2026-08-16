import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/modules/auth/server/user";
import { UnauthorizedError } from "@/lib/errors";
import {
  mapSignupRow,
  SIGNUP_COLUMNS,
  type PendingSignup,
  type PendingSignupRow,
} from "../types";
import type { SignupDraftInput } from "../schema";

/**
 * Creates or updates the caller's single draft.
 *
 * Deliberately a read-then-write rather than an upsert: the uniqueness that
 * makes "one draft per user" true is a PARTIAL index (`where status = 'draft'`),
 * which `on conflict` cannot target cleanly through PostgREST. The read is
 * RLS-scoped anyway, so it costs one cheap query and reads plainly.
 *
 * Every column written here is one the buyer is allowed to own. The payment
 * columns are absent on purpose — migration 0022 revokes them from
 * `authenticated`, so naming one would fail at the database, not just here.
 */
export async function saveDraft(
  input: SignupDraftInput
): Promise<PendingSignup> {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();

  const supabase = await createSupabaseServerClient();
  const fields = {
    contact_name: input.contactName,
    contact_phone: input.contactPhone,
    theme_id: input.themeId,
    title: input.title,
    name1: input.name1 ?? null,
    name2: input.name2 ?? null,
    event_date: input.eventDate ?? null,
    event_time: input.eventTime ?? null,
  };

  const { data: existing } = await supabase
    .from("pending_signups")
    .select("id")
    .eq("status", "draft")
    .maybeSingle();

  const query = existing
    ? supabase.from("pending_signups").update(fields).eq("id", existing.id)
    : supabase
        .from("pending_signups")
        .insert({ ...fields, user_id: user.id });

  const { data, error } = await query.select(SIGNUP_COLUMNS).single();
  if (error) throw error;
  return mapSignupRow(data as PendingSignupRow);
}
