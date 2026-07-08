"use client";

import { useActionState } from "react";
import {
  createGroupAction,
  type FormState,
} from "@/modules/guests/server/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initial: FormState = {};

export function AddGroup({ weddingId }: { weddingId: string }) {
  const [state, action, pending] = useActionState(
    createGroupAction.bind(null, weddingId),
    initial
  );

  return (
    <form action={action} className="flex flex-col gap-2 sm:flex-row">
      <Input
        name="name"
        required
        maxLength={120}
        placeholder="Family / group name — e.g. The Sharma family"
        className="flex-1"
      />
      <Button type="submit" disabled={pending}>
        {pending ? "Adding…" : "Add group"}
      </Button>
      {state.error ? (
        <p className="self-center text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
