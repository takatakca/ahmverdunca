import test from "node:test";
import assert from "node:assert/strict";
import { localEntitlement, canUse } from "../src/features/ahmv-phone/entitlements/access.ts";
import { navigationLinksForVenue } from "../src/features/ahmv-phone/arenas/navigation.ts";
import { resolvePublicTeam } from "../src/features/ahmv-phone/teams/resolve.ts";
import { nextEventService } from "../src/features/ahmv-phone/schedules/service.ts";
import { scheduleRangeAnswer } from "../src/features/ahmv-phone/schedules/range.ts";
import { parsePhoneCommand } from "../src/features/ahmv-phone/conversation/commands.ts";
import {
  planGameReminder,
  reminderLeadMinutes,
} from "../src/features/ahmv-phone/reminders/planner.ts";

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

test("premium unlocks capabilities only while TAKATAK expiry is active", () => {
  const active = localEntitlement(
    "premium",
    undefined,
    new Date("2026-10-03T12:00:00.000Z"),
    "2026-10-10T12:00:00.000Z",
  );
  const expired = localEntitlement(
    "premium",
    undefined,
    new Date("2026-10-11T12:00:00.000Z"),
    "2026-10-10T12:00:00.000Z",
  );
  const unbounded = localEntitlement(
    "premium",
    undefined,
    new Date("2026-10-03T12:00:00.000Z"),
  );

  assert.equal(canUse(active, "smart_departure"), true);
  assert.equal(canUse(expired, "smart_departure"), false);
  assert.equal(canUse(unbounded, "smart_departure"), false);
  assert.equal(canUse(expired, "next_event"), true);
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
  const result = nextEventService("M15", "fr", {}, new Date("2026-10-06T12:00:00Z"));
  assert.equal(result.outcome, "scheduled");
  assert.equal(result.event?.group, "M15");
  assert.ok(result.directions?.googleMaps);
  assert.match(result.smsText, /Itinéraire:/);
});

test("member SMS commands parse in French and English", () => {
  assert.deepEqual(parsePhoneCommand("SEMAINE Junior"), { kind: "week", teamQuery: "Junior" });
  assert.deepEqual(parsePhoneCommand("TODAY M13A"), { kind: "today", teamQuery: "M13A" });
  assert.deepEqual(parsePhoneCommand("DEMAIN M13A"), { kind: "tomorrow", teamQuery: "M13A" });
  assert.deepEqual(parsePhoneCommand("SAVE M13A"), { kind: "save", teamQuery: "M13A" });
  assert.deepEqual(parsePhoneCommand("CALENDRIER M13A"), { kind: "calendar", teamQuery: "M13A" });
  assert.deepEqual(parsePhoneCommand("CALENDAR M13A"), { kind: "calendar", teamQuery: "M13A" });
  assert.deepEqual(parsePhoneCommand("CAL M13A"), { kind: "calendar", teamQuery: "M13A" });
  assert.deepEqual(parsePhoneCommand("DÉPART M13A"), { kind: "departure", teamQuery: "M13A" });
  assert.deepEqual(parsePhoneCommand("DEPART M13A"), { kind: "departure", teamQuery: "M13A" });
  assert.deepEqual(parsePhoneCommand("LEAVE M13A"), { kind: "departure", teamQuery: "M13A" });
  assert.deepEqual(parsePhoneCommand("RAPPEL M13A"), { kind: "reminder-on", teamQuery: "M13A" });
  assert.deepEqual(parsePhoneCommand("REMIND M13A"), { kind: "reminder-on", teamQuery: "M13A" });
  assert.deepEqual(parsePhoneCommand("RAPPEL OFF M13A"), { kind: "reminder-off", teamQuery: "M13A" });
  assert.deepEqual(parsePhoneCommand("REMIND OFF M13A"), { kind: "reminder-off", teamQuery: "M13A" });
  assert.deepEqual(parsePhoneCommand("M13A"), { kind: "next", teamQuery: "M13A" });
});

test("weekly range answer lists only the requested exact group", () => {
  const result = scheduleRangeAnswer(
    "M15",
    "week",
    "fr",
    undefined,
    new Date("2026-10-06T12:00:00Z"),
  );
  assert.equal(result.outcome, "scheduled");
  assert.equal(result.group, "M15");
  assert.ok(result.events.length > 0);
  assert.ok(result.events.every((event) => event.group === "M15"));
  assert.match(result.text, /Cette semaine/);
});

test("tomorrow range does not invent unpublished activities", () => {
  const result = scheduleRangeAnswer(
    "M15",
    "tomorrow",
    "fr",
    undefined,
    new Date("2026-10-06T12:00:00Z"),
  );
  assert.equal(result.outcome, "empty");
  assert.equal(result.events.length, 0);
});


test("game reminder planner requires exact future provider event identity", () => {
  const result = planGameReminder(
    {
      providerEventId: "game-123",
      publicTeamId: "team-456",
      startsAt: "2026-10-04T17:00:00-04:00",
      venue: "Auditorium de Verdun",
      status: "scheduled",
    },
    120,
    new Date("2026-10-03T12:00:00-04:00"),
  );
  assert.equal(result?.sendAt, "2026-10-04T19:00:00.000Z");
  assert.match(result?.dedupeKey ?? "", /game-123/);
  assert.match(result?.dedupeKey ?? "", /2026-10-04T21:00:00.000Z/);
});

test("cancelled or already-too-close events do not create a normal reminder", () => {
  assert.equal(
    planGameReminder(
      {
        providerEventId: "cancelled-1",
        publicTeamId: "team-1",
        startsAt: "2026-10-04T17:00:00-04:00",
        venue: "Arena",
        status: "cancelled",
      },
      120,
      new Date("2026-10-03T12:00:00-04:00"),
    ),
    null,
  );

  assert.equal(
    planGameReminder(
      {
        providerEventId: "soon-1",
        publicTeamId: "team-1",
        startsAt: "2026-10-03T13:00:00-04:00",
        venue: "Arena",
        status: "scheduled",
      },
      120,
      new Date("2026-10-03T12:00:00-04:00"),
    ),
    null,
  );
});

test("reminder lead time defaults safely to two hours", () => {
  assert.equal(reminderLeadMinutes({}), 120);
  assert.equal(reminderLeadMinutes({ AHMV_GAME_REMINDER_LEAD_MINUTES: "90" }), 90);
  assert.equal(reminderLeadMinutes({ AHMV_GAME_REMINDER_LEAD_MINUTES: "0" }), 120);
});
