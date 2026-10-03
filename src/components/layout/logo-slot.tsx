import { cn } from "@/lib/utils";

/**
 * Official AHM Verdun crest.
 *
 * Keep the original transparent artwork intact. Do not place the crest on an
 * artificial white disc: the association mark must read as the actual crest,
 * not as an app-icon treatment.
 */
export function LogoSlot({ className, size = "sm" }: { className?: string; size?: "sm" | "lg" }) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center",
        size === "sm" ? "size-14 lg:size-16" : "size-20 sm:size-24",
        className,
      )}
    >
      <img
        src="/favicon.png"
        alt="Association du hockey mineur de Verdun"
        width={96}
        height={96}
        decoding="async"
        className="size-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.38)]"
      />
    </span>
  );
}
