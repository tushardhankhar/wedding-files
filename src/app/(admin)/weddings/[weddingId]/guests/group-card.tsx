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
import { Spinner } from "@/components/ui/spinner";

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
  // The shared transition covers rename, delete and the invite toggles, so
  // remember which button was pressed and only spin that one. Only meaningful
  // while `pending`, so it never needs clearing.
  const [busy, setBusy] = useState<"rename" | "delete" | null>(null);
  const spinning = (kind: typeof busy) => pending && busy === kind;

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

  // ── Invitation PDF — ON HOLD ─────────────────────────────────────────────
  // Paused pending a website-faithful rendering approach. Handler + button are
  // kept (commented) for easy resume; the /api/.../invite-pdf route and
  // modules/website/pdf/* remain but are now unused. To re-enable: uncomment
  // this handler and the button below.
  /*
  const [pdfLoading, setPdfLoading] = useState(false);
  async function downloadPdf() {
    if (!inviteUrl) return;
    setPdfLoading(true);
    setInviteErr(null);
    try {
      const res = await fetch(
        `/api/weddings/${weddingId}/groups/${group.id}/invite-pdf`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inviteUrl }),
        }
      );
      if (!res.ok) throw new Error(String(res.status));
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slug}-invitation.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setInviteErr("Could not generate the PDF. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  }
  */

  const waHref = inviteUrl
    ? `https://wa.me/?text=${encodeURIComponent(
        `You're invited to ${group.name ? "our celebrations" : "our wedding"}! View your invitation & RSVP: ${inviteUrl}`
      )}`
    : undefined;

  // Pre-addressed WhatsApp link to a specific guest (needs the invite link
  // generated + that guest's phone). The message carries the group invite URL.
  function guestWa(g: { name: string; phone: string | null }): string | null {
    const digits = (g.phone ?? "").replace(/[^0-9]/g, "");
    if (!inviteUrl || !digits) return null;
    const text = `Hi ${g.name}! You're invited to ${group.name} 🎉 View your invitation & RSVP: ${inviteUrl}`;
    return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
  }

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
    setBusy("rename");
    startTransition(async () => {
      await renameGroupAction(group.id, weddingId, name.trim());
      setEditing(false);
    });
  }

  function removeGroup() {
    if (!window.confirm(`Delete "${group.name}" and all its guests?`)) return;
    setBusy("delete");
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
                {spinning("rename") ? <Spinner /> : null}
                {spinning("rename") ? "Saving…" : "Save"}
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
                  {spinning("delete") ? <Spinner /> : null}
                  {spinning("delete") ? "Deleting…" : "Delete"}
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Members — optional contacts (for WhatsApp). RSVP is by family
            headcount now, so members aren't required. */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Members <span className="font-normal normal-case">(optional — for WhatsApp invites)</span>
          </p>
          {group.guests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No members yet.</p>
          ) : (
            <ul className="divide-y rounded-lg border">
              {group.guests.map((g) => {
                const wa = guestWa(g);
                return (
                  <li
                    key={g.id}
                    className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                  >
                    <div className="min-w-0 truncate">
                      <span className="font-medium">{g.name}</span>
                      {g.isPrimary ? (
                        <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-primary">
                          Primary
                        </span>
                      ) : null}
                      {g.phone ? (
                        <span className="ml-2 tabular-nums text-muted-foreground">
                          {g.phone}
                        </span>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      {wa ? (
                        <a
                          href={wa}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          WhatsApp →
                        </a>
                      ) : null}
                      <button
                        type="button"
                        aria-label={`Remove ${g.name}`}
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() =>
                          startTransition(() => {
                            void deleteGuestAction(g.id, weddingId);
                          })
                        }
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                );
              })}
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
              placeholder="Guest name"
              className="flex-1"
            />
            <Input
              name="phone"
              maxLength={30}
              placeholder="Phone (optional)"
              className="sm:w-44"
            />
            <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <input type="checkbox" name="isPrimary" className="size-4" />
              Primary
            </label>
            <Button type="submit" variant="outline" size="sm" disabled={addingGuest}>
              {addingGuest ? <Spinner /> : null}
              {addingGuest ? "Adding…" : "Add"}
            </Button>
          </form>
          {group.guests.some((g) => g.phone) && !inviteUrl ? (
            <p className="text-xs text-muted-foreground">
              Generate the invite link below to message guests on WhatsApp.
            </p>
          ) : null}
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
              {generating ? <Spinner /> : null}
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
              {/* "Download PDF ↓" button is ON HOLD — see the commented
                  downloadPdf handler above. */}
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
