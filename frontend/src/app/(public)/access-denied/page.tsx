import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/shared/page-title";
import { ROUTES } from "@/lib/constants/routes";

export default function AccessDeniedPage() {
  return (
    <div className="mx-auto grid max-w-3xl gap-8">
      <Card className="grid gap-6">
        <PageTitle
          eyebrow="Access"
          title="Access denied."
          description="Your account is signed in, but this workspace is reserved for another role."
        />
        <div className="flex flex-wrap gap-3">
          <Link href={ROUTES.dashboard}>
            <Button>Return to dashboard</Button>
          </Link>
          <Link href={ROUTES.events}>
            <Button variant="ghost">Browse events</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
