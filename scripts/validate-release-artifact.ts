import { existsSync } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";

const candidates = [".output/server/index.mjs", ".output/server/index.js"];
const entry = candidates.find((file) => existsSync(file));
const errors: string[] = [];

if (!existsSync(".output")) errors.push("Missing .output production directory.");
if (!entry) errors.push("Missing standalone Node server entry (.output/server/index.mjs or index.js).");
if (!existsSync(".output/public")) errors.push("Missing .output/public assets directory.");

async function size(path: string): Promise<number> {
  const info = await stat(path);
  if (info.isFile()) return info.size;
  let total = 0;
  for (const item of await readdir(path)) total += await size(join(path, item));
  return total;
}

if (errors.length) {
  console.error("Release artifact validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const bytes = await size(".output");
if (bytes === 0) {
  console.error("Release artifact validation failed: .output is empty.");
  process.exit(1);
}

console.log(`Release artifact validated: ${entry}, ${(bytes / 1024 / 1024).toFixed(2)} MiB.`);
