import { z } from "zod";

/**
 * Public environment variables — safe to reference in any runtime, including
 * the browser bundle. NEXT_PUBLIC_* values are statically inlined by Next.js,
 * so each one must be read as a direct `process.env.NEXT_PUBLIC_X` access.
 *
 * Server-only secrets (service-role key, session signing secret) live in
 * `env.server.ts` and must never appear here.
 */
const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  // Absolute origin used to build invitation links (e.g. https://example.com).
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  // WhatsApp booking target for the "Book Now" button. Accepts either an
  // international phone number in digits (e.g. 919876543210) OR a full chat
  // link (e.g. https://wa.me/919876543210). Optional — the button falls back
  // to the on-page enquiry section until this is set.
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.string().optional(),
});

const parsed = publicSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
});

if (!parsed.success) {
  throw new Error(
    `Invalid public environment variables:\n${parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n")}`
  );
}

export const env = parsed.data;

/**
 * Returns the absolute site origin (no trailing slash), throwing a clear error
 * if `NEXT_PUBLIC_SITE_URL` is unset. Every auth redirect target — magic-link,
 * OTP, password-reset, and invite-claim URLs — is built from this, so a missing
 * value must fail loudly rather than silently producing broken `undefined/...`
 * links. Kept optional in the schema so unrelated builds still boot.
 */
export function requireSiteUrl(): string {
  const url = env.NEXT_PUBLIC_SITE_URL;
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL is required to build auth/invite links but is not set."
    );
  }
  return url.replace(/\/$/, "");
}
