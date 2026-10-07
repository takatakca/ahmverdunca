import { useEffect } from "react";
import { ADSENSE_CONFIG } from "@/lib/monetization";
import { onConsentChange, readConsent } from "@/consent/consent";
import {
  DEMO_MEMBER_EVENT_NAME,
  DEMO_MEMBER_PREVIEW_ENABLED,
  DEMO_MEMBER_STORAGE_KEY,
} from "@/lib/demo-member-mode";

const SCRIPT_ID = "ahmv-adsense-script";

function memberPreviewActive() {
  return (
    DEMO_MEMBER_PREVIEW_ENABLED &&
    typeof window !== "undefined" &&
    window.localStorage.getItem(DEMO_MEMBER_STORAGE_KEY) === "member"
  );
}

function removeAdSense() {
  document.getElementById(SCRIPT_ID)?.remove();
  document
    .querySelectorAll("ins.adsbygoogle, .google-auto-placed, [data-ad-client^='ca-pub-']")
    .forEach((node) => node.remove());
}

function loadAdSense() {
  if (!ADSENSE_CONFIG.enabled || !ADSENSE_CONFIG.client || memberPreviewActive()) return;
  // Québec Law 25: AdSense sets advertising cookies, so it waits for the "Publicité" choice
  // in the cookie banner. Withdrawing that choice reloads the page (src/tracking/loadTags.ts).
  if (readConsent()?.marketing !== true) return;
  if (document.getElementById(SCRIPT_ID)) return;

  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.async = true;
  script.crossOrigin = "anonymous";
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(ADSENSE_CONFIG.client)}`;
  document.head.appendChild(script);
}

export function AdSenseScriptController() {
  useEffect(() => {
    if (!DEMO_MEMBER_PREVIEW_ENABLED) {
      window.localStorage.removeItem(DEMO_MEMBER_STORAGE_KEY);
      loadAdSense();
      return onConsentChange(loadAdSense);
    }

    const sync = () => {
      if (memberPreviewActive()) removeAdSense();
      else loadAdSense();
    };

    sync();
    const stopConsent = onConsentChange(sync);
    window.addEventListener(DEMO_MEMBER_EVENT_NAME, sync);
    window.addEventListener("storage", sync);

    return () => {
      stopConsent();
      window.removeEventListener(DEMO_MEMBER_EVENT_NAME, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return null;
}
