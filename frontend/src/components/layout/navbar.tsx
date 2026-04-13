"use client";

import { Bell, LogOut, Menu, User, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

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
  { href: ROUTES.organizerEvents, label: "Workspace", roles: ["ORGANIZER"] },
  { href: ROUTES.adminEvents, label: "Admin", roles: ["ADMIN"] }
];

function getVisibleNavItems(role?: "PARTICIPANT" | "ORGANIZER" | "ADMIN" | "GUEST") {
  return navItems.filter(
    (item) =>
      !item.roles ||
      (role && role !== "GUEST" && item.roles.includes(role))
  );
}

function getWorkspaceLabel(role?: string | null) {
  if (role === "ADMIN") return "Admin workspace";
  if (role === "ORGANIZER") return "Organizer workspace";
  if (role === "PARTICIPANT") return "Participant workspace";
  return null;
}

function getInitials(name?: string) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : name.slice(0, 2).toUpperCase();
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

  function handleLogout() {
    clearSession();
    clearSessionExpired();
    queryClient.setQueryData(["current-user"], null);
    queryClient.removeQueries({ queryKey: ["my-registrations"] });
    setOpen(false);
    router.push(ROUTES.login);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(5,7,13,0.97),rgba(9,15,26,0.92))] shadow-[0_8px_32px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link
          href={ROUTES.home}
          aria-label="EventOS home"
          className="group flex shrink-0 items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-1)]"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[rgba(88,116,255,0.4)] bg-[linear-gradient(135deg,rgba(88,116,255,0.96),rgba(65,93,255,0.78))] shadow-[0_8px_24px_rgba(65,93,255,0.32)] transition-transform duration-200 motion-safe:group-hover:scale-105">
            <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" aria-hidden="true">
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
          <span className="text-[15px] font-bold uppercase tracking-[0.22em] text-[var(--text-primary)] transition-colors duration-150 group-hover:text-[var(--accent-primary-strong)]">
            EventOS
          </span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Primary navigation" className="hidden items-center gap-1 lg:flex">
          {visibleNavItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-[background-color,color,border-color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-1)]",
                  active
                    ? "bg-[rgba(88,116,255,0.18)] text-[var(--text-primary)] shadow-[inset_0_0_0_1px_rgba(88,116,255,0.32)]"
                    : "text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.05)] hover:text-[var(--text-primary)]"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop right actions */}
        <div className="hidden items-center gap-2 lg:flex">
          {isAuthenticated ? (
            <>
              {/* Notifications bell */}
              <Link
                href={ROUTES.notifications}
                aria-label="Notifications"
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border transition-[background-color,border-color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-1)]",
                  pathname.startsWith(ROUTES.notifications)
                    ? "border-[rgba(88,116,255,0.36)] bg-[rgba(88,116,255,0.18)] text-[var(--text-primary)]"
                    : "border-[var(--line-soft)] bg-[rgba(255,255,255,0.04)] text-[var(--text-muted)] hover:border-[var(--line-strong)] hover:bg-[rgba(255,255,255,0.08)] hover:text-[var(--text-primary)]"
                )}
              >
                <Bell className="h-4 w-4" />
              </Link>

              {/* Profile pill */}
              <Link
                href={ROUTES.profile}
                aria-label={`Profile — ${user?.fullName || "Account"}`}
                title={getWorkspaceLabel(user?.role) || undefined}
                className="group flex h-9 items-center gap-2.5 rounded-full border border-[var(--line-soft)] bg-[rgba(255,255,255,0.04)] pl-1 pr-3 text-sm transition-[background-color,border-color,box-shadow] duration-150 hover:border-[rgba(88,116,255,0.3)] hover:bg-[rgba(88,116,255,0.1)] hover:shadow-[0_0_0_1px_rgba(88,116,255,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-1)]"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(88,116,255,0.9),rgba(65,93,255,0.7))] text-xs font-bold text-white shadow-[0_4px_12px_rgba(65,93,255,0.3)]">
                  {getInitials(user?.fullName)}
                </span>
                <span className="max-w-[120px] truncate font-medium text-[var(--text-primary)]">
                  {user?.fullName?.split(" ")[0] || "Account"}
                </span>
                <span className="rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.06)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                  {user?.role || "user"}
                </span>
              </Link>

              {/* Sign out */}
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Sign out"
                title="Sign out"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line-soft)] bg-[rgba(255,255,255,0.04)] text-[var(--text-muted)] transition-[background-color,border-color,color] duration-150 hover:border-[rgba(251,113,133,0.3)] hover:bg-[rgba(251,113,133,0.08)] hover:text-[var(--status-danger)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-1)]"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link href={ROUTES.login}>
                <Button variant="ghost" className="min-w-[96px]">Sign in</Button>
              </Link>
              <Link href={ROUTES.register}>
                <Button className="min-w-[96px]">Create account</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--line-soft)] bg-[rgba(255,255,255,0.04)] text-[var(--text-primary)] transition-[background-color,border-color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-1)] lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
        >
          {open ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open ? (
        <div
          id="mobile-navigation"
          className="border-t border-[var(--line-soft)] bg-[rgba(7,12,22,0.98)] px-4 pb-5 pt-4 shadow-[0_24px_60px_rgba(0,0,0,0.4)] backdrop-blur-xl lg:hidden"
        >
          <div className="mx-auto grid max-w-7xl gap-3 sm:px-2">

            {/* Profile row (authenticated) */}
            {isAuthenticated ? (
              <Link
                href={ROUTES.profile}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-2xl border border-[var(--line-soft)] bg-[rgba(255,255,255,0.04)] px-4 py-3 transition-[background-color,border-color] duration-150 hover:border-[rgba(88,116,255,0.3)] hover:bg-[rgba(88,116,255,0.08)]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(88,116,255,0.9),rgba(65,93,255,0.7))] text-sm font-bold text-white shadow-[0_4px_12px_rgba(65,93,255,0.28)]">
                  {getInitials(user?.fullName)}
                </span>
                <div className="grid gap-0.5">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{user?.fullName || "Account"}</p>
                  <p className="text-xs text-[var(--text-muted)] capitalize">{user?.role?.toLowerCase() || "member"} · {user?.email || ""}</p>
                </div>
                <User className="ml-auto h-4 w-4 shrink-0 text-[var(--text-muted)]" />
              </Link>
            ) : null}

            {/* Current section cue */}
            {isAuthenticated && user ? (
              <div className="rounded-2xl border border-[var(--line-soft)] bg-[rgba(88,116,255,0.06)] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  Current section
                </p>
                <p className="text-sm font-medium text-[var(--accent-primary-strong)]">
                  {getWorkspaceLabel(user.role)}
                </p>
              </div>
            ) : null}

            {/* Nav links */}
            <nav aria-label="Mobile navigation" className="grid gap-1">
              {visibleNavItems.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "rounded-2xl px-4 py-3 text-sm font-medium transition-[background-color,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)]",
                      active
                        ? "bg-[rgba(88,116,255,0.18)] text-[var(--text-primary)] shadow-[inset_0_0_0_1px_rgba(88,116,255,0.28)]"
                        : "text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.05)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Bottom actions */}
            <div className="grid gap-2 border-t border-[var(--line-soft)] pt-3">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-2xl border border-[rgba(251,113,133,0.18)] bg-[rgba(251,113,133,0.06)] px-4 py-3 text-sm font-medium text-[var(--status-danger)] transition-[background-color,border-color] duration-150 hover:border-[rgba(251,113,133,0.3)] hover:bg-[rgba(251,113,133,0.12)]"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link href={ROUTES.login} onClick={() => setOpen(false)}>
                    <Button variant="ghost" className="w-full">Sign in</Button>
                  </Link>
                  <Link href={ROUTES.register} onClick={() => setOpen(false)}>
                    <Button className="w-full">Create account</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
