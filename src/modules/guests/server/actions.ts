"use server";

import { revalidatePath } from "next/cache";
import { inviteUrl, shareUrl } from "../link-urls";
import { groupSchema, guestSchema } from "../schema";
import {
  createGroup,
  renameGroup,
  deleteGroup,
  addGuest,
  deleteGuest,
  setInvite,
  generateGroupInvite,
  createShareLink,
  regenerateShareToken,
  deleteShareLink,
  setShareLinkAllEvents,
  toggleShareLinkEvent,
} from "./mutations";

export type FormState = { error?: string; saved?: boolean };

function revalidate(weddingId: string) {
  revalidatePath(`/weddings/${weddingId}/guests`);
}

export async function createGroupAction(
  weddingId: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = groupSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  try {
    await createGroup(weddingId, parsed.data.name);
  } catch {
    return { error: "Could not create the group." };
  }
  revalidate(weddingId);
  return { saved: true };
}

export async function renameGroupAction(
  groupId: string,
  weddingId: string,
  name: string
): Promise<FormState> {
  const parsed = groupSchema.safeParse({ name });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  try {
    await renameGroup(groupId, parsed.data.name);
  } catch {
    return { error: "Could not rename the group." };
  }
  revalidate(weddingId);
  return { saved: true };
}

export async function deleteGroupAction(
  groupId: string,
  weddingId: string
): Promise<void> {
  await deleteGroup(groupId);
  revalidate(weddingId);
}

export async function addGuestAction(
  groupId: string,
  weddingId: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = guestSchema.safeParse({
    name: formData.get("name"),
    isPrimary: formData.get("isPrimary") === "on",
    phone: formData.get("phone") ?? undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  try {
    await addGuest(
      groupId,
      parsed.data.name,
      parsed.data.isPrimary,
      parsed.data.phone ?? null
    );
  } catch {
    return { error: "Could not add the guest." };
  }
  revalidate(weddingId);
  return { saved: true };
}

export async function deleteGuestAction(
  guestId: string,
  weddingId: string
): Promise<void> {
  await deleteGuest(guestId);
  revalidate(weddingId);
}

export async function toggleInviteAction(
  groupId: string,
  eventId: string,
  weddingId: string,
  invited: boolean
): Promise<void> {
  await setInvite(groupId, eventId, invited);
  revalidate(weddingId);
}

export type InviteLinkState = { url?: string; error?: string };

/**
 * Mints a NEW invitation link for a group, invalidating any previous one. Since
 * 0021 the plaintext is persisted, so this is only needed to create the first
 * link or to deliberately revoke an old one — re-displaying no longer requires
 * regenerating. The UI confirms before calling this when a link already exists.
 */
export async function generateInviteLinkAction(
  groupId: string,
  weddingId: string,
  slug: string
): Promise<InviteLinkState> {
  try {
    const token = await generateGroupInvite(groupId);
    revalidate(weddingId);
    return { url: inviteUrl(slug, token) };
  } catch {
    return { error: "Could not generate an invite link." };
  }
}

// ── Shareable links ─────────────────────────────────────────────────────────
export async function createShareLinkAction(
  weddingId: string,
  slug: string,
  _prev: InviteLinkState,
  formData: FormData
): Promise<InviteLinkState> {
  const label = String(formData.get("label") ?? "").trim();
  if (!label) return { error: "Give the link a name." };
  try {
    const { token } = await createShareLink(weddingId, label);
    revalidate(weddingId);
    return { url: shareUrl(slug, token) };
  } catch {
    return { error: "Could not create the link." };
  }
}

export async function regenerateShareLinkAction(
  id: string,
  weddingId: string,
  slug: string
): Promise<InviteLinkState> {
  try {
    const token = await regenerateShareToken(id);
    revalidate(weddingId);
    return { url: shareUrl(slug, token) };
  } catch {
    return { error: "Could not regenerate the link." };
  }
}

export async function deleteShareLinkAction(
  id: string,
  weddingId: string
): Promise<void> {
  await deleteShareLink(id);
  revalidate(weddingId);
}

export async function setShareLinkAllEventsAction(
  id: string,
  weddingId: string,
  all: boolean
): Promise<void> {
  await setShareLinkAllEvents(id, all);
  revalidate(weddingId);
}

export async function toggleShareLinkEventAction(
  id: string,
  eventId: string,
  weddingId: string,
  on: boolean
): Promise<void> {
  await toggleShareLinkEvent(id, eventId, on);
  revalidate(weddingId);
}
