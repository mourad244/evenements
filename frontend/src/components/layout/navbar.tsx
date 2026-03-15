"use client";

import { LogOut, Menu, Sparkles, X } from "lucide-react";
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

const navItems = [
  { href: ROUTES.events, label: "Events" },
  { href: ROUTES.dashboard, label: "Dashboard" },
  { href: ROUTES.organizerEvents, label: "Organizer" },
  { href: ROUTES.adminEvents, label: "Admin" }
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const token = getToken();
  const { data: user } = useCurrentUser();
  const isAuthenticated = Boolean(token);

  function handleLogout() {
    clearSession();
    clearSessionExpired();
    queryClient.setQueryData(["current-user"], null);
    queryClient.removeQueries({ queryKey: ["my-registrations"] });
    setOpen(false);
    router.push(ROUTES.login);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href={ROUTES.home} className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-ink text-white shadow-lg shadow-slate-900/10">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="grid min-w-0">
            <span className="truncate text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">
              EventOS
            </span>
            <span className="truncate text-sm text-slate-600">
              Event platform control surface
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  active
                    ? "bg-ink text-white"
                    : "text-slate-600 hover:bg-white hover:text-ink"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {isAuthenticated ? (
            <>
              <div className="hidden rounded-full border border-line bg-white px-4 py-2 text-sm text-slate-600 xl:block">
                <span className="font-medium text-ink">{user?.fullName || "Signed in"}</span>
                <span className="ml-2 text-slate-500">{user?.role || "Member"}</span>
              </div>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link
                href={ROUTES.register}
                className="text-sm font-medium text-slate-600 transition hover:text-ink"
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
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-line bg-white text-ink lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-white/70 bg-white/95 px-4 py-4 shadow-lg shadow-slate-900/5 lg:hidden">
          <div className="mx-auto grid max-w-7xl gap-2 sm:px-2">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm font-medium transition",
                    active
                      ? "bg-ink text-white"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="mt-3 grid gap-2 border-t border-slate-200 pt-3">
              {isAuthenticated ? (
                <>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    <p className="font-medium text-ink">{user?.fullName || "Signed in"}</p>
                    <p className="text-slate-500">{user?.role || "Member"}</p>
                  </div>
                  <Button variant="ghost" className="w-full" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    href={ROUTES.register}
                    onClick={() => setOpen(false)}
                    className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
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
