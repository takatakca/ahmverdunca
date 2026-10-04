import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const srcRoot = path.join(root, "src");
const backendFolder = path.join(srcRoot, "features", "takatak-dashboard-ahmv");

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

function relative(file: string) {
  return path.relative(root, file).replaceAll("\\", "/");
}

const errors: string[] = [];
const sourceFiles = (await walk(srcRoot)).filter((file) => /\.[cm]?[jt]sx?$/.test(file));

for (const file of sourceFiles) {
  if (file.startsWith(backendFolder + path.sep)) continue;
  const content = await readFile(file, "utf8");
  if (content.includes("takatak-dashboard-ahmv")) {
    errors.push(`${relative(file)} imports/references backend-only TAKATAK AHMV control-plane code`);
  }
}

const server = await readFile(path.join(srcRoot, "server.ts"), "utf8");
if (server.includes("takatak-dashboard-ahmv")) {
  errors.push("src/server.ts mounts/references the dormant TAKATAK AHMV control plane");
}

const env = await readFile(path.join(root, ".env.example"), "utf8");
if (/VITE_[A-Z0-9_]*TAKATAK_AHMV_CONTROL/i.test(env)) {
  errors.push("control-plane configuration must never be browser-exposed with VITE_");
}

const manifest = await readFile(
  path.join(backendFolder, "contracts.ts"),
  "utf8",
);
if (!/autoMountInDashboard:\s*false/.test(manifest)) {
  errors.push("backend manifest must keep autoMountInDashboard=false");
}
if (!/standaloneApplication:\s*true/.test(manifest)) {
  errors.push("backend manifest must keep standaloneApplication=true");
}

if (errors.length) {
  console.error("TAKATAK AHMV backend boundary violation:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("TAKATAK AHMV backend boundary: OK");
