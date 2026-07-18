import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sanitizeNextPath } from "@/lib/next-redirect";

/**
 * Token-hash confirmation for email auth links, for when the Supabase email
 * templates use `{{ .TokenHash }}` → `/auth/confirm?token_hash=…&type=…`.
 * Verifies the OTP, establishing the session, then forwards to a validated
 * same-origin `next`. Complements `/auth/callback` (the PKCE `?code=` variant).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = sanitizeNextPath(searchParams.get("next"));

  if (tokenHash && type) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
