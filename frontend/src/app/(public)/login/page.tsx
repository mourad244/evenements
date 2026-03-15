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
            <p>Validation is handled with React Hook Form and Zod for a reliable frontend contract.</p>
          </div>
        </Card>
        <LoginForm />
      </div>
    </PublicOnlyGuard>
  );
}
