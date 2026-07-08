import { Lotus } from "./motifs";

function Ring() {
  return (
    <div className="relative flex size-16 items-center justify-center">
      <span className="absolute inset-0 animate-spin rounded-full border-2 border-[color:var(--gold-line)] border-t-[color:var(--gold)]" />
      <Lotus className="h-7 text-[color:var(--gold-deep)]" />
    </div>
  );
}

/** Loader for the content area (admin/client pages, under the header). */
export function PageLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-[55vh] flex-col items-center justify-center gap-5">
      <Ring />
      <p className="animate-pulse font-heading text-xs uppercase tracking-[0.3em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

/** Full-screen loader for standalone pages (login, preview, guest site). */
export function FullPageLoader({ label = "Loading" }: { label?: string }) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-5 bg-background">
      <Ring />
      <p className="animate-pulse font-heading text-xs uppercase tracking-[0.3em] text-muted-foreground">
        {label}
      </p>
    </main>
  );
}
