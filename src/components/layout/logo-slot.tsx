import { cn } from "@/lib/utils";
import logoAsset from "@/assets/ahmv-logo.jpeg.asset.json";

/** Official AHMV mark provided by the association. */
export function LogoSlot({ className, size = "sm" }: { className?: string; size?: "sm" | "lg" }) {
  return (
    <img
      src={logoAsset.url}
      alt="Association du hockey mineur de Verdun"
      className={cn(
        "shrink-0 rounded-md object-contain",
        size === "sm" ? "size-10" : "size-24",
        className,
      )}
    />
  );
}
