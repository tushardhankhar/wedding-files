"use client";

import { useState, useTransition } from "react";
import { sendGTMEvent } from "@next/third-parties/google";
import { submitEnquiryAction } from "@/modules/contact/server/actions";
import { PetalField } from "./art";
import { CONTACT_EMAIL } from "./data";

/**
 * Landing-page enquiry form. Collects name, email, phone and a query and emails
 * them to the site owner (via `submitEnquiryAction` → Resend). Includes a hidden
 * honeypot field to deter basic spam bots.
 */
export function EnquirySection() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    query: "",
    company: "", // honeypot
  });
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<{ ok?: boolean; error?: string }>({});

  const set = (k: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setState({});
    startTransition(async () => {
      const res = await submitEnquiryAction(form);
      setState(res);
      if (res.ok) {
        // The one conversion GTM can't infer on its own: it can see the submit
        // event fire, but not whether the server actually accepted the enquiry.
        // Deliberately no name/email/phone in the payload — sending personal
        // data to GA4 breaches Google's terms and isn't needed to count a lead.
        sendGTMEvent({ event: "enquiry_submitted" });
        setForm({ name: "", email: "", phone: "", query: "", company: "" });
      }
    });
  }

  const field =
    "w-full rounded-xl border border-[color:var(--l-line)] bg-white px-4 py-3 text-sm text-[color:var(--l-ink)] outline-none transition-colors placeholder:text-[color:var(--l-ink-soft)]/60 focus:border-[color:var(--l-gold)]";

  return (
    <section
      id="enquire"
      className="l-grain relative scroll-mt-24 overflow-hidden px-5 py-28 sm:px-8 sm:py-32"
      style={{
        background:
          "radial-gradient(75% 60% at 15% 8%, rgba(245,166,35,.42), transparent 55%), radial-gradient(70% 60% at 88% 92%, rgba(216,27,96,.5), transparent 55%), linear-gradient(160deg, #3b1022 0%, #57122e 52%, #2a0a18 120%)",
      }}
    >
      <PetalField count={12} />
      <div className="relative mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
        <div data-reveal>
          <p className="l-script text-3xl text-[color:var(--l-gold-lite)]">Let&apos;s talk</p>
          <h2 className="l-display mt-2 text-balance text-[clamp(2.5rem,6vw,4.2rem)] font-semibold leading-[1.04] text-white">
            Talk to us.
            <br />
            <span className="italic text-[color:var(--l-gold-lite)]">We&apos;d love to help.</span>
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-white/85">
            Planning a celebration, or just curious how it works? Drop your details
            and we&apos;ll get back to you personally — usually within a day.
          </p>
          <p className="mt-6 text-sm text-white/75">
            Prefer email?{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-semibold text-[color:var(--l-gold-lite)] underline-offset-4 hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
        </div>

        <div
          className="relative rounded-[26px] bg-[color:var(--l-ivory)] p-6 shadow-[0_44px_90px_-28px_rgba(0,0,0,.7)] sm:p-8"
          data-reveal
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-2.5 rounded-[20px] border border-[color:var(--l-gold)]/30"
          />
          {state.ok ? (
            <div className="py-8 text-center" role="status">
              <p className="l-display text-2xl font-semibold text-[color:var(--l-wine)]">
                Thank you ✨
              </p>
              <p className="mt-2 text-sm text-[color:var(--l-ink-soft)]">
                Your enquiry is on its way — we&apos;ll be in touch soon.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              {/* Honeypot — visually hidden, not shown to real users. */}
              <input
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={form.company}
                onChange={set("company")}
                className="absolute left-[-9999px] h-0 w-0 opacity-0"
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  required
                  placeholder="Your name"
                  autoComplete="name"
                  value={form.name}
                  onChange={set("name")}
                  className={field}
                  aria-label="Your name"
                />
                <input
                  required
                  type="tel"
                  inputMode="tel"
                  placeholder="Phone number"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={set("phone")}
                  className={field}
                  aria-label="Phone number"
                />
              </div>
              <input
                required
                type="email"
                inputMode="email"
                placeholder="Email address"
                autoComplete="email"
                value={form.email}
                onChange={set("email")}
                className={field}
                aria-label="Email address"
              />
              <textarea
                required
                rows={4}
                placeholder="How can we help?"
                value={form.query}
                onChange={set("query")}
                className={`${field} resize-y`}
                aria-label="Your query"
              />

              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-full bg-[color:var(--l-wine)] px-8 py-3.5 text-sm font-semibold text-[color:var(--l-gold-lite)] transition-transform hover:-translate-y-0.5 disabled:opacity-70"
              >
                {pending ? "Sending…" : "Send enquiry"}
              </button>

              {state.error ? (
                <p className="text-center text-sm text-[color:var(--l-red)]" role="alert">
                  {state.error}
                </p>
              ) : null}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
