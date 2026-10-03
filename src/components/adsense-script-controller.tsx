import { useEffect } from "react";
import { ADSENSE_CONFIG } from "@/lib/monetization";

const MEMBER_STORAGE_KEY = "ahmv-demo-member-mode";
const MEMBER_EVENT_NAME = "ahmv:demo-member-mode";
const SCRIPT_ID = "ahmv-adsense-script";

function memberPreviewActive() {
  return typeof window !== "undefined" && window.localStorage.getItem(MEMBER_STORAGE_KEY) === "member";
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
    const sync = () => {
      if (memberPreviewActive()) removeAdSense();
      else loadAdSense();
    };

    sync();
    window.addEventListener(MEMBER_EVENT_NAME, sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener(MEMBER_EVENT_NAME, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return null;
}
