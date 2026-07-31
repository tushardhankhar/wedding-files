"use client";

import { useActionState, useState } from "react";
import {
  createWeddingAction,
  type WeddingFormState,
} from "@/modules/weddings/server/actions";
import {
  CATEGORIES,
  themesForCategory,
  getTheme,
  type ThemeCategory,
} from "@/modules/website/themes/registry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

const TITLE_PLACEHOLDER: Record<ThemeCategory, string> = {
  wedding: "e.g. Aisha & Rohan",
  "save-the-date": "e.g. Aisha & Rohan",
  "kids-birthday": "e.g. Aarav's 6th Birthday",
  "baby-shower": "e.g. Aisha & Kabir",
  housewarming: "e.g. The Sharma Family",
  party: "e.g. Rohan's Bachelor Party",
};

/** A sensible default title (and therefore URL slug) per occasion, until the
 * planner edits it. */
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

function Stepper({ step }: { step: 1 | 2 | 3 }) {
  const labels = ["Occasion", "Theme", "Details"];
  return (
    <ol className="mb-6 flex items-center gap-2 text-xs font-medium">
      {labels.map((l, i) => {
        const n = (i + 1) as 1 | 2 | 3;
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
            {i < labels.length - 1 ? (
              <span className="mx-1 h-px w-6 bg-border" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

export function CreateWizard() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [category, setCategory] = useState<ThemeCategory | null>(null);
  const [themeId, setThemeId] = useState<string | null>(null);
  const [n1, setN1] = useState("");
  const [n2, setN2] = useState("");
  const [title, setTitle] = useState("");
  const [titleTouched, setTitleTouched] = useState(false);
  const [state, formAction, pending] = useActionState(
    createWeddingAction,
    {} as WeddingFormState
  );

  const theme = themeId ? getTheme(themeId) : null;
  const subject = theme?.subjectSpec;
  const labels = subject?.labels ?? ["Name", "Second name"];
  const showTwo = subject ? subject.names === 2 : true;
  // Save-the-dates freeze both names — neither may be left blank.
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
                category === c.id ? "border-primary ring-2 ring-primary/30" : "border-border"
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
                <span className="mt-1 block text-[11px] text-muted-foreground/70">
                  {themesForCategory(c.id).length} theme
                  {themesForCategory(c.id).length === 1 ? "" : "s"}
                </span>
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {/* Step 2 — theme */}
      {step === 2 && category ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {themesForCategory(category).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setThemeId(t.id);
                  setStep(3);
                }}
                className={`rounded-xl border p-3 text-left transition-colors hover:border-[color:var(--gold-line)] ${
                  themeId === t.id ? "border-primary ring-2 ring-primary/30" : "border-border"
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
              </button>
            ))}
          </div>
          <Button type="button" variant="ghost" onClick={() => setStep(1)}>
            ← Change occasion
          </Button>
        </div>
      ) : null}

      {/* Step 3 — details */}
      {step === 3 && theme && category ? (
        <Card>
          <CardContent className="pt-6">
            <p className="mb-4 text-sm text-muted-foreground">
              {CATEGORIES.find((c) => c.id === category)?.emoji}{" "}
              <span className="font-medium text-foreground">{theme.name}</span> —
              fill in the essentials. Everything else (photos, timeline,
              theme-specific content) comes next.
            </p>
            <form action={formAction} className="space-y-4">
              <input type="hidden" name="themeId" value={theme.id} />

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
                  The shareable URL is generated from this.
                </p>
              </div>

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

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="eventDate">Event date</Label>
                  <Input id="eventDate" name="eventDate" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventTime">
                    Event time{" "}
                    <span className="font-normal text-muted-foreground">(optional)</span>
                  </Label>
                  <Input id="eventTime" name="eventTime" type="time" />
                </div>
              </div>

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
                />
                <p className="text-xs text-muted-foreground">
                  Your record of who to contact. Include the country code and you
                  can WhatsApp them the setup link in one tap. Only you see this —
                  never the client&apos;s guests.
                </p>
              </div>

              {state.error ? (
                <p className="text-sm text-destructive" role="alert">
                  {state.error}
                </p>
              ) : null}

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep(2)}
                >
                  ← Back
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? <Spinner /> : null}
                  {pending ? "Creating…" : "Create invitation"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
