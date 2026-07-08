import Link from "next/link";
import { isCurrentUserAdmin } from "@/modules/auth/server/user";
import { listWeddings } from "@/modules/weddings/server/queries";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Lotus } from "@/components/brand/motifs";

function formatDate(iso: string | null): string {
  if (!iso) return "Date not set";
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function StatusPill({ claimed }: { claimed: boolean }) {
  const cls = claimed
    ? "border-emerald-600/40 bg-emerald-600/10 text-emerald-700"
    : "border-[color:var(--gold-line)] bg-[color:var(--accent)] text-[color:var(--gold-deep)]";
  return (
    <span
      className={`mt-4 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-heading text-[11px] font-semibold tracking-wide ${cls}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {claimed ? "Client active" : "Awaiting client"}
    </span>
  );
}

export default async function DashboardPage() {
  const [weddings, isAdmin] = await Promise.all([
    listWeddings(),
    isCurrentUserAdmin(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 font-heading text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--gold-deep)]">
            ❁ {isAdmin ? "Planner" : "Your celebration"}
          </p>
          <h1 className="text-2xl font-semibold">
            {isAdmin ? "All weddings" : "Your wedding"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isAdmin
              ? "Create weddings and follow each client's progress."
              : "Manage your wedding website."}
          </p>
        </div>
        {isAdmin ? (
          <Link href="/weddings/new" className={buttonVariants()}>
            ＋ New wedding
          </Link>
        ) : null}
      </div>

      {weddings.length === 0 ? (
        <Card className="overflow-hidden text-center duration-500 animate-in fade-in zoom-in-95">
          <CardHeader className="items-center">
            <Lotus className="mx-auto h-10 text-[color:var(--gold-deep)]" />
            <h2 className="mt-2 text-lg font-semibold">
              {isAdmin ? "Let the celebrations begin" : "Nothing here yet"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isAdmin
                ? "Create your first wedding to get started."
                : "Your planner hasn't shared a wedding with you yet."}
            </p>
            {isAdmin ? (
              <Link
                href="/weddings/new"
                className={`${buttonVariants()} mt-3`}
              >
                ＋ New wedding
              </Link>
            ) : null}
          </CardHeader>
        </Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {weddings.map((w, i) => (
            <li
              key={w.id}
              className="duration-500 animate-in fade-in slide-in-from-bottom-3"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <Link href={`/weddings/${w.id}`} className="block">
                <Card className="relative overflow-hidden transition-transform hover:-translate-y-1 hover:border-[color:var(--gold-line)] hover:shadow-[0_14px_34px_-14px_rgba(43,39,64,0.25)] before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-gradient-to-r before:from-[color:var(--gold)] before:to-[color:var(--gold-deep)] before:opacity-0 before:transition-opacity hover:before:opacity-100">
                  <CardHeader>
                    <h2 className="text-lg font-semibold">{w.title}</h2>
                    <p className="text-sm tabular-nums text-muted-foreground">
                      {formatDate(w.eventDate)} ·{" "}
                      <span className="font-medium text-primary">
                        /w/{w.slug}
                      </span>
                    </p>
                    {isAdmin ? <StatusPill claimed={w.clientId !== null} /> : null}
                  </CardHeader>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
