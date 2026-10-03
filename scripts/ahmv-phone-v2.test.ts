import test from "node:test";
import assert from "node:assert/strict";
import { localEntitlement, canUse } from "../src/features/ahmv-phone/entitlements/access.ts";
import { navigationLinksForVenue } from "../src/features/ahmv-phone/arenas/navigation.ts";
import { resolvePublicTeam } from "../src/features/ahmv-phone/teams/resolve.ts";
import { nextEventService } from "../src/features/ahmv-phone/schedules/service.ts";
import { scheduleRangeAnswer } from "../src/features/ahmv-phone/schedules/range.ts";
import { parsePhoneCommand } from "../src/features/ahmv-phone/conversation/commands.ts";

test("active 30-day trial unlocks premium-ready phone capabilities", () => {
  const entitlement = localEntitlement("trial", "2099-01-01T00:00:00Z");
  assert.equal(canUse(entitlement, "weekly_schedule"), true);
  assert.equal(canUse(entitlement, "game_reminders"), true);
});

test("expired trial keeps only base information capabilities", () => {
  const entitlement = localEntitlement("trial", "2000-01-01T00:00:00Z");
  assert.equal(canUse(entitlement, "next_event"), true);
  assert.equal(canUse(entitlement, "requested_directions_sms"), true);
  assert.equal(canUse(entitlement, "weekly_schedule"), false);
});

test("premium unlocks all phone capabilities", () => {
  const entitlement = localEntitlement("premium");
  assert.equal(canUse(entitlement, "smart_departure"), true);
});

test("M11B is treated as ambiguous instead of guessing a team", () => {
  const result = resolvePublicTeam("M11B");
  assert.equal(result.kind, "ambiguous");
  if (result.kind === "ambiguous") assert.ok(result.teams.length >= 2);
});

test("unambiguous category and level resolve deterministically", () => {
  const result = resolvePublicTeam("M13A");
  assert.equal(result.kind, "exact");
  if (result.kind === "exact") assert.equal(result.team.categorySlug, "m13");
});

test("Denis Savard venue resolves to a verified destination and navigation links", () => {
  const links = navigationLinksForVenue("À DENIS");
  assert.match(links.destination, /4110/);
  assert.match(links.googleMaps, /^https:\/\/www\.google\.com\/maps\/dir/);
  assert.match(links.appleMaps, /^https:\/\/maps\.apple\.com/);
  assert.match(links.waze, /^https:\/\/www\.waze\.com/);
  assert.equal(links.arenaSlug, "auditorium-de-verdun");
});

test("shared schedule service returns event metadata and directions", () => {
  const result = nextEventService("Junior", "fr", {}, new Date("2026-09-28T16:00:00Z"));
  assert.equal(result.outcome, "scheduled");
  assert.equal(result.event?.group, "Junior");
  assert.ok(result.directions?.googleMaps);
  assert.match(result.smsText, /Itinéraire:/);
});

test("member SMS commands parse in French and English", () => {
  assert.deepEqual(parsePhoneCommand("SEMAINE Junior"), { kind: "week", teamQuery: "Junior" });
  assert.deepEqual(parsePhoneCommand("TODAY M13A"), { kind: "today", teamQuery: "M13A" });
  assert.deepEqual(parsePhoneCommand("DEMAIN M13A"), { kind: "tomorrow", teamQuery: "M13A" });
  assert.deepEqual(parsePhoneCommand("SAVE M13A"), { kind: "save", teamQuery: "M13A" });
  assert.deepEqual(parsePhoneCommand("M13A"), { kind: "next", teamQuery: "M13A" });
});

test("weekly range answer lists only the requested exact group", () => {
  const result = scheduleRangeAnswer(
    "Junior",
    "week",
    "fr",
    undefined,
    new Date("2026-09-28T16:00:00Z"),
  );
  assert.equal(result.outcome, "scheduled");
  assert.equal(result.group, "Junior");
  assert.equal(result.events.length, 1);
  assert.match(result.text, /Cette semaine/);
});

test("tomorrow range does not invent unpublished activities", () => {
  const result = scheduleRangeAnswer(
    "Junior",
    "tomorrow",
    "fr",
    undefined,
    new Date("2026-09-28T16:00:00Z"),
  );
  assert.equal(result.outcome, "empty");
  assert.equal(result.events.length, 0);
});
