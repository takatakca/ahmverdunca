import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Reserved slot for the official AHMV logo. The real file will be dropped in
 * later; nothing here is an AI recreation of the association's mark.
 */
export function LogoSlot({ className, size = "sm" }: { className?: string; size?: "sm" | "lg" }) {
  const { t } = useI18n();
  return (
    <span
      role="img"
      aria-label={t("common.logoSlot")}
      title={t("common.logoSlot")}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-md border border-dashed border-navy-foreground/40 bg-navy-foreground/5 font-display font-bold uppercase text-navy-foreground/80",
        size === "sm" ? "size-10 text-sm" : "size-24 text-2xl",
        className,
      )}
    >
      AHMV
    </span>
  );
}
