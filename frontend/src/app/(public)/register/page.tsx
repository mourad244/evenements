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
            description="Create your account and get started as a participant or organizer."
          />
          <div className="grid gap-3 text-sm text-slate-600">
            <p>Choose the role that matches your workflow and create a validated account securely.</p>
            <p>You can start simple today and grow into more advanced workflows as your events expand.</p>
          </div>
        </Card>
        <RegisterForm />
      </div>
    </PublicOnlyGuard>
  );
}
