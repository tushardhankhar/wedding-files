import { InvitationShell } from "@/components/brand/invitation-shell";
import { getCurrentUser } from "@/modules/auth/server/user";
import { ResetPasswordForm } from "./reset-password-form";

export default async function ResetPasswordPage() {
  // Reached via the recovery link, which /auth/callback turns into a session.
  // If there's no session the link was invalid or expired.
  const user = await getCurrentUser();

  return (
    <InvitationShell
      title="JASHN"
      subtitle="Choose a new password."
      footer="You'll use this to sign in from now on."
    >
      <ResetPasswordForm hasSession={user !== null} />
    </InvitationShell>
  );
}
