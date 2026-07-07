"use client";

import { useActionState } from "react";
import {
  signInAction,
  signUpAction,
  type AuthFormState,
} from "@/modules/auth/server/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthFormState = {};

export function LoginForm() {
  const [signInState, signIn, signInPending] = useActionState(
    signInAction,
    initialState
  );
  const [signUpState, signUp, signUpPending] = useActionState(
    signUpAction,
    initialState
  );

  const error = signInState.error ?? signUpState.error;
  const message = signUpState.message;
  const pending = signInPending || signUpPending;

  return (
    <form className="space-y-4">
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
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="At least 8 characters"
        />
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="text-sm text-muted-foreground" role="status">
          {message}
        </p>
      ) : null}

      <div className="flex flex-col gap-2 pt-2">
        <Button type="submit" formAction={signIn} disabled={pending}>
          {signInPending ? "Signing in…" : "Sign in"}
        </Button>
        <Button
          type="submit"
          variant="outline"
          formAction={signUp}
          disabled={pending}
        >
          {signUpPending ? "Creating account…" : "Create account"}
        </Button>
      </div>
    </form>
  );
}
