import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants/routes";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl py-16">
      <Card className="grid gap-4 text-center">
        <h1 className="text-3xl font-semibold text-ink">Page not found</h1>
        <p className="text-sm text-slate-600">This route does not exist in the current starter.</p>
        <div className="flex justify-center gap-3">
          <Link href={ROUTES.home}><Button>Home</Button></Link>
          <Link href={ROUTES.events}><Button variant="ghost">Events</Button></Link>
        </div>
      </Card>
    </div>
  );
}
