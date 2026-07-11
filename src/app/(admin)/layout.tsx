import Link from "next/link";
import { requireUser, isCurrentUserAdmin } from "@/modules/auth/server/user";
import { signOutAction } from "@/modules/auth/server/actions";
import { Button } from "@/components/ui/button";
import { Lotus, Mandala } from "@/components/brand/motifs";
import { PageDecor } from "@/components/brand/decor";

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
      <header
        className="relative overflow-hidden border-b bg-[color:var(--navy)]"
        style={{ borderColor: "var(--gold-line)" }}
      >
        <Mandala className="spin-slow right-[-40px] top-[-120px] h-56 w-56 opacity-[0.13]" />
        <div className="relative mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Lotus className="h-6 text-[color:var(--gold)]" />
            <span className="font-heading text-lg font-semibold tracking-[0.08em] text-white">
              JASHN
            </span>
            <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--gold)]">
              {isAdmin ? "Planner" : "Client"}
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden max-w-[40vw] truncate text-sm text-white/75 sm:inline">
              {user.email}
            </span>
            <form action={signOutAction}>
              <Button
                type="submit"
                size="sm"
                className="border border-white/25 bg-transparent text-white/90 hover:border-[color:var(--gold)] hover:bg-transparent hover:text-white"
              >
                Sign out
              </Button>
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
