import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { handleAhmvTwilio } from "../src/lib/ahmv-twilio.server.ts";
import {
  localClock,
  parseSms,
  scheduleAnswer,
  type ScheduleSnapshot,
} from "../src/lib/ahmv-phone.ts";

const snapshot: ScheduleSnapshot = {
  start: "2026-10-01",
  end: "2026-10-04",
  activities: [
    {
      id: "one",
      group: "M12 B",
      date: "2026-10-03",
      start: "17:00",
      end: "18:00",
      activity: "Pratique",
      venue: "Denis Savard",
      status: "scheduled",
    },
    {
      id: "two",
      group: "M12 B",
      date: "2026-10-04",
      start: "17:00",
      end: "18:00",
      activity: "Match",
      venue: "Denis Savard",
      status: "cancelled",
    },
  ],
};
const now = new Date("2026-10-03T16:00:00Z");
test("Toronto clock uses local date across midnight", () =>
  assert.deepEqual(localClock(new Date("2026-10-03T02:00:00Z")), {
    date: "2026-10-02",
    time: "22:00",
  }));
test("French is default, EN prefix is explicit", () => {
  assert.deepEqual(parseSms(" EN M12B "), { lang: "en", query: "M12B" });
  assert.deepEqual(parseSms("M12B"), { lang: "fr", query: "M12B" });
});
test("exact normalized team returns next event and canonical link", () => {
  const answer = scheduleAnswer("M12B", "fr", snapshot, now);
  assert.equal(answer.outcome, "scheduled");
  assert.match(answer.text, /2026-10-03 17:00/);
  assert.match(answer.text, /https:\/\/ahmverdun.ca\/horaires/);
});
test("does not infer another age category or partial team", () => {
  assert.equal(scheduleAnswer("M11B", "fr", snapshot, now).outcome, "unpublished");
  assert.equal(scheduleAnswer("M12", "fr", snapshot, now).outcome, "unpublished");
});
test("explicit approved aliases work", () =>
  assert.equal(scheduleAnswer("B12", "fr", snapshot, now, { B12: "M12 B" }).outcome, "scheduled"));
test("expired snapshot never returns an event", () =>
  assert.equal(
    scheduleAnswer("M12B", "en", snapshot, new Date("2026-10-05T16:00:00Z")).outcome,
    "unavailable",
  ));
test("past start times are skipped and cancellation remains prominent", () => {
  const answer = scheduleAnswer("M12B", "en", snapshot, new Date("2026-10-03T22:00:00Z"));
  assert.equal(answer.outcome, "cancelled");
  assert.match(answer.text, /^CANCELLED/);
});
const settings = {
  AHMV_PHONE_ENABLED: "true",
  TWILIO_AUTH_TOKEN: "test-only-token",
  TWILIO_ACCOUNT_SID: "ACtest",
  AHMV_WEBHOOK_ORIGIN: "https://ahmverdun.ca",
};
// Independent signing helper: production validates using the official Twilio SDK.
function request(path: string, fields: Record<string, string> = {}, changes: RequestInit = {}) {
  const params = { AccountSid: "ACtest", To: "+15816666246", MessageSid: "SMtest", ...fields };
  const signature = createHmac("sha1", settings.TWILIO_AUTH_TOKEN)
    .update(
      `https://ahmverdun.ca${path}` +
        Object.keys(params)
          .sort()
          .map((key) => key + params[key as keyof typeof params])
          .join(""),
    )
    .digest("base64");
  return new Request(`http://internal:3000${path}`, {
    method: "POST",
    body: new URLSearchParams(params),
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      "x-twilio-signature": signature,
    },
    ...changes,
  });
}
const root = "/api/ahmv/twilio";
test("unrelated request bypasses phone handler", async () =>
  assert.equal(await handleAhmvTwilio(new Request("https://ahmverdun.ca/"), settings), null));
test("disabled integration fails closed", async () =>
  assert.equal((await handleAhmvTwilio(request(`${root}/sms`), {}))?.status, 503));
test("GET is rejected", async () =>
  assert.equal(
    (await handleAhmvTwilio(new Request(`https://ahmverdun.ca${root}/sms`), settings))?.status,
    405,
  ));
