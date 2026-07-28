import { notFound } from "next/navigation";
import { getWeddingById } from "@/modules/weddings/server/queries";
import { listEvents } from "@/modules/events/server/queries";
import { listGroups, listShareLinks } from "@/modules/guests/server/queries";
import { getTheme } from "@/modules/website/themes/registry";
import { Card, CardHeader } from "@/components/ui/card";
import { Lotus } from "@/components/brand/motifs";
import { AddGroup } from "./add-group";
import { GroupCard } from "./group-card";
import { ShareLinks } from "./share-links";
import { NavLink } from "@/components/brand/nav-link";

export default async function GuestsPage({
  params,
}: {
  params: Promise<{ weddingId: string }>;
}) {
  const { weddingId } = await params;
  const wedding = await getWeddingById(weddingId);
  if (!wedding) notFound();

  const [events, groups, shareLinks] = await Promise.all([
    listEvents(weddingId),
    listGroups(weddingId),
    listShareLinks(weddingId),
  ]);
  const eventLite = events.map((e) => ({ id: e.id, name: e.name }));
  const guestCount = groups.reduce((n, g) => n + g.guests.length, 0);
  // Save-the-dates don't collect RSVPs — no per-guest groups, no headcount.
  const collectsRsvp = getTheme(wedding.themeId).supports.rsvp;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <NavLink
          href={`/weddings/${weddingId}`}
          className="text-sm text-muted-foreground hover:underline"
        >
          ← {wedding.title}
        </NavLink>
        {collectsRsvp ? (
          <span className="text-sm text-muted-foreground">
            {groups.length} {groups.length === 1 ? "group" : "groups"} ·{" "}
            {guestCount} {guestCount === 1 ? "guest" : "guests"}
          </span>
        ) : null}
      </div>

      <div>
        <p className="mb-1 font-heading text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--gold-deep)]">
          ❁ Invitations
        </p>
        <h1 className="text-2xl font-semibold">Shareable links</h1>
        {collectsRsvp ? (
          <p className="text-sm text-muted-foreground">
            Create a broadcast link scoped to all events or a chosen few —
            anyone with it can view and RSVP with their name and headcount. No
            guest list needed.
          </p>
        ) : null}
      </div>

      <ShareLinks
        weddingId={weddingId}
        slug={wedding.slug}
        events={eventLite}
        links={shareLinks}
      />

      {/* Personal invites carry per-person RSVP — omitted for save-the-dates. */}
      {collectsRsvp ? (
        <>
          <div className="pt-4">
            <h2 className="text-lg font-semibold">Personal invites (optional)</h2>
            <p className="text-sm text-muted-foreground">
              Per-family links with each member listed and per-person RSVP.
            </p>
          </div>

          <Card>
            <CardHeader>
              <AddGroup weddingId={weddingId} />
            </CardHeader>
          </Card>

          {groups.length === 0 ? (
            <Card className="text-center duration-500 animate-in fade-in zoom-in-95">
              <CardHeader className="items-center">
                <Lotus className="mx-auto h-10 text-[color:var(--gold-deep)]" />
                <h2 className="mt-2 text-lg font-semibold">No groups yet</h2>
                <p className="text-sm text-muted-foreground">
                  Add your first family or group above.
                </p>
              </CardHeader>
            </Card>
          ) : (
            <ul className="space-y-4">
              {groups.map((g, i) => (
                <li
                  key={g.id}
                  className="duration-500 animate-in fade-in slide-in-from-bottom-3"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <GroupCard
                    group={g}
                    weddingId={weddingId}
                    slug={wedding.slug}
                    events={eventLite}
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      ) : null}
    </div>
  );
}
