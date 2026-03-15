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
      <div className="grid gap-2">
        <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">{title}</h1>
        {description ? <p className="max-w-3xl text-base text-slate-600">{description}</p> : null}
      </div>
    </div>
  );
}
