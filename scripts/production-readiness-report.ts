type State = "ready" | "blocked" | "disabled" | "manual";

type Check = {
  name: string;
  required: string[];
  enabled?: string[];
  manual?: boolean;
  exact?: Record<string, string>;
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
    name: "teamGames",
    required: [
      "TAKATAK_TEAM_GAMES_ORIGIN",
      "TAKATAK_AHMV_SERVICE_TOKEN",
    ],
    enabled: ["TAKATAK_TEAM_GAMES_ENABLED"],
    note: "exact-team games/results connector",
  },
  {
    name: "teamFeed",
    required: [
      "TAKATAK_TEAM_FEED_ORIGIN",
      "TAKATAK_TEAM_FEED_TOKEN",
    ],
    enabled: [
      "TAKATAK_TEAM_FEED_ENABLED",
      "VITE_TAKATAK_TEAM_FEED_ENABLED",
    ],
    note: "exact-team social/news Team Feed bridge and public UI",
  },
  {
    name: "ads",
    required: [
      "VITE_TAKATAK_ADS_ORIGIN",
      "VITE_TAKATAK_ADS_PUBLISHER",
    ],
    enabled: ["VITE_TAKATAK_ADS_ENABLED"],
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
    enabled: ["AHMV_EXPERIENCE_ENABLED"],
    note: "independent AHMV Family Experience",
  },
  {
    name: "community",
    required: [
      "TAKATAK_CONTENT_ORIGIN",
      "TAKATAK_AHMV_CONTENT_TOKEN",
    ],
    enabled: ["TAKATAK_CONTENT_CONTRIBUTIONS_ENABLED"],
    note: "community corrections/moderation bridge",
  },
  {
    name: "phone",
    required: [
      "TWILIO_ACCOUNT_SID",
      "TWILIO_AUTH_TOKEN",
      "AHMV_WEBHOOK_ORIGIN",
      "AHMV_PUBLIC_PHONE",
      "AHMV_PHONE_CARRIER",
    ],
    enabled: ["AHMV_PHONE_ENABLED", "AHMV_PHONE_PUBLIC"],
    exact: { AHMV_PHONE_CARRIER: "twilio" },
    note: "public website Phone/SMS provider edge",
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
    enabled: ["VITE_PUBLIC_INDEXING"],
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
  const invalidExact = Object.entries(check.exact ?? {})
    .filter(([name, expected]) => flag(name) !== expected)
    .map(([name]) => name);
  const unmet = [...new Set([...missing, ...invalidExact])];
  const disabledGates = (check.enabled ?? []).filter((name) => flag(name) !== "true");

  if (disabledGates.length > 0) {
    if (requiredNames.has(check.name)) {
      return { state: "blocked", missing: [...new Set([...disabledGates, ...unmet])] };
    }
    return { state: "disabled", missing: unmet };
  }

  if (unmet.length > 0) return { state: "blocked", missing: unmet };
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
  (result) => requiredNames.has(result.name) && result.state !== "ready",
);
const targetMode = requiredNames.size > 0;
const ok = targetMode ? requiredNotReady.length === 0 : blocked.length === 0;

console.log("");
console.log(
  JSON.stringify({
    ok,
    strict,
    blocked: blocked.map((item) => item.name),
    requiredNotReady: requiredNotReady.map((item) => item.name),
    disabled: results.filter((item) => item.state === "disabled").map((item) => item.name),
    manual: results.filter((item) => item.state === "manual").map((item) => item.name),
  }),
);

if (strict && !ok) {
  process.exit(1);
}
