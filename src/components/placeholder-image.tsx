import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

/**
 * Media slot. Generated/illustrative assets are deliberately not rendered.
 * A source is displayed only when the caller explicitly marks it as official
 * with markIllustrative=false. Until then, the site uses a branded rink graphic.
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
  const showOfficialImage = Boolean(src) && !markIllustrative;
  const fallbackLabel = label ?? alt ?? t("common.placeholderImage");

  return (
    <div className={cn("sport-artwork relative isolate overflow-hidden bg-navy-deep text-navy-foreground", aspect, className)}>
      {showOfficialImage ? (
        <img
          src={src}
          alt={alt ?? ""}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <>
          <div className="technical-grid absolute inset-0 opacity-55" aria-hidden />
          <div className="absolute inset-y-0 left-1/2 w-px bg-sport/55" aria-hidden />
          <div className="absolute left-1/2 top-1/2 size-[42%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-sport/35" aria-hidden />
          <div className="absolute inset-x-0 top-[24%] h-px bg-navy-foreground/10" aria-hidden />
          <div className="absolute inset-x-0 bottom-[24%] h-px bg-navy-foreground/10" aria-hidden />
          <div className="absolute inset-x-4 bottom-4 md:inset-x-5 md:bottom-5">
            <p className="eyebrow text-sport-foreground/85">AHM Verdun</p>
            <p className="mt-2 max-w-[24ch] font-display text-xl font-extrabold uppercase leading-[0.92] md:text-2xl">
              {fallbackLabel}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
