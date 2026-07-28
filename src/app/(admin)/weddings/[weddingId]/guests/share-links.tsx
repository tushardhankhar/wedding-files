"use client";

import { useActionState, useState, useTransition } from "react";
import type { ShareLinkDetail } from "@/modules/guests/types";
import {
  createShareLinkAction,
  regenerateShareLinkAction,
  deleteShareLinkAction,
  setShareLinkAllEventsAction,
  toggleShareLinkEventAction,
  type InviteLinkState,
} from "@/modules/guests/server/actions";
import { shareUrl } from "@/modules/guests/share-url";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

interface EventLite {
  id: string;
  name: string;
}

function LinkBox({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const wa = `https://wa.me/?text=${encodeURIComponent(
    `You're invited to our celebrations 🎉 View & RSVP: ${url}`
  )}`;
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input readOnly value={url} className="font-mono text-xs" />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={async () => {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <a
        href={wa}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-primary hover:underline"
      >
        Share via WhatsApp →
      </a>
    </div>
  );
}

function ShareLinkCard({
  link,
  weddingId,
  slug,
  events,
}: {
  link: ShareLinkDetail;
  weddingId: string;
  slug: string;
  events: EventLite[];
}) {
  const [pending, startTransition] = useTransition();
  // One transition covers every button on the card, so remember which one was
  // pressed — otherwise a spinner would appear on all of them at once. Only
  // meaningful while `pending`, so it never needs clearing.
  const [busy, setBusy] = useState<"link" | "delete" | null>(null);
  const spinning = (kind: typeof busy) => pending && busy === kind;
  const [allEvents, setAllEvents] = useState(link.allEvents);
  const [chosen, setChosen] = useState<Set<string>>(
    () => new Set(link.eventIds)
  );
  // Show the saved link straight away; regenerating replaces it in place.
  const [url, setUrl] = useState<string | null>(
    link.token ? shareUrl(slug, link.token) : null
  );

  function toggleAll(next: boolean) {
    setAllEvents(next);
    startTransition(() => {
      void setShareLinkAllEventsAction(link.id, weddingId, next);
    });
  }
  function toggleEvent(id: string, on: boolean) {
    setChosen((prev) => {
      const s = new Set(prev);
      if (on) s.add(id);
      else s.delete(id);
      return s;
    });
    startTransition(() => {
      void toggleShareLinkEventAction(link.id, id, weddingId, on);
    });
  }
  function getLink() {
    if (
      url &&
      !window.confirm(
        "Regenerate this link? The current link will stop working."
      )
    ) {
      return;
    }
    setBusy("link");
    startTransition(async () => {
      const res = await regenerateShareLinkAction(link.id, weddingId, slug);
      if (res.url) setUrl(res.url);
    });
  }
  function remove() {
    if (!window.confirm(`Delete the "${link.label}" link?`)) return;
    setBusy("delete");
    startTransition(() => {
      void deleteShareLinkAction(link.id, weddingId);
    });
  }

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-heading text-base font-semibold">{link.label}</h3>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={remove}
            disabled={pending}
          >
            {spinning("delete") ? <Spinner /> : null}
            {spinning("delete") ? "Deleting…" : "Delete"}
          </Button>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="size-4"
            checked={allEvents}
            onChange={(e) => toggleAll(e.target.checked)}
          />
          Invite to all events
        </label>

        {!allEvents ? (
          <div className="flex flex-wrap gap-2">
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground">Add events first.</p>
            ) : (
              events.map((e) => {
                const on = chosen.has(e.id);
                return (
                  <button
                    key={e.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleEvent(e.id, !on)}
                    className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                      on
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-[color:var(--gold-line)]"
                    }`}
                  >
                    {on ? "✓ " : ""}
                    {e.name}
                  </button>
                );
              })
            )}
          </div>
        ) : null}

        {url ? (
          <div className="space-y-2">
            <LinkBox url={url} />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={getLink}
              disabled={pending}
            >
              {spinning("link") ? <Spinner /> : null}
              {spinning("link") ? "Regenerating…" : "Regenerate link"}
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={getLink}
            disabled={pending}
          >
            {spinning("link") ? <Spinner /> : null}
            {spinning("link") ? "Creating…" : "Get shareable link"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

const initial: InviteLinkState = {};

export function ShareLinks({
  weddingId,
  slug,
  events,
  links,
}: {
  weddingId: string;
  slug: string;
  events: EventLite[];
  links: ShareLinkDetail[];
}) {
  const [state, create, creating] = useActionState(
    createShareLinkAction.bind(null, weddingId, slug),
    initial
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-3 pt-6">
          <form
            key={links.length}
            action={create}
            className="flex flex-col gap-2 sm:flex-row"
          >
            <Input
              name="label"
              required
              maxLength={80}
              placeholder="Link name — e.g. Reception guests"
              className="flex-1"
            />
            <Button type="submit" disabled={creating}>
              {creating ? <Spinner /> : null}
              {creating ? "Creating…" : "Create link"}
            </Button>
          </form>
          {state.error ? (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          ) : null}
          {state.url ? <LinkBox url={state.url} /> : null}
        </CardContent>
      </Card>

      {links.map((link) => (
        <ShareLinkCard
          key={link.id}
          link={link}
          weddingId={weddingId}
          slug={slug}
          events={events}
        />
      ))}
    </div>
  );
}
