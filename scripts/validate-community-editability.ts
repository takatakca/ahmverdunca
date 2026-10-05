import { readFileSync } from "node:fs";

const failures: string[] = [];

function source(path: string) {
  return readFileSync(path, "utf8");
}

function requireFragment(path: string, body: string, fragment: string, label: string) {
  if (!body.includes(fragment)) {
    failures.push(`${path}: missing ${label}`);
  }
}

const siteLayout = source("src/components/layout/site-layout.tsx");
const globalCorrection = source("src/components/global-page-correction.tsx");
const contributionButton = source("src/components/content-contribution-button.tsx");
const proxy = source("src/lib/takatak-content-contributions.server.ts");
const server = source("src/server.ts");
const env = source(".env.example");

requireFragment(
  "src/components/layout/site-layout.tsx",
  siteLayout,
  "GlobalPageCorrection",
  "sitewide correction surface",
);
requireFragment(
  "src/components/global-page-correction.tsx",
  globalCorrection,
  "ContentContributionButton",
  "global page correction button",
);
requireFragment(
  "src/components/global-page-correction.tsx",
  globalCorrection,
  'resourceType="page"',
  "global page correction resource type",
);

requireFragment(
  "src/components/content-contribution-button.tsx",
  contributionButton,
  "VITE_TAKATAK_CONTENT_CONTRIBUTIONS_VISIBLE",
  "browser-safe correction visibility gate",
);
requireFragment(
  "src/components/content-contribution-button.tsx",
  contributionButton,
  "evidenceRequired",
  "evidence requirement support",
);

requireFragment(
  "src/lib/takatak-content-contributions.server.ts",
  proxy,
  "handleTakatakContentContributions",
  "server contribution proxy",
);
requireFragment(
  "src/lib/takatak-content-contributions.server.ts",
  proxy,
  "/api/ahmv/content-overlays",
  "approved overlay read endpoint",
);
requireFragment(
  "src/server.ts",
  server,
  "handleTakatakContentContributions",
  "server wiring for community corrections",
);

requireFragment(
  ".env.example",
  env,
  "VITE_TAKATAK_CONTENT_CONTRIBUTIONS_VISIBLE=false",
  "correction UI disabled-by-default gate",
);
requireFragment(
  ".env.example",
  env,
  "TAKATAK_CONTENT_CONTRIBUTIONS_ENABLED=false",
  "server contribution disabled-by-default gate",
);

const editableSurfaces = [
  "src/routes/arenas.$slug.tsx",
  "src/components/official-week-schedule.tsx",
  "src/routes/nouvelles.$slug.tsx",
  "src/routes/equipes.$slug.tsx",
  "src/routes/galerie.$slug.tsx",
  "src/routes/galerie.index.tsx",
  "src/routes/faq.tsx",
  "src/components/official-sponsor-showcase.tsx",
  "src/components/house-sponsor-slot.tsx",
] as const;

for (const path of editableSurfaces) {
  requireFragment(path, source(path), "ContentContributionButton", "community correction control");
}

for (const path of [
  "src/routes/arenas.$slug.tsx",
  "src/routes/equipes.$slug.tsx",
] as const) {
  requireFragment(path, source(path), "useContentOverlay", "approved content overlay consumption");
}

for (const path of [
  "src/components/official-week-schedule.tsx",
  "src/routes/nouvelles.$slug.tsx",
  "src/routes/galerie.$slug.tsx",
  "src/routes/galerie.index.tsx",
  "src/routes/faq.tsx",
  "src/components/official-sponsor-showcase.tsx",
  "src/components/house-sponsor-slot.tsx",
] as const) {
  const body = source(path);
  if (!body.includes("useContentOverlayRegistry") && !body.includes("useContentOverlay")) {
    failures.push(`${path}: missing approved overlay consumption`);
  }
}

requireFragment(
  "src/components/official-week-schedule.tsx",
  source("src/components/official-week-schedule.tsx"),
  "evidenceRequired",
  "official schedule correction evidence requirement",
);

if (failures.length > 0) {
  console.error("\nAHMV community editability contract failed:\n");
  for (const failure of failures) console.error(`- ${failure}`);
  console.error(`\n${failures.length} issue(s) found.\n`);
  process.exit(1);
}

console.log(
  "AHMV community editability contract passed: global correction, structured controls, overlays, evidence and fail-closed gates are intact.",
);
