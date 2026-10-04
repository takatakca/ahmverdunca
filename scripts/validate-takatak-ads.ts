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
  if (!component.includes(placement)) failures.push(`Missing TAKATAK ADS placement mapping: ${placement}`);
}

if (!house.includes("TakatakAdSlot") || !house.includes("network = true")) {
  failures.push("House sponsor inventory must have a guarded TAKATAK ADS network wrapper.");
}
if (!house.includes("RUNWAY_AD_CREATIVES")) {
  failures.push("Current visual ad inventory must remain available as the TAKATAK ADS fallback.");
}
if (!component.includes("if (!ad) return <>{fallback}</>")) {
  failures.push("TAKATAK ADS must render local fallback inventory whenever no valid network ad is available.");
}
if (!component.includes("requireImage && !normalized?.imageUrl")) {
  failures.push("Text-only network ads must not suppress visual AHMV fallback inventory.");
}
if (!house.includes("requireImage")) {
  failures.push("AHMV house sponsor slots must require a network image before replacing Runway creatives.");
}

for (const forbidden of ["document.cookie", "localStorage", "sessionStorage", "navigator.geolocation"]) {
  if (component.includes(forbidden)) failures.push(`TAKATAK ADS publisher must not use ${forbidden}.`);
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
if (!component.includes('url.protocol === "https:"')) {
  failures.push("Network creative URLs must be restricted to HTTPS.");
}
if (!component.includes('credentials: "omit"')) {
  failures.push("TAKATAK ADS browser requests must omit credentials.");
}

if (failures.length > 0) {
  console.error("\nTAKATAK ADS publisher validation failed:\n");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("TAKATAK ADS publisher validation passed: fallback, privacy, HTTPS, sponsored links and config are wired.");
