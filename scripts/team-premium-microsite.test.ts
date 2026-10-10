import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { LOUVES_M12B_MICROSITE, getPublicMicrositeModules } from "../src/data/team-microsites.ts";
import { PUBLIC_TEAM_DIRECTORY } from "../src/data/team-directory.ts";

const site = LOUVES_M12B_MICROSITE;

test("Louves M12B is a distinct public microsite, not legacy M12A", () => {
  assert.equal(site.slug, "louves-m12b");
  assert.equal(site.level, "M12B");
  assert.equal(site.exactProviderTeamId, undefined);
  assert.equal(site.teamLinktIcalUrl, undefined);
  assert.equal(site.teamLinktWidgetUrl, undefined);
  const legacyLouvesA = PUBLIC_TEAM_DIRECTORY.find((team) => team.name.includes("LOUVES"));
  assert.ok(legacyLouvesA);
  assert.equal(legacyLouvesA.level, "M12 A féminin");
  assert.equal(site.exactProviderTeamId === legacyLouvesA.legacyScheduleTeamId, false);
});

test("all nine modules exist; only reviewed public destinations have clickable links", () => {
  const modules = getPublicMicrositeModules(site);
  assert.equal(modules.length, 9);
  assert.deepEqual(
    modules.filter((module) => Boolean(module.href)).map((module) => module.key),
    ["schedule", "gallery"],
  );
  for (const module of modules) {
    assert.match(module.title.fr, /\S/);
    assert.match(module.title.en, /\S/);
    assert.match(module.description.fr, /\S/);
    assert.match(module.description.en, /\S/);
    if (module.access !== "public") assert.equal(module.href, undefined);
  }
  assert.ok(modules.some((module) => module.key === "messages" && module.access === "private-provider"));
  assert.ok(modules.some((module) => module.key === "roster" && module.access === "private-provider"));
  assert.ok(modules.some((module) => module.key === "budget" && module.access === "private-provider"));
});

test("provider secrets and untrusted external links cannot leak via cloned team microsites", () => {
  const dirty = {
    ...site,
    modules: [
      { key: "roster" as const, access: "private-provider" as const, title: { fr: "Roster", en: "Roster" }, description: { fr: "Privé", en: "Private" }, href: "https://provider.example/secrets" },
      { key: "schedule" as const, access: "public" as const, title: { fr: "Horaire", en: "Schedule" }, description: { fr: "Public", en: "Public" }, href: "//evil.example/iframe" },
    ],
  };
  const modules = getPublicMicrositeModules(dirty);
  assert.equal(modules[0]?.href, undefined);
  assert.equal(modules[1]?.href, undefined);
});

test("the Louves crest is the owner-supplied image asset, not a synthetic placeholder", () => {
  assert.equal(site.logoUrl, "/images/teams/louves-m12b-crest.webp");
  const bytes = readFileSync("public/images/teams/louves-m12b-crest.webp");
  assert.ok(bytes.subarray(0, 4).toString() === "RIFF");
  assert.equal(bytes.subarray(8, 12).toString(), "WEBP");
  const sha = createHash("sha1").update(Buffer.concat([
    Buffer.from(`blob ${bytes.length}\0`), bytes,
  ])).digest("hex");
  assert.equal(sha, "4f6318065a9e9b63d73db300a4e7651b5a1fc5bd");
});

test("microsite is isolated from homepage and from private/public unverified hockey data", () => {
  const route = readFileSync("src/routes/equipes.louves-m12b.tsx", "utf8");
  const component = readFileSync("src/components/team-premium-microsite.tsx", "utf8");
  const parent = readFileSync("src/routes/equipes.$slug.tsx", "utf8");
  const homepage = readFileSync("src/routes/index.tsx", "utf8");
  assert.match(route, /createFileRoute\("\/equipes\/louves-m12b"\)/);
  assert.match(route, /noindex, follow/);
  assert.match(parent, /href="\/equipes\/louves-m12b"/);
  assert.doesNotMatch(homepage, /PremiumTeamMicrosite/);
  assert.match(component, /media\.url/);
  assert.match(component, /aria-label/);
  assert.match(component, /data-ahmv-team-microsite=\{site\.slug\}/);
  assert.doesNotMatch(component, /<main(?:\s|>)/);
  assert.match(component, /<section data-ahmv-team-microsite=/);
  assert.match(component, /focus-visible/);
  assert.match(component, /TeamLinkt/);
  assert.doesNotMatch(component, /LOUVES.*legacyScheduleTeamId/);
});

test("mobile microsite puts working family links first and folds away future tools", () => {
  const component = readFileSync("src/components/team-premium-microsite.tsx", "utf8");
  assert.match(component, /const publicModules = modules\.filter\(\(module\) => Boolean\(module\.href\)\)/);
  assert.match(component, /const pendingModules = modules\.filter\(\(module\) => !module\.href\)/);
  assert.match(component, /publicModules\.map\(\(module\) =>/);
  assert.match(component, /pendingModules\.map\(\(module\) =>/);
  assert.match(component, /<details className=/);
  assert.match(component, /<summary className=/);
  assert.match(component, /group-open:rotate-180/);
  assert.match(component, /motion-reduce:transition-none/);
  assert.match(component, /focus-visible:outline-2/);
  assert.match(component, /min-h-16/);
  assert.match(component, /<aside className="hidden[^"]*md:block/);
  assert.ok(component.indexOf("publicModules.map") < component.indexOf("<details"));
  assert.doesNotMatch(component, /modules\.map\(\(module, index\) =>/);
});

test("mobile site never advertises planned services as connected", () => {
  const component = readFileSync("src/components/team-premium-microsite.tsx", "utf8");
  assert.match(component, /Private access/);
  assert.match(component, /In preparation/);
  assert.match(component, /private-provider/);
  assert.match(component, /module\.href/);
  assert.doesNotMatch(component, /onClick=\{\(\) => navigateToTeamLinkt/);
});
