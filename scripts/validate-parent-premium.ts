import { readFileSync } from "node:fs";

const errors: string[] = [];
const premium = readFileSync("src/lib/parent-premium.ts", "utf8");
const env = readFileSync(".env.example", "utf8");
const docs = readFileSync("docs/PARENT_PREMIUM_PLATFORM.md", "utf8");
const membership = readFileSync("src/routes/membership.tsx", "utf8");
const experience = readFileSync("src/routes/experience.tsx", "utf8");
const server = readFileSync("src/server.ts", "utf8");
const migration = readFileSync("supabase/migrations/20261003154500_ahmv_family_experience.sql", "utf8");

function requireFragment(source: string, body: string, fragment: string, label: string) {
  if (!body.includes(fragment)) errors.push(`${source}: missing ${label}`);
}

function forbidFragment(source: string, body: string, fragment: string, label: string) {
  if (body.includes(fragment)) errors.push(`${source}: forbidden ${label}`);
}

requireFragment("src/lib/parent-premium.ts", premium, 'productCode: "ahmv"', "canonical AHMV product code");
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
requireFragment(".env.example", env, "TAKATAK_AHMV_EXCHANGE_URL=", "TAKATAK launch exchange endpoint");
requireFragment(".env.example", env, "TAKATAK_AHMV_INTROSPECT_URL=", "TAKATAK entitlement introspection endpoint");
requireFragment(".env.example", env, "AHMV_EXPERIENCE_SESSION_SECRET=", "server-only session signing secret");

requireFragment("src/routes/experience.tsx", experience, 'createFileRoute("/experience")', "independent Family Experience route");
requireFragment("src/routes/membership.tsx", membership, "if (!PARENT_PREMIUM.visible) throw notFound()", "membership preview route visibility gate");
requireFragment("src/server.ts", server, "handleAhmvExperienceAuth", "Family Experience auth handler");
requireFragment("src/server.ts", server, "gateAhmvExperience", "Family Experience server gate");
requireFragment("supabase/migrations/20261003154500_ahmv_family_experience.sql", migration, "enable row level security", "family RLS");
requireFragment("supabase/migrations/20261003154500_ahmv_family_experience.sql", migration, "revoke all", "family browser-role revocation");

requireFragment("docs/PARENT_PREMIUM_PLATFORM.md", docs, "`ahmv_access`", "access entitlement");
requireFragment("docs/PARENT_PREMIUM_PLATFORM.md", docs, "localStorage", "browser entitlement prohibition");
requireFragment("docs/PARENT_PREMIUM_PLATFORM.md", docs, "TAKATAK", "TAKATAK billing authority");

for (const [source, body] of [
  ["src/lib/parent-premium.ts", premium],
  ["src/routes/membership.tsx", membership],
  [".env.example", env],
] as const) {
  forbidFragment(source, body, "VITE_PARENT_PREMIUM_WEEKLY_PRICE_CAD", "browser price variable");
  forbidFragment(source, body, "weeklyPriceCad", "browser weekly price constant");
  forbidFragment(source, body, "hockey_member_weekly_10", "legacy plan as current browser authority");
}

if (errors.length > 0) {
  console.error("\nAHMV Parent Experience contract check failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  console.error(`\n${errors.length} issue(s) found.\n`);
  process.exit(1);
}

console.log("AHMV Parent Experience contract check passed.");
