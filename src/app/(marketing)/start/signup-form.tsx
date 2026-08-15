"use client";

import { useActionState, useState } from "react";
import {
  startSignupAction,
  verifySignupOtpAction,
} from "@/modules/self-serve/server/auth-actions";
import type { AuthFormState } from "@/modules/auth/server/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

const initialState: AuthFormState = {};

/**
 * Account creation for the self-serve funnel. Structurally the same as
 * `app/login/login-form.tsx` — sibling request/verify forms (forms cannot nest),
 * a controlled email field because React 19 resets uncontrolled inputs once a
 * form action settles — but pointed at the actions that are allowed to CREATE a
 * user, and worded for someone buying rather than returning.
 */
export function SignupForm() {
  const [state, request, pending] = useActionState(
    startSignupAction,
    initialState
  );
  const [verifyState, verify, verifying] = useActionState(
    verifySignupOtpAction,
    initialState
  );

  const [email, setEmail] = useState("");
  const sent = state.sent === true;
  // Verify against the address the code actually went to, not whatever is in the
  // box now — the field stays editable so a typo can be corrected and resent.
  const sentTo = state.email ?? email;

  return (
    <div className="space-y-4">
      <form action={request} className="space-y-4">
        {/* Honeypot — real users leave this blank. */}
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
        />
        <div className="space-y-2">
          <Label htmlFor="email">Your email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            No password to remember — we&apos;ll email you a link and a code.
            This is also where your invitation link is sent.
          </p>
        </div>

        {state.error ? (
          <p className="text-sm text-destructive" role="alert">
            {state.error}
          </p>
        ) : null}

        {!sent ? (
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? <Spinner /> : null}
            {pending ? "Sending…" : "Continue"}
          </Button>
        ) : null}
      </form>

      {sent ? (
        <div
          role="status"
          className="space-y-1 rounded-md border border-[color:var(--gold-line)] bg-[color:var(--accent)] px-3 py-2.5 text-left"
        >
          <p className="font-heading text-sm font-semibold text-[color:var(--gold-deep)]">
            Check your inbox
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            A link and code are on their way to{" "}
            <span className="font-medium text-foreground">{sentTo}</span>. It can
            take a minute — check your spam folder too.
          </p>
        </div>
      ) : null}

      {/* Tap the link OR type the code. The code path matters when the request
          happens on a laptop and the mail is read on a phone. */}
      {sent ? (
        <form action={verify} className="space-y-3">
          <input type="hidden" name="email" value={sentTo} />
          <div className="space-y-2">
            <Label htmlFor="code">Or enter the code from that email</Label>
            <Input
              id="code"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6,10}"
              maxLength={10}
              required
              placeholder="Code from your email"
            />
          </div>

          {verifyState.error ? (
            <p className="text-sm text-destructive" role="alert">
              {verifyState.error}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={verifying}>
            {verifying ? <Spinner /> : null}
            {verifying ? "Verifying…" : "Verify & continue"}
          </Button>
        </form>
      ) : null}

      {/* Its own form so it doesn't nest inside the verify form. Sends to
          whatever the field currently holds, so a typo can be corrected. */}
      {sent ? (
        <form action={request}>
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="hidden"
          />
          <input type="hidden" name="email" value={email} />
          <Button
            type="submit"
            variant="ghost"
            className="w-full"
            disabled={pending}
          >
            {pending ? <Spinner /> : null}
            {pending ? "Sending…" : "Resend the email"}
          </Button>
        </form>
      ) : null}
    </div>
  );
}
