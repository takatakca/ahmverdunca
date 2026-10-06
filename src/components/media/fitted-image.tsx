import { cn } from "@/lib/utils";

/**
 * Shows the whole image inside any frame — posters and flyers are never cropped —
 * over a blurred cover copy of itself so the frame never looks empty.
 * Fills its nearest positioned ancestor.
 */
export function FittedImage({
  src,
  alt,
  loading = "lazy",
  className,
  imgClassName,
}: {
  src: string;
  alt: string;
  loading?: "lazy" | "eager";
  className?: string;
  imgClassName?: string;
}) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden bg-navy-deep", className)}>
      <img
        src={src}
        alt=""
        aria-hidden
        loading={loading}
        decoding="async"
        className="absolute inset-0 size-full scale-110 object-cover opacity-45 blur-2xl"
      />
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        className={cn("relative size-full object-contain", imgClassName)}
      />
    </div>
  );
}
