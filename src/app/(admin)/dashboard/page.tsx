import { isCurrentUserAdmin } from "@/modules/auth/server/user";
import { listWeddings } from "@/modules/weddings/server/queries";
import {
  getAdminInviteStatus,
  type WeddingAdminMeta,
} from "@/modules/weddings/server/admin-queries";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Lotus } from "@/components/brand/motifs";
import { NavLink, NavCardLink } from "@/components/brand/nav-link";
import { occasionLabel } from "@/modules/website/themes/registry";

function formatDate(iso: string | null): string {
  if (!iso) return "Date not set";
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function inviteExpiryLabel(iso: string | null): string | null {
  if (!iso) return null;
  const days = Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
  if (days <= 0) return "expires today";
  if (days === 1) return "expires in 1 day";
  return `expires in ${days} days`;
}

const gold =
  "border-[color:var(--gold-line)] bg-[color:var(--accent)] text-[color:var(--gold-deep)]";
const emerald = "border-emerald-600/40 bg-emerald-600/10 text-emerald-700";
const red = "border-destructive/40 bg-destructive/10 text-destructive";

function AdminStatus({ meta }: { meta?: WeddingAdminMeta }) {
  const status = meta?.inviteStatus ?? "none";
  const pill: Record<string, { cls: string; label: string }> = {
    active: { cls: emerald, label: "Client active" },
    accepted: { cls: emerald, label: "Client active" },
    pending: { cls: gold, label: "Invite sent" },
    expired: { cls: red, label: "Invite expired" },
    none: { cls: gold, label: "Awaiting client" },
  };
  const { cls, label } = pill[status] ?? pill.none;

  // A secondary line: owning email once active, invited email + expiry while pending.
  let detail: string | null = null;
  if ((status === "active" || status === "accepted") && meta?.clientEmail) {
    detail = meta.clientEmail;
  } else if (status === "pending" && meta?.invitedEmail) {
    const exp = inviteExpiryLabel(meta.inviteExpiresAt);
    detail = exp ? `${meta.invitedEmail} · ${exp}` : meta.invitedEmail;
  } else if (status === "expired" && meta?.invitedEmail) {
    detail = meta.invitedEmail;
  }

  return (
    <div className="mt-4 space-y-1">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-heading text-[11px] font-semibold tracking-wide ${cls}`}
      >
        <span className="size-1.5 rounded-full bg-current" />
        {label}
      </span>
      {detail ? (
        <p className="truncate text-xs text-muted-foreground">{detail}</p>
      ) : null}
    </div>
  );
}

export default async function DashboardPage() {
  const [weddings, isAdmin] = await Promise.all([
    listWeddings(),
    isCurrentUserAdmin(),
  ]);
  const adminMeta = isAdmin ? await getAdminInviteStatus() : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 font-heading text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--gold-deep)]">
            ❁ {isAdmin ? "Planner" : "Your celebration"}
          </p>
          <h1 className="text-2xl font-semibold">
            {isAdmin ? "All invitations" : "Your celebration"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isAdmin
              ? "Create invitations and follow each client's progress."
              : "Manage your invitation website."}
          </p>
        </div>
        {isAdmin ? (
          <NavLink href="/weddings/new" className={buttonVariants()}>
            ＋ New invitation
          </NavLink>
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
                ? "Create your first invitation to get started."
                : "Your planner hasn't shared an invitation with you yet."}
            </p>
            {isAdmin ? (
              <NavLink
                href="/weddings/new"
                className={`${buttonVariants()} mt-3`}
              >
                ＋ New invitation
              </NavLink>
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
              <NavCardLink href={`/weddings/${w.id}`}>
                <Card className="relative overflow-hidden transition-transform hover:-translate-y-1 hover:border-[color:var(--gold-line)] hover:shadow-[0_14px_34px_-14px_rgba(43,39,64,0.25)] before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-gradient-to-r before:from-[color:var(--gold)] before:to-[color:var(--gold-deep)] before:opacity-0 before:transition-opacity hover:before:opacity-100">
                  <CardHeader>
                    <span className="inline-flex w-fit items-center rounded-full border border-[color:var(--gold-line)] bg-[color:var(--accent)] px-2.5 py-0.5 font-heading text-[10px] font-semibold uppercase tracking-wide text-[color:var(--gold-deep)]">
                      {occasionLabel(w.themeId)}
                    </span>
                    <h2 className="mt-2 text-lg font-semibold">{w.title}</h2>
                    <p className="text-sm tabular-nums text-muted-foreground">
                      {formatDate(w.eventDate)} ·{" "}
                      <span className="font-medium text-primary">
                        /w/{w.slug}
                      </span>
                    </p>
                    {isAdmin ? (
                      <AdminStatus meta={adminMeta?.get(w.id)} />
                    ) : null}
                  </CardHeader>
                </Card>
              </NavCardLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
