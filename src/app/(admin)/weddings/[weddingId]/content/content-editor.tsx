"use client";

import { useState, useTransition } from "react";
import type {
  WebsiteConfig,
  Focus,
  Artwork,
  HeroPhoto,
  Experience,
  Localized,
} from "@/modules/website/schema";
import type {
  ThemeSupports,
  ThemeCategory,
} from "@/modules/website/themes/registry";
import { saveWebsiteConfigAction } from "@/modules/website/server/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ImageUpload } from "@/modules/media/client/image-upload";
import { MusicUpload } from "@/modules/media/client/music-upload";
import { WaveformTrimmer } from "@/modules/media/client/waveform-trimmer";
import { FocusPicker } from "@/modules/media/client/focus-picker";
import { ArtworkPicker } from "@/modules/media/client/artwork-picker";
import { MUSIC_LIBRARY, getMusicTrack } from "@/modules/website/music/registry";
import { ThemeArtworkPreview } from "@/modules/website/render/artwork-preview";
import { resolveArtwork } from "@/modules/website/render/artwork-placement";
import {
  MIRAMAR_COPY,
  MIRAMAR_COPY_GROUPS,
  miramarCopy,
  type MiramarCopyKey,
} from "@/modules/website/render/miramar/copy";

type Loc = { en: string; hi: string };
const L = (v?: { en: string; hi?: string }): Loc => ({
  en: v?.en ?? "",
  hi: v?.hi ?? "",
});
const loc = (l: Loc) => ({ en: l.en.trim(), hi: l.hi.trim() || undefined });
const filled = (l: Loc) => l.en.trim() !== "" || l.hi.trim() !== "";

type FamilySide = "groom" | "bride";

/** Placement defaults for a freshly uploaded illustration: exactly where (and
 * how big as) the theme's own drawn figures are. */
const ARTWORK_HOME = { enabled: true, x: 0, y: 0, scale: 1, flip: false };

interface State {
  tagline: Loc;
  milestones: { when: string; title: Loc; text: Loc }[];
  images: { url: string; caption: Loc; focus?: Focus }[];
  /** The client's own illustration replacing the theme's figures (themes with
   * `supports.artwork`). */
  artwork?: Artwork;
  /** One photograph behind the hero (themes with `supports.heroPhoto`). */
  heroPhoto?: HeroPhoto;
  familyMembers: { name: Loc; relation: Loc; side: FamilySide }[];
  faqs: { q: Loc; a: Loc }[];
  hashtag: string;
  contacts: { name: string; phone: string; relation: string }[];
  music: {
    enabled: boolean;
    source: "library" | "custom";
    trackId?: string;
    customUrl?: string;
    loopStart?: number;
    loopEnd?: number;
  };
}

function normalize(c: WebsiteConfig): State {
  return {
    tagline: L(c.hero?.tagline),
    milestones: (c.story?.milestones ?? []).map((m) => ({
      when: m.when,
      title: L(m.title),
      text: L(m.text),
    })),
    images: (c.gallery?.images ?? []).map((i) => ({
      url: i.url,
      caption: L(i.caption),
      focus: i.focus,
    })),
    artwork: c.artwork,
    heroPhoto: c.heroPhoto,
    familyMembers: (c.family?.members ?? []).map((m) => ({
      name: L(m.name),
      relation: L(m.relation),
      side: m.side ?? "groom",
    })),
    faqs: (c.faq?.items ?? []).map((f) => ({ q: L(f.q), a: L(f.a) })),
    hashtag: c.footer?.hashtag ?? "",
    contacts: (c.footer?.contacts ?? []).map((x) => ({
      name: x.name,
      phone: x.phone,
      relation: x.relation ?? "",
    })),
    music: {
      enabled: c.music?.enabled ?? true,
      source: c.music?.source ?? "library",
      trackId: c.music?.trackId,
      customUrl: c.music?.customUrl,
      loopStart: c.music?.loopStart,
      loopEnd: c.music?.loopEnd,
    },
  };
}

function toConfig(s: State): WebsiteConfig {
  return {
    hero: filled(s.tagline) ? { tagline: loc(s.tagline) } : undefined,
    story: {
      milestones: s.milestones
        .filter((m) => m.title.en.trim())
        .map((m) => ({ when: m.when.trim(), title: loc(m.title), text: loc(m.text) })),
    },
    gallery: {
      images: s.images
        .filter((i) => i.url.trim())
        .map((i) => ({
          url: i.url.trim(),
          caption: filled(i.caption) ? loc(i.caption) : undefined,
          focus: i.focus,
        })),
    },
    // Kept even with no upload: `enabled` is the client's own choice about the
    // theme's figures, and dropping it would silently reset that choice.
    artwork: s.artwork
      ? { ...s.artwork, url: s.artwork.url?.trim() || undefined }
      : undefined,
    // Kept even with no upload, for the same reason as `artwork` above: the
    // switch is the client's own choice, not a by-product of having a file.
    heroPhoto: s.heroPhoto
      ? { ...s.heroPhoto, url: s.heroPhoto.url?.trim() || undefined }
      : undefined,
    family: {
      members: s.familyMembers
        .filter((m) => m.name.en.trim())
        .map((m) => ({
          name: loc(m.name),
          relation: filled(m.relation) ? loc(m.relation) : undefined,
          side: m.side,
        })),
    },
    faq: {
      items: s.faqs
        .filter((f) => f.q.en.trim())
        .map((f) => ({ q: loc(f.q), a: loc(f.a) })),
    },
    footer: {
      hashtag: s.hashtag.trim() || undefined,
      contacts: s.contacts
        .filter((c) => c.name.trim())
        .map((c) => ({
          name: c.name.trim(),
          phone: c.phone.trim(),
          relation: c.relation.trim() || undefined,
        })),
    },
    music: {
      enabled: s.music.enabled,
      source: s.music.source,
      trackId: s.music.source === "library" ? s.music.trackId : undefined,
      customUrl: s.music.source === "custom" ? s.music.customUrl : undefined,
      loopStart: s.music.loopStart,
      loopEnd: s.music.loopEnd,
    },
  };
}

