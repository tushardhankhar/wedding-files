"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createWeddingSchema, updateWeddingSchema } from "../schema";
import { createWedding, deleteWedding, updateWedding } from "./mutations";

export type WeddingFormState = { error?: string; saved?: boolean };

function parseForm(formData: FormData) {
  return {
    title: formData.get("title"),
    partnerOneName: formData.get("partnerOneName"),
    partnerTwoName: formData.get("partnerTwoName"),
    eventDate: formData.get("eventDate"),
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

  await updateWedding(id, parsed.data);
  revalidatePath("/dashboard");
  revalidatePath(`/weddings/${id}`);
  return { saved: true };
}

export async function deleteWeddingAction(id: string): Promise<void> {
  await deleteWedding(id);
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
