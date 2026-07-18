"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  requestClaimOtpAction,
  verifyClaimOtpAction,
  finalizeClaimAction,
  claimSignOutAction,
  type ClaimState,
} from "@/modules/client-onboarding/server/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type ClaimStatus = "ok" | "invalid" | "expired" | "accepted" | "legacy";

const initialState: ClaimState = {};

export function ClaimFlow({
  token,
  status,
  maskedEmail,
  signedInEmail,
  matches,
}: {
  token: string;
  status: ClaimStatus;
  maskedEmail: string | null;
  signedInEmail: string | null;
  matches: boolean;
}) {
  if (status !== "ok") {
    return <ClaimNotice status={status} />;
  }

  // Signed in as someone other than the invited person → offer a clean switch.
  if (signedInEmail && !matches) {
    return (
      <WrongEmail
        token={token}
        signedInEmail={signedInEmail}
        maskedEmail={maskedEmail}
      />
    );
  }

  // Signed in as the invited person → one click to finish.
  if (signedInEmail && matches) {
    return <FinishSetup token={token} signedInEmail={signedInEmail} />;
  }

  // Not signed in → email a one-time code to the invited address.
  return <OtpFlow token={token} maskedEmail={maskedEmail} />;
}

function ClaimNotice({ status }: { status: ClaimStatus }) {
  const copy: Record<Exclude<ClaimStatus, "ok">, string> = {
    invalid:
      "This invite link isn't valid. Please ask your planner for a fresh link.",
    expired:
      "This invite link has expired. Please ask your planner to send a new one.",
    accepted:
      "This invite has already been used. If it was you, just sign in.",
    legacy:
      "This invite needs to be reissued. Please ask your planner for a fresh link.",
  };
  return (
    <div className="space-y-4 text-center">
      <p className="text-sm text-muted-foreground">
        {copy[status as Exclude<ClaimStatus, "ok">]}
      </p>
      <Link
        href="/login"
        className={cn(buttonVariants({ variant: "outline" }), "w-full")}
      >
        Go to sign in
      </Link>
    </div>
  );
}

function OtpFlow({
  token,
  maskedEmail,
}: {
  token: string;
  maskedEmail: string | null;
}) {
  const [reqState, requestAction, requesting] = useActionState(
    requestClaimOtpAction.bind(null, token),
    initialState
  );
  const [verState, verifyAction, verifying] = useActionState(
    verifyClaimOtpAction.bind(null, token),
    initialState
  );

  const codeSent = reqState.sent === true;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        This invite is for{" "}
        <span className="font-medium text-foreground">
          {maskedEmail ?? "your email"}
        </span>
        . We&apos;ll email a 6-digit code there to confirm it&apos;s you.
      </p>

      {!codeSent ? (
        <form action={requestAction} className="space-y-3">
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="hidden"
          />
          {reqState.error ? (
            <p className="text-sm text-destructive" role="alert">
              {reqState.error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={requesting}>
            {requesting ? "Sending…" : "Email me a sign-in code"}
          </Button>
        </form>
      ) : (
        <div className="space-y-3">
          <form action={verifyAction} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="code">6-digit code</Label>
              <Input
                id="code"
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="\d{6}"
                maxLength={6}
                required
                placeholder="123456"
              />
              <p className="text-xs text-muted-foreground" role="status">
                {reqState.message}
              </p>
            </div>

            {verState.error ? (
              <p className="text-sm text-destructive" role="alert">
                {verState.error}
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={verifying}>
              {verifying ? "Verifying…" : "Finish setup"}
            </Button>
          </form>

          {/* Separate form so it isn't nested inside the verify form. */}
          <FormButton
            action={requestAction}
            pending={requesting}
            className="w-full"
            variant="ghost"
          >
            {requesting ? "Sending…" : "Resend code"}
          </FormButton>
        </div>
      )}
    </div>
  );
}

function FinishSetup({
  token,
  signedInEmail,
}: {
  token: string;
  signedInEmail: string;
}) {
  const [state, action, pending] = useActionState(
    finalizeClaimAction.bind(null, token),
    initialState
  );
  return (
    <form action={action} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        You&apos;re signed in as{" "}
        <span className="font-medium text-foreground">{signedInEmail}</span>.
        Finish setting up your access to this invitation.
      </p>
      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Finishing…" : "Finish setup"}
      </Button>
    </form>
  );
}

function WrongEmail({
  token,
  signedInEmail,
  maskedEmail,
}: {
  token: string;
  signedInEmail: string;
  maskedEmail: string | null;
}) {
  const signOut = claimSignOutAction.bind(null, token);
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        You&apos;re signed in as{" "}
        <span className="font-medium text-foreground">{signedInEmail}</span>,
        but this invite is for{" "}
        <span className="font-medium text-foreground">
          {maskedEmail ?? "a different email"}
        </span>
        . Sign out to continue as the invited person.
      </p>
      <form action={signOut}>
        <Button type="submit" variant="outline" className="w-full">
          Sign out &amp; continue
        </Button>
      </form>
    </div>
  );
}

/**
 * A submit button bound to a specific form action, used for the secondary
 * "Resend code" action inside the verify step.
 */
function FormButton({
  action,
  pending,
  children,
  className,
  variant,
}: {
  action: (formData: FormData) => void;
  pending: boolean;
  children: React.ReactNode;
  className?: string;
  variant?: "ghost" | "outline" | "secondary";
}) {
  return (
    <form action={action}>
      <Button
        type="submit"
        variant={variant}
        className={className}
        disabled={pending}
      >
        {children}
      </Button>
    </form>
  );
}
