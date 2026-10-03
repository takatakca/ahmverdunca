import { useEffect } from "react";
import { ADSENSE_CONFIG } from "@/lib/monetization";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function AdSenseSlot({ className = "" }: { className?: string }) {
  useEffect(() => {
    if (!ADSENSE_CONFIG.enabled || !ADSENSE_CONFIG.client || !ADSENSE_CONFIG.slot) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ad blockers or provider timing can prevent a slot from initializing.
    }
  }, []);

  if (!ADSENSE_CONFIG.enabled || !ADSENSE_CONFIG.client || !ADSENSE_CONFIG.slot) return null;

  return (
    <aside className={className} aria-label="Publicité">
      <ins
        className="adsbygoogle block min-h-24 w-full"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CONFIG.client}
        data-ad-slot={ADSENSE_CONFIG.slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
