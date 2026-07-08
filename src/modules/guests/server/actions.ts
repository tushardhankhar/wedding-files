"use server";

import { revalidatePath } from "next/cache";
import { env } from "@/lib/env";
import { groupSchema, guestSchema } from "../schema";
import {
  createGroup,
  renameGroup,
  deleteGroup,
  addGuest,
  deleteGuest,
  setInvite,
  generateGroupInvite,
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
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  try {
    await addGuest(groupId, parsed.data.name, parsed.data.isPrimary);
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

export async function generateInviteLinkAction(
  groupId: string,
  weddingId: string,
  slug: string
): Promise<InviteLinkState> {
  try {
    const token = await generateGroupInvite(groupId);
    const base = env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
    revalidate(weddingId);
    return { url: `${base}/w/${slug}/invite/${token}` };
  } catch {
    return { error: "Could not generate an invite link." };
  }
}
