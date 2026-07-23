import Link from "next/link";
import { notFound } from "next/navigation";
import { getWeddingById } from "@/modules/weddings/server/queries";
import { listEvents } from "@/modules/events/server/queries";
import { listWeddingRsvps, listShareRsvps } from "@/modules/rsvp/server/queries";
import { getTheme } from "@/modules/website/themes/registry";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lotus } from "@/components/brand/motifs";

export default async function RsvpsPage({
  params,
}: {
  params: Promise<{ weddingId: string }>;
}) {
  const { weddingId } = await params;
  const wedding = await getWeddingById(weddingId);
  if (!wedding) notFound();
  // Save-the-dates don't collect RSVPs — no report to show.
  if (!getTheme(wedding.themeId).supports.rsvp) notFound();

  const [events, byEvent, directByEvent] = await Promise.all([
    listEvents(weddingId),
    listWeddingRsvps(weddingId),
    listShareRsvps(weddingId),
  ]);

  const totalAttending = Object.values(byEvent).reduce(
    (n, e) => n + e.attending.length,
    0
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href={`/weddings/${weddingId}`}
        className="text-sm text-muted-foreground hover:underline"
      >
        ← {wedding.title}
      </Link>

      <div>
        <p className="mb-1 font-heading text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--gold-deep)]">
          ❁ Responses
        </p>
        <h1 className="text-2xl font-semibold">RSVPs</h1>
        <p className="text-sm text-muted-foreground">
          {totalAttending} attending across all events so far.
        </p>
      </div>

      {events.length === 0 ? (
        <Card className="text-center">
          <CardHeader className="items-center">
            <Lotus className="mx-auto h-10 text-[color:var(--gold-deep)]" />
            <CardTitle>No events yet</CardTitle>
          </CardHeader>
        </Card>
      ) : (
        <ul className="space-y-4">
          {events.map((e) => {
            const r = byEvent[e.id] ?? { attending: [], declined: [] };
            const direct = directByEvent[e.id] ?? [];
            const directHeads = direct.reduce((n, d) => n + d.partySize, 0);
            return (
              <li key={e.id}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-base">
                      <span>{e.name}</span>
                      <span className="font-heading text-sm font-medium text-muted-foreground">
                        {r.attending.length} going · {r.declined.length} declined
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                        Attending
                      </p>
                      {r.attending.length === 0 ? (
                        <p className="text-muted-foreground">No responses yet.</p>
                      ) : (
                        <p>{r.attending.map((g) => g.name).join(", ")}</p>
                      )}
                    </div>
                    {r.declined.length > 0 ? (
                      <div>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-destructive">
                          Can&apos;t make it
                        </p>
                        <p className="text-muted-foreground">
                          {r.declined.map((g) => g.name).join(", ")}
                        </p>
                      </div>
                    ) : null}
                    {direct.length > 0 ? (
                      <div>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[color:var(--gold-deep)]">
                          Direct responses ({directHeads} guest
                          {directHeads === 1 ? "" : "s"})
                        </p>
                        <p className="text-muted-foreground">
                          {direct
                            .map((d) => `${d.name} (${d.partySize})`)
                            .join(", ")}
                        </p>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
