import { redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/auth/server/user";
import { InvitationShell } from "@/components/brand/invitation-shell";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  // Already signed in → skip the login screen.
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <InvitationShell
      title="UTSAV"
      subtitle="Sign in to craft and manage your celebrations."
      footer="Invited by your planner? Open your link to set up your account."
    >
      <LoginForm />
    </InvitationShell>
  );
}
