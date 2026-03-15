import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card className="grid gap-3 text-center">
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      <p className="text-sm text-slate-600">{description}</p>
      {action ? <div className="pt-2">{action}</div> : null}
    </Card>
  );
}
