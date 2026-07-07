import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";

/**
 * Refreshes the admin Supabase auth session on every matched request and
 * propagates rotated auth cookies onto the response.
 *
 * Deliberately does NOT perform route protection or redirects. Auth guarding
 * lives in the `(admin)` layout via `requireUser()` (Phase 1), which keeps a
 * single, testable authorization decision point and avoids the subtle cookie
 * bugs that redirect-in-middleware patterns invite.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Touch the user to trigger token refresh. Do not add logic between the
  // client creation and this call (Supabase SSR requirement).
  await supabase.auth.getUser();

  return supabaseResponse;
}
