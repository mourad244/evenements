"use client";

import { Card } from "@/components/ui/card";
import { PageTitle } from "@/components/shared/page-title";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";

export default function DashboardPage() {
  const { data: user } = useCurrentUser();

  return (
    <div className="grid gap-8">
      <PageTitle
        eyebrow="Dashboard"
        title={`Welcome back${user ? `, ${user.fullName}` : ""}.`}
        description="Use this shared dashboard as the default landing space for authenticated flows."
      />
      <div className="grid gap-6 md:grid-cols-3">
        {[
          ["Active role", user?.role || "Loading"],
          ["Current focus", "Frontend integration"],
          ["Backend readiness", "API client layer connected"]
        ].map(([label, value]) => (
          <Card key={label} className="grid gap-2">
            <p className="text-sm text-slate-500">{label}</p>
            <h2 className="text-xl font-semibold text-ink">{value}</h2>
          </Card>
        ))}
      </div>
    </div>
  );
}
