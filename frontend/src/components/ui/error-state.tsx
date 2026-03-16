import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";

type ErrorStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function ErrorState({ title, description, action }: ErrorStateProps) {
  return (
    <Card className="grid gap-3.5" role="alert">
      <h2 className="text-xl font-semibold text-ink sm:text-2xl">{title}</h2>
      <p className="max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
      {action ? <div className="flex flex-wrap gap-3 pt-1.5">{action}</div> : null}
    </Card>
  );
}
