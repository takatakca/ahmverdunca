import test from "node:test";
import assert from "node:assert/strict";
import {
  TEAM_ICE_BAG_ITEMS,
  parseTeamIceBagState,
  serializeTeamIceBagState,
  teamIceBagStorageKey,
  toggleTeamIceBagItem,
} from "../src/lib/team-ice-bag.ts";
import { readFileSync } from "node:fs";

test("parents get six bilingual general packing reminders, not official rules", () => {
  assert.deepEqual(TEAM_ICE_BAG_ITEMS.map((item) => item.id), [
    "skates", "helmet", "gloves", "stick", "neck-guard", "water",
  ]);
  for (const item of TEAM_ICE_BAG_ITEMS) {
    assert.ok(item.fr.length > 2);
    assert.ok(item.en.length > 2);
  }
});

test("local-only checklist is isolated per exact-team slug", () => {
  assert.equal(teamIceBagStorageKey("louves-m12b"), "ahmv:ice-bag:v1:louves-m12b");
  assert.notEqual(teamIceBagStorageKey("louves-m12a"), teamIceBagStorageKey("louves-m12b"));
  for (const bad of ["../louves", "/louves", "", "LOUVES-M12B", "louves m12b", "x".repeat(81)]) {
    assert.equal(teamIceBagStorageKey(bad), null);
  }
});

test("decode/encode only six known boolean selections; reject malformed or oversized data", () => {
  assert.deepEqual(parseTeamIceBagState(null), []);
  assert.deepEqual(parseTeamIceBagState('["skates","helmet","skates"]'), ["skates", "helmet"]);
  assert.deepEqual(parseTeamIceBagState('{"id":"skates","name":"player"}'), []);
  assert.deepEqual(parseTeamIceBagState('["skates","private-player-email"]'), []);
  assert.deepEqual(parseTeamIceBagState("invalid JSON"), []);
  assert.deepEqual(parseTeamIceBagState("x".repeat(513)), []);
  assert.deepEqual(parseTeamIceBagState(JSON.stringify(["skates", 5])), []);
  assert.equal(serializeTeamIceBagState(["water", "skates"]), '["skates","water"]');
});

test("check/uncheck is reversible and persists only item identifiers", () => {
  const start = toggleTeamIceBagItem([], "skates");
  assert.deepEqual(start, ["skates"]);
  assert.deepEqual(toggleTeamIceBagItem(start, "skates"), []);
  assert.deepEqual(toggleTeamIceBagItem(start, "water"), ["skates", "water"]);
  assert.equal(serializeTeamIceBagState(start).includes("Louves"), false);
});

test("team page uses a keyboard-accessible, honest, private on-device checklist", () => {
  const page = readFileSync("src/components/team-premium-microsite.tsx", "utf8");
  const component = readFileSync("src/components/team-ice-bag-checklist.tsx", "utf8");
  assert.match(page, /TeamIceBagChecklist teamSlug=\{site.slug\} lang=\{lang\}/);
  assert.ok(page.indexOf("<TeamIceBagChecklist") < page.indexOf("<details className="));
  assert.match(component, /aria-expanded=\{expanded\}/);
  assert.match(component, /aria-controls=\{disclosureId\}/);
  assert.match(component, /aria-live="polite"/);
  assert.match(component, /type="checkbox"/);
  assert.match(component, /peer-focus-visible/);
  assert.match(component, /motion-reduce:transition-none/);
  assert.match(component, /localStorage/);
  assert.doesNotMatch(component, /fetch\(|sendBeacon\(|WebSocket\(/);
});
