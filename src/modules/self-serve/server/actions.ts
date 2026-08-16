"use server";

import { THEMES, getTheme } from "@/modules/website/themes/registry";
import { requireUser } from "@/modules/auth/server/user";
import { signupDraftSchema } from "../schema";
import { saveDraft } from "./mutations";

export type DraftFormState = {
  error?: string;
  /** Set once the draft is stored, so the wizard can advance to payment. */
  signupId?: string;
};

/**
 * Stores the wizard's answers as the caller's draft.
 *
 * Server Actions are reachable by direct POST, not only through our own UI, so
 * this re-establishes identity (`requireUser`) and re-validates the theme id
 * against the registry rather than trusting the value the form sent.
 */
export async function saveDraftAction(
  _prev: DraftFormState,
  formData: FormData
): Promise<DraftFormState> {
  await requireUser();

  const value = (key: string) => formData.get(key) ?? undefined;
  const parsed = signupDraftSchema.safeParse({
    contactName: value("contactName"),
    contactPhone: value("contactPhone"),
    themeId: value("themeId"),
    title: value("title"),
    name1: value("name1"),
    name2: value("name2"),
    eventDate: value("eventDate"),
    eventTime: value("eventTime"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  // The theme id arrives from the client — it must name a real theme, or the
  // renderer would fall back silently and the buyer would get a site that
  // isn't the one they chose and paid for.
  if (!THEMES.some((t) => t.id === parsed.data.themeId)) {
    return { error: "Please choose a theme." };
  }

  // Save-the-dates announce a couple, so neither name may be blank. Same rule
  // the planner's create form enforces via the theme's subjectSpec.
  const { subjectSpec } = getTheme(parsed.data.themeId);
  if (subjectSpec.required === true && (!parsed.data.name1 || !parsed.data.name2)) {
    return { error: "Both names are required for this theme." };
  }

  try {
    const draft = await saveDraft(parsed.data);
    return { signupId: draft.id };
  } catch {
    return { error: "Could not save your details. Please try again." };
  }
}
