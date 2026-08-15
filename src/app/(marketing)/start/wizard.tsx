"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { saveDraftAction } from "@/modules/self-serve/server/actions";
import {
  CATEGORIES,
  themesForCategory,
  getTheme,
  type ThemeCategory,
} from "@/modules/website/themes/registry";
import { PRICE_LABEL } from "@/modules/self-serve/pricing";
import type { PendingSignup } from "@/modules/self-serve/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { PayButton } from "./pay-button";

const TITLE_PLACEHOLDER: Record<ThemeCategory, string> = {
  wedding: "e.g. Aisha & Rohan",
  "save-the-date": "e.g. Aisha & Rohan",
  "kids-birthday": "e.g. Aarav's 6th Birthday",
  "baby-shower": "e.g. Aisha & Kabir",
  housewarming: "e.g. The Sharma Family",
  party: "e.g. Rohan's Bachelor Party",
};

/** A sensible default title (and therefore URL) per occasion, until edited. */
function suggestTitle(cat: ThemeCategory, n1: string, n2: string): string {
  const a = n1.trim();
  const b = n2.trim();
  const both = [a, b].filter(Boolean).join(" & ");
  if (!a && !b) return "";
  switch (cat) {
    case "kids-birthday":
      return a ? `${a}'s Birthday` : "";
    case "party":
      return a ? `${a}'s Party` : "";
    case "housewarming":
      return a ? `${a} Housewarming` : both;
    default:
      return both;
  }
}

const STEPS = ["Occasion", "Theme", "Your details", "Pay"] as const;
type Step = 1 | 2 | 3 | 4;

