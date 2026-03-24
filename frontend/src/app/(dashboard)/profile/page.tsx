"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { RoleGuard } from "@/components/guards/role-guard";
import { PageTitle } from "@/components/shared/page-title";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useProfileQuery } from "@/features/auth/hooks/use-profile-query";
import { useUpdateProfileMutation } from "@/features/auth/hooks/use-update-profile-mutation";
import type { UpdateProfileInput } from "@/features/auth/types/auth.types";

type ProfileFormValues = {
  fullName: string;
  displayName: string;
  phone: string;
  city: string;
  bio: string;
};

export default function ProfilePage() {
  const { data: user } = useCurrentUser();
  const { data: profile, isLoading, isError, error, refetch } = useProfileQuery();
  const updateMutation = useUpdateProfileMutation();
  const form = useForm<ProfileFormValues>({
    defaultValues: {
      fullName: "",
      displayName: "",
      phone: "",
      city: "",
      bio: ""
    }
  });

  useEffect(() => {
    if (!profile) return;
    form.reset({
      fullName: profile.fullName || "",
      displayName: profile.displayName || "",
      phone: profile.phone || "",
      city: profile.city || "",
      bio: profile.bio || ""
    });
  }, [form, profile]);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload: UpdateProfileInput = {
      fullName: values.fullName.trim(),
      displayName: values.displayName.trim(),
      phone: values.phone.trim() ? values.phone.trim() : null,
      city: values.city.trim() ? values.city.trim() : null,
      bio: values.bio.trim() ? values.bio.trim() : null
    };
    await updateMutation.mutateAsync(payload);
  });

  return (
    <RoleGuard user={user} allowedRoles={["PARTICIPANT", "ORGANIZER"]}>
      <div className="grid gap-10">
        <PageTitle
          eyebrow="Profile"
          title="Your profile"
          description="Keep your profile details up to date so your participant or organizer workspace always reflects the right identity context."
        />

        {isLoading ? (
          <LoadingState label="Loading your profile..." variant="editor" />
        ) : isError ? (
          <ErrorState
            title="Could not load your profile"
            description={error?.message || "The profile service is unavailable right now."}
            action={
              <Button variant="ghost" onClick={() => refetch()}>
                Try again
              </Button>
            }
          />
        ) : profile ? (
          <div className="grid gap-6">
            <Card className="grid gap-4 border-[rgba(88,116,255,0.2)] bg-[radial-gradient(circle_at_top_right,rgba(88,116,255,0.14),transparent_30%),linear-gradient(180deg,rgba(18,28,46,0.96),rgba(9,15,26,0.98))] shadow-[0_28px_64px_rgba(14,24,54,0.3)]">
              <div className="grid gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary-strong)]">
                  Identity context
                </p>
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                  Profile summary
                </h2>
                <p className="text-sm leading-6 text-[var(--text-secondary)]">
                  Email and role remain read-only in the MVP. Update the profile fields below to
                  keep your workspace identity accurate.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Email" value={profile.email} readOnly disabled />
                <Input label="Role" value={profile.role} readOnly disabled />
              </div>
            </Card>

            <Card className="grid gap-6 border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(15,24,40,0.94),rgba(8,14,24,0.98))] shadow-[0_24px_56px_rgba(0,0,0,0.28)]">
              <div className="grid gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary-strong)]">
                  Editable profile
                </p>
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                  Update your details
                </h2>
                <p className="text-sm leading-6 text-[var(--text-secondary)]">
                  These details are used across your participant and organizer experiences to
                  keep communication consistent.
                </p>
              </div>

              <form className="grid gap-5" onSubmit={onSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="Full name"
                    placeholder="Your full name"
                    {...form.register("fullName", { required: "Full name is required." })}
                    error={form.formState.errors.fullName?.message}
                    disabled={updateMutation.isPending}
                  />
                  <Input
                    label="Display name"
                    placeholder="How you want to be addressed"
                    {...form.register("displayName", { required: "Display name is required." })}
                    error={form.formState.errors.displayName?.message}
                    disabled={updateMutation.isPending}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="Phone"
                    placeholder="+212..."
                    {...form.register("phone")}
                    disabled={updateMutation.isPending}
                  />
                  <Input
                    label="City"
                    placeholder="City"
                    {...form.register("city")}
                    disabled={updateMutation.isPending}
                  />
                </div>

                <label className="grid gap-2.5 text-sm text-[var(--text-secondary)]">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    Bio
                  </span>
                  <textarea
                    className="min-h-32 rounded-[22px] border border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(16,26,45,0.96),rgba(10,17,30,0.98))] px-4 py-3 text-sm text-[var(--text-primary)] outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition placeholder:text-[var(--text-muted)] focus-visible:border-[rgba(88,116,255,0.38)] focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)]"
                    placeholder="A short note about your role or focus"
                    {...form.register("bio")}
                    disabled={updateMutation.isPending}
                  />
                </label>

                {updateMutation.isPending ? (
                  <p
                    role="status"
                    className="rounded-[22px] border border-[rgba(88,116,255,0.18)] bg-[rgba(88,116,255,0.08)] px-4 py-3 text-sm text-[var(--text-secondary)]"
                  >
                    Saving your profile updates...
                  </p>
                ) : null}
                {updateMutation.isSuccess && !form.formState.isDirty ? (
                  <p
                    role="status"
                    className="rounded-[22px] border border-[rgba(34,197,94,0.18)] bg-[rgba(22,101,52,0.2)] px-4 py-3 text-sm text-[var(--status-success)]"
                  >
                    Profile saved and ready.
                  </p>
                ) : null}
                {updateMutation.error ? (
                  <p
                    role="alert"
                    className="rounded-[22px] border border-[rgba(251,113,133,0.24)] bg-[rgba(127,29,29,0.26)] px-4 py-3 text-sm text-[var(--status-danger)]"
                  >
                    {updateMutation.error.message}
                  </p>
                ) : null}

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <Button
                    type="submit"
                    disabled={updateMutation.isPending || !form.formState.isDirty}
                    className="w-full sm:w-auto"
                  >
                    {updateMutation.isPending ? "Saving..." : "Save profile"}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        ) : null}
      </div>
    </RoleGuard>
  );
}
