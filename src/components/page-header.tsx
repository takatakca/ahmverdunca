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
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-6 flex items-end justify-between gap-4 md:mb-8", className)}>
      <div>
        {eyebrow && <p className="eyebrow text-sport mb-2">{eyebrow}</p>}
        <h2 className="heading-section">{title}</h2>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
