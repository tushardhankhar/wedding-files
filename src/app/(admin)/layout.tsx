import type { Metadata } from "next";
import { requireUser, isCurrentUserAdmin } from "@/modules/auth/server/user";
import { signOutAction } from "@/modules/auth/server/actions";
import { Lotus, Mandala } from "@/components/brand/motifs";
import { PageDecor } from "@/components/brand/decor";
import { NavProgress } from "@/components/brand/nav-progress";
import { NavLink } from "@/components/brand/nav-link";
import { PendingSubmit } from "@/components/brand/pending-submit";

// Inherited by every dashboard/wedding route below this layout.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Single authorization gate for every admin/client route.
  const [user, isAdmin] = await Promise.all([
    requireUser(),
    isCurrentUserAdmin(),
  ]);

  return (
    <div className="min-h-svh">
      <PageDecor />
      {/* Outside <main> so it keeps sweeping while the page below is swapped. */}
      <NavProgress />
      <header
        className="relative overflow-hidden border-b bg-[color:var(--navy)]"
        style={{ borderColor: "var(--gold-line)" }}
      >
        <Mandala className="spin-slow right-[-40px] top-[-120px] h-56 w-56 opacity-[0.13]" />
        <div className="relative mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <NavLink href="/dashboard" className="flex items-center gap-3 text-white">
            <Lotus className="h-6 text-[color:var(--gold)]" />
            <span className="font-heading text-lg font-semibold tracking-[0.08em] text-white">
              JASHN
            </span>
            <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--gold)]">
              {isAdmin ? "Planner" : "Client"}
            </span>
          </NavLink>
          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden max-w-[40vw] truncate text-sm text-white/75 sm:inline">
              {user.email}
            </span>
            <form action={signOutAction}>
              <PendingSubmit
                label="Sign out"
                pendingLabel="Signing out…"
                overlay="Signing out"
                size="sm"
                className="border border-white/25 bg-transparent text-white/90 hover:border-[color:var(--gold)] hover:bg-transparent hover:text-white disabled:opacity-100"
              />
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8 duration-500 animate-in fade-in slide-in-from-bottom-2">
        {children}
      </main>
    </div>
  );
}
