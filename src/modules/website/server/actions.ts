"use server";

import { revalidatePath } from "next/cache";
import { updateWeddingConfig } from "@/modules/weddings/server/mutations";
import { websiteConfigSchema } from "../schema";

export type ContentState = { error?: string; saved?: boolean };

/**
 * Saves the whole website content config for a wedding. Editable by the
 * managing admin or client (RLS scopes it); name/theme remain admin-only.
 */
export async function saveWebsiteConfigAction(
  weddingId: string,
  raw: unknown
): Promise<ContentState> {
  const parsed = websiteConfigSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Some content looks invalid — please review your entries." };
  }
  try {
    await updateWeddingConfig(weddingId, parsed.data);
  } catch {
    return { error: "Could not save. Please try again." };
  }
  revalidatePath(`/weddings/${weddingId}`);
  revalidatePath(`/preview/${weddingId}`);
  return { saved: true };
}
