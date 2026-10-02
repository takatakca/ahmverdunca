import { cn } from "@/lib/utils";
import logoAsset from "@/assets/ahmv-logo.png.asset.json";

/** Official transparent AHMV mark provided by the association. */
export function LogoSlot({ className, size = "sm" }: { className?: string; size?: "sm" | "lg" }) {
  return (
    <img
      src={logoAsset.url}
      alt="Association du hockey mineur de Verdun"
      width={size === "sm" ? 132 : 286}
      height={size === "sm" ? 104 : 224}
      decoding="async"
      className={cn(
        "shrink-0 object-contain object-center",
        size === "sm"
          ? "h-12 w-auto max-w-[7.75rem] lg:h-[54px] lg:max-w-[8.75rem]"
          : "h-20 w-auto max-w-[11rem] sm:h-24 sm:max-w-[13rem]",
        className,
      )}
    />
  );
}
