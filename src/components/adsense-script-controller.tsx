import { readBrowserPreference, removeBrowserPreference } from "@/lib/browser-preferences";
import { useEffect } from "react";
import { ADSENSE_CONFIG } from "@/lib/monetization";
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
    readBrowserPreference(DEMO_MEMBER_STORAGE_KEY) === "member"
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
      removeBrowserPreference(DEMO_MEMBER_STORAGE_KEY);
      loadAdSense();
      return;
    }

    const sync = () => {
      if (memberPreviewActive()) removeAdSense();
      else loadAdSense();
    };

    sync();
    window.addEventListener(DEMO_MEMBER_EVENT_NAME, sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener(DEMO_MEMBER_EVENT_NAME, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return null;
}
