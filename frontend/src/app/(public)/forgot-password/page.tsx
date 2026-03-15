import { PublicOnlyGuard } from "@/components/guards/public-only-guard";
import { Card } from "@/components/ui/card";
import { PageTitle } from "@/components/shared/page-title";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <PublicOnlyGuard>
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <Card className="grid gap-6">
          <PageTitle
            eyebrow="Password recovery"
            title="Recover access to your workspace."
            description="Use the recovery flow to request a password reset without leaving the auth module."
          />
          <div className="grid gap-3 text-sm text-slate-600">
            <p>Enter the email linked to your account to start the reset process.</p>
            <p>This page stays public-only and redirects authenticated users back into the app.</p>
          </div>
        </Card>
        <ForgotPasswordForm />
      </div>
    </PublicOnlyGuard>
  );
}
