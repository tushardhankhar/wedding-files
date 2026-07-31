"use client";

import { Lotus } from "@/components/brand/motifs";

/**
 * Guest-facing error boundary. A guest has no account, no dashboard and no idea
 * what a "wedding id" is — the only useful recovery is retry, then fall back to
 * asking their host. Deliberately mirrors the "A private invitation" screen in
 * w/[slug]/page.tsx so a failure looks like part of the invitation, not a crash.
 *
 * No "go home" link: the marketing site is not where an invited guest wants to
 * land, and their invite link is the only route back in.
 */
export default function GuestError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <main className="flex min-h-svh items-center justify-center p-6 text-center">
      <div className="max-w-sm space-y-3">
        <Lotus className="mx-auto h-10 text-[color:var(--gold-deep)]" />
        <h1 className="font-heading text-2xl font-semibold">
          We couldn&apos;t load this invitation
        </h1>
        <p className="text-sm text-muted-foreground">
          Something went wrong at our end — your invitation is safe. Please try
          again in a moment, or ask your host to resend your link.
        </p>
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="mt-1 rounded-full bg-[color:var(--gold-deep)] px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Try again
        </button>
        {error.digest ? (
          <p className="pt-2 text-[11px] text-muted-foreground/70">
            Reference: {error.digest}
          </p>
        ) : null}
      </div>
    </main>
  );
}
