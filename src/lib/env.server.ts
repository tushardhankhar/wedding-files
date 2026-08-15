import "server-only";
import { z } from "zod";

/**
 * Server-only secrets. Importing this module from any code that can reach the
 * browser bundle is a build error thanks to `server-only`. It is additionally
 * guarded by an ESLint import-boundary rule.
 */
const serverSchema = z.object({
  // Supabase service-role key — BYPASSES Row Level Security. Guarded here and
  // only consumed by `lib/supabase/service.ts`.
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  // HMAC secret used to sign guest session cookies (Phase 4). Kept long so a
  // rotation invalidates every outstanding guest session.
  GUEST_SESSION_SECRET: z.string().min(32),

  // ── Transactional email (Resend REST API) ─────────────────────────────────
  // All optional so the app still boots without email configured — the enquiry
  // form and the client-invite email each degrade to a friendly "not set up
  // yet" message instead of crashing. Native Supabase auth emails (OTP, magic
  // link, password reset) are sent by Supabase via custom SMTP, not from here.
  RESEND_API_KEY: z.string().min(1).optional(),
  // Owner inboxes that receive enquiries — one address, or several separated by
  // commas so a copy lands in each. Split and validated here so a typo fails at
  // boot, where it's obvious, rather than silently at send time.
  ENQUIRY_TO_EMAIL: z
    .string()
    .optional()
    .transform((v) =>
      (v ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    )
    .pipe(z.array(z.string().email())),
  // FROM fields may carry a display name ("Name <addr@domain>"), so not .email().
  ENQUIRY_FROM_EMAIL: z.string().min(1).optional(),
  // Branded sender for client-invite emails, e.g. "Join the Jashn <hello@jointhejashn.com>".
  AUTH_FROM_EMAIL: z.string().min(1).optional(),

  // ── Payments (Razorpay) ───────────────────────────────────────────────────
  // Self-serve checkout. Optional as a set, like the R2 and Resend vars: with
  // them unset the app still boots and every other flow works, and only the
  // self-serve pay step degrades to "checkout isn't set up yet". That keeps
  // local and preview environments runnable without live payment credentials.
  //
  // KEY_ID is not a secret (it is handed to Razorpay's browser checkout), but
  // it lives here rather than in `env.ts` so it is served from the create-order
  // action alongside the order — one fewer NEXT_PUBLIC_* value inlined into
  // every page's bundle whether or not the visitor is buying.
  RAZORPAY_KEY_ID: z.string().min(1).optional(),
  RAZORPAY_KEY_SECRET: z.string().min(1).optional(),
  // Set when creating the webhook in the Razorpay dashboard. Every webhook body
  // is HMAC-verified against this before it can touch the database.
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1).optional(),
});

const parsed = serverSchema.safeParse({
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  GUEST_SESSION_SECRET: process.env.GUEST_SESSION_SECRET,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  ENQUIRY_TO_EMAIL: process.env.ENQUIRY_TO_EMAIL,
  ENQUIRY_FROM_EMAIL: process.env.ENQUIRY_FROM_EMAIL,
  AUTH_FROM_EMAIL: process.env.AUTH_FROM_EMAIL,
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
});

if (!parsed.success) {
  throw new Error(
    `Invalid server environment variables:\n${parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n")}`
  );
}

export const serverEnv = parsed.data;
