"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { PageTitle } from "@/components/shared/page-title";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useProfileQuery } from "@/features/auth/hooks/use-profile-query";
import { useUpdateProfileMutation } from "@/features/auth/hooks/use-update-profile-mutation";
import { ROUTES } from "@/lib/constants/routes";
import { formatDate } from "@/lib/utils/format-date";

function getInitials(name?: string) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, { label: string; classes: string }> = {
    PARTICIPANT: {
      label: "Participant",
      classes: "border-[rgba(88,116,255,0.3)] bg-[rgba(88,116,255,0.12)] text-[var(--accent-primary-strong)]"
    },
    ORGANIZER: {
      label: "Organizer",
      classes: "border-[rgba(243,154,99,0.3)] bg-[rgba(243,154,99,0.12)] text-[var(--accent-warm)]"
    },
    ADMIN: {
      label: "Admin",
      classes: "border-[rgba(52,211,153,0.3)] bg-[rgba(52,211,153,0.1)] text-[var(--status-success)]"
    }
  };
  const style = map[role] || map.PARTICIPANT;
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${style.classes}`}>
      {style.label}
    </span>
  );
}

function ProfileSkeleton() {
  return (
    <div className="grid gap-10 animate-pulse">
      <div className="grid gap-2">
        <div className="h-3 w-20 rounded-full bg-[rgba(88,116,255,0.15)]" />
        <div className="h-8 w-48 rounded-xl bg-[rgba(255,255,255,0.06)]" />
        <div className="h-4 w-80 rounded-full bg-[rgba(255,255,255,0.04)]" />
      </div>
      <Card className="grid gap-6 border-[rgba(88,116,255,0.18)] bg-[rgba(18,28,46,0.96)]">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 shrink-0 rounded-2xl bg-[rgba(88,116,255,0.2)]" />
          <div className="grid gap-2">
            <div className="h-6 w-40 rounded-lg bg-[rgba(255,255,255,0.07)]" />
            <div className="h-4 w-52 rounded-full bg-[rgba(255,255,255,0.04)]" />
            <div className="h-5 w-24 rounded-full bg-[rgba(88,116,255,0.12)]" />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-12 rounded-[22px] bg-[rgba(255,255,255,0.04)]" />
          ))}
        </div>
      </Card>
      <Card className="grid gap-6 border-[var(--line-soft)] bg-[rgba(16,26,45,0.94)]">
        <div className="grid gap-3 border-b border-[var(--line-soft)] pb-5">
          <div className="h-3 w-32 rounded-full bg-[rgba(88,116,255,0.15)]" />
          <div className="h-6 w-40 rounded-lg bg-[rgba(255,255,255,0.06)]" />
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 rounded-[22px] bg-[rgba(255,255,255,0.04)]" />
          ))}
        </div>
        <div className="h-20 rounded-[22px] bg-[rgba(255,255,255,0.04)]" />
      </Card>
    </div>
  );
}

export default function ProfilePage() {
  const { data: currentUser } = useCurrentUser();
  const { data: profile, isLoading: isProfileLoading } = useProfileQuery();
  const mutation = useUpdateProfileMutation();

  const [formState, setFormState] = useState({
    fullName: "",
    phone: "",
    city: "",
    bio: ""
  });
  const [isDirty, setIsDirty] = useState(false);
  const [saved, setSaved] = useState(false);

  // Use profile data when available, fall back to currentUser for display
  const displayData = useMemo(() => ({
    fullName: profile?.fullName || currentUser?.fullName || "",
    email: profile?.email || currentUser?.email || "",
    role: profile?.role || currentUser?.role || "PARTICIPANT",
    phone: profile?.phone || "",
    city: profile?.city || "",
    bio: profile?.bio || "",
    createdAt: profile?.createdAt,
    updatedAt: profile?.updatedAt
  }), [profile, currentUser]);

  const derivedValues = useMemo(() => ({
    fullName: displayData.fullName,
    phone: displayData.phone,
    city: displayData.city,
    bio: displayData.bio
  }), [displayData]);

  const values = isDirty ? formState : derivedValues;

  // Show skeleton only if we have neither currentUser nor profile
  if (!currentUser && isProfileLoading) {
    return <ProfileSkeleton />;
  }

  if (!currentUser && !isProfileLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <p className="text-[var(--text-secondary)]">Please sign in to view your profile.</p>
        <Link href={ROUTES.login}>
          <Button>Sign in</Button>
        </Link>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    mutation.mutate(
      {
        fullName: values.fullName.trim() || undefined,
        phone: values.phone.trim() || null,
        city: values.city.trim() || null,
        bio: values.bio.trim() || null
      },
      {
        onSuccess: () => {
          setSaved(true);
          setIsDirty(false);
        }
      }
    );
  }

  const initials = getInitials(displayData.fullName);

  return (
    <div className="grid gap-10">
      <PageTitle
        eyebrow="Account"
        title="Your profile"
        description="Manage your personal information and keep your account details up to date."
      />

      {/* Identity card */}
      <Card className="grid gap-6 border-[rgba(88,116,255,0.18)] bg-[radial-gradient(circle_at_top_right,rgba(88,116,255,0.12),transparent_30%),linear-gradient(180deg,rgba(18,28,46,0.96),rgba(9,15,26,0.98))] shadow-[0_28px_64px_rgba(14,24,54,0.3)]">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(88,116,255,0.95),rgba(65,93,255,0.75))] text-xl font-bold text-white shadow-[0_12px_32px_rgba(65,93,255,0.36)]">
              {initials}
            </div>
            <div className="grid gap-1">
              <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
                {displayData.fullName || "—"}
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">{displayData.email}</p>
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <RoleBadge role={displayData.role} />
                {displayData.city ? (
                  <span className="text-xs text-[var(--text-muted)]">{displayData.city}</span>
                ) : null}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            {displayData.createdAt ? (
              <p className="text-xs text-[var(--text-muted)]">
                Member since {formatDate(displayData.createdAt)}
              </p>
            ) : null}
            {displayData.updatedAt ? (
              <p className="text-xs text-[var(--text-muted)]">
                Last updated {formatDate(displayData.updatedAt)}
              </p>
            ) : null}
          </div>
        </div>

        {/* Read-only account info */}
        <dl className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center justify-between gap-4 rounded-[22px] border border-[var(--line-soft)] bg-[rgba(12,20,35,0.6)] px-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Email</dt>
            <dd className="text-sm font-medium text-[var(--text-primary)]">{displayData.email}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-[22px] border border-[var(--line-soft)] bg-[rgba(12,20,35,0.6)] px-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Role</dt>
            <dd><RoleBadge role={displayData.role} /></dd>
          </div>
          {displayData.phone ? (
            <div className="flex items-center justify-between gap-4 rounded-[22px] border border-[var(--line-soft)] bg-[rgba(12,20,35,0.6)] px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Phone</dt>
              <dd className="text-sm font-medium text-[var(--text-primary)]">{displayData.phone}</dd>
            </div>
          ) : null}
          {displayData.bio ? (
            <div className="flex items-center justify-between gap-4 rounded-[22px] border border-[var(--line-soft)] bg-[rgba(12,20,35,0.6)] px-4 py-3 sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Bio</dt>
              <dd className="text-sm text-[var(--text-secondary)]">{displayData.bio}</dd>
            </div>
          ) : null}
        </dl>
      </Card>

      {/* Edit form */}
      <Card className="grid gap-6 border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(16,26,45,0.94),rgba(9,15,26,0.98))]">
        <div className="grid gap-1.5 border-b border-[var(--line-soft)] pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-primary-strong)]">
            Edit information
          </p>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Personal details</h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Update your display name, location, phone number, and bio. Your email and role cannot be changed here.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Input
              label="Full name"
              value={values.fullName}
              onChange={(e) => {
                setFormState((prev) => ({ ...prev, fullName: e.target.value }));
                setIsDirty(true);
                setSaved(false);
              }}
              placeholder="Your full name"
              disabled={mutation.isPending}
            />
            <Input
              label="City"
              value={values.city}
              onChange={(e) => {
                setFormState((prev) => ({ ...prev, city: e.target.value }));
                setIsDirty(true);
                setSaved(false);
              }}
              placeholder="e.g. Casablanca"
              disabled={mutation.isPending}
            />
            <Input
              label="Phone"
              type="tel"
              value={values.phone}
              onChange={(e) => {
                setFormState((prev) => ({ ...prev, phone: e.target.value }));
                setIsDirty(true);
                setSaved(false);
              }}
              placeholder="e.g. +212 6XX XXX XXX"
              disabled={mutation.isPending}
            />
          </div>

          {/* Bio textarea */}
          <label className="grid gap-2.5 text-sm text-[var(--text-secondary)]">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Bio
            </span>
            <textarea
              value={values.bio}
              onChange={(e) => {
                setFormState((prev) => ({ ...prev, bio: e.target.value }));
                setIsDirty(true);
                setSaved(false);
              }}
              placeholder="A short description about yourself..."
              rows={3}
              disabled={mutation.isPending}
              className="rounded-[22px] border border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(16,26,45,0.96),rgba(10,17,30,0.98))] px-4 py-3 text-sm text-[var(--text-primary)] outline-none ring-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition placeholder:text-[var(--text-muted)] focus-visible:border-[rgba(88,116,255,0.38)] focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)] disabled:cursor-not-allowed disabled:opacity-60 resize-none"
            />
          </label>

          {/* Feedback */}
          {saved && !mutation.isPending ? (
            <p className="rounded-[22px] border border-[rgba(52,211,153,0.22)] bg-[rgba(6,78,59,0.3)] px-4 py-3 text-sm text-[var(--status-success)]">
              Profile updated successfully.
            </p>
          ) : null}
          {mutation.isError ? (
            <p className="rounded-[22px] border border-[rgba(251,113,133,0.24)] bg-[rgba(127,29,29,0.26)] px-4 py-3 text-sm text-[var(--status-danger)]">
              {mutation.error.message}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button type="submit" disabled={mutation.isPending} className="sm:w-auto">
              {mutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </Card>

      {/* Security section */}
      <Card className="grid gap-5 border-[rgba(243,154,99,0.16)] bg-[radial-gradient(circle_at_top_right,rgba(243,154,99,0.1),transparent_30%),linear-gradient(180deg,rgba(18,28,46,0.94),rgba(9,15,26,0.98))]">
        <div className="grid gap-1.5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-warm)]">
            Security
          </p>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Password</h2>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            To change your password, use the password reset flow. Enter your email on the reset page and follow the link sent to your inbox.
          </p>
        </div>
        <Link href={ROUTES.forgotPassword} className="w-full sm:w-auto">
          <Button variant="ghost" className="w-full sm:w-auto">
            Reset password
          </Button>
        </Link>
      </Card>

      {/* Legal links */}
      <div className="flex flex-wrap gap-4 border-t border-[var(--line-soft)] pt-6 text-sm text-[var(--text-muted)]">
        <Link href={ROUTES.privacyPolicy} className="transition-colors hover:text-[var(--text-primary)]">
          Privacy Policy
        </Link>
        <span>·</span>
        <Link href={ROUTES.termsOfService} className="transition-colors hover:text-[var(--text-primary)]">
          Terms of Service
        </Link>
      </div>
    </div>
  );
}
