import { PublicOnlyGuard } from "@/components/guards/public-only-guard";
import { PageTitle } from "@/components/shared/page-title";
import { LoginForm } from "@/features/auth/components/login-form";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <PublicOnlyGuard>
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <Card className="grid gap-6">
          <PageTitle
            eyebrow="Authentication"
            title="Sign in to your event workspace."
            description="Use this flow for participant, organizer, or admin access."
          />
          <div className="grid gap-3 text-sm text-slate-600">
            <p>Access participant dashboards, organizer event operations, and admin workflows.</p>
            <p>Pick up where you left off and move between the parts of the platform that matter to you.</p>
          </div>
        </Card>
        <LoginForm />
      </div>
    </PublicOnlyGuard>
  );
}
