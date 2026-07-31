import type { Metadata } from "next";
import { InvitationShell } from "@/components/brand/invitation-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/modules/auth/server/user";
import { ClaimFlow, type ClaimStatus } from "./claim-form";

type ClaimStateRow = {
  masked_email: string | null;
  expired: boolean;
  accepted: boolean;
  bound: boolean;
  matches_viewer: boolean;
};

// A one-time, email-bound bearer link — must never be indexed or followed.
export const metadata: Metadata = {
  title: "Set up your invitation · Join the Jashn",
  robots: { index: false, follow: false },
};

export default async function ClaimPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const supabase = await createSupabaseServerClient();
  const [{ data: rows }, user] = await Promise.all([
    supabase.rpc("get_claim_state", { p_token: token }),
    getCurrentUser(),
  ]);

  const row: ClaimStateRow | null =
    Array.isArray(rows) && rows.length ? (rows[0] as ClaimStateRow) : null;

  let status: ClaimStatus;
  if (!row) status = "invalid";
  else if (row.accepted) status = "accepted";
  else if (row.expired) status = "expired";
  else if (!row.bound) status = "legacy";
  else status = "ok";

  return (
    <InvitationShell
      title="JASHN"
      subtitle="Set up your access to manage your invitation."
      footer="No password needed — we sign you in with a one-time email code."
    >
      <ClaimFlow
        token={token}
        status={status}
        maskedEmail={row?.masked_email ?? null}
        signedInEmail={user?.email ?? null}
        matches={row?.matches_viewer ?? false}
      />
    </InvitationShell>
  );
}
