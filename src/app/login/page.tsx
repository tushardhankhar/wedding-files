import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/auth/server/user";
import { InvitationShell } from "@/components/brand/invitation-shell";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in · Join the Jashn",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  // Already signed in → skip the login screen.
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  const { error } = await searchParams;

  return (
    <>
      <Link
        href="/"
        className="fixed left-4 top-4 z-50 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/20 px-4 py-2 text-xs font-medium text-white/85 backdrop-blur-sm transition-colors hover:border-white/50 hover:text-white"
      >
        ← Back to home
      </Link>
      <InvitationShell
        title="JASHN"
        subtitle="Sign in to craft and manage your celebrations."
        footer="Invited by your planner? Open your link to set up your account."
      >
        {error === "auth" ? (
          <p className="mb-4 text-sm text-destructive" role="alert">
            That sign-in link was invalid or has expired. Please try again.
          </p>
        ) : null}
        <LoginForm />
      </InvitationShell>
    </>
  );
}
