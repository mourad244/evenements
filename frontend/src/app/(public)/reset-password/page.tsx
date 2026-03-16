import { PublicOnlyGuard } from "@/components/guards/public-only-guard";
import { Card } from "@/components/ui/card";
import { PageTitle } from "@/components/shared/page-title";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <PublicOnlyGuard>
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <Card className="relative grid gap-6 overflow-hidden border-[rgba(243,154,99,0.18)] bg-[radial-gradient(circle_at_top_right,rgba(243,154,99,0.14),transparent_30%),linear-gradient(180deg,rgba(18,28,46,0.96),rgba(8,14,24,0.98))] shadow-[0_30px_70px_rgba(0,0,0,0.34)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)]" />
          <PageTitle
            eyebrow="Password recovery"
            title="Choose a new password."
            description="Paste your reset token or open this page from your recovery link to finish the process."
          />
          <div className="grid gap-3 text-sm leading-6 text-[var(--text-secondary)]">
            <p>Set a strong new password so you can get back to your account with confidence.</p>
            <p>If you are already signed in, you can head back to your workspace instead.</p>
          </div>
        </Card>
        <ResetPasswordForm />
      </div>
    </PublicOnlyGuard>
  );
}
