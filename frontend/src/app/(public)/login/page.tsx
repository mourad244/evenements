import { PublicOnlyGuard } from "@/components/guards/public-only-guard";
import { PageTitle } from "@/components/shared/page-title";
import { LoginForm } from "@/features/auth/components/login-form";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <PublicOnlyGuard>
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <Card className="relative grid gap-6 overflow-hidden border-[rgba(88,116,255,0.18)] bg-[radial-gradient(circle_at_top_right,rgba(88,116,255,0.16),transparent_30%),linear-gradient(180deg,rgba(18,28,46,0.96),rgba(8,14,24,0.98))] shadow-[0_30px_70px_rgba(14,24,54,0.34)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)]" />
          <PageTitle
            eyebrow="Authentication"
            title="Sign in to your event workspace."
            description="Use this flow for participant, organizer, or admin access."
          />
          <div className="grid gap-3 text-sm leading-6 text-[var(--text-secondary)]">
            <p>Access participant dashboards, organizer event operations, and admin workflows.</p>
            <p>Pick up where you left off and move between the parts of the platform that matter to you.</p>
          </div>
        </Card>
        <LoginForm />
      </div>
    </PublicOnlyGuard>
  );
}
