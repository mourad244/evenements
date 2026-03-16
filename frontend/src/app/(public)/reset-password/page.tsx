import { PublicOnlyGuard } from "@/components/guards/public-only-guard";
import { Card } from "@/components/ui/card";
import { PageTitle } from "@/components/shared/page-title";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <PublicOnlyGuard>
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <Card className="grid gap-6">
          <PageTitle
            eyebrow="Password recovery"
            title="Choose a new password."
            description="Paste your reset token or open this page from your recovery link to finish the process."
          />
          <div className="grid gap-3 text-sm text-slate-600">
            <p>Set a strong new password so you can get back to your account with confidence.</p>
            <p>If you are already signed in, you can head back to your workspace instead.</p>
          </div>
        </Card>
        <ResetPasswordForm />
      </div>
    </PublicOnlyGuard>
  );
}
