"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl py-16">
      <Card className="grid gap-4 text-center">
        <h1 className="text-2xl font-semibold text-ink">Something went wrong</h1>
        <p className="text-sm text-slate-600">The frontend shell hit an unexpected state. Try the route again.</p>
        <div>
          <Button onClick={reset}>Retry</Button>
        </div>
      </Card>
    </div>
  );
}
