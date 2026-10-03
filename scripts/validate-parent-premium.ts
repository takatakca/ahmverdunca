import { readFileSync } from "node:fs";

const errors: string[] = [];
const premium = readFileSync("src/lib/parent-premium.ts", "utf8");
const env = readFileSync(".env.example", "utf8");
const docs = readFileSync("docs/PARENT_PREMIUM_PLATFORM.md", "utf8");

function requireFragment(source: string, content: string, fragment: string, label: string) {
  if (!content.includes(fragment)) errors.push(`${source}: missing ${label}`);
}

requireFragment("src/lib/parent-premium.ts", premium, 'productCode: "hockey_member_weekly_10"', "TAKATAK hockey plan code");
for (const entitlement of [
  "ad_free",
  "ai_assistant",
  "game_reminders",
  "calendar_sync",
  "team_community",
  "parent_messaging",
  "parent_rideshare",
]) {
  requireFragment("src/lib/parent-premium.ts", premium, `"${entitlement}"`, `member entitlement ${entitlement}`);
}
requireFragment(".env.example", env, "VITE_PARENT_PREMIUM_VISIBLE=false", "hidden-by-default presentation flag");
requireFragment(".env.example", env, "VITE_PARENT_PREMIUM_LAUNCH_ENABLED=false", "disabled-by-default launch flag");
requireFragment(".env.example", env, "VITE_PARENT_PREMIUM_WEEKLY_PRICE_CAD=10", "CAD 10 weekly display price");
requireFragment("docs/PARENT_PREMIUM_PLATFORM.md", docs, "hockey_vip_weekly_30", "planned VIP code");
requireFragment("docs/PARENT_PREMIUM_PLATFORM.md", docs, "not for sale", "VIP non-sale boundary");
requireFragment("docs/PARENT_PREMIUM_PLATFORM.md", docs, "localStorage", "browser entitlement prohibition");

if (errors.length > 0) {
  console.error("\nAHMV Parent Premium contract check failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  console.error(`\n${errors.length} issue(s) found.\n`);
  process.exit(1);
}

console.log("AHMV Parent Premium contract check passed.");
