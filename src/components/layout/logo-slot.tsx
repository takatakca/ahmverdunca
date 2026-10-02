import { cn } from "@/lib/utils";

/**
 * Production-safe AHMV wordmark.
 *
 * The previous component depended on a Lovable-only private asset route,
 * which does not exist on MochaHost. Keep this mark self-contained so the
 * association identity is always visible even when no external media loads.
 */
export function LogoSlot({ className, size = "sm" }: { className?: string; size?: "sm" | "lg" }) {
  return (
    <span
      role="img"
      aria-label="Association du hockey mineur de Verdun"
      className={cn(
        "relative inline-flex shrink-0 items-stretch overflow-hidden border border-white/20 bg-white text-navy shadow-sm",
        size === "sm" ? "h-12 min-w-[6.8rem] lg:h-[54px]" : "h-20 min-w-[10rem] sm:h-24 sm:min-w-[12rem]",
        className,
      )}
    >
      <span className="w-1.5 shrink-0 bg-sport" aria-hidden />
      <span className={cn("flex flex-col justify-center px-2.5 leading-none", size === "lg" && "px-4")}>
        <span className={cn("font-display font-extrabold uppercase tracking-[-0.045em]", size === "sm" ? "text-[1.55rem]" : "text-4xl sm:text-5xl")}>
          AHMV
        </span>
        <span className={cn("mt-0.5 font-display font-bold uppercase tracking-[0.2em] text-sport", size === "sm" ? "text-[0.52rem]" : "text-[0.68rem] sm:text-xs")}>
          Verdun
        </span>
      </span>
      <span className="absolute inset-x-0 bottom-0 h-0.5 bg-navy/10" aria-hidden />
    </span>
  );
}
