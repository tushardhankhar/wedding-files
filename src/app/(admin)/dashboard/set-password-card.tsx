"use client";

import { useActionState, useState } from "react";
import {
  setOwnPasswordAction,
  type AuthFormState,
} from "@/modules/auth/server/actions";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthFormState = {};

/**
 * Optional convenience for clients who signed in passwordlessly (magic link /
 * OTP) and want a password too. Collapsed by default so it stays out of the way.
 */
export function SetPasswordCard() {
  const [open, setOpen] = useState(false);
  const [state, setPassword, pending] = useActionState(
    setOwnPasswordAction,
    initialState
  );

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Set a password</h2>
            <p className="text-sm text-muted-foreground">
              Optional — you can always sign in with an email link instead.
            </p>
          </div>
          {!open ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(true)}
            >
              Set password
            </Button>
          ) : null}
        </div>

        {open ? (
          <form action={setPassword} className="mt-4 space-y-3">
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
            {state.message ? (
              <p className="text-sm text-emerald-700" role="status">
                {state.message}
              </p>
            ) : null}

            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save password"}
            </Button>
          </form>
        ) : null}
      </CardHeader>
    </Card>
  );
}
