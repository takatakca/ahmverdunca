import { cn } from "@/lib/utils";
import logoAsset from "@/assets/ahmv-logo.jpeg.asset.json";

/** Official AHMV mark provided by the association — displayed without a card/box treatment. */
export function LogoSlot({ className, size = "sm" }: { className?: string; size?: "sm" | "lg" }) {
  return (
    <img
      src={logoAsset.url}
      alt="Association du hockey mineur de Verdun"
      width={size === "sm" ? 52 : 112}
      height={size === "sm" ? 52 : 112}
      decoding="async"
      className={cn(
        "shrink-0 object-contain object-center",
        size === "sm" ? "size-12 lg:size-[52px]" : "size-24 sm:size-28",
        className,
      )}
    />
  );
}
