"use client";

import { useActionState, useState, useTransition } from "react";
import type { GroupDetail } from "@/modules/guests/types";
import {
  renameGroupAction,
  deleteGroupAction,
  addGuestAction,
  deleteGuestAction,
  toggleInviteAction,
  generateInviteLinkAction,
  type FormState,
} from "@/modules/guests/server/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export interface EventLite {
  id: string;
  name: string;
}

const initial: FormState = {};

export function GroupCard({
  group,
  weddingId,
  slug,
  events,
}: {
  group: GroupDetail;
  weddingId: string;
  slug: string;
  events: EventLite[];
}) {
  const [pending, startTransition] = useTransition();

  // Invite link
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [inviteErr, setInviteErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [generating, startGenerate] = useTransition();

  function generateInvite() {
    setInviteErr(null);
    startGenerate(async () => {
      const res = await generateInviteLinkAction(group.id, weddingId, slug);
      if (res.error) setInviteErr(res.error);
      else setInviteUrl(res.url ?? null);
    });
  }

  async function copyInvite() {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const waHref = inviteUrl
    ? `https://wa.me/?text=${encodeURIComponent(
        `You're invited to ${group.name ? "our celebrations" : "our wedding"}! View your invitation & RSVP: ${inviteUrl}`
      )}`
    : undefined;

  // Rename
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(group.name);

  // Invites — optimistic set, reconciled by revalidation.
  const [invited, setInvited] = useState<Set<string>>(
    () => new Set(group.invitedEventIds)
  );

  // Add-guest form
  const [guestState, addGuest, addingGuest] = useActionState(
    addGuestAction.bind(null, group.id, weddingId),
    initial
  );

  function saveName() {
    if (name.trim() === group.name || !name.trim()) {
      setEditing(false);
      return;
    }
    startTransition(async () => {
      await renameGroupAction(group.id, weddingId, name.trim());
      setEditing(false);
    });
  }

  function removeGroup() {
    if (!window.confirm(`Delete "${group.name}" and all its guests?`)) return;
    startTransition(() => {
      void deleteGroupAction(group.id, weddingId);
    });
  }

  function toggleInvite(eventId: string, next: boolean) {
    setInvited((prev) => {
      const s = new Set(prev);
      if (next) s.add(eventId);
      else s.delete(eventId);
      return s;
    });
    startTransition(() => {
      void toggleInviteAction(group.id, eventId, weddingId, next);
    });
  }

  return (
    <Card>
      <CardContent className="space-y-5 pt-6">
        {/* Header: name + actions */}
        <div className="flex items-center justify-between gap-3">
          {editing ? (
            <div className="flex flex-1 gap-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={120}
                autoFocus
              />
              <Button type="button" size="sm" onClick={saveName} disabled={pending}>
                Save
              </Button>
            </div>
          ) : (
            <>
              <h3 className="font-heading text-lg font-semibold">
                {group.name}
              </h3>
              <div className="flex gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditing(true)}
                >
                  Rename
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={removeGroup}
                  disabled={pending}
                >
                  Delete
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Members */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Members
          </p>
          {group.guests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No members yet.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {group.guests.map((g) => (
                <li
                  key={g.id}
                  className="flex items-center gap-1.5 rounded-full border bg-secondary px-3 py-1 text-sm"
                >
                  <span>{g.name}</span>
                  {g.isPrimary ? (
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-primary">
                      Primary
                    </span>
                  ) : null}
                  <button
                    type="button"
                    aria-label={`Remove ${g.name}`}
                    className="ml-0.5 text-muted-foreground hover:text-destructive"
                    onClick={() =>
                      startTransition(() => {
                        void deleteGuestAction(g.id, weddingId);
                      })
                    }
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}

          <form
            key={group.guests.length}
            action={addGuest}
            className="flex flex-col gap-2 sm:flex-row sm:items-center"
          >
            <Input
              name="name"
              required
              maxLength={120}
              placeholder="Add a guest…"
              className="flex-1"
            />
            <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <input type="checkbox" name="isPrimary" className="size-4" />
              Primary contact
            </label>
            <Button type="submit" variant="outline" size="sm" disabled={addingGuest}>
              {addingGuest ? "Adding…" : "Add"}
            </Button>
          </form>
          {guestState.error ? (
            <p className="text-sm text-destructive" role="alert">
              {guestState.error}
            </p>
          ) : null}
        </div>

        {/* Invited events */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Invited to
          </p>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Add events first, then choose which this group is invited to.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {events.map((e) => {
                const on = invited.has(e.id);
                return (
                  <button
                    key={e.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleInvite(e.id, !on)}
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
              })}
            </div>
          )}
        </div>

        {/* Invite link */}
        <div className="space-y-2 border-t pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Invitation link
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={generateInvite}
              disabled={generating}
            >
              {generating
                ? "Generating…"
                : group.hasInvite || inviteUrl
                  ? "Regenerate link"
                  : "Generate invite link"}
            </Button>
            {group.hasInvite && !inviteUrl ? (
              <span className="text-xs text-muted-foreground">
                A link exists. Regenerate to see it again (the old one stops
                working).
              </span>
            ) : null}
          </div>
          {inviteErr ? (
            <p className="text-sm text-destructive" role="alert">
              {inviteErr}
            </p>
          ) : null}
          {inviteUrl ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input readOnly value={inviteUrl} className="font-mono text-xs" />
                <Button type="button" variant="secondary" size="sm" onClick={copyInvite}>
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
      </CardContent>
    </Card>
  );
}
