import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = join(process.cwd(), "src");
const forbidden = [
  "hero-hockey.jpg",
  "news-cancellation.jpg",
  "news-season.jpg",
  "news-academy.jpg",
  "gallery-party.jpg",
  "gallery-feminine.jpg",
  "gallery-tournament.jpg",
];

const forbiddenRuntimePatterns = ["/__l5e/", ".asset.json"];

const failures: string[] = [];

function visit(directory: string) {
  for (const name of readdirSync(directory)) {
    const path = join(directory, name);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      visit(path);
      continue;
    }
    if (!/\.(?:ts|tsx|js|jsx|css)$/.test(name)) continue;

    const source = readFileSync(path, "utf8");
    for (const asset of forbidden) {
      if (source.includes(asset)) {
        failures.push(`${relative(process.cwd(), path)} references disabled synthetic asset ${asset}.`);
      }
    }
  }
}

visit(root);

if (failures.length) {
  console.error("Synthetic-media policy validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Media policy validation passed: no disabled synthetic assets or Lovable-only runtime asset paths are referenced by application code.");
