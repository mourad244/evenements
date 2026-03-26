import { Badge } from "@/components/ui/badge";

type PageTitleProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function PageTitle({ eyebrow, title, description }: PageTitleProps) {
  return (
    <div className="grid gap-4">
      {eyebrow ? <Badge>{eyebrow}</Badge> : null}
      <div className="grid gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="max-w-3xl text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
