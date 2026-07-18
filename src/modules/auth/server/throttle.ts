import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

/**
 * Returns true when the given (key, action) is still within its cooldown window
 * and the caller should NOT proceed (e.g. skip re-sending an email). Records the
 * attempt when allowed. Backed by the `check_auth_throttle` DB function.
 *
 * Fails OPEN: if the throttle check itself errors we don't block a legitimate
 * user — Supabase's built-in rate limits remain as the backstop.
 */
export async function isCoolingDown(
  supabase: ServerClient,
  key: string,
  action: string,
  cooldownSeconds = 30
): Promise<boolean> {
  const { data, error } = await supabase.rpc("check_auth_throttle", {
    p_key: key.trim().toLowerCase(),
    p_action: action,
    p_cooldown_seconds: cooldownSeconds,
  });
  if (error) return false;
  return data === false; // false => blocked (still cooling down)
}
