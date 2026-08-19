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

  // ── Meta Conversions API ──────────────────────────────────────────────────
  // Server-side Purchase reporting. Optional as a set: unset means the browser
  // pixel is the only reporter, which is the status quo and breaks nothing.
  //
  // This is the ONLY place personal data leaves the app for analytics, and it
  // leaves SHA-256 hashed — see `modules/self-serve/server/meta-capi.ts` for
  // why that exception exists and what is deliberately still excluded.
  META_PIXEL_ID: z.string().min(1).optional(),
  META_CAPI_ACCESS_TOKEN: z.string().min(1).optional(),
  // From Events Manager → Test Events. When set, events are routed to that tab
  // INSTEAD of production reporting — never leave it set in production.
  META_TEST_EVENT_CODE: z.string().min(1).optional(),

  // ── Reviews (landing-page social proof) ───────────────────────────────────
  // Which reader the carousel uses. Defaults to `curated`, which needs no
  // configuration at all: it reads real reviews typed into
  // `modules/reviews/curated-reviews.ts`, and renders nothing while that file is
  // empty. Set `google-places` only once the two Google vars below are present.
  REVIEWS_SOURCE: z
    .enum(["curated", "google-places", "google-business-profile"])
    .default("curated"),

  // Only read when REVIEWS_SOURCE=google-places. Optional as a set: without them
  // the Places reader returns nothing rather than failing, so local and preview
  // builds don't need Google credentials — and reviews are a billed Places field,
  // so there's no reason for every dev build to spend on them.
  //
  // The key is server-only on purpose. A browser fetch would both expose it and
  // fail CORS, so the call happens in a Server Component and Next caches the
  // response for a day (see `modules/reviews/server/google-places.ts`).
  GOOGLE_PLACES_API_KEY: z.string().min(1).optional(),
  // The Google Maps place identifier, not the business name. Find it with
  // `node scripts/find-place-id.mjs "Join the Jashn"`.
  GOOGLE_PLACE_ID: z.string().min(1).optional(),
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
  META_PIXEL_ID: process.env.META_PIXEL_ID,
  META_CAPI_ACCESS_TOKEN: process.env.META_CAPI_ACCESS_TOKEN,
  META_TEST_EVENT_CODE: process.env.META_TEST_EVENT_CODE,
  REVIEWS_SOURCE: process.env.REVIEWS_SOURCE,
  GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY,
  GOOGLE_PLACE_ID: process.env.GOOGLE_PLACE_ID,
});

if (!parsed.success) {
  throw new Error(
    `Invalid server environment variables:\n${parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n")}`
  );
}

export const serverEnv = parsed.data;