// ── Theme-specific ("experience") fields ────────────────────────────────────
type DetailCard = { icon: string; label: Loc; value: Loc };

interface ExpState {
  // afterparty (party)
  eventTitle: Loc;
  guestLabel: string;
  passTier: string;
  venue: string;
  city: string;
  mapsUrl: string;
  partyRule: Loc;
  // confetti (kids-birthday)
  childName: string;
  age: string;
  surprise: Loc;
  secretStar: Loc;
  cards: DetailCard[];
  // little-miracle (baby-shower)
  parents: string;
  lmTitle: Loc;
  wishPrompt: Loc;
  grEnabled: boolean;
  grReveal: Loc;
  grAccent: string;
  // shubh-aarambh (housewarming)
  familyName: Loc;
  saTitle: Loc;
  blessing: Loc;
  rangoli: string[];
}

function normalizeExp(x: Experience): ExpState {
  const ap = x?.afterparty;
  const cf = x?.confetti;
  const lm = x?.littleMiracle;
  const sa = x?.shubhAarambh;
  return {
    eventTitle: L(ap?.eventTitle),
    guestLabel: ap?.guestLabel ?? "",
    passTier: ap?.passTier ?? "",
    venue: ap?.location?.venue ?? "",
    city: ap?.location?.city ?? "",
    mapsUrl: ap?.location?.mapsUrl ?? "",
    partyRule: L(ap?.partyRule),
    childName: cf?.childName ?? "",
    age: cf?.age != null ? String(cf.age) : "",
    surprise: L(cf?.surprise),
    secretStar: L(cf?.secretStar),
    cards: (cf?.cards ?? []).map((c) => ({
      icon: c.icon,
      label: L(c.label),
      value: L(c.value),
    })),
    parents: lm?.parents ?? "",
    lmTitle: L(lm?.title),
    wishPrompt: L(lm?.wishPrompt),
    grEnabled: lm?.genderReveal?.enabled ?? false,
    grReveal: L(lm?.genderReveal?.reveal),
    grAccent: lm?.genderReveal?.accent ?? "#C5A46D",
    familyName: L(sa?.familyName),
    saTitle: L(sa?.title),
    blessing: L(sa?.blessing),
    rangoli: sa?.rangoliColors ?? [],
  };
}

/** Serialize the editable block for the given category. Returns undefined for
 * wedding/save-the-date (no experience block). */
function serializeExp(
  e: ExpState,
  category: ThemeCategory
): WebsiteConfig["experience"] {
  switch (category) {
    case "party":
      return {
        afterparty: {
          eventTitle: filled(e.eventTitle) ? loc(e.eventTitle) : undefined,
          guestLabel: e.guestLabel.trim() || undefined,
          passTier: e.passTier.trim() || undefined,
          location: e.venue.trim()
            ? {
                venue: e.venue.trim(),
                city: e.city.trim() || undefined,
                mapsUrl: e.mapsUrl.trim() || undefined,
              }
            : undefined,
          partyRule: filled(e.partyRule) ? loc(e.partyRule) : undefined,
        },
      };
    case "kids-birthday": {
      const n = parseInt(e.age, 10);
      return {
        confetti: {
          childName: e.childName.trim() || undefined,
          age: Number.isFinite(n) && n >= 1 && n <= 120 ? n : undefined,
          surprise: filled(e.surprise) ? loc(e.surprise) : undefined,
          secretStar: filled(e.secretStar) ? loc(e.secretStar) : undefined,
          cards: e.cards
            .filter((c) => c.icon.trim() || filled(c.label) || filled(c.value))
            .map((c) => ({
              icon: c.icon.trim() || "🎉",
              label: loc(c.label),
              value: loc(c.value),
            })),
        },
      };
    }
    case "baby-shower":
      return {
        littleMiracle: {
          parents: e.parents.trim() || undefined,
          title: filled(e.lmTitle) ? loc(e.lmTitle) : undefined,
          wishPrompt: filled(e.wishPrompt) ? loc(e.wishPrompt) : undefined,
          genderReveal:
            e.grEnabled || filled(e.grReveal)
              ? {
                  enabled: e.grEnabled,
                  reveal: loc(e.grReveal),
                  accent: e.grAccent.trim() || undefined,
                }
              : undefined,
        },
      };
    case "housewarming":
      return {
        shubhAarambh: {
          familyName: filled(e.familyName) ? loc(e.familyName) : undefined,
          title: filled(e.saTitle) ? loc(e.saTitle) : undefined,
          blessing: filled(e.blessing) ? loc(e.blessing) : undefined,
          rangoliColors: e.rangoli.map((c) => c.trim()).filter(Boolean),
        },
      };
    default:
      return undefined;
  }
}

// ── Theme wording (the Miramar's fixed lines) ───────────────────────────────
/**
 * Every line the theme prints, prefilled with the wording the client saw in the
 * preview — NOT with placeholders. Placeholder grey reads as "we will write
 * something here"; the point of this section is that the beautiful default is
 * already theirs and they are editing it, so the real words have to be sitting
 * in the boxes, selectable and deletable.
 */
type CopyState = Partial<Record<MiramarCopyKey, Loc>>;

