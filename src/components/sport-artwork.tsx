import { cn } from "@/lib/utils";

export function SportArtwork({
  index,
  kicker,
  title,
  code = "AHMV",
  className,
  aspect = "aspect-[16/10]",
  dark = true,
}: {
  index?: string;
  kicker?: string;
  title?: string;
  code?: string;
  className?: string;
  aspect?: string;
  dark?: boolean;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "sport-artwork relative isolate overflow-hidden",
        dark ? "bg-navy-deep text-navy-foreground" : "bg-ice text-navy",
        aspect,
        className,
      )}
    >
      <div className="technical-grid absolute inset-0 opacity-70" />
      <div className="absolute inset-y-0 left-[28%] w-px bg-sport/80" />
      <div className="absolute inset-y-0 right-[20%] w-px bg-navy-foreground/10" />
      <div className="absolute left-[28%] top-1/2 size-[42%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-sport/45" />
      <div className="absolute left-[28%] top-1/2 size-[18%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-navy-foreground/15" />
      <div className="absolute inset-x-0 top-[18%] h-px bg-navy-foreground/10" />
      <div className="absolute inset-x-0 bottom-[18%] h-px bg-navy-foreground/10" />
      <div className="absolute -right-[4%] -top-[12%] font-display text-[clamp(7rem,22vw,18rem)] font-extrabold uppercase leading-none tracking-[-0.08em] text-current opacity-[0.035]">
        {code}
      </div>

      <div className="absolute left-4 top-4 flex items-center gap-2 md:left-5 md:top-5">
        <span className="h-1.5 w-8 bg-sport" />
        <span className="font-display text-[10px] font-bold uppercase tracking-[0.22em] opacity-55">
          {kicker ?? "AHM Verdun"}
        </span>
      </div>

      {index && (
        <span className="absolute right-4 top-3 font-display text-5xl font-extrabold tracking-[-0.06em] opacity-20 md:right-5 md:top-4 md:text-6xl">
          {index}
        </span>
      )}

      <div className="absolute inset-x-4 bottom-4 md:inset-x-5 md:bottom-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="h-px flex-1 bg-current opacity-15" />
          <span className="size-1.5 bg-sport" />
        </div>
        <p className="max-w-[18ch] font-display text-xl font-extrabold uppercase leading-[0.9] tracking-[-0.025em] md:text-3xl">
          {title ?? "Association du hockey mineur de Verdun"}
        </p>
      </div>
    </div>
  );
}
