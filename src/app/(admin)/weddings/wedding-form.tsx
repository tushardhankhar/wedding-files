"use client";

import { useActionState } from "react";
import type { WeddingFormState } from "@/modules/weddings/server/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type WeddingAction = (
  prev: WeddingFormState,
  formData: FormData
) => Promise<WeddingFormState>;

export interface WeddingFormValues {
  title?: string | null;
  partnerOneName?: string | null;
  partnerTwoName?: string | null;
  eventDate?: string | null;
}

const initialState: WeddingFormState = {};

export function WeddingForm({
  action,
  values,
  submitLabel = "Save",
}: {
  action: WeddingAction;
  values?: WeddingFormValues;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Wedding title</Label>
        <Input
          id="title"
          name="title"
          required
          maxLength={120}
          defaultValue={values?.title ?? ""}
          placeholder="e.g. Aisha & Rohan"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="partnerOneName">Partner one</Label>
          <Input
            id="partnerOneName"
            name="partnerOneName"
            maxLength={120}
            defaultValue={values?.partnerOneName ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="partnerTwoName">Partner two</Label>
          <Input
            id="partnerTwoName"
            name="partnerTwoName"
            maxLength={120}
            defaultValue={values?.partnerTwoName ?? ""}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="eventDate">Event date</Label>
        <Input
          id="eventDate"
          name="eventDate"
          type="date"
          defaultValue={values?.eventDate ?? ""}
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
