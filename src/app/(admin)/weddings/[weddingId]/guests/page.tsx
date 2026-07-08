import Link from "next/link";
import { notFound } from "next/navigation";
import { getWeddingById } from "@/modules/weddings/server/queries";
import { listEvents } from "@/modules/events/server/queries";
import { listGroups } from "@/modules/guests/server/queries";
import { Card, CardHeader } from "@/components/ui/card";
import { Lotus } from "@/components/brand/motifs";
import { AddGroup } from "./add-group";
import { GroupCard } from "./group-card";

export default async function GuestsPage({
  params,
}: {
  params: Promise<{ weddingId: string }>;
}) {
  const { weddingId } = await params;
  const wedding = await getWeddingById(weddingId);
  if (!wedding) notFound();

  const [events, groups] = await Promise.all([
    listEvents(weddingId),
    listGroups(weddingId),
  ]);
  const eventLite = events.map((e) => ({ id: e.id, name: e.name }));
  const guestCount = groups.reduce((n, g) => n + g.guests.length, 0);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href={`/weddings/${weddingId}`}
          className="text-sm text-muted-foreground hover:underline"
        >
          ← {wedding.title}
        </Link>
        <span className="text-sm text-muted-foreground">
          {groups.length} {groups.length === 1 ? "group" : "groups"} ·{" "}
          {guestCount} {guestCount === 1 ? "guest" : "guests"}
        </span>
      </div>

      <div>
        <p className="mb-1 font-heading text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--gold-deep)]">
          ❁ Guest list
        </p>
        <h1 className="text-2xl font-semibold">Groups &amp; guests</h1>
        <p className="text-sm text-muted-foreground">
          Create a group per family, add its members, and choose which events
          each group is invited to.
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
    </div>
  );
}
