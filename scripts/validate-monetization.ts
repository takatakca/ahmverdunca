import { readFileSync } from "node:fs";

const takatakAdsEnabled = process.env["VITE_TAKATAK_ADS_ENABLED"] === "true";
const takatakAdsOrigin = process.env["VITE_TAKATAK_ADS_ORIGIN"] ?? "https://takatak.ca";
const takatakAdsPublisher = process.env["VITE_TAKATAK_ADS_PUBLISHER"] ?? "ahmv";
const adsEnabled = process.env["VITE_ADSENSE_ENABLED"] === "true";
const adsClient = process.env["VITE_ADSENSE_CLIENT"] ?? "";
const adsSlot = process.env["VITE_ADSENSE_SLOT"] ?? "";
const supportEnabled = process.env["VITE_SUPPORT_ENABLED"] === "true";
const publicIndexing = process.env["VITE_PUBLIC_INDEXING"] === "true";
const demoMemberPreviewEnabled = process.env["VITE_DEMO_MEMBER_PREVIEW_ENABLED"] === "true";
const supportBeneficiary = process.env["VITE_SUPPORT_BENEFICIARY"] ?? "";
const supportUrls = [
  process.env["VITE_SUPPORT_URL_10"],
  process.env["VITE_SUPPORT_URL_25"],
  process.env["VITE_SUPPORT_URL_50"],
  process.env["VITE_SUPPORT_URL_100"],
  process.env["VITE_SUPPORT_URL_CUSTOM"],
].filter((value): value is string => Boolean(value));

const demoMemberSource = readFileSync("src/lib/demo-member-mode.ts", "utf8");
const adSenseControllerSource = readFileSync(
  "src/components/adsense-script-controller.tsx",
  "utf8",
);
const directStorageKeyOccurrences = [
  demoMemberSource,
  adSenseControllerSource,
].join("\n").match(/ahmv-demo-member-mode/g)?.length ?? 0;

const errors: string[] = [];

if (directStorageKeyOccurrences !== 1) {
  errors.push("Demo member storage key must be declared exactly once in src/lib/demo-member-mode.ts.");
}

if (!adSenseControllerSource.includes("DEMO_MEMBER_PREVIEW_ENABLED")) {
  errors.push("AdSense loader must honor the explicit demo member preview gate.");
}

if (adSenseControllerSource.includes('const MEMBER_STORAGE_KEY = "ahmv-demo-member-mode"')) {
  errors.push("AdSense loader must not redeclare the demo member storage key.");
}

if (takatakAdsEnabled) {
  try {
    const url = new URL(takatakAdsOrigin);
    if (url.protocol !== "https:") {
      errors.push("VITE_TAKATAK_ADS_ORIGIN must use HTTPS when TAKATAK ADS is enabled.");
    }
  } catch {
    errors.push("VITE_TAKATAK_ADS_ORIGIN must be a valid URL when TAKATAK ADS is enabled.");
  }

  if (!/^[a-z0-9][a-z0-9_-]{1,63}$/i.test(takatakAdsPublisher)) {
    errors.push("VITE_TAKATAK_ADS_PUBLISHER must be a valid publisher code.");
  }
}


if (publicIndexing && demoMemberPreviewEnabled) {
  errors.push("VITE_DEMO_MEMBER_PREVIEW_ENABLED must be false when public indexing is enabled; real member ad suppression must come from verified entitlement state, not localStorage.");
}

if (adsEnabled) {
  if (!/^ca-pub-\d+$/.test(adsClient)) {
    errors.push("VITE_ADSENSE_CLIENT must be a real ca-pub-<digits> identifier when AdSense is enabled.");
  }
  if (adsSlot && !/^\d+$/.test(adsSlot)) {
    errors.push("VITE_ADSENSE_SLOT must be numeric when provided.");
  }
}

if (supportEnabled) {
  if (!supportBeneficiary.trim()) {
    errors.push("VITE_SUPPORT_BENEFICIARY is required when development support is enabled.");
  }
  if (supportUrls.length === 0) {
    errors.push("At least one secure support payment URL is required when development support is enabled.");
  }
  for (const value of supportUrls) {
    try {
      const url = new URL(value);
      if (url.protocol !== "https:") errors.push(`Support URL must use HTTPS: ${value}`);
    } catch {
      errors.push(`Support URL is invalid: ${value}`);
    }
  }
}

if (errors.length > 0) {
  console.error("\nAHM Verdun monetization configuration check failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `AHM Verdun monetization check passed. TAKATAK_ADS=${takatakAdsEnabled ? takatakAdsPublisher : "off"}; AdSense=${adsEnabled ? (adsSlot ? "manual+auto-ready" : "auto-ready") : "off"}; demoMemberPreview=${demoMemberPreviewEnabled ? "on" : "off"}; support=${supportEnabled ? "configured" : "off"}.`,
);
