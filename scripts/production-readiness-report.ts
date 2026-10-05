type State = "ready" | "blocked" | "disabled" | "manual";

type Check = {
  name: string;
  required: string[];
  enabled?: string;
  enabledWhen?: string;
  manual?: boolean;
  note: string;
};

const checks: Check[] = [
  {
    name: "core",
    required: [
      "SUPABASE_URL",
      "SUPABASE_SERVICE_ROLE_KEY",
      "AHMV_SUPABASE_PROJECT_REF",
      "VITE_SUPABASE_URL",
      "VITE_SUPABASE_PUBLISHABLE_KEY",
    ],
    note: "AHMV website database/runtime foundation",
  },
  {
    name: "schedule",
    required: [
      "TAKATAK_AHMV_SCHEDULE_URL",
      "TAKATAK_AHMV_SERVICE_TOKEN",
      "AHMV_LIVE_SCHEDULE_MAX_AGE_MINUTES",
    ],
    note: "continuous authoritative schedule feed",
  },
  {
    name: "teamFeed",
    required: [
      "TAKATAK_TEAM_GAMES_ORIGIN",
      "TAKATAK_AHMV_SERVICE_TOKEN",
    ],
    enabled: "TAKATAK_TEAM_GAMES_ENABLED",
    enabledWhen: "true",
    note: "exact-team games/feed connector",
  },
  {
    name: "ads",
    required: [
      "VITE_TAKATAK_ADS_ORIGIN",
      "VITE_TAKATAK_ADS_PUBLISHER",
    ],
    enabled: "VITE_TAKATAK_ADS_ENABLED",
    enabledWhen: "true",
    note: "TAKATAK ADS publisher delivery",
  },
  {
    name: "family",
    required: [
      "TAKATAK_AHMV_LAUNCH_URL",
      "TAKATAK_AHMV_EXCHANGE_URL",
      "TAKATAK_AHMV_INTROSPECT_URL",
      "TAKATAK_AHMV_SERVICE_TOKEN",
      "AHMV_EXPERIENCE_SESSION_SECRET",
    ],
    enabled: "AHMV_EXPERIENCE_ENABLED",
    enabledWhen: "true",
    note: "independent AHMV Family Experience",
  },
  {
    name: "community",
    required: [
      "TAKATAK_CONTENT_ORIGIN",
      "TAKATAK_AHMV_CONTENT_TOKEN",
    ],
    enabled: "TAKATAK_CONTENT_CONTRIBUTIONS_ENABLED",
    enabledWhen: "true",
    note: "community corrections/moderation bridge",
  },
  {
    name: "phone",
    required: [
      "TWILIO_ACCOUNT_SID",
      "TWILIO_AUTH_TOKEN",
      "AHMV_WEBHOOK_ORIGIN",
      "AHMV_PUBLIC_PHONE",
    ],
    enabled: "AHMV_PHONE_ENABLED",
    enabledWhen: "true",
    note: "website Phone/SMS provider edge",
  },
  {
    name: "voiceBridge",
    required: [
      "AHMV_VOICE_BRIDGE_TOKEN",
      "TAKATAK_AHMV_SCHEDULE_URL",
      "TAKATAK_AHMV_SERVICE_TOKEN",
    ],
    note: "private website bridge used by the standalone Voice service",
  },
  {
    name: "publicIndexing",
    required: [],
    enabled: "VITE_PUBLIC_INDEXING",
    enabledWhen: "true",
    manual: true,
    note: "SEO indexing requires explicit human release acceptance",
  },
];

const args = process.argv.slice(2);
const strict = args.includes("--strict");
const requiredArg = args.find((arg) => arg.startsWith("--require="));
const requiredNames = new Set(
  requiredArg
    ? requiredArg.slice("--require=".length).split(",").map((item) => item.trim()).filter(Boolean)
    : [],
);

function present(name: string) {
  const value = process.env[name];
  return typeof value === "string" && value.trim().length > 0;
}

function flag(name: string) {
  return (process.env[name] ?? "").trim().toLowerCase();
}

function evaluate(check: Check): { state: State; missing: string[] } {
  const missing = check.required.filter((name) => !present(name));
  if (check.enabled) {
    const actual = flag(check.enabled);
    const expected = check.enabledWhen ?? "true";
    if (actual !== expected) {
      if (requiredNames.has(check.name)) return { state: "blocked", missing: [check.enabled, ...missing] };
      return { state: "disabled", missing };
    }
  }
  if (missing.length > 0) return { state: "blocked", missing };
  if (check.manual) return { state: "manual", missing: [] };
  return { state: "ready", missing: [] };
}

const results = checks.map((check) => ({ ...check, ...evaluate(check) }));

const knownNames = new Set(checks.map((check) => check.name));
const unknownRequired = [...requiredNames].filter((name) => !knownNames.has(name));
if (unknownRequired.length > 0) {
  console.error(`Unknown readiness target(s): ${unknownRequired.join(", ")}`);
  console.error(`Known targets: ${[...knownNames].join(", ")}`);
  process.exit(2);
}

console.log("AHMV production readiness");
console.log("-------------------------");
for (const result of results) {
  const missing = result.missing.length > 0 ? ` | missing: ${result.missing.join(", ")}` : "";
  console.log(`${result.name.padEnd(14)} ${result.state.padEnd(8)} | ${result.note}${missing}`);
}

const blocked = results.filter((result) => result.state === "blocked");
const requiredNotReady = results.filter(
  (result) => requiredNames.has(result.name) && result.state !== "ready" && result.state !== "manual",
);

console.log("");
console.log(
  JSON.stringify({
    ok: blocked.length === 0 && requiredNotReady.length === 0,
    strict,
    blocked: blocked.map((item) => item.name),
    requiredNotReady: requiredNotReady.map((item) => item.name),
    disabled: results.filter((item) => item.state === "disabled").map((item) => item.name),
    manual: results.filter((item) => item.state === "manual").map((item) => item.name),
  }),
);

if (strict && (blocked.length > 0 || requiredNotReady.length > 0)) {
  process.exit(1);
}
