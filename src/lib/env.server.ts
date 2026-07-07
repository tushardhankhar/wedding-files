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
});

const parsed = serverSchema.safeParse({
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  GUEST_SESSION_SECRET: process.env.GUEST_SESSION_SECRET,
});

if (!parsed.success) {
  throw new Error(
    `Invalid server environment variables:\n${parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n")}`
  );
}

export const serverEnv = parsed.data;
