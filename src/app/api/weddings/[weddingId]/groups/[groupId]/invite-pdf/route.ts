// ── Invitation PDF route — ON HOLD ──────────────────────────────────────────
// The per-group invitation PDF is paused pending a website-faithful rendering
// approach (rendering the real themed site rather than the hand-drawn template).
// This endpoint is disabled (returns 404). The original implementation is kept
// below for easy resume, along with modules/website/pdf/* and the commented
// "Download PDF" button in the guests group card. Deps @react-pdf/renderer and
// qrcode remain installed.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  return new Response("Not found", { status: 404 });
}

/* ---- Original implementation — uncomment (and restore the imports) to re-enable ----

import type { NextRequest } from "next/server";
import { getCurrentUser } from "@/modules/auth/server/user";
import { getWeddingById } from "@/modules/weddings/server/queries";
import { listEvents } from "@/modules/events/server/queries";
import { listGroups } from "@/modules/guests/server/queries";
import { renderInvitePdf } from "@/modules/website/pdf/render";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ weddingId: string; groupId: string }> }
) {
  const { weddingId, groupId } = await params;

  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const wedding = await getWeddingById(weddingId);
  if (!wedding) return new Response("Not found", { status: 404 });

  let inviteUrl = "";
  try {
    const body = (await req.json()) as { inviteUrl?: unknown };
    inviteUrl = typeof body.inviteUrl === "string" ? body.inviteUrl.trim() : "";
  } catch {
    return new Response("Bad request", { status: 400 });
  }
  if (!inviteUrl.includes(`/w/${wedding.slug}/invite/`)) {
    return new Response("Invalid invite link", { status: 400 });
  }

  const [events, groups] = await Promise.all([
    listEvents(weddingId),
    listGroups(weddingId),
  ]);
  const group = groups.find((g) => g.id === groupId);
  if (!group) return new Response("Not found", { status: 404 });

  const invited = events.filter((e) => group.invitedEventIds.includes(e.id));

  const pdf = await renderInvitePdf({
    wedding,
    groupName: group.name,
    events: invited,
    inviteUrl,
  });

  const filename = `${wedding.slug}-invitation.pdf`;
  return new Response(pdf as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

---- end original implementation ---- */
