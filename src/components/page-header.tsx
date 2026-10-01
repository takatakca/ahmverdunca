import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Standard navy page header used by every inner page. */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string | undefined;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("navy-texture text-navy-foreground", className)}>
      <div className="container-site py-10 md:py-16">
        {eyebrow && <p className="eyebrow text-sport-foreground/80 mb-3 flex items-center gap-2"><span className="inline-block h-px w-6 bg-sport" />{eyebrow}</p>}
        <h1 className="heading-section">{title}</h1>
        {description && <p className="mt-4 max-w-2xl text-base text-navy-foreground/80 md:text-lg">{description}</p>}
        {actions && <div className="mt-6 flex flex-wrap gap-3">{actions}</div>}
      </div>
    </header>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
  id,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div className={cn("mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end md:mb-8", className)}>
      <div>
        {eyebrow && <p className="eyebrow text-sport mb-2">{eyebrow}</p>}
        <h2 id={id} className="heading-section">{title}</h2>
        {description && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
