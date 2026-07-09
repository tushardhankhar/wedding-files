import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/auth/server/user";
import { InvitationShell } from "@/components/brand/invitation-shell";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  // Already signed in → skip the login screen.
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <>
      <Link
        href="/"
        className="fixed left-4 top-4 z-50 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/20 px-4 py-2 text-xs font-medium text-white/85 backdrop-blur-sm transition-colors hover:border-white/50 hover:text-white"
      >
        ← Back to home
      </Link>
      <InvitationShell
        title="UTSAV"
        subtitle="Sign in to craft and manage your celebrations."
        footer="Invited by your planner? Open your link to set up your account."
      >
        <LoginForm />
      </InvitationShell>
    </>
  );
}
