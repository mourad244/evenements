import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

type LoadingStateProps = {
  label?: string;
  minHeightClassName?: string;
};

export function LoadingState({
  label = "Loading...",
  minHeightClassName = "min-h-[240px]"
}: LoadingStateProps) {
  return (
    <Card
      className={`flex ${minHeightClassName} flex-col items-center justify-center gap-4 text-center`}
      role="status"
      aria-live="polite"
    >
      <Spinner />
      <p className="max-w-xl text-sm leading-6 text-slate-600">{label}</p>
    </Card>
  );
}
