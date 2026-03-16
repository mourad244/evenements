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
            description="Request a password reset and get back into your account safely."
          />
          <div className="grid gap-3 text-sm text-slate-600">
            <p>Enter the email linked to your account to start the reset process.</p>
            <p>If you are already signed in, you can return to your workspace instead.</p>
          </div>
        </Card>
        <ForgotPasswordForm />
      </div>
    </PublicOnlyGuard>
  );
}
