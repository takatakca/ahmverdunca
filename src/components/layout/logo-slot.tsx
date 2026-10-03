import { cn } from "@/lib/utils";

/**
 * Official AHM Verdun crest.
 *
 * The production bundle already ships the association crest as /favicon.png.
 * Reuse that stable local asset instead of a text-only replacement or a
 * Lovable-only asset URL so the real identity is always visible.
 */
export function LogoSlot({ className, size = "sm" }: { className?: string; size?: "sm" | "lg" }) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center",
        size === "sm" ? "size-12 lg:size-[54px]" : "size-20 sm:size-24",
        className,
      )}
    >
      <span className="absolute inset-0 rounded-full bg-white/95 shadow-[0_8px_24px_rgba(0,0,0,0.28)]" aria-hidden />
      <img
        src="/favicon.png"
        alt="Association du hockey mineur de Verdun"
        width={64}
        height={64}
        decoding="async"
        className="relative z-10 size-full object-contain p-[3px]"
      />
    </span>
  );
}
