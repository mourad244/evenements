import type { Metadata } from "next";
import Link from "next/link";

import { ROUTES } from "@/lib/constants/routes";

export const metadata: Metadata = {
  title: "Terms of Service"
};

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: [
      {
        subtitle: "Agreement to terms",
        body: "By creating an account or using EventOS in any capacity, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, you may not access or use the platform."
      },
      {
        subtitle: "Capacity to agree",
        body: "You must be at least 16 years of age to create an account. By registering, you represent that you meet this requirement and that all information you provide is accurate and complete."
      }
    ]
  },
  {
    title: "2. Account Responsibilities",
    content: [
      {
        subtitle: "Account security",
        body: "You are responsible for maintaining the confidentiality of your credentials and for all activity that occurs under your account. Notify us immediately at security@evenetos.app if you suspect unauthorized access."
      },
      {
        subtitle: "Accurate information",
        body: "You agree to provide accurate, current, and complete information during registration and to update it as necessary. Accounts created with false information may be suspended without notice."
      },
      {
        subtitle: "One account per person",
        body: "Each individual may maintain only one personal account. Organizational accounts for event management purposes may be discussed with our team."
      }
    ]
  },
  {
    title: "3. Participant Rules",
    content: [
      {
        subtitle: "Registration conduct",
        body: "As a participant, you agree to register for events only if you genuinely intend to attend or participate. Registering for events with no intention of attending, or registering on behalf of others without authorization, is prohibited."
      },
      {
        subtitle: "Cancellations",
        body: "You may cancel a registration at any time. Cancellations release your spot for other participants on the waitlist. Refund policies are determined by the event organizer and communicated before registration."
      },
      {
        subtitle: "Ticket use",
        body: "Tickets issued through EventOS are personal and non-transferable unless the event organizer explicitly permits transfers. Reselling or distributing tickets for commercial gain is prohibited."
      }
    ]
  },
  {
    title: "4. Organizer Rules",
    content: [
      {
        subtitle: "Accurate event information",
        body: "As an organizer, you are solely responsible for the accuracy of all event details you publish, including dates, locations, capacity, pricing, and descriptions. EventOS is not liable for inaccuracies in organizer-submitted content."
      },
      {
        subtitle: "Prohibited events",
        body: "You may not use EventOS to organize events that are illegal, promote violence or hatred, involve fraudulent activity, or violate any applicable local, national, or international law."
      },
      {
        subtitle: "Participant data",
        body: "Organizers may access participant names and registration statuses for their own events. This data may only be used to administer the event. Organizers may not sell, share, or use participant data for any other purpose."
      },
      {
        subtitle: "Pricing and payments",
        body: "If you charge for event attendance, you are responsible for clearly communicating pricing, refund conditions, and any applicable taxes. EventOS is not responsible for disputes between organizers and participants over payments."
      }
    ]
  },
  {
    title: "5. Prohibited Conduct",
    content: [
      {
        subtitle: "General prohibitions",
        body: "You agree not to: attempt to gain unauthorized access to any part of the platform; use automated tools to scrape, crawl, or extract data; impersonate any person or entity; upload malicious code or interfere with platform operations; or use the platform for any unlawful purpose."
      },
      {
        subtitle: "Content standards",
        body: "Any content you submit (event titles, descriptions, names) must not be defamatory, obscene, discriminatory, or infringing on third-party intellectual property rights. EventOS reserves the right to remove non-compliant content."
      }
    ]
  },
  {
    title: "6. Intellectual Property",
    content: [
      {
        subtitle: "EventOS platform",
        body: "The EventOS name, logo, design, and software are the intellectual property of EventOS and its licensors. You may not copy, reproduce, or create derivative works from any part of the platform without explicit written permission."
      },
      {
        subtitle: "Your content",
        body: "You retain ownership of content you submit (event descriptions, profile information). By submitting content, you grant EventOS a limited, non-exclusive, royalty-free license to display and distribute it as necessary to operate the platform."
      }
    ]
  },
  {
    title: "7. Disclaimers and Limitation of Liability",
    content: [
      {
        subtitle: "Platform availability",
        body: "EventOS is provided on an 'as is' and 'as available' basis. We do not warrant that the platform will be uninterrupted, error-free, or free of harmful components. We may suspend or discontinue the platform at any time with reasonable notice."
      },
      {
        subtitle: "Third-party events",
        body: "EventOS is a platform connecting participants and organizers. We do not endorse, sponsor, or take responsibility for any events listed on the platform. Participation in any event is at your own risk."
      },
      {
        subtitle: "Limitation of liability",
        body: "To the fullest extent permitted by law, EventOS shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform, even if advised of the possibility of such damages."
      }
    ]
  },
  {
    title: "8. Termination",
    content: [
      {
        subtitle: "By you",
        body: "You may delete your account at any time from your account settings. Deletion is permanent and removes access to your registration history and tickets."
      },
      {
        subtitle: "By EventOS",
        body: "We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or pose a security risk to the platform or its users. We will provide notice unless immediate action is required to protect the platform."
      }
    ]
  },
  {
    title: "9. Governing Law and Disputes",
    content: [
      {
        subtitle: "Governing law",
        body: "These terms are governed by the laws of the Kingdom of Morocco. Any disputes arising from or related to these terms shall be subject to the exclusive jurisdiction of the courts of Casablanca, Morocco."
      },
      {
        subtitle: "Informal resolution",
        body: "Before initiating any formal dispute, you agree to contact us at legal@evenetos.app to attempt an informal resolution. We will respond within 14 business days."
      }
    ]
  },
  {
    title: "10. Changes to These Terms",
    content: [
      {
        subtitle: "Notification",
        body: "We may update these Terms of Service from time to time. We will notify you by email or platform notice at least 14 days before material changes take effect. Your continued use of EventOS after the effective date constitutes acceptance of the revised terms."
      }
    ]
  }
];

