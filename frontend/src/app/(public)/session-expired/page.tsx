import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/shared/page-title";
import { ROUTES } from "@/lib/constants/routes";

export default function SessionExpiredPage() {
  return (
    <div className="mx-auto grid max-w-3xl gap-8">
      <Card className="grid gap-6">
        <PageTitle
          eyebrow="Session"
          title="Your session expired."
          description="For security, we signed you out. Please sign in again to continue where you left off."
        />
        <div className="flex flex-wrap gap-3">
          <Link href={ROUTES.login}>
            <Button>Return to sign in</Button>
          </Link>
          <Link href={ROUTES.events}>
            <Button variant="ghost">Browse events</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
