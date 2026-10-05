import { readFileSync } from "node:fs";

const env = readFileSync(".env.example", "utf8");
const voiceEnv = readFileSync("services/ahmv-voice-ai/.env.example", "utf8");
const inventory = readFileSync("docs/PRODUCTION_CONFIGURATION_INVENTORY.md", "utf8");
const errors: string[] = [];

const disabledByDefault = [
  "VITE_PUBLIC_INDEXING",
  "VITE_DEMO_MEMBER_PREVIEW_ENABLED",
  "VITE_COMMUNICATIONS_PREVIEW_ENABLED",
  "VITE_ASSISTANT_NUDGE_ENABLED",
  "VITE_TAKATAK_CONTENT_CONTRIBUTIONS_VISIBLE",
  "TAKATAK_CONTENT_CONTRIBUTIONS_ENABLED",
  "VITE_PARENT_PREMIUM_VISIBLE",
  "VITE_PARENT_PREMIUM_LAUNCH_ENABLED",
  "AHMV_EXPERIENCE_ENABLED",
  "VITE_TAKATAK_ADS_ENABLED",
  "VITE_TAKATAK_TEAM_FEED_ENABLED",
  "TAKATAK_TEAM_FEED_ENABLED",
  "AHMV_PHONE_ENABLED",
  "AHMV_PHONE_PUBLIC",
  "AHMV_PHONE_DEMO_ENABLED",
  "AHMV_PHONE_OPS_ENABLED",
  "AHMV_PHONE_RETENTION_ENABLED",
  "AHMV_PHONE_LIFECYCLE_ENABLED",
  "AHMV_PHONE_REMINDERS_ENABLED",
  "AHMV_CALENDAR_LINKS_ENABLED",
  "AHMV_TAKATAK_MEMBERSHIP_SYNC_ENABLED",
  "TAKATAK_AHMV_CONTROL_PLANE_ENABLED",
  "AHMV_PHONE_CAMPAIGNS_ENABLED",
  "AHMV_TAKATAK_MARKETING_CONSENT_SYNC_ENABLED",
] as const;

const websiteCriticalNames = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "AHMV_SUPABASE_PROJECT_REF",
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
  "TAKATAK_CONTENT_ORIGIN",
  "TAKATAK_AHMV_CONTENT_TOKEN",
  "TAKATAK_AHMV_SERVICE_TOKEN",
  "AHMV_EXPERIENCE_SESSION_SECRET",
  "TAKATAK_AHMV_LAUNCH_URL",
  "TAKATAK_AHMV_EXCHANGE_URL",
  "TAKATAK_AHMV_INTROSPECT_URL",
  "TAKATAK_TEAM_GAMES_ENABLED",
  "TAKATAK_TEAM_GAMES_ORIGIN",
  "TAKATAK_TEAM_FEED_ORIGIN",
  "TAKATAK_TEAM_FEED_TOKEN",
  "TAKATAK_AHMV_SCHEDULE_URL",
  "AHMV_LIVE_SCHEDULE_MAX_AGE_MINUTES",
  "VITE_TAKATAK_ADS_ORIGIN",
  "VITE_TAKATAK_ADS_PUBLISHER",
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
  "AHMV_WEBHOOK_ORIGIN",
  "AHMV_PUBLIC_PHONE",
  "AHMV_VOICE_BRIDGE_TOKEN",
] as const;

const voiceCriticalNames = [
  "PUBLIC_BASE_URL",
  "PUBLIC_WSS_URL",
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_PHONE_NUMBER",
  "OPENAI_API_KEY",
  "AHM_VOICE_BRIDGE_URL",
  "AHM_VOICE_BRIDGE_TOKEN",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

function envValue(source: string, name: string) {
  const match = source.match(new RegExp(`^${name}=(.*)$`, "m"));
  return match?.[1];
}

function inventoryMentions(name: string) {
  return inventory.includes(`\`${name}\``) || inventory.includes(`\`${name}=`);
}

for (const name of disabledByDefault) {
  const value = envValue(env, name);
  if (value === undefined) {
    errors.push(`.env.example is missing guarded flag ${name}`);
  } else if (value !== "false") {
    errors.push(`${name} must default to false, found "${value}"`);
  }
  if (!inventoryMentions(name)) {
    errors.push(`Production configuration inventory is missing ${name}`);
  }
}

for (const name of websiteCriticalNames) {
  if (envValue(env, name) === undefined) {
    errors.push(`.env.example is missing critical website variable ${name}`);
  }
  if (!inventoryMentions(name)) {
    errors.push(`Production configuration inventory is missing website variable ${name}`);
  }
}

for (const name of voiceCriticalNames) {
  if (envValue(voiceEnv, name) === undefined) {
    errors.push(`Voice .env.example is missing critical variable ${name}`);
  }
  if (!inventoryMentions(name)) {
    errors.push(`Production configuration inventory is missing Voice variable ${name}`);
  }
}

for (const secretName of [
  "SUPABASE_SERVICE_ROLE_KEY",
  "TWILIO_AUTH_TOKEN",
  "AHMV_EXPERIENCE_SESSION_SECRET",
  "TAKATAK_AHMV_SERVICE_TOKEN",
  "TAKATAK_AHMV_CONTENT_TOKEN",
  "TAKATAK_TEAM_FEED_TOKEN",
  "AHMV_VOICE_BRIDGE_TOKEN",
] as const) {
  if (secretName.startsWith("VITE_")) {
    errors.push(`Server secret ${secretName} must never use a VITE_ prefix`);
  }
}

if (!inventory.includes("report only `present`, `missing`, `enabled` or `disabled`")) {
  errors.push("Production inventory must preserve the no-secret-value reporting rule");
}

if (errors.length > 0) {
  console.error("\nProduction configuration inventory validation failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  console.error(`\n${errors.length} issue(s) found.\n`);
  process.exit(1);
}

console.log(
  `Production configuration inventory passed: ${disabledByDefault.length} guarded flags, ${websiteCriticalNames.length} website variables, ${voiceCriticalNames.length} Voice variables.`,
);
