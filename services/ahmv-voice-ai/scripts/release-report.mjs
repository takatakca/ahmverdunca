import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const env = await readFile(path.join(root, ".env.example"), "utf8");
const defaults = Object.fromEntries(
  env.split(/\r?\n/).filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const i = line.indexOf("=");
      const key = line.slice(0, i);
      const value = line.slice(i + 1);
      const sensitive = /(TOKEN|KEY|SECRET|PASSWORD|AUTH|SID)/i.test(key);
      return [key, sensitive ? (value ? "CONFIGURED_IN_TEMPLATE" : "EMPTY") : value];
    })
);

const output = {
  generatedAt: new Date().toISOString(),
  product: "AHM Verdun Voice AI",
  version: pkg.version,
  node: pkg.engines.node,
  dependencyVersions: pkg.dependencies,
  architecture: {
    realtimeHost: "voice.ahmverdun.ca",
    website: "ahmverdun.ca",
    languages: ["fr", "en", "es"],
    activation: "press-1-before-ai",
    deploymentMode: "single-instance-until-distributed-lease",
  },
  operationalDefaults: defaults,
};
console.log(JSON.stringify(output, null, 2));
