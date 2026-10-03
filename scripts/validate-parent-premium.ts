import { readFileSync } from "node:fs";

const errors: string[] = [];
const premium = readFileSync("src/lib/parent-premium.ts", "utf8");
const env = readFileSync(".env.example", "utf8");
const docs = readFileSync("docs/PARENT_PREMIUM_PLATFORM.md", "utf8");
const membershipPage = readFileSync("src/routes/membership.tsx", "utf8");

function requireFragment(source: string, content: string, fragment: string, label: string) {
  if (!content.includes(fragment)) errors.push(`${source}: missing ${label}`);
}
function forbidFragment(source: string, content: string, fragment: string, label: string) {
  if (content.includes(fragment)) errors.push(`${source}: contains forbidden ${label}`);
}

requireFragment("src/lib/parent-premium.ts", premium, 'productCode: "ahmv"', "AHMV product code");
requireFragment("src/lib/parent-premium.ts", premium, 'planCode: "parent_essential"', "canonical parent plan code");
requireFragment("src/lib/parent-premium.ts", premium, 'entitlementCode: "ahmv_access"', "AHMV access entitlement");
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
requireFragment(".env.example", env, "AHMV_EXPERIENCE_ENABLED=false", "disabled-by-default private experience");
requireFragment(".env.example", env, "TAKATAK_AHMV_INTROSPECT_URL=", "live entitlement introspection URL");
requireFragment("docs/PARENT_PREMIUM_PLATFORM.md", docs, "`parent_premium`", "planned premium plan");
requireFragment("docs/PARENT_PREMIUM_PLATFORM.md", docs, "`ahmv_access`", "access entitlement");
requireFragment("docs/PARENT_PREMIUM_PLATFORM.md", docs, "localStorage", "browser entitlement prohibition");
requireFragment("docs/PARENT_PREMIUM_PLATFORM.md", docs, "database configuration", "catalog-owned pricing");

for (const [source, content] of [
  ["src/lib/parent-premium.ts", premium],
  [".env.example", env],
  ["src/routes/membership.tsx", membershipPage],
] as const) {
  forbidFragment(source, content, "VITE_PARENT_PREMIUM_WEEKLY_PRICE_CAD", "browser price variable");
  forbidFragment(source, content, "weeklyPriceCad", "browser weekly price constant");
  forbidFragment(source, content, "CAD 10/week", "hard-coded weekly offer");
}

if (errors.length > 0) {
  console.error("\nAHMV Parent Experience contract check failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  console.error(`\n${errors.length} issue(s) found.\n`);
  process.exit(1);
}

console.log("AHMV Parent Experience contract check passed.");
