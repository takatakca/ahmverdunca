import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Shared editorial masthead for every inner page. */
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
      <div className="technical-grid absolute inset-0 opacity-45" aria-hidden />
      <div className="absolute inset-y-0 left-[12%] w-px bg-sport/45" aria-hidden />
      <div className="absolute inset-y-0 left-[58%] w-px bg-navy-foreground/8" aria-hidden />
      <div className="absolute left-[58%] top-1/2 size-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-navy-foreground/7" aria-hidden />
      <div className="giant-watermark pointer-events-none absolute -bottom-7 -right-3 select-none" aria-hidden>
        Verdun
      </div>

      <div className="container-site relative grid gap-8 py-12 md:grid-cols-[minmax(0,1fr)_minmax(13rem,0.28fr)] md:items-end md:py-20">
        <div className="max-w-5xl">
          {eyebrow && (
            <p className="eyebrow mb-4 flex items-center gap-3 text-sport-foreground/90">
              <span className="h-1.5 w-10 bg-sport" aria-hidden />
              {eyebrow}
            </p>
          )}
          <h1 className="font-display text-[clamp(3.5rem,9vw,7.5rem)] font-extrabold uppercase leading-[0.8] tracking-[-0.045em]">
            {title}
          </h1>
          {description && (
            <p className="mt-6 max-w-3xl border-l-2 border-sport pl-4 text-base leading-relaxed text-navy-foreground/72 md:text-lg">
              {description}
            </p>
          )}
          {actions && <div className="mt-7 flex flex-wrap gap-3">{actions}</div>}
        </div>

        <div className="hidden border-l border-navy-foreground/12 pl-6 md:block">
          <p className="font-display text-6xl font-extrabold leading-none tracking-[-0.05em] text-navy-foreground/12">
            514
          </p>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.24em] text-navy-foreground/45">
            Verdun · Montréal
          </p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.24em] text-sport-foreground/80">
            Hockey mineur
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
    <div className={cn("mb-7 grid gap-5 border-b border-navy/15 pb-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end md:mb-9", className)}>
      <div className="max-w-4xl">
        {eyebrow && (
          <p className="eyebrow mb-2 flex items-center gap-2 text-sport">
            <span className="h-px w-7 bg-sport" aria-hidden />
            {eyebrow}
          </p>
        )}
        <h2 id={id} className="font-display text-[clamp(2.4rem,5.4vw,4.6rem)] font-extrabold uppercase leading-[0.84] tracking-[-0.035em] text-navy">
          {title}
        </h2>
        {description && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
