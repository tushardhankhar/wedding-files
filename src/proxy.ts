import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Next.js "proxy" (formerly the `middleware` file convention). Runs on matched
 * requests to refresh the admin Supabase auth session — see
 * `lib/supabase/middleware.ts`.
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets and image files. The auth
     * session refresh runs on everything else, including the guest routes
     * (harmless there — guests have no Supabase session to refresh).
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