function normalizeCopy(c: WebsiteConfig): CopyState {
  const resolved = miramarCopy(c);
  const out: CopyState = {};
  for (const key of Object.keys(MIRAMAR_COPY) as MiramarCopyKey[]) {
    out[key] = L(resolved[key]);
  }
  return out;
}

/**
 * Only what the client actually changed goes to the database. Storing all
 * fifty-six every time would freeze this invitation's wording against the
 * theme's — a later fix to a translation or a typo in the defaults would reach
 * every invitation except the ones whose owner had opened this form once.
 */
function serializeCopy(state: CopyState): Record<string, Localized> | undefined {
  const out: Record<string, Localized> = {};
  for (const key of Object.keys(MIRAMAR_COPY) as MiramarCopyKey[]) {
    const v = state[key];
    if (!v) continue;
    const own = loc(v);
    const base = MIRAMAR_COPY[key];
    if (own.en === base.en && (own.hi ?? "") === (base.hi ?? "")) continue;
    out[key] = own;
  }
  return Object.keys(out).length ? out : undefined;
}

// ── small building blocks ──────────────────────────────────────────────────
function LocField({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: Loc;
  onChange: (v: Loc) => void;
  multiline?: boolean;
}) {
  const Field = multiline ? Textarea : Input;
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="grid gap-2 sm:grid-cols-2">
        <Field
          value={value.en}
          onChange={(e) => onChange({ ...value, en: e.target.value })}
          placeholder="English"
        />
        <Field
          value={value.hi}
          onChange={(e) => onChange({ ...value, hi: e.target.value })}
          placeholder="हिंदी"
        />
      </div>
    </div>
  );
}

function SideSelect({
  value,
  onChange,
}: {
  value: FamilySide;
  onChange: (v: FamilySide) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>Side</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as FamilySide)}
        className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
      >
        <option value="groom">Groom&apos;s side</option>
        <option value="bride">Bride&apos;s side</option>
      </select>
    </div>
  );
}

function Row({
  index,
  label,
  onRemove,
  children,
}: {
  index: number;
  label: string;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3 rounded-lg border p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          {label} {index + 1}
        </span>
        <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
          Remove
        </Button>
      </div>
      {children}
    </div>
  );
}

