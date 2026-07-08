import { loadGuestSite } from "@/modules/guest-access/server/guest-site";

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Phase 6 shows a minimal gated landing that proves the session + event
// authorization work. Phase 7 replaces this with the full themed WebsiteView.
export default async function GuestHome({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ invalid?: string }>;
}) {
  const { slug } = await params;
  const { invalid } = await searchParams;
  const data = await loadGuestSite(slug);

  if (!data) {
    return (
      <main className="flex min-h-svh items-center justify-center p-6 text-center">
        <div className="max-w-sm space-y-3">
          <h1 className="font-heading text-2xl font-semibold">
            A private invitation
          </h1>
          <p className="text-sm text-muted-foreground">
            {invalid
              ? "That invitation link is invalid or has expired. Please ask your host for a fresh link."
              : "Please open the personal invitation link you were sent to view this wedding."}
          </p>
        </div>
      </main>
    );
  }

  const { groupName, wedding, events } = data;
  const names =
    wedding.partnerOneName && wedding.partnerTwoName
      ? `${wedding.partnerOneName} & ${wedding.partnerTwoName}`
      : wedding.title;

  return (
    <main className="mx-auto max-w-xl space-y-6 p-6 py-12">
      <div className="text-center">
        <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--gold-deep)]">
          Welcome, {groupName}
        </p>
        <h1 className="mt-1 font-heading text-3xl font-semibold">{names}</h1>
        {wedding.eventDate ? (
          <p className="text-sm text-muted-foreground">
            {formatDate(wedding.eventDate)}
          </p>
        ) : null}
      </div>

      <div className="space-y-3">
        <h2 className="font-heading text-lg font-semibold">
          You&apos;re invited to
        </h2>
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No events yet — check back soon.
          </p>
        ) : (
          <ul className="space-y-2">
            {events.map((e) => (
              <li
                key={e.id}
                className="rounded-lg border p-3"
                style={{ borderColor: "var(--gold-line)" }}
              >
                <p className="font-medium">{e.name}</p>
                <p className="text-sm tabular-nums text-muted-foreground">
                  {[formatDate(e.eventDate), e.venueName]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Only the events your group is invited to are shown here. The full themed
        site arrives in the next step.
      </p>
    </main>
  );
}
