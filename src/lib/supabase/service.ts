import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { serverEnv } from "@/lib/env.server";

/**
 * ⚠️ SERVICE-ROLE Supabase client — BYPASSES Row Level Security.
 *
 * This client can read and write ANY row in the database. It exists for the
 * GUEST trust domain, where guests are not Supabase-authenticated users and
 * RLS therefore cannot see them.
 *
 * Rules (enforced by the ESLint import-boundary rule):
 *   1. Never import this into a Client Component or shared UI.
 *   2. Only call it from `modules/<x>/server/**` or `app/api/**`.
 *   3. Every call MUST be preceded by an explicit authorization check
 *      (see `modules/guest-access`). This client provides NO protection of
 *      its own — the authorization is the code around it.
 */
export function createSupabaseServiceClient() {
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
