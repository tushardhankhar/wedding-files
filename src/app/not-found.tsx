import type { Metadata } from "next";
import Link from "next/link";
import { Lotus } from "@/components/brand/motifs";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found · Join the Jashn",
  robots: { index: false, follow: false },
};

/**
 * Custom 404. Also what a guest sees if they mistype a slug, so the copy avoids
 * assuming the visitor is a customer.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6 text-center">
      <div className="max-w-sm space-y-3">
        <Lotus className="mx-auto h-10 text-[color:var(--gold-deep)]" />
        <h1 className="font-heading text-2xl font-semibold">
          This page doesn&apos;t exist
        </h1>
        <p className="text-sm text-muted-foreground">
          The link may be mistyped or no longer active. If you were sent an
          invitation, please open the link your host shared with you.
        </p>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Go to Join the Jashn
        </Link>
      </div>
    </main>
  );
}
