import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  mapSignupRow,
  SIGNUP_COLUMNS,
  type PendingSignup,
  type PendingSignupRow,
} from "../types";

/**
 * The current user's live draft, or null. RLS scopes this to the caller's own
 * row, and the partial unique index guarantees there is at most one — so no
 * ordering or limit games are needed.
 */
export async function getMyDraft(): Promise<PendingSignup | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("pending_signups")
    .select(SIGNUP_COLUMNS)
    .eq("status", "draft")
    .maybeSingle();

  if (error) throw error;
  return data ? mapSignupRow(data as PendingSignupRow) : null;
}

/**
 * The most recent signup of any status. Used after checkout to answer "did my
 * payment land yet?" — a paid row carries the `wedding_id` to redirect to.
 */
export async function getLatestSignup(): Promise<PendingSignup | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("pending_signups")
    .select(SIGNUP_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ? mapSignupRow(data as PendingSignupRow) : null;
}