function Stepper({ step }: { step: Step }) {
  return (
    <ol className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium">
      {STEPS.map((l, i) => {
        const n = (i + 1) as Step;
        const active = n === step;
        const done = n < step;
        return (
          <li key={l} className="flex items-center gap-2">
            <span
              className={`flex size-5 items-center justify-center rounded-full text-[11px] ${
                active
                  ? "bg-primary text-primary-foreground"
                  : done
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {done ? "✓" : n}
            </span>
            <span className={active ? "text-foreground" : "text-muted-foreground"}>
              {l}
            </span>
            {i < STEPS.length - 1 ? (
              <span className="mx-1 h-px w-5 bg-border" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <dt className="shrink-0 text-xs text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm font-medium">{value}</dd>
    </div>
  );
}

/**
 * The self-serve build wizard: occasion → theme → details → pay.
 *
 * Structurally a sibling of the planner's `weddings/new/create-wizard.tsx` and
 * driven by the same registry (so a new theme appears here automatically), with
 * three differences that matter:
 *
 *  1. It collects the BUYER — name and phone, both mandatory — as well as the
 *     celebration. The planner's version collects a client phone optionally,
 *     because a planner already knows who their client is.
 *  2. Each theme card links to its live `/demo/[id]`. Theme is frozen once the
 *     invitation exists, so the choice has to be an informed one *here*.
 *  3. It ends at a review-and-pay step rather than creating anything. Nothing
 *     exists until the payment clears.
 */
export function Wizard({ draft }: { draft: PendingSignup | null }) {
  const initialCategory = draft ? getTheme(draft.themeId).category : null;

  const [step, setStep] = useState<Step>(draft ? 4 : 1);
  const [category, setCategory] = useState<ThemeCategory | null>(initialCategory);
  const [themeId, setThemeId] = useState<string | null>(draft?.themeId ?? null);
  const [n1, setN1] = useState(draft?.name1 ?? "");
  const [n2, setN2] = useState(draft?.name2 ?? "");
  const [title, setTitle] = useState(draft?.title ?? "");
  const [titleTouched, setTitleTouched] = useState(Boolean(draft));
  const [contactName, setContactName] = useState(draft?.contactName ?? "");
  const [contactPhone, setContactPhone] = useState(draft?.contactPhone ?? "");
  const [eventDate, setEventDate] = useState(draft?.eventDate ?? "");
  const [eventTime, setEventTime] = useState(draft?.eventTime ?? "");

  const [signupId, setSignupId] = useState<string | null>(draft?.id ?? null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  /**
   * Calls the action directly rather than through `useActionState` so the step
   * can advance in the same handler that saw it succeed. Driving that from an
   * effect watching the returned id would be a cascading render — and the step
   * is this component's business, not the action's.
   */
  function submitDetails(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await saveDraftAction({}, formData);
      if (result.error || !result.signupId) {
        setError(result.error ?? "Could not save your details.");
        return;
      }
      setError(null);
      setSignupId(result.signupId);
      setStep(4);
    });
  }

  const theme = themeId ? getTheme(themeId) : null;
  const subject = theme?.subjectSpec;
  const labels = subject?.labels ?? ["Name", "Second name"];
  const showTwo = subject ? subject.names === 2 : true;
  const namesRequired = subject?.required ?? false;
  const effectiveTitle =
    titleTouched || !category ? title : suggestTitle(category, n1, n2);

  return (
    <div>
      <Stepper step={step} />

      {/* Step 1 — occasion */}
      {step === 1 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setCategory(c.id);
                setThemeId(null);
                setStep(2);
              }}
              className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors hover:border-[color:var(--gold-line)] ${
                category === c.id
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-border"
              }`}
            >
              <span className="text-2xl" aria-hidden>
                {c.emoji}
              </span>
              <span>
                <span className="block font-heading text-sm font-semibold">
                  {c.label}
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {c.blurb}
                </span>
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {/* Step 2 — theme */}
      {step === 2 && category ? (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Tap <span className="font-medium text-foreground">See it live</span>{" "}
            to walk through a real invitation in that theme before you choose —
            your theme is set when your invitation is created.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {themesForCategory(category).map((t) => (
              <div
                key={t.id}
                className={`rounded-xl border p-3 transition-colors ${
                  themeId === t.id
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-border"
                }`}
              >
                <div className="mb-2 flex gap-1.5">
                  {t.swatch.map((c) => (
                    <span
                      key={c}
                      className="size-5 rounded-full border border-black/10"
                      style={{ background: c }}
                    />
                  ))}
                </div>
                <span className="block font-heading text-sm font-semibold">
                  {t.name}
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {t.description}
                </span>
                <div className="mt-3 flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setThemeId(t.id);
                      setStep(3);
                    }}
                  >
                    Choose
                  </Button>
                  <Link
                    href={`/demo/${t.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-primary underline-offset-2 hover:underline"
                  >
                    See it live ↗
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <Button type="button" variant="ghost" onClick={() => setStep(1)}>
            ← Change occasion
          </Button>
        </div>
      ) : null}

      {/* Step 3 — details */}
      {step === 3 && theme && category ? (
        <form onSubmit={submitDetails} className="space-y-5">
          <p className="text-sm text-muted-foreground">
            {CATEGORIES.find((c) => c.id === category)?.emoji}{" "}
            <span className="font-medium text-foreground">{theme.name}</span> —
            just the essentials. Photos, timeline and the rest come after you
            pay, in your dashboard.
          </p>

          <input type="hidden" name="themeId" value={theme.id} />

          <fieldset className="space-y-4">
            <legend className="mb-2 font-heading text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--gold-deep)]">
              About you
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contactName">Your name</Label>
                <Input
                  id="contactName"
                  name="contactName"
                  required
                  maxLength={120}
                  autoComplete="name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Phone</Label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  type="tel"
                  required
                  maxLength={30}
                  autoComplete="tel"
                  placeholder="+91 98765 43210"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              So we can reach you about your invitation. Include the country
              code. Your guests never see this.
            </p>
          </fieldset>

          <fieldset className="space-y-4 border-t pt-4">
            <legend className="mb-2 font-heading text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--gold-deep)]">
              The celebration
            </legend>

            <div className={showTwo ? "grid gap-4 sm:grid-cols-2" : ""}>
              <div className="space-y-2">
                <Label htmlFor="name1">{labels[0] ?? "Name"}</Label>
                <Input
                  id="name1"
                  name="name1"
                  required={namesRequired}
                  maxLength={120}
                  value={n1}
                  onChange={(e) => setN1(e.target.value)}
                />
              </div>
              {showTwo ? (
                <div className="space-y-2">
                  <Label htmlFor="name2">{labels[1] ?? "Second name"}</Label>
                  <Input
                    id="name2"
                    name="name2"
                    required={namesRequired}
                    maxLength={120}
                    value={n2}
                    onChange={(e) => setN2(e.target.value)}
                  />
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Invitation title</Label>
              <Input
                id="title"
                name="title"
                required
                maxLength={120}
                value={effectiveTitle}
                placeholder={TITLE_PLACEHOLDER[category]}
                onChange={(e) => {
                  setTitleTouched(true);
                  setTitle(e.target.value);
                }}
              />
              <p className="text-xs text-muted-foreground">
                Your shareable link is made from this, and it&apos;s fixed once
                your invitation is created.
              </p>
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
                  Time{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="eventTime"
                  name="eventTime"
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                />
              </div>
            </div>
          </fieldset>

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" onClick={() => setStep(2)}>
              ← Back
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? <Spinner /> : null}
              {pending ? "Saving…" : "Review & pay"}
            </Button>
          </div>
        </form>
      ) : null}

      {/* Step 4 — review & pay */}
      {step === 4 && theme ? (
        <div className="space-y-5">
          <div className="rounded-xl border border-[color:var(--gold-line)] bg-[color:var(--accent)] p-4">
            <dl className="divide-y divide-[color:var(--gold-line)]/40">
              <Row label="Theme" value={theme.name} />
              <Row
                label="Title"
                value={draft?.title || effectiveTitle || "—"}
              />
              <Row
                label={showTwo ? "Names" : labels[0] ?? "Name"}
                value={[n1, n2].filter(Boolean).join(" & ") || "—"}
              />
              <Row
                label="Date"
                value={eventDate ? `${eventDate}${eventTime ? ` · ${eventTime}` : ""}` : "Not set"}
              />
              <Row label="Contact" value={contactPhone || "—"} />
              <div className="flex items-baseline justify-between gap-4 pt-2.5">
                <dt className="font-heading text-sm font-semibold">Total</dt>
                <dd className="font-heading text-xl font-bold text-[color:var(--gold-deep)]">
                  {PRICE_LABEL}
                </dd>
              </div>
            </dl>
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground">
            One payment, no subscription. Your invitation is created the moment
            payment succeeds, and everything else — photos, events, guest lists
            and links — is editable afterwards.
          </p>

          {signupId ? <PayButton /> : null}

          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => setStep(3)}
          >
            ← Change my details
          </Button>
        </div>
      ) : null}
    </div>
  );
}
