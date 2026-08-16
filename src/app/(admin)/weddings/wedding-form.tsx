"use client";

import { useActionState, useState } from "react";
import type { WeddingFormState } from "@/modules/weddings/server/actions";
import type { SubjectSpec } from "@/modules/website/themes/registry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

type WeddingAction = (
  prev: WeddingFormState,
  formData: FormData
) => Promise<WeddingFormState>;

export interface WeddingFormValues {
  title?: string | null;
  name1?: string | null;
  name2?: string | null;
  eventDate?: string | null;
  /** HH:MM — optional time of day, powers an exact countdown. */
  eventTime?: string | null;
  /** Planner's contact number for the client. Admin-only. */
  clientPhone?: string | null;
}

const initialState: WeddingFormState = {};

export function WeddingForm({
  action,
  values,
  submitLabel = "Save",
  isAdmin = true,
  subject,
}: {
  action: WeddingAction;
  values?: WeddingFormValues;
  submitLabel?: string;
  // Gates the admin-only fields. Clients cannot change the invitation name (it
  // renders read-only and isn't submitted) and never see the client phone —
  // that's the planner's own contact record. The server action and a DB trigger
  // enforce both regardless of what the form sends.
  isAdmin?: boolean;
  /** From the chosen theme (edit only). Drives name labels + how many to show.
   * Absent → generic two-name fallback. */
  subject?: SubjectSpec;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  // Name inputs always write to the name1 / name2 columns; only their labels and
  // visibility change per theme subject.
  const nameLabels = subject?.labels ?? ["Partner one", "Partner two"];
  const showSecondName = subject ? subject.names === 2 : true;
  // Save-the-dates freeze both names — neither may be left blank.
  const namesRequired = subject?.required ?? false;

  // Controlled inputs — a post-save revalidate re-renders this form with the
  // freshly-saved values, which would trip Base UI's "uncontrolled defaultValue
  // changed" warning if these used defaultValue.
  const [title, setTitle] = useState(values?.title ?? "");
  const [name1, setName1] = useState(values?.name1 ?? "");
  const [name2, setName2] = useState(values?.name2 ?? "");
  const [eventDate, setEventDate] = useState(values?.eventDate ?? "");
  const [eventTime, setEventTime] = useState(values?.eventTime ?? "");
  const [clientPhone, setClientPhone] = useState(values?.clientPhone ?? "");

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Invitation title</Label>
        {isAdmin ? (
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
            {/* Says WHY it's locked, not who locked it. Half of these clients
                now bought the invitation themselves and never had a planner —
                being told to ask one is confusing at best, and they meet this
                line within a minute of paying. The reason holds for both:
                the shareable link is built from the title, so changing it
                would break links already sent. */}
            <p className="text-xs text-muted-foreground">
              Fixed once the invitation is created — your shareable link is
              built from it.
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
            required={namesRequired}
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
              required={namesRequired}
              maxLength={120}
              value={name2}
              onChange={(e) => setName2(e.target.value)}
            />
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
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
        <div className="space-y-2">
          <Label htmlFor="eventTime">
            Event time{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="eventTime"
            name="eventTime"
            type="time"
            value={eventTime}
            onChange={(e) => setEventTime(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Sets an exact countdown. Defaults to 8:00 PM if left blank.
          </p>
        </div>
      </div>

      {isAdmin ? (
        <div className="space-y-2 border-t pt-4">
          <Label htmlFor="clientPhone">
            Client phone{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="clientPhone"
            name="clientPhone"
            type="tel"
            maxLength={30}
            autoComplete="off"
            placeholder="+91 98765 43210"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Your record of who to contact. Include the country code to WhatsApp
            them from Client access below. Never shown to guests.
          </p>
        </div>
      ) : null}

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
        {pending ? <Spinner /> : null}
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
