"use client";

import Link from "next/link";

import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { getToken } from "@/lib/auth/get-token";
import { ROUTES } from "@/lib/constants/routes";

const Logo = () => (
  <Link
    href={ROUTES.home}
    className="group flex w-fit items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)]"
  >
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[rgba(88,116,255,0.4)] bg-[linear-gradient(135deg,rgba(88,116,255,0.96),rgba(65,93,255,0.78))] shadow-[0_8px_20px_rgba(65,93,255,0.28)] transition-transform duration-200 motion-safe:group-hover:scale-105">
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
        <rect x="3" y="6" width="18" height="15" rx="3" stroke="white" strokeWidth="1.6" strokeOpacity="0.9"/>
        <rect x="3" y="6" width="18" height="5" rx="3" fill="white" fillOpacity="0.2"/>
        <rect x="3" y="9" width="18" height="2" fill="white" fillOpacity="0.2"/>
        <line x1="8" y1="4" x2="8" y2="8" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="16" y1="4" x2="16" y2="8" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="8" cy="14" r="1.2" fill="white" fillOpacity="0.9"/>
        <circle cx="12" cy="14" r="1.2" fill="white" fillOpacity="0.9"/>
        <circle cx="16" cy="14" r="1.2" fill="#f39a63"/>
      </svg>
    </span>
    <span className="text-[15px] font-bold uppercase tracking-[0.22em] text-[var(--text-primary)]">
      EventOS
    </span>
  </Link>
);

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link
        href={href}
        className="group flex items-center gap-2 text-sm text-[var(--text-secondary)] transition-colors duration-150 hover:text-[var(--text-primary)]"
      >
        <span className="h-px w-3 shrink-0 bg-[var(--line-strong)] transition-[width,background-color] duration-200 group-hover:w-4 group-hover:bg-[var(--accent-primary-strong)]" />
        {label}
      </Link>
    </li>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-4 content-start">
      <p className="text-sm font-semibold text-[var(--text-primary)]">{title}</p>
      <ul className="grid gap-2.5">{children}</ul>
    </div>
  );
}

export function Footer() {
  const isAuthenticated = Boolean(getToken());
  const { data: user } = useCurrentUser();
  const role = user?.role;

  return (
    <footer className="border-t border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(7,12,22,0.98),rgba(5,7,13,1))]">
      <div className="h-px w-full bg-[linear-gradient(90deg,transparent_0%,rgba(88,116,255,0.3)_30%,rgba(243,154,99,0.3)_70%,transparent_100%)]" />

      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.8fr_1fr_1fr_0.8fr] lg:gap-8 lg:px-8">

        {/* Brand */}
        <div className="grid gap-5">
          <Logo />
          <p className="max-w-xs text-sm leading-7 text-[var(--text-secondary)]">
            Discover events near you, register as a participant, or manage your own events as an organizer — all from one platform.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-[rgba(88,116,255,0.2)] bg-[rgba(88,116,255,0.08)] px-3 py-1 text-xs font-medium text-[var(--accent-primary-strong)]">
              Participants
            </span>
            <span className="rounded-full border border-[rgba(243,154,99,0.2)] bg-[rgba(243,154,99,0.08)] px-3 py-1 text-xs font-medium text-[var(--accent-warm)]">
              Organizers
            </span>
            <span className="rounded-full border border-[var(--line-soft)] bg-[rgba(255,255,255,0.04)] px-3 py-1 text-xs font-medium text-[var(--text-muted)]">
              Admins
            </span>
          </div>
        </div>

        {/* Platform — always visible */}
        <FooterColumn title="Platform">
          <FooterLink href={ROUTES.events} label="Browse events" />
          {isAuthenticated && (
            <FooterLink href={ROUTES.dashboard} label="Dashboard" />
          )}
          {isAuthenticated && (role === "PARTICIPANT") && (
            <FooterLink href={ROUTES.myRegistrations} label="My registrations" />
          )}
          {isAuthenticated && (
            <FooterLink href={ROUTES.notifications} label="Notifications" />
          )}
          {isAuthenticated && (role === "ORGANIZER" || role === "ADMIN") && (
            <FooterLink href={ROUTES.organizerEvents} label="Organizer workspace" />
          )}
        </FooterColumn>

        {/* Account — context-aware */}
        <FooterColumn title={isAuthenticated ? "My account" : "Account"}>
          {isAuthenticated ? (
            <>
              <FooterLink href={ROUTES.profile} label="Profile settings" />
              <FooterLink href={ROUTES.dashboard} label="Dashboard" />
              <FooterLink href={ROUTES.forgotPassword} label="Reset password" />
            </>
          ) : (
            <>
              <FooterLink href={ROUTES.login} label="Sign in" />
              <FooterLink href={ROUTES.register} label="Create account" />
              <FooterLink href={ROUTES.forgotPassword} label="Forgot password" />
            </>
          )}
        </FooterColumn>

        {/* Legal */}
        <FooterColumn title="Legal">
          <FooterLink href={ROUTES.privacyPolicy} label="Privacy policy" />
          <FooterLink href={ROUTES.termsOfService} label="Terms of service" />
        </FooterColumn>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[var(--line-soft)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-[var(--text-muted)] sm:px-6 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>© {new Date().getFullYear()} EventOS. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href={ROUTES.privacyPolicy} className="transition-colors duration-150 hover:text-[var(--text-primary)]">
              Privacy policy
            </Link>
            <span>·</span>
            <Link href={ROUTES.termsOfService} className="transition-colors duration-150 hover:text-[var(--text-primary)]">
              Terms of service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
