import { cn } from "@/lib/utils";

export const AHMV_LOGO_URL =
  "https://utuvzrqvivqyziibobvu.supabase.co/storage/v1/object/public/ahmv-media-public/branding/ahmv-logo-premium-2026.png";

/**
 * Approved AHM Verdun crest used across the production experience.
 *
 * The transparent artwork is served from the association media storage so the
 * same approved mark can be reused by the header, hero, footer and social
 * surfaces without duplicating binary assets in the app bundle.
 */
export function LogoSlot({ className, size = "sm" }: { className?: string; size?: "sm" | "lg" }) {
  return (
    <span
      className={cn(
        "ahmv-logo-motion relative inline-flex shrink-0 items-center justify-center",
        size === "sm" ? "size-14 lg:size-16" : "size-20 sm:size-24",
        className,
      )}
    >
      <img
        src={AHMV_LOGO_URL}
        alt="Association du hockey mineur de Verdun"
        width={1024}
        height={1024}
        decoding="async"
        className="size-full object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.52)]"
      />
    </span>
  );
}
