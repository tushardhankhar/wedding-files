"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";

/**
 * Admin/client error boundary. Renders inside the (admin) layout, so the header
 * and sign-out stay available — the planner keeps their bearings and can reach
 * the rest of the dashboard even when one section fails.
 */
export default function AdminError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl space-y-4 py-10 text-center">
      <h1 className="font-heading text-xl font-semibold">
        This page didn&apos;t load
      </h1>
      <p className="text-sm text-muted-foreground">
        Something went wrong fetching your data. Nothing has been lost — try
        again, and if it persists, note the reference below.
      </p>
      <div className="flex justify-center gap-2">
        <Button type="button" onClick={() => unstable_retry()}>
          Try again
        </Button>
        <Link
          href="/dashboard"
          className={buttonVariants({ variant: "outline" })}
        >
          Back to dashboard
        </Link>
      </div>
      {error.digest ? (
        <p className="text-[11px] text-muted-foreground/70">
          Reference: {error.digest}
        </p>
      ) : null}
    </div>
  );
}
