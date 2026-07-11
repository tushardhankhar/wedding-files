import Link from "next/link";
import { notFound } from "next/navigation";
import { getWeddingById } from "@/modules/weddings/server/queries";
import { listEvents } from "@/modules/events/server/queries";
import { createEventAction } from "@/modules/events/server/actions";
import { getTheme } from "@/modules/website/themes/registry";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lotus } from "@/components/brand/motifs";
import { EventForm } from "./event-form";
import { EventRow } from "./event-row";

export default async function EventsPage({
  params,
}: {
  params: Promise<{ weddingId: string }>;
}) {
  const { weddingId } = await params;
  const wedding = await getWeddingById(weddingId);
  if (!wedding) notFound();
  // Themes like Save the Date have no events — the section is hidden and the
  // route is unreachable, matching the registry's `supports.events` flag.
  if (!getTheme(wedding.themeId).supports.events) notFound();

  const events = await listEvents(weddingId);

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
          {events.length} {events.length === 1 ? "event" : "events"}
        </span>
      </div>

      <div>
        <p className="mb-1 font-heading text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--gold-deep)]">
          ❁ Celebrations
        </p>
        <h1 className="text-2xl font-semibold">Events</h1>
        <p className="text-sm text-muted-foreground">
          Add every function — Haldi, Mehendi, Sangeet, the wedding, reception —
          in the order they happen.
        </p>
      </div>

      {events.length === 0 ? (
        <Card className="text-center duration-500 animate-in fade-in zoom-in-95">
          <CardHeader className="items-center">
            <Lotus className="mx-auto h-10 text-[color:var(--gold-deep)]" />
            <CardTitle className="mt-2">No events yet</CardTitle>
            <CardDescription>
              Add your first celebration below. You can add as many as you like.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <ul className="space-y-3">
          {events.map((e, i) => (
            <li
              key={`${e.id}-${e.updatedAt}`}
              className="duration-500 animate-in fade-in slide-in-from-bottom-3"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <EventRow event={e} weddingId={weddingId} />
            </li>
          ))}
        </ul>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add an event</CardTitle>
          <CardDescription>
            Only the name is required — fill in the rest whenever you have it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Keyed by event count so the form clears after each successful add. */}
          <EventForm
            key={events.length}
            action={createEventAction.bind(null, weddingId)}
            submitLabel="Add event"
          />
        </CardContent>
      </Card>
    </div>
  );
}
