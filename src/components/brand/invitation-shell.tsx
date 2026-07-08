import type { ReactNode } from "react";
import { Lotus, Mandala, Paisley } from "./motifs";
import { FloatingPetals } from "./decor";

/**
 * The royal-invitation frame shared by sign-in and client onboarding: an
 * aubergine-navy stage, a mandala watermark, and an ivory card edged in gold
 * with paisley corner flourishes and a lotus emblem.
 */
export function InvitationShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main
      className="relative flex min-h-svh items-center justify-center overflow-hidden p-6"
      style={{
        background:
          "radial-gradient(130% 100% at 50% -20%, #4a3560 0%, rgba(74,53,96,0) 58%), linear-gradient(180deg, #2b2740 0%, #201d31 100%)",
      }}
    >
      <Mandala className="spin-slow left-1/2 top-[-130px] h-[460px] w-[460px] -translate-x-1/2 opacity-[0.16]" />
      <FloatingPetals />

      <div
        className="relative w-full max-w-sm rounded-[5px] bg-card p-8 shadow-[0_34px_66px_-22px_rgba(0,0,0,0.6)] duration-700 animate-in fade-in zoom-in-95"
        style={{ outline: "1px solid var(--gold-line)", outlineOffset: "-8px" }}
      >
        <Paisley className="absolute left-3 top-3 h-10 w-10 text-[color:var(--gold-deep)] opacity-60" />
        <Paisley className="absolute right-3 top-3 h-10 w-10 -scale-x-100 text-[color:var(--gold-deep)] opacity-60" />
        <Paisley className="absolute bottom-3 left-3 h-10 w-10 -scale-y-100 text-[color:var(--gold-deep)] opacity-60" />
        <Paisley className="absolute bottom-3 right-3 h-10 w-10 -scale-100 text-[color:var(--gold-deep)] opacity-60" />

        <div className="relative mb-1 flex justify-center">
          <Mandala className="left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 opacity-40" />
          <Lotus className="relative h-9 text-primary" />
        </div>

        <h1 className="text-shimmer mt-2 text-center text-2xl font-semibold tracking-[0.06em]">
          {title}
        </h1>
        <p className="mb-5 mt-0.5 text-center text-sm text-muted-foreground">
          {subtitle}
        </p>

        <div className="relative mx-auto mb-6 h-px w-2/3 bg-[color:var(--gold-line)]">
          <span className="absolute left-1/2 top-[-10px] -translate-x-1/2 bg-card px-2 text-[10px] text-[color:var(--gold-deep)]">
            ✦
          </span>
        </div>

        {children}

        {footer ? (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            {footer}
          </p>
        ) : null}
      </div>
    </main>
  );
}
