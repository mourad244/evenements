import { Badge } from "@/components/ui/badge";

type PageTitleProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function PageTitle({ eyebrow, title, description }: PageTitleProps) {
  return (
    <div className="grid gap-6 px-1">
      {eyebrow ? <Badge variant="secondary" className="w-fit">{eyebrow}</Badge> : null}
      <div className="grid gap-3.5">
        <h1 className="text-4xl font-bold tracking-tight text-[var(--text-primary)] sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        {description ? (
          <p className="max-w-3xl text-sm leading-8 text-[var(--text-secondary)] sm:text-base lg:text-lg">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
