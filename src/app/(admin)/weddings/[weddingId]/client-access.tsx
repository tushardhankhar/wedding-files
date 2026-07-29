"use client";

import { useActionState, useState } from "react";
import {
  generateClientInviteAction,
  revokeClientInviteAction,
  type GenerateInviteState,
  type RevokeInviteState,
} from "@/modules/client-onboarding/server/actions";
import type { WeddingAdminMeta } from "@/modules/weddings/server/admin-queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

const initialState: GenerateInviteState = {};
const initialRevoke: RevokeInviteState = {};

function expiryLabel(iso: string | null): string | null {
  if (!iso) return null;
  const days = Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
  if (days <= 0) return "expires today";
  if (days === 1) return "expires in 1 day";
  return `expires in ${days} days`;
}

export function ClientAccess({
  weddingId,
  claimed,
  occasion,
  clientPhone,
  meta,
}: {
  weddingId: string;
  claimed: boolean;
  /** Lowercase occasion noun for copy, e.g. "wedding", "baby shower". */
  occasion: string;
  /** Planner's contact number for the client — addresses the WhatsApp link. */
  clientPhone?: string | null;
  meta?: WeddingAdminMeta;
}) {
  const action = generateClientInviteAction.bind(null, weddingId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!state.url) return;
    await navigator.clipboard.writeText(state.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  // Pre-addressed to the client's number when we have one, so the planner skips
  // WhatsApp's contact picker; falls back to "choose a contact" without it.
  const phoneDigits = (clientPhone ?? "").replace(/[^0-9]/g, "");
  const waHref = state.url
    ? `https://wa.me/${phoneDigits}?text=${encodeURIComponent(
        `You're invited to set up your ${occasion} website: ${state.url}`
      )}`
    : undefined;

  const status = meta?.inviteStatus ?? (claimed ? "active" : "none");

  return (
    <div className="space-y-3">
      <InviteStatusSummary weddingId={weddingId} status={status} meta={meta} />

      {clientPhone ? (
        <p className="text-sm text-muted-foreground">
          Contact number:{" "}
          <span className="font-medium text-foreground">{clientPhone}</span>
          {phoneDigits ? (
            <>
              {" · "}
              <a
                href={`https://wa.me/${phoneDigits}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                WhatsApp
              </a>
            </>
          ) : null}
        </p>
      ) : null}

      {status === "active" || status === "accepted" ? (
        <p className="text-sm text-muted-foreground">
          Generating a new link lets a different person take over management.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Enter your client&apos;s email and we&apos;ll send them a one-time link
          (valid 30 days). It can only be claimed from that email address.
        </p>
      )}

      <form action={formAction} className="space-y-2">
        <input type="hidden" name="occasion" value={occasion} />
        <Input
          type="email"
          name="email"
          required
          placeholder="client@email.com"
          autoComplete="off"
          aria-label="Client email address"
        />
        <Button type="submit" variant="outline" disabled={pending}>
          {pending ? <Spinner /> : null}
          {pending ? "Generating…" : "Generate & email link"}
        </Button>
      </form>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      {state.url ? (
        <div className="space-y-2">
          {state.email ? (
            <p className="text-sm text-muted-foreground">
              {state.emailSent ? (
                <>
                  Invite emailed to{" "}
                  <span className="font-medium text-foreground">
                    {state.email}
                  </span>
                  . You can also share the link directly:
                </>
              ) : (
                <>
                  Invite for{" "}
                  <span className="font-medium text-foreground">
                    {state.email}
                  </span>{" "}
                  — couldn&apos;t email automatically, so send them this link:
                </>
              )}
            </p>
          ) : null}
          <div className="flex gap-2">
            <Input readOnly value={state.url} className="font-mono text-xs" />
            <Button type="button" variant="secondary" onClick={copy}>
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          {waHref ? (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              {phoneDigits ? `Share via WhatsApp to ${clientPhone} →` : "Share via WhatsApp →"}
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function InviteStatusSummary({
  weddingId,
  status,
  meta,
}: {
  weddingId: string;
  status: string;
  meta?: WeddingAdminMeta;
}) {
  if (status === "active" || status === "accepted") {
    return (
      <p className="rounded-md bg-emerald-600/10 px-3 py-2 text-sm text-emerald-700">
        Managed by{" "}
        <span className="font-medium">{meta?.clientEmail ?? "the client"}</span>
      </p>
    );
  }

  if (status === "pending") {
    const exp = expiryLabel(meta?.inviteExpiresAt ?? null);
    return (
      <div className="space-y-2 rounded-md bg-[color:var(--accent)] px-3 py-2 text-sm text-[color:var(--gold-deep)]">
        <p>
          Invite sent to{" "}
          <span className="font-medium">
            {meta?.invitedEmail ?? "the client"}
          </span>
          {exp ? ` · ${exp}` : ""} — not claimed yet.
        </p>
        <RevokeButton weddingId={weddingId} />
      </div>
    );
  }

  if (status === "expired") {
    return (
      <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
        The last invite to{" "}
        <span className="font-medium">{meta?.invitedEmail ?? "the client"}</span>{" "}
        expired. Generate a new one below.
      </p>
    );
  }

  return null;
}

function RevokeButton({ weddingId }: { weddingId: string }) {
  const action = revokeClientInviteAction.bind(null, weddingId);
  const [state, formAction, pending] = useActionState(action, initialRevoke);

  if (state.revoked) {
    return <p className="text-xs text-muted-foreground">Invite revoked.</p>;
  }

  return (
    <form action={formAction}>
      <Button type="submit" variant="ghost" size="sm" disabled={pending}>
        {pending ? <Spinner /> : null}
        {pending ? "Revoking…" : "Revoke invite"}
      </Button>
      {state.error ? (
        <p className="mt-1 text-xs text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
