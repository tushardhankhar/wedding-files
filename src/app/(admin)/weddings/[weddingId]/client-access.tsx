"use client";

import { useActionState, useState } from "react";
import {
  generateClientInviteAction,
  type GenerateInviteState,
} from "@/modules/client-onboarding/server/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: GenerateInviteState = {};

export function ClientAccess({
  weddingId,
  claimed,
}: {
  weddingId: string;
  claimed: boolean;
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

  const waHref = state.url
    ? `https://wa.me/?text=${encodeURIComponent(
        `You're invited to set up your wedding website: ${state.url}`
      )}`
    : undefined;

  return (
    <div className="space-y-3">
      {claimed ? (
        <p className="text-sm text-muted-foreground">
          A client has already claimed this wedding. Generating a new link lets
          a different person take over management.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Generate a one-time link (valid 30 days) and send it to your client so
          they can set up and manage this wedding.
        </p>
      )}

      <form action={formAction}>
        <Button type="submit" variant="outline" disabled={pending}>
          {pending ? "Generating…" : "Generate client link"}
        </Button>
      </form>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      {state.url ? (
        <div className="space-y-2">
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
              Share via WhatsApp →
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
