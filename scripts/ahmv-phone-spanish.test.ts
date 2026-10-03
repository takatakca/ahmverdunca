import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  parseSms,
  scheduleAnswer,
  type ScheduleSnapshot,
} from "../src/lib/ahmv-phone.ts";
import { parsePhoneCommand } from "../src/features/ahmv-phone/conversation/commands.ts";
import { parseMarketingConsentCommand } from "../src/features/ahmv-phone/contacts/marketing-consent.ts";
import {
  phoneDateLocale,
  phoneLocale,
  phoneText,
  phoneVoice,
} from "../src/features/ahmv-phone/i18n.ts";
import { compactDirectionsSms } from "../src/features/ahmv-phone/arenas/navigation.ts";
import { scheduleRangeAnswer } from "../src/features/ahmv-phone/schedules/range.ts";
import { lifecycleMessageText } from "../src/features/ahmv-phone/messaging/templates.ts";
import { gameReminderText } from "../src/features/ahmv-phone/reminders/templates.ts";
import { eventChangeAlertText } from "../src/features/ahmv-phone/reminders/change-alert.ts";
import { simulatePhoneDemo } from "../src/features/ahmv-phone/demo/simulator.ts";

const snapshot: ScheduleSnapshot = {
  start: "2099-10-03",
  end: "2099-10-10",
  activities: [
    {
      id: "es-event-1",
      date: "2099-10-03",
      start: "17:00",
      end: "18:00",
      venue: "Auditorium de Verdun",
      activity: "Partido",
      group: "M13 A DÉMO",
      status: "scheduled",
    },
  ],
};

const now = new Date("2099-10-03T16:00:00-04:00");

test("Spanish phone locale and voice are explicit Twilio-supported values", () => {
  assert.equal(phoneLocale("es"), "es-US");
  assert.equal(phoneVoice("es"), "Polly.Lupe-Neural");
  assert.equal(phoneDateLocale("es"), "es-US");
  assert.equal(phoneText("es", { fr: "fr", en: "en", es: "es" }), "es");
});

test("SMS ES prefix selects Spanish without changing the team query", () => {
  assert.deepEqual(parseSms("ES M13A"), {
    lang: "es",
    query: "M13A",
  });
});

test("Spanish SMS commands map to the same internal intents", () => {
  assert.deepEqual(parsePhoneCommand("HOY M13A"), {
    kind: "today",
    teamQuery: "M13A",
  });
  assert.deepEqual(parsePhoneCommand("MAÑANA M13A"), {
    kind: "tomorrow",
    teamQuery: "M13A",
  });
  assert.deepEqual(parsePhoneCommand("SEMANA M13A"), {
    kind: "week",
    teamQuery: "M13A",
  });
  assert.deepEqual(parsePhoneCommand("GUARDA M13A"), {
    kind: "save",
    teamQuery: "M13A",
  });
  assert.deepEqual(parsePhoneCommand("RECORDATORIO M13A"), {
    kind: "reminder-on",
    teamQuery: "M13A",
  });
  assert.deepEqual(parsePhoneCommand("RECORDATORIO NO M13A"), {
    kind: "reminder-off",
    teamQuery: "M13A",
  });
  assert.deepEqual(parsePhoneCommand("CALENDARIO M13A"), {
    kind: "calendar",
    teamQuery: "M13A",
  });
  assert.deepEqual(parsePhoneCommand("SALIDA M13A"), {
    kind: "departure",
    teamQuery: "M13A",
  });
});

test("Spanish commercial offer consent remains explicit", () => {
  assert.deepEqual(parseMarketingConsentCommand("OFERTAS SI"), {
    kind: "marketing-opt-in",
  });
  assert.deepEqual(parseMarketingConsentCommand("OFERTAS NO"), {
    kind: "marketing-opt-out",
  });
  assert.equal(parseMarketingConsentCommand("SI"), null);
});

test("next event and range answers are localized in Spanish", () => {
  const answer = scheduleAnswer(
    "M13 A DÉMO",
    "es",
    snapshot,
    now,
  );
  assert.equal(answer.outcome, "scheduled");
  assert.match(answer.text, /M13 A DÉMO/);

  const range = scheduleRangeAnswer(
    "M13 A DÉMO",
    "today",
    "es",
    snapshot,
    now,
  );
  assert.equal(range.outcome, "scheduled");
  assert.match(range.text, /Hoy/);
});

test("Spanish directions and lifecycle messages are localized", () => {
  assert.match(
    compactDirectionsSms("Auditorium de Verdun", "es"),
    /Cómo llegar/,
  );
  assert.match(
    lifecycleMessageText(
      "trial_expiry_3d",
      "es",
      "https://takatak.ca/membership",
    ),
    /3 días/,
  );
});

test("Spanish reminder and event-change messages are localized", () => {
  const event = {
    providerEventId: "event-es",
    publicTeamId: "team-es",
    startsAt: "2099-10-03T21:00:00.000Z",
    venue: "Auditorium de Verdun",
    status: "scheduled" as const,
  };

  assert.match(gameReminderText(event, "es"), /Recordatorio/);

  const changed = eventChangeAlertText(
    [
      {
        kind: "venue_changed" as const,
        previous: { ...event, venue: "Aréna St-Charles" },
        current: event,
      },
    ],
    "es",
  );
  assert.match(changed, /Actualización importante/);
  assert.match(changed, /Nueva arena/);
});

test("credential-free demo supports Spanish", () => {
  const result = simulatePhoneDemo({
    channel: "sms",
    lang: "es",
    message: "M13A",
    access: "trial",
  });
  assert.equal(result.language, "es");
  assert.match(result.disclaimer, /SOLO DEMO/);
  assert.match(result.smsText ?? "", /Cómo llegar/);
});

test("Spanish database migration expands contact and campaign language storage", () => {
  const sql = readFileSync(
    "supabase/migrations/20261003110000_ahmv_phone_spanish.sql",
    "utf8",
  );
  assert.match(sql, /language in \('fr','en','es'\)/i);
  assert.match(sql, /body_es text/i);
  assert.match(sql, /alter column body_es set not null/i);
});
