import { useEffect } from "react";
import { ADSENSE_CONFIG, TAKATAK_ADS_CONFIG } from "@/lib/monetization";
import { HouseSponsorSlot } from "@/components/house-sponsor-slot";
import { TakatakAdSlot } from "@/components/takatak-ad-slot";
import { useDemoMemberMode } from "@/lib/demo-member-mode";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

function GoogleAdSenseOrHouse({
  className,
  placement,
}: {
  className: string;
  placement: string;
}) {
  useEffect(() => {
    if (!ADSENSE_CONFIG.enabled || !ADSENSE_CONFIG.client || !ADSENSE_CONFIG.slot) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ad blockers or provider timing can prevent a slot from initializing.
    }
  }, []);

  if (!ADSENSE_CONFIG.enabled || !ADSENSE_CONFIG.client || !ADSENSE_CONFIG.slot) {
    return <HouseSponsorSlot placement={placement} className={className} network={false} />;
  }

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

export function AdSenseSlot({
  className = "",
  placement = "generic",
}: {
  className?: string;
  placement?: string;
}) {
  const { isDemoMember } = useDemoMemberMode();
  if (isDemoMember) return null;

  const fallback = <GoogleAdSenseOrHouse className={className} placement={placement} />;

  if (!TAKATAK_ADS_CONFIG.enabled) return fallback;

  return <TakatakAdSlot placement={placement} className={className} fallback={fallback} />;
}
