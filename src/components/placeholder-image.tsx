import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

/**
 * Image slot. When `src` is provided it renders the illustrative image with a
 * small "to replace" marker; otherwise renders a clearly identified placeholder.
 */
export function PlaceholderImage({
  src,
  alt,
  label,
  className,
  aspect = "aspect-[16/10]",
  markIllustrative = true,
}: {
  src?: string | undefined;
  alt?: string;
  label?: string;
  className?: string;
  aspect?: string;
  markIllustrative?: boolean;
}) {
  const { t } = useI18n();
  const publicLaunch = import.meta.env["VITE_PUBLIC_INDEXING"] === "true";
  const showIllustrativeImage = Boolean(src) && (!markIllustrative || !publicLaunch);
  const fallbackLabel =
    src && markIllustrative && publicLaunch
      ? (alt || "AHM Verdun")
      : (label ?? t("common.placeholderImage"));

  return (
    <div className={cn("relative overflow-hidden bg-muted", aspect, className)}>
      {showIllustrativeImage ? (
        <img
          src={src}
          alt={alt ?? ""}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[repeating-linear-gradient(45deg,transparent_0_12px,var(--color-border)_12px_13px)] text-muted-foreground">
          <ImageIcon className="size-8" aria-hidden />
          <span className="px-4 text-center text-xs font-medium">{fallbackLabel}</span>
        </div>
      )}
      {showIllustrativeImage && markIllustrative && (
        <span className="absolute bottom-2 left-2 rounded-full border border-white/10 bg-navy-deep/70 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-navy-foreground/85 backdrop-blur-sm">
          {t("common.demo")}
        </span>
      )}
    </div>
  );
}
