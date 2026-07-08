"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isCurrentUserAdmin } from "@/modules/auth/server/user";
import { THEMES } from "@/modules/website/themes/registry";
import { createWeddingSchema, updateWeddingSchema } from "../schema";
import {
  createWedding,
  deleteWedding,
  updateWedding,
  updateWeddingTheme,
} from "./mutations";

export type WeddingFormState = { error?: string; saved?: boolean };

function parseForm(formData: FormData) {
  // A field the form omits (e.g. the title, which is read-only for clients)
  // comes back as null; Zod's .optional() expects undefined, so normalize it.
  const value = (key: string) => formData.get(key) ?? undefined;
  return {
    title: value("title"),
    partnerOneName: value("partnerOneName"),
    partnerTwoName: value("partnerTwoName"),
    eventDate: value("eventDate"),
  };
}

export async function createWeddingAction(
  _prev: WeddingFormState,
  formData: FormData
): Promise<WeddingFormState> {
  const parsed = createWeddingSchema.safeParse(parseForm(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const wedding = await createWedding(parsed.data);
  revalidatePath("/dashboard");
  redirect(`/weddings/${wedding.id}`);
}

export async function updateWeddingAction(
  id: string,
  _prev: WeddingFormState,
  formData: FormData
): Promise<WeddingFormState> {
  const parsed = updateWeddingSchema.safeParse(parseForm(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const allowRename = await isCurrentUserAdmin();
  await updateWedding(id, parsed.data, { allowRename });
  revalidatePath("/dashboard");
  revalidatePath(`/weddings/${id}`);
  return { saved: true };
}

export async function deleteWeddingAction(id: string): Promise<void> {
  await deleteWedding(id);
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export type ThemeState = { error?: string; saved?: boolean };

export async function updateWeddingThemeAction(
  weddingId: string,
  themeId: string
): Promise<ThemeState> {
  if (!(await isCurrentUserAdmin())) {
    return { error: "Only your planner can change the theme." };
  }
  if (!THEMES.some((t) => t.id === themeId)) {
    return { error: "Unknown theme." };
  }
  try {
    await updateWeddingTheme(weddingId, themeId);
  } catch {
    return { error: "Could not update the theme. Please try again." };
  }
  revalidatePath(`/weddings/${weddingId}`);
  return { saved: true };
}
