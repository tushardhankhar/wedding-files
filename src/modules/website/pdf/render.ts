import "server-only";
import { renderToBuffer } from "@react-pdf/renderer";
import QRCode from "qrcode";
import type { CSSProperties } from "react";
import type { WeddingEvent } from "@/modules/events/types";
import type { Wedding } from "@/modules/weddings/types";
import { getTheme } from "@/modules/website/themes/registry";
import { parseWebsiteConfig } from "@/modules/website/schema";
import {
  InvitePdfDocument,
  type PdfEvent,
  type PdfFamily,
  type PdfPalette,
} from "./invite-pdf";

/** Read a --w-* token off a theme's vars, with a fallback. */
function token(vars: CSSProperties, name: string, fallback: string): string {
  const v = (vars as Record<string, string | undefined>)[name];
  return v ?? fallback;
}

/** A light, print-friendly palette derived from the theme tokens: warm paper
 * with the theme's own heading/gold/accent colours so the PDF echoes the site
 * without wasting ink on full-bleed dark backgrounds. */
function paletteFor(themeId: string): PdfPalette {
  const { vars } = getTheme(themeId);
  return {
    paper: "#FBFAF5",
    ink: token(vars, "--w-ink", "#2b2438"),
    inkSoft: token(vars, "--w-ink-soft", "#6d6479"),
    heading: token(vars, "--w-navy", token(vars, "--w-ink", "#2b2438")),
    gold: token(vars, "--w-gold", "#b8912f"),
    goldLite: token(vars, "--w-gold-lite", "#e4c56a"),
    accent: token(vars, "--w-accent", "#7a3d94"),
  };
}

function formatWhen(dateIso: string | null, time: string | null): string {
  if (!dateIso) return time ? clock(time) : "";
  const d = new Date(`${dateIso}T00:00:00`);
  const date = d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  return time ? `${date} · ${clock(time)}` : date;
}

function clock(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const ap = h < 12 ? "AM" : "PM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m).padStart(2, "0")} ${ap}`;
}

function longDate(dateIso: string | null): string | null {
  if (!dateIso) return null;
  return new Date(`${dateIso}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export interface RenderInvitePdfArgs {
  wedding: Wedding;
  groupName: string;
  events: WeddingEvent[];
  inviteUrl: string;
}

/** Render a guest group's invitation to a PDF buffer. */
export async function renderInvitePdf({
  wedding,
  groupName,
  events,
  inviteUrl,
}: RenderInvitePdfArgs): Promise<Uint8Array> {
  const config = parseWebsiteConfig(wedding.config);
  const parts = [wedding.name1?.trim(), wedding.name2?.trim()].filter(
    (n): n is string => !!n
  );
  const names = parts.length > 0 ? parts.join(" & ") : wedding.title;
  const initials = (
    parts.length > 0 ? parts.map((n) => n[0]).join(" · ") : wedding.title[0] ?? ""
  ).toUpperCase();

  const pdfEvents: PdfEvent[] = events.map((e) => ({
    name: e.name,
    when: formatWhen(e.eventDate, e.startTime),
    venue: e.venueName ?? undefined,
    address: e.venueAddress ?? undefined,
    dress: e.description ?? undefined,
  }));

  const families: PdfFamily[] = (config.family?.groups ?? []).map((g) => ({
    name: g.name.en,
    members: g.members?.en,
    relation: g.relation?.en,
  }));

  // High error-correction so the QR still scans after printing.
  const qrDataUrl = await QRCode.toDataURL(inviteUrl, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 320,
    color: { dark: "#221c33", light: "#ffffff" },
  });

  return renderToBuffer(
    InvitePdfDocument({
      names,
      initials,
      dateLabel: longDate(wedding.eventDate),
      tagline: config.hero?.tagline?.en,
      groupName,
      events: pdfEvents,
      families,
      qrDataUrl,
      inviteUrl,
      palette: paletteFor(wedding.themeId),
    })
  );
}
