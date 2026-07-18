"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  updatePasswordAction,
  type AuthFormState,
} from "@/modules/auth/server/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const initialState: AuthFormState = {};

export function ResetPasswordForm({ hasSession }: { hasSession: boolean }) {
  const [state, update, pending] = useActionState(
    updatePasswordAction,
    initialState
  );

  if (!hasSession) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">
          This reset link is invalid or has expired. Request a new one from the
          sign-in page.
        </p>
        <Link
          href="/forgot-password"
          className={cn(buttonVariants({ variant: "outline" }), "w-full")}
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <form action={update} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          placeholder="At least 8 characters"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm">Confirm password</Label>
        <Input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          placeholder="Re-enter your password"
        />
      </div>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Saving…" : "Save new password"}
      </Button>
    </form>
  );
}
