"use client";

import { useActionState, useState } from "react";
import {
  requestMagicLinkAction,
  verifyLoginOtpAction,
  type AuthFormState,
} from "@/modules/auth/server/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

const initialState: AuthFormState = {};

export function LoginForm() {
  const [state, request, pending] = useActionState(
    requestMagicLinkAction,
    initialState
  );

  const [verifyState, verify, verifying] = useActionState(
    verifyLoginOtpAction,
    initialState
  );

  // Controlled on purpose: React 19 resets UNCONTROLLED fields once a form
  // action settles, which wiped the address the moment the link was sent and
  // left the screen looking like nothing had happened.
  const [email, setEmail] = useState("");

  const sent = state.sent === true;
  // Verify against the address the code actually went to, not whatever is in
  // the box now — the field stays editable so it can be corrected and resent.
  const sentTo = state.email ?? email;

  return (
    <div className="space-y-4">
      {/* Request the link/code. Sibling forms below — forms cannot nest. */}
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
          <Label htmlFor="email">Email</Label>
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
            We&apos;ll email you a sign-in link and a code — no password needed.
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
            {pending ? "Sending…" : "Email me a sign-in link"}
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
            If an account exists for{" "}
            <span className="font-medium text-foreground">{sentTo}</span>, a
            sign-in link and code are on their way. It can take a minute — check
            your spam folder too.
          </p>
        </div>
      ) : null}

      {/* Tap the link OR type the code. The code path matters when the request
          happens on one device and the mail is read on another. */}
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
            {verifying ? "Signing in…" : "Sign in"}
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
            {pending ? "Sending…" : "Resend sign-in link"}
          </Button>
        </form>
      ) : null}
    </div>
  );
}
