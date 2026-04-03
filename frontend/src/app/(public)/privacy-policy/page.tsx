import type { Metadata } from "next";
import Link from "next/link";

import { ROUTES } from "@/lib/constants/routes";

export const metadata: Metadata = {
  title: "Privacy Policy"
};

const sections = [
  {
    title: "1. Information We Collect",
    content: [
      {
        subtitle: "Account information",
        body: "When you create an account on EventOS, we collect your full name, email address, and password (stored in hashed form). You may also choose a role — Participant or Organizer — which determines what features are available to you."
      },
      {
        subtitle: "Event and registration data",
        body: "When you register for an event, we record your registration, status, waitlist position, and ticket information. Organizers' event drafts, published events, capacity settings, and associated metadata are also stored."
      },
      {
        subtitle: "Usage data",
        body: "We collect standard server logs including IP address, browser type, pages visited, and timestamps. This data is used solely to maintain platform stability and detect abuse. We do not sell or share this data with advertisers."
      },
      {
        subtitle: "Payment information",
        body: "EventOS does not store full payment card details. Payment sessions are initiated through secure processing and only a reference identifier is retained to link the payment to your registration."
      }
    ]
  },
  {
    title: "2. How We Use Your Information",
    content: [
      {
        subtitle: "Platform operations",
        body: "Your information is used to operate and deliver EventOS services: authenticating your account, processing registrations, issuing tickets, sending notifications about event updates, and enabling organizers to manage their events."
      },
      {
        subtitle: "Communications",
        body: "We may send you transactional notifications (registration confirmed, waitlist movement, ticket ready). You will not receive marketing emails unless you explicitly opt in."
      },
      {
        subtitle: "Platform improvement",
        body: "Aggregated, anonymized usage data may be used to identify bugs, improve user experience, and prioritize features. This analysis never identifies individual users."
      }
    ]
  },
  {
    title: "3. Data Sharing",
    content: [
      {
        subtitle: "With organizers",
        body: "When you register for an event, the organizer of that event can see your registration status and your name. They cannot see your password, payment details, or registrations for other events."
      },
      {
        subtitle: "With service providers",
        body: "We use third-party infrastructure providers (hosting, database, email delivery). These providers are contractually bound to process your data only as instructed by EventOS and not to share it with others."
      },
      {
        subtitle: "Legal obligations",
        body: "We may disclose your information if required to do so by law, court order, or governmental authority. We will notify you of such requests when legally permitted."
      }
    ]
  },
  {
    title: "4. Data Retention",
    content: [
      {
        subtitle: "Active accounts",
        body: "Your account and associated data are retained for as long as your account remains active on EventOS."
      },
      {
        subtitle: "Deleted accounts",
        body: "When you delete your account, your personal information is removed or anonymized within 30 days. Registration records may be retained in anonymized form for event analytics."
      },
      {
        subtitle: "Legal holds",
        body: "Certain data may be retained longer if required by applicable law or to resolve disputes."
      }
    ]
  },
  {
    title: "5. Your Rights",
    content: [
      {
        subtitle: "Access and portability",
        body: "You may request a copy of all personal data we hold about you at any time by contacting us. We will respond within 30 days."
      },
      {
        subtitle: "Correction",
        body: "You can update your name and email directly from your account settings. For corrections to other records, contact our support team."
      },
      {
        subtitle: "Deletion",
        body: "You may request deletion of your account and associated data. We will confirm the deletion within 30 days, subject to legal retention requirements."
      },
      {
        subtitle: "Objection and restriction",
        body: "You may object to or request restriction of certain processing of your data. We will respond to such requests within 30 days."
      }
    ]
  },
  {
    title: "6. Security",
    content: [
      {
        subtitle: "Technical measures",
        body: "All data is transmitted over encrypted connections (HTTPS/TLS). Passwords are stored using industry-standard hashing algorithms. Access to production systems is restricted to authorized personnel."
      },
      {
        subtitle: "Incident response",
        body: "In the event of a data breach that affects your personal information, we will notify you within 72 hours of discovery, as required by applicable data protection law."
      }
    ]
  },
  {
    title: "7. Cookies",
    content: [
      {
        subtitle: "Session cookies",
        body: "EventOS uses session tokens stored in your browser's local storage to keep you signed in. These are not third-party tracking cookies and expire when you sign out or your session times out."
      },
      {
        subtitle: "No advertising cookies",
        body: "We do not use advertising or cross-site tracking cookies of any kind."
      }
    ]
  },
  {
    title: "8. Changes to This Policy",
    content: [
      {
        subtitle: "Notification of changes",
        body: "We will notify you of material changes to this Privacy Policy by email or by a prominent notice on the platform at least 14 days before the changes take effect. Continued use of EventOS after the effective date constitutes your acceptance of the updated policy."
      }
    ]
  }
];

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-12 grid gap-4 border-b border-[var(--line-soft)] pb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary-strong)]">
          Legal
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="max-w-xl text-base leading-7 text-[var(--text-secondary)]">
          This policy explains how EventOS collects, uses, stores, and protects your personal information when you use the platform.
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

      {/* Contact + links */}
      <div className="mt-14 grid gap-5 rounded-[28px] border border-[rgba(88,116,255,0.18)] bg-[radial-gradient(circle_at_top_right,rgba(88,116,255,0.1),transparent_30%),linear-gradient(180deg,rgba(18,28,46,0.94),rgba(9,15,26,0.98))] p-6">
        <div className="grid gap-1.5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-primary-strong)]">
            Questions about this policy?
          </p>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Contact us</h2>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            If you have any questions or requests related to your personal data, contact the EventOS data protection team at{" "}
            <span className="font-medium text-[var(--text-primary)]">privacy@evenetos.app</span>.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href={ROUTES.termsOfService}
            className="rounded-full border border-[var(--line-soft)] bg-[rgba(255,255,255,0.04)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors duration-150 hover:border-[var(--line-strong)] hover:text-[var(--text-primary)]"
          >
            Terms of Service →
          </Link>
          <Link
            href={ROUTES.register}
            className="rounded-full border border-[rgba(88,116,255,0.3)] bg-[rgba(88,116,255,0.1)] px-4 py-2 text-sm font-medium text-[var(--accent-primary-strong)] transition-colors duration-150 hover:bg-[rgba(88,116,255,0.18)]"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
