import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Shared compact editorial masthead for every inner page. */
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
    <header className={cn("relative isolate overflow-hidden bg-competition text-navy-foreground", className)}>
      <div className="technical-grid absolute inset-0 opacity-25" aria-hidden />
      <div className="absolute inset-y-0 left-[12%] w-px bg-sport/35" aria-hidden />
      <div className="absolute inset-y-0 right-[18%] hidden w-px bg-navy-foreground/7 lg:block" aria-hidden />
      <div className="giant-watermark pointer-events-none absolute -bottom-8 -right-2 hidden select-none opacity-45 lg:block" aria-hidden>
        Verdun
      </div>

      <div className="container-site relative grid gap-6 py-9 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:py-14">
        <div className="max-w-5xl min-w-0">
          {eyebrow && (
            <p className="eyebrow mb-3 flex flex-wrap items-center gap-2.5 text-sport-foreground/90">
              <span className="h-1 w-8 bg-sport" aria-hidden />
              {eyebrow}
            </p>
          )}
          <h1 className="max-w-[18ch] break-words font-display text-[clamp(2.75rem,7.5vw,6rem)] font-extrabold uppercase leading-[0.86] tracking-[-0.035em]">
            {title}
          </h1>
          {description && (
            <p className="mt-4 max-w-3xl border-l-2 border-sport pl-4 text-sm leading-relaxed text-navy-foreground/72 sm:text-base md:text-lg">
              {description}
            </p>
          )}
          {actions && <div className="mt-5 flex flex-wrap gap-3">{actions}</div>}
        </div>

        <div className="hidden min-w-[8rem] border-l border-navy-foreground/12 pl-5 lg:block">
          <p className="font-display text-3xl font-extrabold uppercase leading-none tracking-[-0.03em] text-navy-foreground/75">
            AHMV
          </p>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-navy-foreground/45">
            Verdun · Montréal
          </p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-sport-foreground/80">
            2026–2027
          </p>
        </div>
      </div>

      <div className="relative h-1 bg-sport" aria-hidden />
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
    <div className={cn("mb-6 grid gap-4 border-b border-navy/15 pb-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end md:mb-8", className)}>
      <div className="max-w-4xl min-w-0">
        {eyebrow && (
          <p className="eyebrow mb-2 flex flex-wrap items-center gap-2 text-sport">
            <span className="h-px w-7 bg-sport" aria-hidden />
            {eyebrow}
          </p>
        )}
        <h2 id={id} className="break-words font-display text-[clamp(2rem,4.8vw,3.75rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.025em] text-navy">
          {title}
        </h2>
        {description && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
