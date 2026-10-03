export type ParentPremiumCapabilityId =
  | "ad_free"
  | "ai_assistant"
  | "game_reminders"
  | "calendar_sync"
  | "team_community"
  | "parent_messaging"
  | "parent_rideshare"
  | "smart_departure"
  | "family_live_coordination"
  | "tournament_travel"
  | "live_tracking"
  | "video_chat";

function httpsUrl(value: string) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url : undefined;
  } catch {
    return undefined;
  }
}

function weeklyPrice() {
  const value = Number(import.meta.env["VITE_PARENT_PREMIUM_WEEKLY_PRICE_CAD"] || "10");
  return Number.isFinite(value) && value > 0 ? value : 10;
}

export const PARENT_PREMIUM = {
  /** Must match GROUPE TAKATAK Hockey Membership catalog. */
  productCode: "hockey_member_weekly_10",
  planName: "AHMV Member",
  visible: import.meta.env["VITE_PARENT_PREMIUM_VISIBLE"] === "true",
  launchEnabled: import.meta.env["VITE_PARENT_PREMIUM_LAUNCH_ENABLED"] === "true",
  weeklyPriceCad: weeklyPrice(),
  supporterThankYouWeeks: 4,
  authStartUrl: import.meta.env["VITE_TAKATAK_AUTH_START_URL"] || "",
  activeCapabilities: [
    "ad_free",
    "ai_assistant",
    "game_reminders",
    "calendar_sync",
    "team_community",
    "parent_messaging",
    "parent_rideshare",
  ] satisfies ParentPremiumCapabilityId[],
  roadmapCapabilities: [
    "smart_departure",
    "family_live_coordination",
    "tournament_travel",
    "live_tracking",
    "video_chat",
  ] satisfies ParentPremiumCapabilityId[],
} as const;

export function parentPremiumSignupUrl(teamId: string) {
  if (!PARENT_PREMIUM.launchEnabled) return undefined;
  const url = httpsUrl(PARENT_PREMIUM.authStartUrl);
  if (!url) return undefined;

  url.searchParams.set("product", PARENT_PREMIUM.productCode);
  url.searchParams.set("teamId", teamId);
  url.searchParams.set("source", "ahmverdun");
  return url.toString();
}
