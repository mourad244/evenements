import { PublicOnlyGuard } from "@/components/guards/public-only-guard";
import { PageTitle } from "@/components/shared/page-title";
import { RegisterForm } from "@/features/auth/components/register-form";
import { Card } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <PublicOnlyGuard>
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <Card className="grid gap-6">
          <PageTitle
            eyebrow="Create account"
            title="Open your participant or organizer account."
            description="This starter keeps registration isolated in the auth feature for easy backend integration."
          />
          <div className="grid gap-3 text-sm text-slate-600">
            <p>Choose the role that matches your workflow and create a validated account securely.</p>
            <p>Organizer and participant onboarding stays in one feature module for easier backend evolution.</p>
          </div>
        </Card>
        <RegisterForm />
      </div>
    </PublicOnlyGuard>
  );
}