export default function TermsOfServicePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-12 grid gap-4 border-b border-[var(--line-soft)] pb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-warm)]">
          Legal
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-5xl">
          Terms of Service
        </h1>
        <p className="max-w-xl text-base leading-7 text-[var(--text-secondary)]">
          These terms govern your use of the EventOS platform, whether as a participant, organizer, or administrator. Please read them carefully before creating an account.
        </p>
        <div className="flex flex-wrap gap-3 text-sm text-[var(--text-muted)]">
          <span className="rounded-full border border-[var(--line-soft)] bg-[rgba(255,255,255,0.04)] px-3 py-1">
            Effective date: January 1, 2025
          </span>
          <span className="rounded-full border border-[var(--line-soft)] bg-[rgba(255,255,255,0.04)] px-3 py-1">
            Last updated: April 1, 2025
          </span>
        </div>
      </div>

      {/* Sections */}
      <div className="grid gap-10">
        {sections.map((section) => (
          <div key={section.title} className="grid gap-5">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              {section.title}
            </h2>
            <div className="grid gap-4">
              {section.content.map((item) => (
                <div
                  key={item.subtitle}
                  className="rounded-[22px] border border-[var(--line-soft)] bg-[rgba(255,255,255,0.025)] px-5 py-4"
                >
                  <p className="mb-1.5 text-sm font-semibold text-[var(--text-primary)]">
                    {item.subtitle}
                  </p>
                  <p className="text-sm leading-7 text-[var(--text-secondary)]">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* CTA block */}
      <div className="mt-14 grid gap-5 rounded-[28px] border border-[rgba(243,154,99,0.18)] bg-[radial-gradient(circle_at_top_right,rgba(243,154,99,0.12),transparent_30%),linear-gradient(180deg,rgba(18,28,46,0.94),rgba(9,15,26,0.98))] p-6">
        <div className="grid gap-1.5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-warm)]">
            Questions about these terms?
          </p>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Contact us</h2>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            For questions about these Terms of Service, contact us at{" "}
            <span className="font-medium text-[var(--text-primary)]">legal@evenetos.app</span>. For privacy-related questions, see our Privacy Policy.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href={ROUTES.privacyPolicy}
            className="rounded-full border border-[var(--line-soft)] bg-[rgba(255,255,255,0.04)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors duration-150 hover:border-[var(--line-strong)] hover:text-[var(--text-primary)]"
          >
            Privacy Policy →
          </Link>
          <Link
            href={ROUTES.register}
            className="rounded-full border border-[rgba(243,154,99,0.3)] bg-[rgba(243,154,99,0.1)] px-4 py-2 text-sm font-medium text-[var(--accent-warm)] transition-colors duration-150 hover:bg-[rgba(243,154,99,0.18)]"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
