"use client";

import { useActionState } from "react";
import {
  requestPasswordResetAction,
  type AuthFormState,
} from "@/modules/auth/server/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthFormState = {};

export function ForgotPasswordForm() {
  const [state, request, pending] = useActionState(
    requestPasswordResetAction,
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

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Sending…" : "Email me a reset link"}
      </Button>
    </form>
  );
}
