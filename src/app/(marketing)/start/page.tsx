import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/auth/server/user";
import { listWeddings } from "@/modules/weddings/server/queries";
import { getLatestSignup } from "@/modules/self-serve/server/queries";
import { InvitationShell } from "@/components/brand/invitation-shell";
import { PRICE_LABEL } from "@/modules/self-serve/pricing";
import { SignupForm } from "./signup-form";
import { Wizard } from "./wizard";

export const metadata: Metadata = {
  title: `Create your invitation · ${PRICE_LABEL} · Join the Jashn`,
  description:
    "Pick a theme, add your details, and share a private invitation link with every family — live in minutes.",
};

/**
 * The self-serve entry point: the first step of
 * sign up → pick a theme → add details → pay → share.
 *
 * It sits in the `(marketing)` route group on purpose. That group's layout is
 * the single tag layer, so the paid funnel is measurable end-to-end without
 * extra wiring — and unlike the private routes deliberately kept out of it, the
 * path `/start` identifies no couple and no guest list.
 */
export default async function StartPage() {
  const user = await getCurrentUser();

  // Already has an invitation (client) or is a planner — nothing to buy here.
  if (user && (await listWeddings()).length > 0) redirect("/dashboard");

  const signup = user ? await getLatestSignup() : null;

  // Paid, but no invitation to redirect to — activation got as far as taking
  // the money and no further. Showing the wizard here would invite a second
  // payment for something already bought, so it says so plainly instead.
  const stalled = signup?.status === "paid" && !signup.weddingId;

  return (
    <>
      <Link
        href="/"
        className="fixed left-4 top-4 z-50 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/20 px-4 py-2 text-xs font-medium text-white/85 backdrop-blur-sm transition-colors hover:border-white/50 hover:text-white"
      >
        ← Back to home
      </Link>

      {user && stalled ? (
        <InvitationShell
          title="JASHN"
          subtitle="Your payment came through."
          footer={`Signed in as ${user.email}`}
        >
          <div className="space-y-3 text-center">
            <p className="text-sm text-muted-foreground">
              We&apos;ve received your payment but haven&apos;t finished building
              your invitation yet. Refresh in a moment — if it still says this,
              message us and we&apos;ll sort it out right away. You will not be
              charged again.
            </p>
            <p className="text-xs text-muted-foreground">
              Reference:{" "}
              <span className="font-mono">{signup?.razorpayPaymentId}</span>
            </p>
          </div>
        </InvitationShell>
      ) : user ? (
        <InvitationShell
          size="lg"
          title="JASHN"
          subtitle="You're in. Let's build your invitation."
          footer={`Signed in as ${user.email}`}
        >
          <Wizard draft={signup?.status === "draft" ? signup : null} />
        </InvitationShell>
      ) : (
        <InvitationShell
          title="JASHN"
          subtitle={`Your own celebration invitation, live in minutes — ${PRICE_LABEL}.`}
          footer="Already have an account? Use the same email and we'll sign you in."
        >
          <SignupForm />
        </InvitationShell>
      )}
    </>
  );
}
