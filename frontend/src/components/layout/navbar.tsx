"use client";

import { LogOut, Menu, Sparkles, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import {
  clearSession,
  clearSessionExpired
} from "@/features/auth/utils/auth-storage";
import { getToken } from "@/lib/auth/get-token";
import { ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

type NavItem = {
  href: string;
  label: string;
  roles?: Array<"PARTICIPANT" | "ORGANIZER" | "ADMIN">;
};

const navItems: NavItem[] = [
  { href: ROUTES.events, label: "Events" },
  { href: ROUTES.dashboard, label: "Dashboard", roles: ["PARTICIPANT", "ORGANIZER", "ADMIN"] },
  { href: ROUTES.myRegistrations, label: "My registrations", roles: ["PARTICIPANT"] },
  { href: ROUTES.organizerEvents, label: "Organizer", roles: ["ORGANIZER", "ADMIN"] },
  { href: ROUTES.adminEvents, label: "Admin", roles: ["ADMIN"] }
];

function getVisibleNavItems(role?: "PARTICIPANT" | "ORGANIZER" | "ADMIN" | "GUEST") {
  const isWorkspaceRole =
    role === "PARTICIPANT" || role === "ORGANIZER" || role === "ADMIN";

  return navItems.filter(
    (item) =>
      !item.roles || (isWorkspaceRole ? item.roles.includes(role) : false) || item.href === ROUTES.events
  );
}

function getCurrentSection(pathname: string) {
  if (pathname === ROUTES.myRegistrations || pathname.startsWith(`${ROUTES.myRegistrations}/`)) {
    return "Participant workspace";
  }

  if (pathname === ROUTES.organizerEvents || pathname.startsWith(`${ROUTES.organizerEvents}/`)) {
    return "Organizer workspace";
  }

  if (
    pathname === ROUTES.adminEvents ||
    pathname.startsWith(`${ROUTES.adminEvents}/`) ||
    pathname === ROUTES.adminUsers ||
    pathname.startsWith(`${ROUTES.adminUsers}/`)
  ) {
    return "Admin workspace";
  }

  if (pathname === ROUTES.dashboard || pathname.startsWith(`${ROUTES.dashboard}/`)) {
    return "Dashboard";
  }

  if (pathname === ROUTES.events || pathname.startsWith(`${ROUTES.events}/`)) {
    return "Events";
  }

  return "Platform";
}

function getSurfaceLabel(pathname: string) {
  if (
    pathname === ROUTES.home ||
    pathname === ROUTES.events ||
    pathname.startsWith(`${ROUTES.events}/`) ||
    pathname === ROUTES.login ||
    pathname === ROUTES.register ||
    pathname === ROUTES.forgotPassword ||
    pathname === ROUTES.resetPassword ||
    pathname === ROUTES.sessionExpired
  ) {
    return "Public shell";
  }

  return "Workspace";
}

function MetaChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-[var(--line-soft)] bg-[rgba(17,25,39,0.82)] px-3 py-1.5 shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
      <span className="font-[family:var(--font-mono)] text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
        {label}
      </span>
      <span className="ml-2 text-sm font-medium text-[var(--text-primary)]">{value}</span>
    </div>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const token = getToken();
  const { data: user } = useCurrentUser();
  const isAuthenticated = Boolean(token);
  const visibleNavItems = getVisibleNavItems(user?.role);
  const currentSection = getCurrentSection(pathname);
  const surfaceLabel = getSurfaceLabel(pathname);

  function handleLogout() {
    clearSession();
    clearSessionExpired();
    queryClient.setQueryData(["current-user"], null);
    queryClient.removeQueries({ queryKey: ["my-registrations"] });
    setOpen(false);
    router.push(ROUTES.login);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(7,12,22,0.96),rgba(9,15,26,0.88))] shadow-[0_18px_48px_rgba(0,0,0,0.34)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,rgba(88,116,255,0.55),rgba(16,185,129,0.45),rgba(245,158,11,0.35),transparent)]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 py-4">
          <div className="flex min-w-0 items-center gap-4">
            <Link
              href={ROUTES.home}
              aria-label="EventOS home"
              className="group flex min-w-0 items-center gap-3 rounded-2xl transition-transform duration-200 ease-out motion-safe:hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-1)]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[var(--line-strong)] bg-[linear-gradient(135deg,rgba(88,116,255,0.96),rgba(79,70,229,0.84))] text-[var(--text-primary)] shadow-[0_16px_34px_rgba(65,93,255,0.26)] transition-[transform,box-shadow] duration-300 ease-out motion-safe:group-hover:scale-105">
                <Sparkles className="h-5 w-5" />
              </span>
              <span className="grid min-w-0">
                <span className="truncate text-sm font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary-strong)]">
                  EventOS
                </span>
                <span className="truncate text-sm text-[var(--text-secondary)]">
                  Microservice event delivery
                </span>
              </span>
            </Link>

            <div className="hidden xl:flex xl:flex-wrap xl:gap-2">
              <MetaChip label="Surface" value={surfaceLabel} />
              <MetaChip label="Current section" value={currentSection} />
            </div>
          </div>

          <nav aria-label="Primary navigation" className="hidden items-center gap-2 lg:flex">
            {visibleNavItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-medium transition-[transform,box-shadow,border-color,background-color,color] duration-200 ease-out motion-safe:hover:-translate-y-px active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-1)]",
                    active
                      ? "border-[rgba(88,116,255,0.42)] bg-[linear-gradient(135deg,rgba(88,116,255,0.28),rgba(65,93,255,0.12))] text-[var(--text-primary)] shadow-[0_14px_28px_rgba(65,93,255,0.2)]"
                      : "border-[var(--line-soft)] bg-[rgba(16,26,45,0.72)] text-[var(--text-secondary)] hover:border-[var(--line-strong)] hover:bg-[rgba(20,32,52,0.82)] hover:text-[var(--text-primary)]"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            {isAuthenticated ? (
              <>
                <div className="hidden rounded-full border border-[var(--line-soft)] bg-[rgba(17,25,39,0.82)] px-4 py-2 text-sm text-[var(--text-secondary)] shadow-[0_10px_24px_rgba(0,0,0,0.18)] xl:block">
                  <span className="font-medium text-[var(--text-primary)]">{user?.fullName || "Signed in"}</span>
                  <span className="ml-2 text-[var(--text-muted)]">{user?.role || "Member"}</span>
                </div>
                <Button variant="ghost" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link
                  href={ROUTES.register}
                  className="text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-1)]"
                >
                  Create account
                </Link>
                <Link href={ROUTES.login}>
                  <Button>Sign in</Button>
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--line-soft)] bg-[rgba(16,26,45,0.92)] text-[var(--text-primary)] shadow-[0_10px_24px_rgba(0,0,0,0.22)] transition-[transform,box-shadow,border-color,background-color] duration-200 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-1)] lg:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div
          id="mobile-navigation"
          className="border-t border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(11,18,32,0.98),rgba(7,12,22,0.98))] px-4 py-4 shadow-[0_24px_60px_rgba(0,0,0,0.42)] lg:hidden"
        >
          <div className="mx-auto grid max-w-7xl gap-4 sm:px-2">
            <div className="grid gap-2 rounded-3xl border border-[var(--line-soft)] bg-[rgba(16,26,45,0.92)] px-4 py-3 shadow-[0_16px_36px_rgba(0,0,0,0.26)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-primary-strong)]">
                Current section
              </p>
              <p className="text-sm font-medium text-[var(--text-primary)]">{currentSection}</p>
              <p className="font-[family:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                {surfaceLabel}
              </p>
            </div>

            <nav aria-label="Mobile navigation" className="grid gap-2">
              {isAuthenticated ? (
                <p className="px-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  Workspace
                </p>
              ) : null}
              {visibleNavItems.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "rounded-3xl border px-4 py-3 text-sm font-medium transition-[transform,box-shadow,border-color,background-color,color] duration-200 ease-out motion-safe:hover:-translate-y-px active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-1)]",
                      active
                        ? "border-[rgba(88,116,255,0.4)] bg-[linear-gradient(135deg,rgba(88,116,255,0.3),rgba(65,93,255,0.12))] text-[var(--text-primary)] shadow-[0_14px_28px_rgba(65,93,255,0.2)]"
                        : "border-[var(--line-soft)] bg-[rgba(16,26,45,0.8)] text-[var(--text-secondary)] hover:bg-[rgba(22,36,58,0.92)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-3 grid gap-2 border-t border-[var(--line-soft)] pt-3">
              {isAuthenticated ? (
                <>
                  <div className="rounded-3xl border border-[var(--line-soft)] bg-[rgba(16,26,45,0.92)] px-4 py-3 text-sm text-[var(--text-secondary)] shadow-[0_16px_36px_rgba(0,0,0,0.24)]">
                    <p className="font-medium text-[var(--text-primary)]">{user?.fullName || "Signed in"}</p>
                    <p className="text-[var(--text-muted)]">{user?.role || "Member"}</p>
                  </div>
                  <Button variant="ghost" className="w-full" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    href={ROUTES.register}
                    onClick={() => setOpen(false)}
                    className="rounded-3xl border border-[var(--line-soft)] bg-[rgba(16,26,45,0.8)] px-4 py-3 text-sm font-medium text-[var(--text-secondary)] transition-[transform,box-shadow,border-color,background-color,color] duration-200 ease-out motion-safe:hover:-translate-y-px hover:bg-[rgba(22,36,58,0.92)] hover:text-[var(--text-primary)] active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-1)]"
                  >
                    Create account
                  </Link>
                  <Link href={ROUTES.login} onClick={() => setOpen(false)}>
                    <Button className="w-full">Sign in</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
