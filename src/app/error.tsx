"use client";

import Link from "next/link";
import { Lotus } from "@/components/brand/motifs";
import { Button, buttonVariants } from "@/components/ui/button";

/**
 * App-level error boundary — covers the marketing pages, demos, login and the
 * claim flow. The (admin) and (guest) groups have their own so the tone and
 * recovery action fit the audience.
 */
export default function AppError({
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
          Something went wrong
        </h1>
        <p className="text-sm text-muted-foreground">
          We hit an unexpected problem. Please try again — if it keeps
          happening, email us at hello@jointhejashn.com.
        </p>
        <div className="flex justify-center gap-2 pt-1">
          <Button type="button" onClick={() => unstable_retry()}>
            Try again
          </Button>
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            Go home
          </Link>
        </div>
        {error.digest ? (
          <p className="pt-2 text-[11px] text-muted-foreground/70">
            Reference: {error.digest}
          </p>
        ) : null}
      </div>
    </main>
  );
}
