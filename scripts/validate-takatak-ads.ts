import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures: string[] = [];

function read(relativePath: string): string {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

const component = read("src/components/takatak-ad-slot.tsx");
const house = read("src/components/house-sponsor-slot.tsx");
const monetization = read("src/lib/monetization.ts");
const envExample = read(".env.example");

for (const placement of [
  "site-inline-01",
  "home-main-01",
  "schedule-inline-01",
  "team-inline-01",
  "news-inline-01",
  "gallery-inline-01",
]) {
  if (!component.includes(placement)) {
    failures.push(`Missing TAKATAK ADS placement mapping: ${placement}`);
  }
}

if (!house.includes("TakatakAdSlot")) {
  failures.push("House sponsor inventory must route through TAKATAK ADS.");
}

for (const forbidden of [
  "document.cookie",
  "localStorage",
  "sessionStorage",
  "navigator.geolocation",
]) {
  if (component.includes(forbidden)) {
    failures.push(`TAKATAK ADS publisher must not use ${forbidden}.`);
  }
}

for (const variable of [
  "VITE_TAKATAK_ADS_ENABLED",
  "VITE_TAKATAK_ADS_ORIGIN",
  "VITE_TAKATAK_ADS_PUBLISHER",
]) {
  if (!monetization.includes(variable) || !envExample.includes(variable)) {
    failures.push(`Missing TAKATAK ADS configuration variable: ${variable}`);
  }
}

if (!component.includes('rel="sponsored noopener noreferrer"')) {
  failures.push("Paid outbound ad links must be marked sponsored.");
}

if (failures.length > 0) {
  console.error("\nTAKATAK ADS publisher validation failed:\n");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "TAKATAK ADS publisher validation passed: placements, privacy, sponsored links and config are wired.",
);
