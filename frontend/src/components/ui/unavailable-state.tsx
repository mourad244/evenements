import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";

type UnavailableStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function UnavailableState({
  title,
  description,
  action
}: UnavailableStateProps) {
  return (
    <Card className="grid gap-3.5 text-center sm:text-left">
      <h2 className="text-xl font-semibold text-ink sm:text-2xl">{title}</h2>
      <p className="max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
      {action ? <div className="flex flex-wrap gap-3 pt-1.5">{action}</div> : null}
    </Card>
  );
}
