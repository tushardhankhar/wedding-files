"use client";

import { useState, useTransition } from "react";
import type { WebsiteConfig, Focus } from "@/modules/website/schema";
import { saveWebsiteConfigAction } from "@/modules/website/server/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ImageUpload } from "@/modules/media/client/image-upload";
import { FocusPicker } from "@/modules/media/client/focus-picker";

type Loc = { en: string; hi: string };
const L = (v?: { en: string; hi?: string }): Loc => ({
  en: v?.en ?? "",
  hi: v?.hi ?? "",
});
const loc = (l: Loc) => ({ en: l.en.trim(), hi: l.hi.trim() || undefined });
const filled = (l: Loc) => l.en.trim() !== "" || l.hi.trim() !== "";

interface State {
  tagline: Loc;
  milestones: { when: string; title: Loc; text: Loc }[];
  images: { url: string; caption: Loc; focus?: Focus }[];
  groups: { name: Loc; members: Loc; relation: Loc }[];
  faqs: { q: Loc; a: Loc }[];
  hashtag: string;
  contacts: { name: string; phone: string }[];
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
    groups: (c.family?.groups ?? []).map((g) => ({
      name: L(g.name),
      members: L(g.members),
      relation: L(g.relation),
    })),
    faqs: (c.faq?.items ?? []).map((f) => ({ q: L(f.q), a: L(f.a) })),
    hashtag: c.footer?.hashtag ?? "",
    contacts: (c.footer?.contacts ?? []).map((x) => ({ ...x })),
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
    family: {
      groups: s.groups
        .filter((g) => g.name.en.trim())
        .map((g) => ({
          name: loc(g.name),
          members: filled(g.members) ? loc(g.members) : undefined,
          relation: filled(g.relation) ? loc(g.relation) : undefined,
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
        .map((c) => ({ name: c.name.trim(), phone: c.phone.trim() })),
    },
  };
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

export function ContentEditor({
  weddingId,
  initial,
}: {
  weddingId: string;
  initial: WebsiteConfig;
}) {
  const [s, setS] = useState<State>(() => normalize(initial));
  const [urlDraft, setUrlDraft] = useState("");
  const [editFocus, setEditFocus] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ error?: string; saved?: boolean }>({});

  const set = (patch: Partial<State>) => setS((prev) => ({ ...prev, ...patch }));

  // Functional append so parallel uploads can't clobber each other's writes.
  const addImage = (url: string) =>
    setS((prev) => ({
      ...prev,
      images: [...prev.images, { url, caption: L() }],
    }));

  const setFocus = (i: number, focus: Focus) =>
    setS((prev) => ({
      ...prev,
      images: prev.images.map((x, idx) => (idx === i ? { ...x, focus } : x)),
    }));

  function save() {
    setStatus({});
    startTransition(async () => {
      const res = await saveWebsiteConfigAction(weddingId, toConfig(s));
      setStatus(res);
    });
  }

  return (
    <div className="space-y-5">
      {/* Hero */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hero</CardTitle>
          <CardDescription>A short line under the couple&apos;s names.</CardDescription>
        </CardHeader>
        <CardContent>
          <LocField
            label="Tagline"
            value={s.tagline}
            onChange={(v) => set({ tagline: v })}
          />
        </CardContent>
      </Card>

      {/* Story */}
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

      {/* Gallery */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gallery</CardTitle>
          <CardDescription>
            Upload photos in any size — we optimize and crop them to fit each
            theme automatically.
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

      {/* Family */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Families</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {s.groups.map((g, i) => (
            <Row
              key={i}
              index={i}
              label="Family"
              onRemove={() =>
                set({ groups: s.groups.filter((_, idx) => idx !== i) })
              }
            >
              <LocField
                label="Name"
                value={g.name}
                onChange={(v) =>
                  set({
                    groups: s.groups.map((x, idx) =>
                      idx === i ? { ...x, name: v } : x
                    ),
                  })
                }
              />
              <LocField
                label="Members"
                value={g.members}
                onChange={(v) =>
                  set({
                    groups: s.groups.map((x, idx) =>
                      idx === i ? { ...x, members: v } : x
                    ),
                  })
                }
              />
              <LocField
                label="Relation"
                value={g.relation}
                onChange={(v) =>
                  set({
                    groups: s.groups.map((x, idx) =>
                      idx === i ? { ...x, relation: v } : x
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
                groups: [
                  ...s.groups,
                  { name: L(), members: L(), relation: L() },
                ],
              })
            }
          >
            ＋ Add family
          </Button>
        </CardContent>
      </Card>

      {/* FAQ */}
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
              placeholder="AishaKiRohaniyat"
              onChange={(e) => set({ hashtag: e.target.value })}
            />
          </div>
          {s.contacts.map((c, i) => (
            <Row
              key={i}
              index={i}
              label="Contact"
              onRemove={() =>
                set({ contacts: s.contacts.filter((_, idx) => idx !== i) })
              }
            >
              <div className="grid gap-2 sm:grid-cols-2">
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
              set({ contacts: [...s.contacts, { name: "", phone: "" }] })
            }
          >
            ＋ Add contact
          </Button>
        </CardContent>
      </Card>

      {/* Save bar */}
      <div className="sticky bottom-0 flex items-center gap-3 border-t bg-background/90 py-3 backdrop-blur">
        <Button type="button" onClick={save} disabled={pending}>
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
