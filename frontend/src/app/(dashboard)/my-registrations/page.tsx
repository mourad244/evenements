"use client";

import { RoleGuard } from "@/components/guards/role-guard";
import { Card } from "@/components/ui/card";
import { PageTitle } from "@/components/shared/page-title";
import { Spinner } from "@/components/ui/spinner";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { RegistrationList } from "@/features/registrations/components/registration-list";
import { useMyRegistrationsQuery } from "@/features/registrations/hooks/use-my-registrations-query";

export default function MyRegistrationsPage() {
  const { data = [], isLoading, isError, error } = useMyRegistrationsQuery();
  const { data: user } = useCurrentUser();

  return (
    <RoleGuard user={user} allowedRoles={["PARTICIPANT"]}>
      <div className="grid gap-8">
        <PageTitle
          eyebrow="Participant"
          title="My registrations"
          description="Track registration states and ticket readiness from one clear panel."
        />
        {isLoading ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <Spinner />
          </div>
        ) : isError ? (
          <Card className="grid gap-2">
            <h2 className="text-lg font-semibold text-ink">Could not load registrations</h2>
            <p className="text-sm text-slate-600">{error.message}</p>
          </Card>
        ) : (
          <RegistrationList registrations={data} />
        )}
      </div>
    </RoleGuard>
  );
}
