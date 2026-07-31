import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LandingNavbar } from "@/components/landing/navbar";
import { GoToTop } from "@/modules/website/render/go-to-top";

export const metadata: Metadata = {
  title: "About Us · Join the Jashn",
  description:
    "The story behind JoinTheJashn — luxury digital wedding invitations and personalized wedding websites that turn an announcement into an experience your guests can revisit for years.",
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10 border-t border-[color:var(--l-line)] pt-10">
      <h2 className="l-display text-[1.7rem] font-semibold text-[color:var(--l-wine)] sm:text-[2rem]">
        <span className="mr-2 text-[color:var(--l-gold)]">✦</span>
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-[17px] leading-relaxed text-[color:var(--l-ink-soft)] sm:text-lg">
        {children}
      </div>
    </section>
  );
}

function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5 marker:text-[color:var(--l-gold)]">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}

function Em({ children }: { children: ReactNode }) {
  return (
    <strong className="font-semibold text-[color:var(--l-ink)]">{children}</strong>
  );
}

export default function AboutPage() {
  return (
    <div className="landing">
      <LandingNavbar />
      <main>
        {/* Wine header band — gives the transparent fixed navbar a dark backdrop. */}
        <header className="bg-[color:var(--l-wine)] px-5 pb-16 pt-32 text-center text-[color:var(--l-ivory)] sm:px-8">
          <p className="l-script text-2xl text-[color:var(--l-gold-lite)]">
            Join the Jashn
          </p>
          <h1 className="l-display mt-2 text-4xl font-semibold sm:text-5xl">
            About Us
          </h1>
          <p className="l-display mx-auto mt-5 max-w-2xl text-lg italic text-white/80 sm:text-xl">
            Every celebration deserves a beautiful beginning.
          </p>
        </header>

        <div className="bg-[color:var(--l-ivory)] px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-3xl">
            <p className="text-lg leading-relaxed text-[color:var(--l-ink)]">
              At <Em>JoinTheJashn</Em>, we believe a wedding invitation is more than
              just an announcement—it&apos;s the first chapter of a celebration. It
              sets the tone, tells a story, and creates excitement long before the
              festivities begin.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-[color:var(--l-ink)]">
              Our mission is simple: to transform traditional invitations into elegant
              digital experiences that couples love to share and guests love to
              explore.
            </p>

            <Section title="How It All Started">
              <p>Like many great ideas, ours began with a personal story.</p>
              <p>
                A close friend of ours, who happens to be a software developer, was
                preparing for his wedding. Instead of sending a conventional printed
                invitation, he built a beautiful website that reflected his
                personality and relationship.
              </p>
              <p>The website wasn&apos;t just an invitation.</p>
              <p>
                It introduced the couple, shared their journey together, showcased
                their favorite memories through photos and videos, helped guests
                navigate to the venue, collected RSVPs, and became a single place
                where every important detail about the wedding lived.
              </p>
              <p>
                When he shared the link with friends and family, the response was
                overwhelming. Guests didn&apos;t just receive an invitation—they
                experienced the wedding before it even began.
              </p>
              <p>
                Even after the celebrations ended, the website remained a digital
                keepsake, preserving memories that could be revisited anytime.
              </p>
              <p>That experience inspired us.</p>
              <p>
                We realized that every couple deserves a beautiful, modern, and
                memorable way to celebrate their story—not just for a day, but for
                years to come.
              </p>
              <p>
                And that&apos;s how <Em>JoinTheJashn</Em> was born.
              </p>
            </Section>

            <Section title="What We Do">
              <p>
                We create luxury digital wedding invitations and personalized wedding
                websites that combine elegant design with modern technology.
              </p>
              <p>
                Every invitation is designed to be effortless, interactive, and
                beautifully crafted for today&apos;s couples.
              </p>
              <p>
                With JoinTheJashn, your invitation becomes much more than a card.
              </p>
              <p>It becomes your wedding&apos;s digital home.</p>
            </Section>

            <Section title="Everything Your Guests Need, In One Place">
              <p>Your personalized invitation website can include:</p>
              <Bullets
                items={[
                  "Your love story",
                  "Wedding timeline and event schedule",
                  "Venue details with interactive maps",
                  "RSVP management",
                  "Photo galleries",
                  "Video memories",
                  "Family introductions",
                  "Accommodation information",
                  "Contact details",
                  "Gift registry (if applicable)",
                  "Music and personalized touches",
                  "Instant sharing via WhatsApp and other platforms",
                ]}
              />
              <p>
                No downloads. No complicated apps. Just one elegant link that works
                seamlessly across devices.
              </p>
            </Section>

            <Section title="Designed for Modern Celebrations">
              <p>
                Today&apos;s celebrations deserve invitations that are as dynamic as
                the memories they represent.
              </p>
              <p>Digital invitations are:</p>
              <Bullets
                items={[
                  "Beautifully designed",
                  "Easy to share",
                  "Instantly accessible",
                  "Environmentally conscious",
                  "Easy to update when needed",
                  "Convenient for guests anywhere in the world",
                ]}
              />
              <p>They combine timeless elegance with modern convenience.</p>
            </Section>

            <Section title="Our Philosophy">
              <p>
                We believe technology should never replace emotion—it should enhance
                it.
              </p>
              <p>Every design decision we make is guided by one simple question:</p>
              <blockquote className="l-display border-l-2 border-[color:var(--l-gold)] pl-5 text-lg italic text-[color:var(--l-wine)]">
                “Will this make the couple&apos;s story feel even more special?”
              </blockquote>
              <p>
                From typography and animations to layouts and interactions, every
                detail is thoughtfully crafted to create an experience that feels
                premium, personal, and unforgettable.
              </p>
            </Section>

            <Section title="Why Couples Choose JoinTheJashn">
              <Bullets
                items={[
                  "Premium, luxury-inspired designs",
                  "Mobile-first experience",
                  "Elegant user interface",
                  "Easy self-management through an admin dashboard",
                  "Secure invitation links",
                  "Fast sharing with friends and family",
                  "Personalized wedding websites",
                  "Reliable support throughout your journey",
                ]}
              />
            </Section>

            <Section title="More Than an Invitation">
              <p>
                Your wedding deserves more than a card that gets misplaced after the
                celebration.
              </p>
              <p>
                It deserves a place where your story begins, your guests stay
                connected, and your memories live on.
              </p>
              <p>
                At <Em>JoinTheJashn</Em>, we&apos;re proud to help couples create
                invitations that are not only beautiful to receive but meaningful to
                revisit.
              </p>
              <p>
                Because some moments deserve to be remembered long after the last
                dance.
              </p>
            </Section>

            <p className="l-display mt-12 border-t border-[color:var(--l-line)] pt-12 text-center text-xl font-semibold text-[color:var(--l-wine)] sm:text-2xl">
              Welcome to JoinTheJashn — where every celebration begins with a story.
            </p>
          </div>
        </div>
      </main>
      <GoToTop bg="#3b1022" ring="#c99a3d" />
    </div>
  );
}
