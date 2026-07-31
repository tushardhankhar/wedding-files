import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LandingNavbar } from "@/components/landing/navbar";
import { GoToTop } from "@/modules/website/render/go-to-top";

export const metadata: Metadata = {
  title: "Terms & Conditions · Join the Jashn",
  description:
    "The Terms & Conditions governing orders, invitation links, payments, refunds, and use of JoinTheJashn's digital invitation services.",
};

function Section({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-10 border-t border-[color:var(--l-line)] pt-10">
      <h2 className="l-display text-[1.7rem] font-semibold text-[color:var(--l-wine)] sm:text-[2rem]">
        <span className="text-[color:var(--l-gold)]">{n}.</span> {title}
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

export default function TermsPage() {
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
            Terms &amp; Conditions
          </h1>
          <p className="mt-5 inline-block rounded-full border border-[color:var(--l-gold-lite)]/40 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--l-gold-lite)]">
            Last updated · July 13, 2026
          </p>
        </header>

        <div className="bg-[color:var(--l-ivory)] px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-3xl">
            <p className="text-lg leading-relaxed text-[color:var(--l-ink)]">
              Welcome to <Em>JoinTheJashn</Em>. By placing an order, accessing our
              website, or using our services, you acknowledge that you have read,
              understood, and agree to be bound by these Terms &amp; Conditions.
            </p>

            <Section n={1} title="Our Services">
              <p>
                JoinTheJashn provides premium digital wedding invitation websites
                designed for weddings and related celebrations.
              </p>
              <p>
                Upon confirmation of your order, we create a personalized digital
                invitation based on the information provided by you and make it
                available through a unique invitation link.
              </p>
            </Section>

            <Section n={2} title="Information Required from Customer">
              <p>
                At the time of placing an order, the customer is required to provide
                only:
              </p>
              <Bullets
                items={[
                  "Bride & Groom names (or names applicable to the event)",
                  "Event/Wedding Date",
                  "Selected Theme",
                ]}
              />
              <p>
                After the invitation has been created, the customer will receive a
                secure Admin Link through which they can independently add, edit, and
                manage information such as (including but not limited to):
              </p>
              <Bullets
                items={[
                  "Event details",
                  "Venue information",
                  "Family details",
                  "Schedule",
                  "Photos",
                  "Videos",
                  "RSVP details",
                  "Contact information",
                  "Gallery",
                  "Accommodation details",
                  "Maps",
                  "Gift Registry",
                  "Music",
                  "Any other editable content made available by JoinTheJashn.",
                ]}
              />
              <p>
                The customer is solely responsible for ensuring that all information
                entered through the Admin Link is accurate and up to date.
              </p>
              <p>
                JoinTheJashn shall not be responsible for any incorrect, incomplete,
                or outdated information entered by the customer.
              </p>
            </Section>

            <Section n={3} title="Theme Selection">
              <p>
                The selected invitation theme can be chosen <Em>only once</Em> at the
                time of order confirmation.
              </p>
              <p>Once the order is confirmed and the invitation has been created:</p>
              <Bullets
                items={[
                  "The selected theme cannot be changed by the customer.",
                  "Theme changes can only be performed by JoinTheJashn administrators.",
                  "Any request for a theme change after confirmation shall be treated as an additional service.",
                  "Theme change requests are subject to availability and additional charges.",
                ]}
              />
              <p>
                JoinTheJashn reserves the right to decline any theme change request.
              </p>
            </Section>

            <Section n={4} title="Admin Link">
              <p>
                The Admin Link is provided exclusively for the customer to manage
                invitation content.
              </p>
              <p>The customer is responsible for:</p>
              <Bullets
                items={[
                  "Keeping the Admin Link confidential.",
                  "Preventing unauthorized access.",
                  "Any modifications made using the Admin Link.",
                ]}
              />
              <p>
                JoinTheJashn shall not be liable for any loss or damage resulting from
                unauthorized sharing or misuse of the Admin Link.
              </p>
            </Section>

            <Section n={5} title="Invitation Link Validity">
              <p>
                The digital invitation link shall remain active for{" "}
                <Em>one (1) year</Em> from the date of delivery.
              </p>
              <p>After the expiry of one year:</p>
              <Bullets
                items={[
                  "The invitation may be disabled or permanently removed.",
                  "Customer content, uploaded images, RSVP data, and other associated information may be permanently deleted.",
                  "JoinTheJashn is under no obligation to maintain backups after the validity period expires.",
                ]}
              />
              <p>
                Customers wishing to extend the validity period must contact
                JoinTheJashn before expiry. Renewal is subject to applicable charges
                and availability.
              </p>
            </Section>

            <Section n={6} title="Payments">
              <p>
                All prices are displayed in Indian Rupees (INR) unless stated
                otherwise.
              </p>
              <p>
                An order is confirmed only after payment has been successfully
                received.
              </p>
              <p>
                JoinTheJashn reserves the right to suspend or delay services for
                unpaid or partially paid orders.
              </p>
            </Section>

            <Section n={7} title="Cancellation & Refund Policy">
              <p>
                Since every invitation is personalized and digitally created
                specifically for the customer:
              </p>
              <Bullets
                items={[
                  <Em key="a">All payments made to JoinTheJashn are final.</Em>,
                  <Em key="b">
                    Payments are strictly non-refundable under any circumstances.
                  </Em>,
                  "Orders cannot be cancelled once payment has been received.",
                  "Failure to use the invitation, change of plans, postponement, cancellation of the event, or any personal reason shall not entitle the customer to any refund.",
                ]}
              />
            </Section>

            <Section n={8} title="Customer Responsibilities">
              <p>The customer agrees:</p>
              <Bullets
                items={[
                  "To use the invitation only for lawful purposes.",
                  "Not to upload illegal, offensive, defamatory, copyrighted, or inappropriate material.",
                  "Not to misuse or attempt unauthorized access to JoinTheJashn's systems.",
                ]}
              />
              <p>
                JoinTheJashn reserves the right to suspend or terminate services in
                case of misuse.
              </p>
            </Section>

            <Section n={9} title="Intellectual Property">
              <p>
                All invitation themes, layouts, source code, animations, graphics,
                designs, branding, and other creative assets remain the exclusive
                intellectual property of JoinTheJashn.
              </p>
              <p>
                Purchasing an invitation grants the customer only a limited,
                non-transferable license to use the invitation for their personal
                event.
              </p>
              <p>Customers may not:</p>
              <Bullets
                items={[
                  "Copy",
                  "Reproduce",
                  "Modify",
                  "Resell",
                  "Redistribute",
                  "Reverse engineer",
                  "Commercially exploit",
                ]}
              />
              <p>
                any part of the invitation or platform without prior written
                permission from JoinTheJashn.
              </p>
            </Section>

            <Section n={10} title="Availability of Service">
              <p>
                While JoinTheJashn strives to provide uninterrupted service, we do not
                guarantee that the invitation website or its associated services will
                always remain available without interruption.
              </p>
              <p>Temporary downtime may occur due to:</p>
              <Bullets
                items={[
                  "Server maintenance",
                  "Software updates",
                  "Internet outages",
                  "Third-party service failures",
                  "Events beyond our reasonable control",
                ]}
              />
            </Section>

            <Section n={11} title="Limitation of Liability">
              <p>
                To the maximum extent permitted by law, JoinTheJashn shall not be
                liable for:
              </p>
              <Bullets
                items={[
                  "Incorrect information entered by the customer",
                  "Loss of data due to customer actions",
                  "Unauthorized sharing of the Admin Link",
                  "Third-party service interruptions",
                  "Internet connectivity issues",
                  "Browser-related compatibility issues",
                  "Any indirect, incidental, or consequential damages arising from the use of the invitation.",
                ]}
              />
              <p>
                Our total liability shall not exceed the amount paid by the customer
                for the relevant order.
              </p>
            </Section>

            <Section n={12} title="Privacy">
              <p>
                Customer information is used solely for providing and improving our
                services.
              </p>
              <p>
                JoinTheJashn does not sell personal information to third parties.
              </p>
            </Section>

            <Section n={13} title="Changes to Terms">
              <p>
                JoinTheJashn reserves the right to modify these Terms &amp; Conditions
                at any time without prior notice.
              </p>
              <p>
                The latest version published on our website shall govern all future
                use of our services.
              </p>
            </Section>

            <Section n={14} title="Governing Law">
              <p>
                These Terms &amp; Conditions shall be governed by and interpreted in
                accordance with the laws of India.
              </p>
              <p>
                Any dispute arising out of or relating to these Terms shall be subject
                to the exclusive jurisdiction of the competent courts at the location
                of JoinTheJashn&apos;s principal place of business.
              </p>
            </Section>

            <Section n={15} title="Contact Us">
              <p>
                For any questions regarding these Terms &amp; Conditions, please
                contact JoinTheJashn through the contact details provided on our
                official website.
              </p>
            </Section>
          </div>
        </div>
      </main>
      <GoToTop bg="#3b1022" ring="#c99a3d" />
    </div>
  );
}
