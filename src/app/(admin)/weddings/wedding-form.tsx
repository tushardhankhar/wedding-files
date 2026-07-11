"use client";

import { useActionState, useState } from "react";
import type { WeddingFormState } from "@/modules/weddings/server/actions";
import type { SubjectSpec } from "@/modules/website/themes/registry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type WeddingAction = (
  prev: WeddingFormState,
  formData: FormData
) => Promise<WeddingFormState>;

export interface WeddingFormValues {
  title?: string | null;
  name1?: string | null;
  name2?: string | null;
  eventDate?: string | null;
}

const initialState: WeddingFormState = {};

export function WeddingForm({
  action,
  values,
  submitLabel = "Save",
  canRename = true,
  subject,
}: {
  action: WeddingAction;
  values?: WeddingFormValues;
  submitLabel?: string;
  // Clients cannot change the invitation name; the field renders read-only and
  // is not submitted. The server action and a DB trigger also enforce this.
  canRename?: boolean;
  /** From the chosen theme (edit only). Drives name labels + how many to show.
   * Absent → generic two-name fallback. */
  subject?: SubjectSpec;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  // Name inputs always write to the name1 / name2 columns; only their labels and
  // visibility change per theme subject.
  const nameLabels = subject?.labels ?? ["Partner one", "Partner two"];
  const showSecondName = subject ? subject.names === 2 : true;

  // Controlled inputs — a post-save revalidate re-renders this form with the
  // freshly-saved values, which would trip Base UI's "uncontrolled defaultValue
  // changed" warning if these used defaultValue.
  const [title, setTitle] = useState(values?.title ?? "");
  const [name1, setName1] = useState(values?.name1 ?? "");
  const [name2, setName2] = useState(values?.name2 ?? "");
  const [eventDate, setEventDate] = useState(values?.eventDate ?? "");

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Invitation title</Label>
        {canRename ? (
          <Input
            id="title"
            name="title"
            required
            maxLength={120}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Aisha & Rohan"
          />
        ) : (
          <>
            <Input id="title" value={values?.title ?? ""} readOnly disabled />
            <p className="text-xs text-muted-foreground">
              The name is set by your planner and can&apos;t be changed here.
            </p>
          </>
        )}
      </div>

      <div className={showSecondName ? "grid gap-4 sm:grid-cols-2" : ""}>
        <div className="space-y-2">
          <Label htmlFor="name1">{nameLabels[0] ?? "Name"}</Label>
          <Input
            id="name1"
            name="name1"
            maxLength={120}
            value={name1}
            onChange={(e) => setName1(e.target.value)}
          />
        </div>
        {showSecondName ? (
          <div className="space-y-2">
            <Label htmlFor="name2">{nameLabels[1] ?? "Second name"}</Label>
            <Input
              id="name2"
              name="name2"
              maxLength={120}
              value={name2}
              onChange={(e) => setName2(e.target.value)}
            />
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="eventDate">Event date</Label>
        <Input
          id="eventDate"
          name="eventDate"
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
        />
      </div>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.saved ? (
        <p className="text-sm text-muted-foreground" role="status">
          Changes saved.
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
