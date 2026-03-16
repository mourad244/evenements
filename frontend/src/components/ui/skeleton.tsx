import { cn } from "@/lib/utils/cn";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "rounded-[20px] border border-[rgba(255,255,255,0.04)] bg-[linear-gradient(90deg,rgba(18,28,46,0.68),rgba(28,42,66,0.9),rgba(18,28,46,0.68))] bg-[length:200%_100%] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] animate-pulse",
        className
      )}
    />
  );
}
