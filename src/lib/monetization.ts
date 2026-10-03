export const DEVELOPMENT_SUPPORT = {
  beneficiary: import.meta.env["VITE_SUPPORT_BENEFICIARY"] || "GROUPE TAKATAK",
  enabled: import.meta.env["VITE_SUPPORT_ENABLED"] === "true",
  tiers: [
    { amount: 10, url: import.meta.env["VITE_SUPPORT_URL_10"] || "" },
    { amount: 25, url: import.meta.env["VITE_SUPPORT_URL_25"] || "" },
    { amount: 50, url: import.meta.env["VITE_SUPPORT_URL_50"] || "" },
    { amount: 100, url: import.meta.env["VITE_SUPPORT_URL_100"] || "" },
  ],
  customUrl: import.meta.env["VITE_SUPPORT_URL_CUSTOM"] || "",
} as const;

export const ADSENSE_CONFIG = {
  enabled: import.meta.env["VITE_ADSENSE_ENABLED"] === "true",
  client: import.meta.env["VITE_ADSENSE_CLIENT"] || "",
  slot: import.meta.env["VITE_ADSENSE_SLOT"] || "",
} as const;


export const TAKATAK_ADS_CONFIG = {
  enabled: import.meta.env["VITE_TAKATAK_ADS_ENABLED"] === "true",
  origin: (import.meta.env["VITE_TAKATAK_ADS_ORIGIN"] || "https://takatak.ca").replace(/\/$/, ""),
  publisherCode: import.meta.env["VITE_TAKATAK_ADS_PUBLISHER"] || "ahmv",
} as const;