/** The one theme-specific section, shown only for experience categories. */
function ExperienceEditor({
  category,
  exp,
  setExp,
}: {
  category: ThemeCategory;
  exp: ExpState;
  setExp: React.Dispatch<React.SetStateAction<ExpState>>;
}) {
  const up = (patch: Partial<ExpState>) =>
    setExp((prev) => ({ ...prev, ...patch }));

  if (category === "party") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Party details</CardTitle>
          <CardDescription>
            Powers the VIP pass, the classified-location scratch card and the
            hold-to-reveal rule.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <LocField
            label="Event title"
            value={exp.eventTitle}
            onChange={(v) => up({ eventTitle: v })}
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Guest label (on the pass)</Label>
              <Input
                value={exp.guestLabel}
                placeholder="THE CREW"
                onChange={(e) => up({ guestLabel: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Pass tier</Label>
              <Input
                value={exp.passTier}
                placeholder="VIP ACCESS"
                onChange={(e) => up({ passTier: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Venue</Label>
              <Input
                value={exp.venue}
                placeholder="Kitty Su"
                onChange={(e) => up({ venue: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>City</Label>
              <Input
                value={exp.city}
                onChange={(e) => up({ city: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Maps URL</Label>
              <Input
                value={exp.mapsUrl}
                placeholder="https://…"
                onChange={(e) => up({ mapsUrl: e.target.value })}
              />
            </div>
          </div>
          <LocField
            label="Party rule (hold to reveal)"
            multiline
            value={exp.partyRule}
            onChange={(v) => up({ partyRule: v })}
          />
        </CardContent>
      </Card>
    );
  }

  if (category === "kids-birthday") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Birthday details</CardTitle>
          <CardDescription>
            The gift-box reveal, secret star and floating party cards.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Child&apos;s name</Label>
              <Input
                value={exp.childName}
                onChange={(e) => up({ childName: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Age turning</Label>
              <Input
                type="number"
                min={1}
                max={120}
                value={exp.age}
                onChange={(e) => up({ age: e.target.value })}
              />
            </div>
          </div>
          <LocField
            label="Surprise line (before the gift opens)"
            value={exp.surprise}
            onChange={(v) => up({ surprise: v })}
          />
          <LocField
            label="Secret-star reward"
            value={exp.secretStar}
            onChange={(v) => up({ secretStar: v })}
          />
          <div className="space-y-3">
            <Label>Party detail cards</Label>
            {exp.cards.map((c, i) => (
              <Row
                key={i}
                index={i}
                label="Card"
                onRemove={() =>
                  up({ cards: exp.cards.filter((_, idx) => idx !== i) })
                }
              >
                <div className="space-y-1.5">
                  <Label>Icon (emoji)</Label>
                  <Input
                    value={c.icon}
                    placeholder="🎂"
                    onChange={(e) =>
                      up({
                        cards: exp.cards.map((x, idx) =>
                          idx === i ? { ...x, icon: e.target.value } : x
                        ),
                      })
                    }
                  />
                </div>
                <LocField
                  label="Label"
                  value={c.label}
                  onChange={(v) =>
                    up({
                      cards: exp.cards.map((x, idx) =>
                        idx === i ? { ...x, label: v } : x
                      ),
                    })
                  }
                />
                <LocField
                  label="Value"
                  value={c.value}
                  onChange={(v) =>
                    up({
                      cards: exp.cards.map((x, idx) =>
                        idx === i ? { ...x, value: v } : x
                      ),
                    })
                  }
                />
              </Row>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                up({ cards: [...exp.cards, { icon: "", label: L(), value: L() }] })
              }
            >
              ＋ Add card
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (category === "baby-shower") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Baby shower details</CardTitle>
          <CardDescription>
            Parents, wish prompt and the optional gender reveal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Parents</Label>
            <Input
              value={exp.parents}
              placeholder="Aisha & Kabir"
              onChange={(e) => up({ parents: e.target.value })}
            />
          </div>
          <LocField
            label="Title"
            value={exp.lmTitle}
            onChange={(v) => up({ lmTitle: v })}
          />
          <LocField
            label="Wish prompt"
            value={exp.wishPrompt}
            onChange={(v) => up({ wishPrompt: v })}
          />
          <div className="space-y-3 rounded-lg border p-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={exp.grEnabled}
                onChange={(e) => up({ grEnabled: e.target.checked })}
              />
              Enable gender reveal (scratch card)
            </label>
            {exp.grEnabled ? (
              <>
                <LocField
                  label="Reveal text"
                  value={exp.grReveal}
                  onChange={(v) => up({ grReveal: v })}
                />
                <div className="space-y-1.5">
                  <Label>Accent colour</Label>
                  <input
                    type="color"
                    value={exp.grAccent}
                    onChange={(e) => up({ grAccent: e.target.value })}
                    className="h-9 w-16 rounded border"
                    aria-label="Gender reveal accent colour"
                  />
                </div>
              </>
            ) : null}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (category === "housewarming") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ceremony details</CardTitle>
          <CardDescription>
            Family name, blessing and the rangoli colour palette.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <LocField
            label="Family name"
            value={exp.familyName}
            onChange={(v) => up({ familyName: v })}
          />
          <LocField
            label="Title"
            value={exp.saTitle}
            onChange={(v) => up({ saTitle: v })}
          />
          <LocField
            label="Blessing (Hindi + English)"
            multiline
            value={exp.blessing}
            onChange={(v) => up({ blessing: v })}
          />
          <div className="space-y-3">
            <Label>Rangoli colours</Label>
            <div className="flex flex-wrap items-center gap-2">
              {exp.rangoli.map((c, i) => (
                <div key={i} className="flex items-center gap-1">
                  <input
                    type="color"
                    value={c}
                    onChange={(e) =>
                      up({
                        rangoli: exp.rangoli.map((x, idx) =>
                          idx === i ? e.target.value : x
                        ),
                      })
                    }
                    className="h-9 w-12 rounded border"
                    aria-label={`Rangoli colour ${i + 1}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      up({ rangoli: exp.rangoli.filter((_, idx) => idx !== i) })
                    }
                  >
                    ✕
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => up({ rangoli: [...exp.rangoli, "#D99A2B"] })}
            >
              ＋ Add colour
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}

/**
 * THE MIRAMAR — "Words on your website".
 *
 * Fifty-six fields is a lot of form, so it is grouped the way the site is read
 * (invitation → welcome → story → … → footer) and each group starts collapsed
 * with the first one open. Someone here to change one heading opens one group;
 * someone rewriting the whole invitation opens them in order and works down the
 * page.
 */
function ThemeCopyEditor({
  copy,
  setCopy,
}: {
  copy: CopyState;
  setCopy: React.Dispatch<React.SetStateAction<CopyState>>;
}) {
  const [open, setOpen] = useState<string | null>(
    MIRAMAR_COPY_GROUPS[0]?.title ?? null
  );

  const changed = (Object.keys(MIRAMAR_COPY) as MiramarCopyKey[]).filter((k) => {
    const v = copy[k];
    if (!v) return false;
    const base = MIRAMAR_COPY[k];
    return v.en.trim() !== base.en || (v.hi.trim() || undefined) !== base.hi;
  }).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Words on your website</CardTitle>
        <CardDescription>
          Every fixed line your theme prints — the scripture, the headings above
          each section, the buttons, the closing verse. They start as the wording
          you saw in the preview; change any of them and your site follows. Clear
          a line to remove it altogether (buttons and menu items keep their
          wording, since an unlabelled button is a dead one).
          {changed > 0 ? (
            <>
              {" "}
              <span className="font-medium text-foreground">
                {changed} line{changed === 1 ? "" : "s"} changed.
              </span>
            </>
          ) : null}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {MIRAMAR_COPY_GROUPS.map((g) => {
          const isOpen = open === g.title;
          return (
            <div key={g.title} className="rounded-lg border">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : g.title)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left"
              >
                <span className="text-sm font-medium">{g.title}</span>
                <span className="text-muted-foreground">{isOpen ? "−" : "+"}</span>
              </button>
              {isOpen ? (
                <div className="space-y-4 border-t px-3 py-3">
                  {g.hint ? (
                    <p className="text-xs text-muted-foreground">{g.hint}</p>
                  ) : null}
                  {g.fields.map((f) => (
                    <LocField
                      key={f.key}
                      label={f.label}
                      multiline={f.multiline}
                      value={copy[f.key] ?? L(MIRAMAR_COPY[f.key])}
                      onChange={(v) =>
                        setCopy((prev) => ({ ...prev, [f.key]: v }))
                      }
                    />
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
        <Button
          type="button"
          variant="outline"
          disabled={changed === 0}
          onClick={() => setCopy(normalizeCopy({}))}
        >
          Reset all wording to the theme&rsquo;s
        </Button>
      </CardContent>
    </Card>
  );
}

export function ContentEditor({
  weddingId,
  initial,
  themeId,
  initials,
  supports,
  category,
}: {
  weddingId: string;
  initial: WebsiteConfig;
  /** Theme id — the artwork picker previews that theme's own scene. */
  themeId: string;
  /** The couple's monogram — themes that frame the artwork carry it on the frame,
   * so the preview needs it to match the site. */
  initials: string;
  /** Which content sections this theme exposes (from the theme registry). */
  supports: ThemeSupports;
  /** Theme category — decides which theme-specific section (if any) to show. */
  category: ThemeCategory;
}) {
  const [s, setS] = useState<State>(() => normalize(initial));
  const [exp, setExp] = useState<ExpState>(() =>
    normalizeExp(initial.experience)
  );
  /* The Miramar is the one theme that publishes its own copy list. Other themes
     get no wording section — and none of this state ever reaches their save. */
  const editableCopy = themeId === "miramar";
  const [copy, setCopy] = useState<CopyState>(() =>
    editableCopy ? normalizeCopy(initial) : {}
  );
  const [urlDraft, setUrlDraft] = useState("");
  const [artUrlDraft, setArtUrlDraft] = useState("");
  const [heroPhotoUrlDraft, setHeroPhotoUrlDraft] = useState("");
  const [editFocus, setEditFocus] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ error?: string; saved?: boolean }>({});

  const set = (patch: Partial<State>) => setS((prev) => ({ ...prev, ...patch }));

  // Whether the theme is currently drawing an illustration — the switch below
  // starts wherever the theme's own default sits.
  const artworkOn = resolveArtwork(s.artwork, supports.artwork).show;

  const currentTrackUrl =
    s.music.source === "custom"
      ? s.music.customUrl
      : getMusicTrack(s.music.trackId)?.url;

  // Functional append so parallel uploads can't clobber each other's writes.
  const addImage = (url: string) =>
    setS((prev) => ({
      ...prev,
      images: [...prev.images, { url, caption: L() }],
    }));

  // A re-upload swaps the file but keeps the placement the client already dialed
  // in, so replacing a rough sketch with the final art doesn't undo their work.
  const setArtworkUrl = (url: string) =>
    setS((prev) => ({
      ...prev,
      artwork: { ...ARTWORK_HOME, ...prev.artwork, url },
    }));

  // A re-upload swaps the photo but keeps the framing already dialed in.
  const setHeroPhoto = (patch: Partial<HeroPhoto>) =>
    setS((prev) => ({
      ...prev,
      heroPhoto: { enabled: true, ...prev.heroPhoto, ...patch },
    }));

  const setFocus = (i: number, focus: Focus) =>
    setS((prev) => ({
      ...prev,
      images: prev.images.map((x, idx) => (idx === i ? { ...x, focus } : x)),
    }));

  function save() {
    setStatus({});
    const experience = serializeExp(exp, category);
    const cfg: WebsiteConfig = experience
      ? { ...toConfig(s), experience }
      : toConfig(s);
    if (editableCopy) {
      const miramar = serializeCopy(copy);
      cfg.themeCopy = miramar ? { miramar } : undefined;
    } else {
      // Saving from a theme that has no wording section must not throw away the
      // wording another theme's section wrote — switching theme to look at
      // something else and switching back is a normal afternoon.
      cfg.themeCopy = initial.themeCopy;
    }
    startTransition(async () => {
      const res = await saveWebsiteConfigAction(weddingId, cfg);
      setStatus(res);
    });
  }

  return (
    <div className="space-y-5">
      {/* Theme-specific section (parties, birthdays, baby showers, pujas) */}
      <ExperienceEditor category={category} exp={exp} setExp={setExp} />

      {/* The illustration of the couple — the theme's own drawn figures, or the
          client's caricature in their place. */}
      {supports.artwork ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Illustration of the couple
            </CardTitle>
            <CardDescription>
              {supports.artwork === "built-in"
                ? "Your theme draws the two of you into its scene. Keep the illustrated couple, upload a caricature of your own to stand in for them, or switch the illustration off altogether."
                : "Add the two of you to the design — the theme draws an illustrated couple, and you can upload a caricature of your own to stand in for them."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={artworkOn}
                onChange={(e) =>
                  set({ artwork: { ...ARTWORK_HOME, ...s.artwork, enabled: e.target.checked } })
                }
              />
              Show an illustration of the couple
            </label>

            {artworkOn ? (
              <>
                <div className="rounded-md border bg-muted/30 p-3">
                  {s.artwork?.url ? (
                    <ArtworkPicker
                      themeId={themeId}
                      value={s.artwork}
                      initials={initials}
                      onChange={(artwork) => set({ artwork })}
                    />
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-muted-foreground">
                        The theme&apos;s own illustration, as guests will see it.
                        Upload your caricature below to put it here instead.
                      </p>
                      <div className="mx-auto max-w-sm overflow-hidden rounded-lg border">
                        <ThemeArtworkPreview themeId={themeId} initials={initials} />
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  A PNG with a transparent background sits in the design best —
                  trim the empty space around the drawing so it lands where the
                  theme&apos;s figures stand.
                </p>
                <ImageUpload weddingId={weddingId} onUploaded={setArtworkUrl} />

                {s.artwork?.url ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      set({ artwork: { ...ARTWORK_HOME, ...s.artwork, url: undefined } })
                    }
                  >
                    Remove my illustration
                  </Button>
                ) : (
                  <div className="space-y-1.5">
                    <Label htmlFor="artwork-url">Or add by URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="artwork-url"
                        value={artUrlDraft}
                        placeholder="https://…"
                        onChange={(e) => setArtUrlDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && artUrlDraft.trim()) {
                            e.preventDefault();
                            setArtworkUrl(artUrlDraft.trim());
                            setArtUrlDraft("");
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        disabled={!artUrlDraft.trim()}
                        onClick={() => {
                          setArtworkUrl(artUrlDraft.trim());
                          setArtUrlDraft("");
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {/* Hero */}
      {/* One of the couple's own photographs behind the hero. Offered only by
          themes whose hero is a bounded object with a ground behind it — see
          ThemeSupports.heroPhoto. */}
      {supports.heroPhoto ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Photo behind the invitation</CardTitle>
            <CardDescription>
              Your theme sets the invitation down on an illustrated shore. Add one
              of your own photographs and it lies on that instead — softened and
              tinted to the theme&rsquo;s colours so the invitation still reads
              clearly on top. Leave it off to keep the illustrated shore.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                className="size-4"
                checked={s.heroPhoto?.enabled ?? false}
                onChange={(e) => setHeroPhoto({ enabled: e.target.checked })}
              />
              Show a photo behind the invitation
            </label>

            {s.heroPhoto?.enabled ? (
              <>
                {s.heroPhoto.url ? (
                  <div className="space-y-2">
                    <div
                      className="aspect-[3/2] w-full rounded-md border bg-muted bg-cover"
                      style={{
                        backgroundImage: `url(${s.heroPhoto.url})`,
                        backgroundPosition: `${(s.heroPhoto.focus?.x ?? 0.5) * 100}% ${(s.heroPhoto.focus?.y ?? 0.5) * 100}%`,
                      }}
                      role="img"
                      aria-label="Photo behind the invitation"
                    />
                    <p className="text-xs text-muted-foreground">
                      A wide photo works best — on a phone the invitation covers
                      the middle, so keep the two of you off to one side, or set
                      the framing below.
                    </p>
                    <div className="rounded-md border bg-muted/30 p-3">
                      <FocusPicker
                        url={s.heroPhoto.url}
                        value={s.heroPhoto.focus}
                        onChange={(focus) => setHeroPhoto({ focus })}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setHeroPhoto({ url: undefined })}
                    >
                      Remove photo
                    </Button>
                  </div>
                ) : (
                  <>
                    <ImageUpload
                      weddingId={weddingId}
                      onUploaded={(url) => setHeroPhoto({ url })}
                    />
                    <div className="space-y-1.5">
                      <Label htmlFor="hero-photo-url">Or add by URL</Label>
                      <div className="flex gap-2">
                        <Input
                          id="hero-photo-url"
                          value={heroPhotoUrlDraft}
                          placeholder="https://…"
                          onChange={(e) => setHeroPhotoUrlDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && heroPhotoUrlDraft.trim()) {
                              e.preventDefault();
                              setHeroPhoto({ url: heroPhotoUrlDraft.trim() });
                              setHeroPhotoUrlDraft("");
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          disabled={!heroPhotoUrlDraft.trim()}
                          onClick={() => {
                            setHeroPhoto({ url: heroPhotoUrlDraft.trim() });
                            setHeroPhotoUrlDraft("");
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {/* Every word the theme prints, editable. Placed here — above the
          content sections — because it is where a client goes to change what
          the site SAYS, as opposed to what is on it. */}
      {editableCopy ? <ThemeCopyEditor copy={copy} setCopy={setCopy} /> : null}

      {/* The tagline is the older, single-field way to replace a theme's hero
          line. A theme with its own wording section already offers it there (on
          the Miramar it is "Scripture / opening quote", prefilled from whatever
          tagline this invitation already had), and two boxes writing the same
          line is how one of them silently loses. */}
      {supports.taglineHero && !editableCopy ? (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hero</CardTitle>
          <CardDescription>A short line under the names.</CardDescription>
        </CardHeader>
        <CardContent>
          <LocField
            label="Tagline"
            value={s.tagline}
            onChange={(v) => set({ tagline: v })}
          />
        </CardContent>
      </Card>
      ) : null}

      {/* Story */}
      {supports.story ? (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Our story</CardTitle>
          <CardDescription>Milestones shown as a timeline.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {s.milestones.map((m, i) => (
            <Row
              key={i}
              index={i}
              label="Milestone"
              onRemove={() =>
                set({ milestones: s.milestones.filter((_, idx) => idx !== i) })
              }
            >
              <div className="space-y-1.5">
                <Label>When</Label>
                <Input
                  value={m.when}
                  placeholder="e.g. 2019"
                  onChange={(e) =>
                    set({
                      milestones: s.milestones.map((x, idx) =>
                        idx === i ? { ...x, when: e.target.value } : x
                      ),
                    })
                  }
                />
              </div>
              <LocField
                label="Title"
                value={m.title}
                onChange={(v) =>
                  set({
                    milestones: s.milestones.map((x, idx) =>
                      idx === i ? { ...x, title: v } : x
                    ),
                  })
                }
              />
              <LocField
                label="Text"
                multiline
                value={m.text}
                onChange={(v) =>
                  set({
                    milestones: s.milestones.map((x, idx) =>
                      idx === i ? { ...x, text: v } : x
                    ),
                  })
                }
              />
            </Row>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              set({
                milestones: [
                  ...s.milestones,
                  { when: "", title: L(), text: L() },
                ],
              })
            }
          >
            ＋ Add milestone
          </Button>
        </CardContent>
      </Card>
      ) : null}

      {/* Gallery */}
      {supports.gallery ? (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gallery</CardTitle>
          <CardDescription>
            Upload photos in any size — we optimize and crop them to fit each
            theme automatically.
            {/* The Miramar also runs photographs full-width BETWEEN its
                sections, and it takes them from this list rather than from a
                second uploader — one set of photographs, used twice. Without
                this line there is nothing anywhere to tell the client that the
                order of these uploads decides what appears between the pages,
                which is the first thing they ask. */}
            {themeId === "miramar" ? (
              <>
                {" "}
                Your first three photos also appear full-width between the
                sections — the first two together after “Our Story”, the third
                after “Our Families”. Reorder them here to change which ones.
              </>
            ) : null}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ImageUpload weddingId={weddingId} onUploaded={addImage} />

          {s.images.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {s.images.map((img, i) => (
                <div key={i} className="space-y-2 rounded-lg border p-3">
                  <div className="relative">
                    <div
                      className="aspect-[4/3] w-full rounded-md bg-muted bg-cover"
                      style={
                        img.url
                          ? {
                              backgroundImage: `url(${img.url})`,
                              backgroundPosition: `${(img.focus?.x ?? 0.5) * 100}% ${(img.focus?.y ?? 0.5) * 100}%`,
                            }
                          : undefined
                      }
                      role="img"
                      aria-label={`Photo ${i + 1}`}
                    />
                    {/* The position, shown on the photo itself. Order was
                        invisible here, which was survivable while the gallery
                        was one grid — but the Miramar spends photos 1–3 between
                        its sections, so "which one is third?" became a question
                        the screen had to answer without being counted. */}
                    <span className="absolute left-2 top-2 rounded-full bg-background/85 px-2 py-0.5 text-xs font-medium tabular-nums shadow-sm">
                      {i + 1}
                    </span>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="absolute right-2 top-2"
                      onClick={() => {
                        setEditFocus(null);
                        set({
                          images: s.images.filter((_, idx) => idx !== i),
                        });
                      }}
                    >
                      Remove
                    </Button>
                  </div>

                  {/* Reordering. Without it the only way to change which photos
                      run between the sections was to remove everything and
                      re-upload in a different order. Any open framing editor is
                      closed first: it is keyed by index, so moving a photo
                      underneath it would leave it editing whichever photo
                      happened to land on that number. */}
                  {s.images.length > 1 ? (
                    <div className="flex gap-2">
                      {(
                        [
                          ["Move earlier", -1, i === 0],
                          ["Move later", 1, i === s.images.length - 1],
                        ] as const
                      ).map(([label, delta, disabled]) => (
                        <Button
                          key={label}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          disabled={disabled}
                          onClick={() => {
                            setEditFocus(null);
                            const next = [...s.images];
                            const [moved] = next.splice(i, 1);
                            next.splice(i + delta, 0, moved);
                            set({ images: next });
                          }}
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  ) : null}

                  {img.url ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() =>
                        setEditFocus((cur) => (cur === i ? null : i))
                      }
                    >
                      {editFocus === i ? "Done adjusting" : "Adjust framing"}
                    </Button>
                  ) : null}

                  {editFocus === i && img.url ? (
                    <div className="rounded-md border bg-muted/30 p-3">
                      <FocusPicker
                        url={img.url}
                        value={img.focus}
                        onChange={(f) => setFocus(i, f)}
                      />
                    </div>
                  ) : null}

                  <LocField
                    label="Caption"
                    value={img.caption}
                    onChange={(v) =>
                      set({
                        images: s.images.map((x, idx) =>
                          idx === i ? { ...x, caption: v } : x
                        ),
                      })
                    }
                  />
                </div>
              ))}
            </div>
          ) : null}

          {/* Fallback: paste an image URL (e.g. an existing hosted photo). */}
          <div className="space-y-1.5">
            <Label htmlFor="gallery-url">Or add by URL</Label>
            <div className="flex gap-2">
              <Input
                id="gallery-url"
                value={urlDraft}
                placeholder="https://…"
                onChange={(e) => setUrlDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && urlDraft.trim()) {
                    e.preventDefault();
                    addImage(urlDraft.trim());
                    setUrlDraft("");
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                disabled={!urlDraft.trim()}
                onClick={() => {
                  addImage(urlDraft.trim());
                  setUrlDraft("");
                }}
              >
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      ) : null}

      {/* Background music */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Background music</CardTitle>
          <CardDescription>
            Plays softly on the invite. On by default — guests can mute it
            from a toggle on the page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={s.music.enabled}
              onChange={(e) =>
                set({ music: { ...s.music, enabled: e.target.checked } })
              }
            />
            Play music on this invite
          </label>

          {s.music.enabled ? (
            <>
              <div className="flex gap-4 text-sm">
                <label className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    name="music-source"
                    checked={s.music.source === "library"}
                    onChange={() => set({ music: { ...s.music, source: "library" } })}
                  />
                  Pick from our library
                </label>
                <label className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    name="music-source"
                    checked={s.music.source === "custom"}
                    onChange={() => set({ music: { ...s.music, source: "custom" } })}
                  />
                  Upload my own
                </label>
              </div>

              {s.music.source === "library" ? (
                <div className="space-y-1.5">
                  <Label>Track</Label>
                  <select
                    value={s.music.trackId ?? ""}
                    onChange={(e) =>
                      set({
                        music: {
                          ...s.music,
                          trackId: e.target.value || undefined,
                          loopStart: undefined,
                          loopEnd: undefined,
                        },
                      })
                    }
                    className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
                  >
                    <option value="">Choose a track…</option>
                    {MUSIC_LIBRARY.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title} — {t.artist}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-2">
                  {s.music.customUrl ? (
                    <div className="flex items-center gap-2">
                      <audio controls src={s.music.customUrl} className="h-8 flex-1" />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          set({
                            music: {
                              ...s.music,
                              customUrl: undefined,
                              loopStart: undefined,
                              loopEnd: undefined,
                            },
                          })
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <MusicUpload
                      weddingId={weddingId}
                      onUploaded={(url) =>
                        set({
                          music: {
                            ...s.music,
                            customUrl: url,
                            loopStart: undefined,
                            loopEnd: undefined,
                          },
                        })
                      }
                    />
                  )}
                </div>
              )}

              {currentTrackUrl ? (
                <div className="space-y-1.5">
                  <Label>Loop segment</Label>
                  <WaveformTrimmer
                    key={currentTrackUrl}
                    url={currentTrackUrl}
                    value={
                      s.music.loopStart != null && s.music.loopEnd != null
                        ? { start: s.music.loopStart, end: s.music.loopEnd }
                        : undefined
                    }
                    onChange={(range) =>
                      set({
                        music: { ...s.music, loopStart: range.start, loopEnd: range.end },
                      })
                    }
                  />
                </div>
              ) : null}
            </>
          ) : null}
        </CardContent>
      </Card>

      {/* Family */}
      {supports.family ? (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Family</CardTitle>
          <CardDescription>
            Add family members one by one — pick which side each belongs to.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {s.familyMembers.map((m, i) => (
            <Row
              key={i}
              index={i}
              label="Member"
              onRemove={() =>
                set({
                  familyMembers: s.familyMembers.filter((_, idx) => idx !== i),
                })
              }
            >
              <LocField
                label="Name"
                value={m.name}
                onChange={(v) =>
                  set({
                    familyMembers: s.familyMembers.map((x, idx) =>
                      idx === i ? { ...x, name: v } : x
                    ),
                  })
                }
              />
              <LocField
                label="Relation"
                value={m.relation}
                onChange={(v) =>
                  set({
                    familyMembers: s.familyMembers.map((x, idx) =>
                      idx === i ? { ...x, relation: v } : x
                    ),
                  })
                }
              />
              <SideSelect
                value={m.side}
                onChange={(v) =>
                  set({
                    familyMembers: s.familyMembers.map((x, idx) =>
                      idx === i ? { ...x, side: v } : x
                    ),
                  })
                }
              />
            </Row>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              set({
                familyMembers: [
                  ...s.familyMembers,
                  { name: L(), relation: L(), side: "groom" },
                ],
              })
            }
          >
            ＋ Add member
          </Button>
        </CardContent>
      </Card>
      ) : null}

      {/* FAQ */}
      {supports.faq ? (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">FAQ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {s.faqs.map((f, i) => (
            <Row
              key={i}
              index={i}
              label="Question"
              onRemove={() =>
                set({ faqs: s.faqs.filter((_, idx) => idx !== i) })
              }
            >
              <LocField
                label="Question"
                value={f.q}
                onChange={(v) =>
                  set({
                    faqs: s.faqs.map((x, idx) =>
                      idx === i ? { ...x, q: v } : x
                    ),
                  })
                }
              />
              <LocField
                label="Answer"
                multiline
                value={f.a}
                onChange={(v) =>
                  set({
                    faqs: s.faqs.map((x, idx) =>
                      idx === i ? { ...x, a: v } : x
                    ),
                  })
                }
              />
            </Row>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => set({ faqs: [...s.faqs, { q: L(), a: L() }] })}
          >
            ＋ Add question
          </Button>
        </CardContent>
      </Card>
      ) : null}

      {/* Footer */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Footer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="hashtag">Hashtag</Label>
            <Input
              id="hashtag"
              value={s.hashtag}
              placeholder="OurCelebration2026"
              onChange={(e) => set({ hashtag: e.target.value })}
            />
          </div>
          {/* Save-the-dates are a bare announcement — no point-of-contact list. */}
          {category !== "save-the-date" ? (
            <>
              {s.contacts.map((c, i) => (
                <Row
                  key={i}
                  index={i}
                  label="Contact"
                  onRemove={() =>
                    set({ contacts: s.contacts.filter((_, idx) => idx !== i) })
                  }
                >
                  <div className="grid gap-2 sm:grid-cols-3">
                    <Input
                      value={c.name}
                      placeholder="Name"
                      onChange={(e) =>
                        set({
                          contacts: s.contacts.map((x, idx) =>
                            idx === i ? { ...x, name: e.target.value } : x
                          ),
                        })
                      }
                    />
                    <Input
                      value={c.relation}
                      placeholder="Relation (optional)"
                      onChange={(e) =>
                        set({
                          contacts: s.contacts.map((x, idx) =>
                            idx === i ? { ...x, relation: e.target.value } : x
                          ),
                        })
                      }
                    />
                    <Input
                      value={c.phone}
                      placeholder="+91 …"
                      onChange={(e) =>
                        set({
                          contacts: s.contacts.map((x, idx) =>
                            idx === i ? { ...x, phone: e.target.value } : x
                          ),
                        })
                      }
                    />
                  </div>
                </Row>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  set({
                    contacts: [
                      ...s.contacts,
                      { name: "", phone: "", relation: "" },
                    ],
                  })
                }
              >
                ＋ Add contact
              </Button>
            </>
          ) : null}
        </CardContent>
      </Card>

      {/* Save bar */}
      <div className="sticky bottom-0 flex items-center gap-3 border-t bg-background/90 py-3 backdrop-blur">
        <Button type="button" onClick={save} disabled={pending}>
          {pending ? <Spinner /> : null}
          {pending ? "Saving…" : "Save content"}
        </Button>
        {status.saved ? (
          <span className="text-sm text-muted-foreground" role="status">
            Saved — check the preview.
          </span>
        ) : null}
        {status.error ? (
          <span className="text-sm text-destructive" role="alert">
            {status.error}
          </span>
        ) : null}
      </div>
    </div>
  );
}
