"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  signInAction,
  requestMagicLinkAction,
  type AuthFormState,
} from "@/modules/auth/server/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthFormState = {};

export function LoginForm() {
  const [mode, setMode] = useState<"password" | "magic">("password");

  return mode === "password" ? (
    <PasswordForm onUseMagicLink={() => setMode("magic")} />
  ) : (
    <MagicLinkForm onUsePassword={() => setMode("password")} />
  );
}

function PasswordForm({ onUseMagicLink }: { onUseMagicLink: () => void }) {
  const [state, signIn, pending] = useActionState(signInAction, initialState);

  return (
    <form action={signIn} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/forgot-password"
            className="text-xs text-muted-foreground hover:text-foreground hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="At least 8 characters"
        />
      </div>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="space-y-2 pt-2">
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={onUseMagicLink}
        >
          Email me a sign-in link instead
        </Button>
      </div>
    </form>
  );
}

function MagicLinkForm({ onUsePassword }: { onUsePassword: () => void }) {
  const [state, request, pending] = useActionState(
    requestMagicLinkAction,
    initialState
  );

  return (
    <form action={request} className="space-y-4">
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />
      <div className="space-y-2">
        <Label htmlFor="magic-email">Email</Label>
        <Input
          id="magic-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
        />
        <p className="text-xs text-muted-foreground">
          We&apos;ll email you a link to sign in — no password needed.
        </p>
      </div>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p className="text-sm text-muted-foreground" role="status">
          {state.message}
        </p>
      ) : null}

      <div className="space-y-2 pt-2">
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Sending…" : "Email me a sign-in link"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={onUsePassword}
        >
          Use a password instead
        </Button>
      </div>
    </form>
  );
}
