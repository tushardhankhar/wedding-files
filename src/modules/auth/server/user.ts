import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Returns the current admin/client user, or null if not authenticated.
 * Uses getUser() (not getSession()) so the token is verified against Supabase.
 *
 * Wrapped in React cache() so the (network) verification runs at most once per
 * request even when several components/queries need the user.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/**
 * Guard for the authenticated app. Redirects to /login when unauthenticated.
 * The single authorization decision point for the admin/client routes.
 */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Whether the current user is a platform admin (Viamedia side). Backed by the
 * `is_admin()` DB function reading the `admins` allowlist. Non-admin
 * authenticated users are clients.
 */
export const isCurrentUserAdmin = cache(async (): Promise<boolean> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("is_admin");
  if (error) return false;
  return data === true;
});