test("missing or invalid signature is rejected", async () =>
  assert.equal(
    (
      await handleAhmvTwilio(
        request(
          `${root}/sms`,
          {},
          { headers: { "content-type": "application/x-www-form-urlencoded" } },
        ),
        settings,
      )
    )?.status,
    403,
  ));
test("tampered signed query fails", async () => {
  const original = request(`${root}/voice?step=menu&lang=fr`);
  const altered = new Request(`http://internal:3000${root}/voice?step=menu&lang=en`, original);
  assert.equal((await handleAhmvTwilio(altered, settings))?.status, 403);
});
test("wrong account or destination fails", async () => {
  assert.equal(
    (await handleAhmvTwilio(request(`${root}/sms`, { AccountSid: "ACother" }), settings))?.status,
    403,
  );
  assert.equal(
    (await handleAhmvTwilio(request(`${root}/sms`, { To: "+15145550000" }), settings))?.status,
    403,
  );
});
test("oversized and duplicate forms fail before response", async () => {
  assert.equal(
    (await handleAhmvTwilio(request(`${root}/sms`, { Body: "x".repeat(17000) }), settings))?.status,
    413,
  );
  assert.equal(
    (await handleAhmvTwilio(request(`${root}/sms`, {}, { body: "Body=A&Body=B" }), settings))
      ?.status,
    400,
  );
});
test("trusted origin works behind internal proxy; response cannot be cached", async () => {
  const response = await handleAhmvTwilio(
    request(`${root}/sms`, { Body: "HELP", FutureTwilioField: "accepted" }),
    settings,
  );
  assert.equal(response?.status, 200);
  assert.equal(response?.headers.get("cache-control"), "no-store");
  assert.match(await response!.text(), /<Message>/);
});
test("SMS escaping prevents XML injection", async () => {
  const response = await handleAhmvTwilio(
    request(`${root}/sms`, { Body: "</Message><Message>attack" }),
    settings,
  );
  const body = await response!.text();
  assert.equal((body.match(/<Message>/g) ?? []).length, 1);
  assert.match(body, /&lt;/);
});
test("STOP and Advanced Opt-Out never generate custom messages", async () => {
  for (const fields of [{ Body: "STOP" }, { Body: "anything", OptOutType: "STOP" }]) {
    const response = await handleAhmvTwilio(request(`${root}/sms`, fields), settings);
    assert.doesNotMatch(await response!.text(), /<Message>/);
  }
});
test("voice begins with bilingual DTMF language selection", async () => {
  const response = await handleAhmvTwilio(request(`${root}/voice`), settings);
  const body = await response!.text();
  assert.match(body, /fr-CA/);
  assert.match(body, /en-US/);
  assert.match(body, /numDigits="1"/);
});
test("urgent message comes before menu and expires", async () => {
  const extra = {
    ...settings,
    AHMV_URGENT_FR: "URGENT TEST",
    AHMV_URGENT_UNTIL: "2099-01-01T00:00:00Z",
  };
  const response = await handleAhmvTwilio(request(`${root}/voice?step=menu&lang=fr`), extra);
  const body = await response!.text();
  assert.ok(body.indexOf("URGENT TEST") < body.indexOf("<Gather"));
  const expired = await handleAhmvTwilio(request(`${root}/voice?step=menu&lang=fr`), {
    ...extra,
    AHMV_URGENT_UNTIL: "2000-01-01T00:00:00Z",
  });
  assert.doesNotMatch(await expired!.text(), /URGENT TEST/);
});
test("silence in team recognition retries only twice", async () => {
  const response = await handleAhmvTwilio(
    request(`${root}/voice?step=answer&lang=en&attempt=2`, { SpeechResult: "" }),
    settings,
  );
  const body = await response!.text();
  assert.match(body, /<Hangup/);
  assert.doesNotMatch(body, /<Redirect/);
});
test("status callback is authenticated and emits no SMS", async () =>
  assert.equal((await handleAhmvTwilio(request(`${root}/status`), settings))?.status, 204));
