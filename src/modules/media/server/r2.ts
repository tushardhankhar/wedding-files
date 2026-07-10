import "server-only";
import { S3Client } from "@aws-sdk/client-s3";
import { z } from "zod";

/**
 * Cloudflare R2 (S3-compatible) configuration.
 *
 * These secrets are validated LAZILY — on first upload — rather than at module
 * import time. That is deliberate: the rest of the app must boot and run in
 * environments where R2 keys are not yet configured (photo uploads are the only
 * feature that needs them). A missing key surfaces as a clear upload error, not
 * a crash on startup.
 *
 * Reads process.env directly (this is a `server-only` server module, so the
 * values can never reach the browser bundle).
 */
const r2Schema = z.object({
  // Cloudflare account id — forms the S3 API endpoint.
  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  // Bucket that stores wedding media.
  R2_BUCKET: z.string().min(1),
  // Public base URL the bucket is served from (r2.dev subdomain or a custom
  // domain), e.g. https://media.example.com — no trailing slash. Used to build
  // the URL stored in the wedding config and rendered on the site.
  R2_PUBLIC_BASE_URL: z.string().url(),
});

export type R2Config = z.infer<typeof r2Schema>;

let cached: { config: R2Config; client: S3Client } | null = null;

/**
 * Returns the validated R2 config and a memoized S3 client. Throws a readable
 * error the first time it is called without the keys present.
 */
export function getR2(): { config: R2Config; client: S3Client } {
  if (cached) return cached;

  const parsed = r2Schema.safeParse({
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    R2_BUCKET: process.env.R2_BUCKET,
    R2_PUBLIC_BASE_URL: process.env.R2_PUBLIC_BASE_URL,
  });
  if (!parsed.success) {
    throw new Error(
      "Photo uploads are not configured. Set the R2_* environment variables " +
        "(see .env.example)."
    );
  }

  const config = parsed.data;
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${config.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.R2_ACCESS_KEY_ID,
      secretAccessKey: config.R2_SECRET_ACCESS_KEY,
    },
  });

  cached = { config, client };
  return cached;
}

/** The public URL a stored object is served from. */
export function publicUrl(key: string): string {
  const { config } = getR2();
  return `${config.R2_PUBLIC_BASE_URL}/${key}`;
}
