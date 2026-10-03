import test from "node:test";
import assert from "node:assert/strict";
import {
  detectAuthoritativeEventChanges,
  eventChangeDedupeKey,
} from "../src/features/ahmv-phone/reminders/change-detector.ts";
import { eventChangeAlertText } from "../src/features/ahmv-phone/reminders/change-alert.ts";
import { canSendTeamServiceAlert } from "../src/features/ahmv-phone/reminders/policy.ts";
import { localEntitlement } from "../src/features/ahmv-phone/entitlements/access.ts";
import type { AhmvPhoneContact } from "../src/features/ahmv-phone/contacts/store.server.ts";

const previous = {
  providerEventId: "game-42",
  publicTeamId: "team-13a",
  startsAt: "2026-10-04T17:00:00-04:00",
  venue: "Aréna St-Charles",
  status: "scheduled" as const,
};

test("authoritative change detector reports cancellation time and venue changes without guessing", () => {
  const current = {
    ...previous,
    startsAt: "2026-10-04T18:30:00-04:00",
    venue: "Auditorium de Verdun",
    status: "cancelled" as const,
  };
  const changes = detectAuthoritativeEventChanges(previous, current);
  assert.deepEqual(
    changes.map((change) => change.kind),
    ["cancelled", "time_changed", "venue_changed"],
  );
  const text = eventChangeAlertText(changes, "fr");
  assert.match(text, /ANNULÉ/);
  assert.match(text, /Nouvelle heure/);
  assert.match(text, /Nouvel aréna/);
  assert.match(text, /google\.com\/maps/);
});

test("same authoritative event state produces no alert", () => {
  assert.deepEqual(detectAuthoritativeEventChanges(previous, { ...previous }), []);
});

test("different provider event IDs cannot be compared", () => {
  assert.throws(
    () =>
      detectAuthoritativeEventChanges(previous, {
        ...previous,
        providerEventId: "other-game",
      }),
    /different authoritative events/,
  );
});

test("dedupe key changes when authoritative event time changes", () => {
  const one = eventChangeDedupeKey(previous);
  const two = eventChangeDedupeKey({
    ...previous,
    startsAt: "2026-10-04T18:00:00-04:00",
  });
  assert.notEqual(one, two);
});

function contact(overrides: Partial<AhmvPhoneContact> = {}): AhmvPhoneContact {
  return {
    id: "contact-1",
    phoneE164: "+15145550123",
    language: "fr",
    accessTier: "trial",
    trialExpiresAt: "2099-01-01T00:00:00Z",
    smsConsent: true,
    transactionalSmsAllowed: true,
    marketingSmsConsent: false,
    ...overrides,
  };
}

test("team service alert does not depend on marketing consent", () => {
  const entitlement = localEntitlement(
    "trial",
    "2099-01-01T00:00:00Z",
    new Date("2026-10-03T12:00:00Z"),
  );
  assert.equal(
    canSendTeamServiceAlert({
      contact: contact({ marketingSmsConsent: false }),
      remindersEnabled: true,
      entitlement,
    }),
    true,
  );
});

test("team service alert requires requested SMS, reminder preference, and active entitlement", () => {
  const active = localEntitlement(
    "trial",
    "2099-01-01T00:00:00Z",
    new Date("2026-10-03T12:00:00Z"),
  );
  const expired = localEntitlement(
    "trial",
    "2000-01-01T00:00:00Z",
    new Date("2026-10-03T12:00:00Z"),
  );
  assert.equal(
    canSendTeamServiceAlert({
      contact: contact({ smsConsent: false }),
      remindersEnabled: true,
      entitlement: active,
    }),
    false,
  );
  assert.equal(
    canSendTeamServiceAlert({
      contact: contact(),
      remindersEnabled: false,
      entitlement: active,
    }),
    false,
  );
  assert.equal(
    canSendTeamServiceAlert({
      contact: contact(),
      remindersEnabled: true,
      entitlement: expired,
    }),
    false,
  );
});
