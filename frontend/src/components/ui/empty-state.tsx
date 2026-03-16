import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  align?: "center" | "left";
};

export function EmptyState({
  title,
  description,
  action,
  align = "center"
}: EmptyStateProps) {
  return (
    <Card className={`grid gap-3.5 ${align === "left" ? "text-left" : "text-center"}`}>
      <h2 className="text-xl font-semibold text-ink sm:text-2xl">{title}</h2>
      <p className="max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
      {action ? <div className="pt-1.5">{action}</div> : null}
    </Card>
  );
}
