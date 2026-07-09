import { InvitationShell } from "@/components/brand/invitation-shell";
import { ClaimForm } from "./claim-form";

export default async function ClaimPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <InvitationShell
      title="JASHN"
      subtitle="Set up your account to start managing your wedding."
      footer="You'll use this email and password to sign in later."
    >
      <ClaimForm token={token} />
    </InvitationShell>
  );
}
