import test from "node:test";
import assert from "node:assert/strict";
import { simulatePhoneDemo } from "../src/features/ahmv-phone/demo/simulator.ts";
import { handleAhmvPhoneDemo } from "../src/features/ahmv-phone/demo/handler.server.ts";

test("voice demo returns spoken answer and optional SMS", () => {
  const result = simulatePhoneDemo({
    channel: "voice",
    lang: "fr",
    message: "M13A",
    access: "trial",
    wantsSms: true,
  });
  assert.equal(result.demo, true);
  assert.equal(result.recognizedIntent, "next-event");
  assert.match(result.spokenText ?? "", /M13 A DÉMO/);
  assert.match(result.smsText ?? "", /DÉMO UNIQUEMENT/);
  assert.match(result.smsText ?? "", /google\.com\/maps/);
  assert.equal(result.hangup, true);
});

test("expired trial gates weekly personalization", () => {
  const result = simulatePhoneDemo({
    channel: "sms",
    lang: "fr",
    message: "SEMAINE M13A",
    access: "expired",
  });
  assert.equal(result.recognizedIntent, "week");
  assert.match(result.smsText ?? "", /abonnement GROUPE TAKATAK/);
});

test("premium can demonstrate saved-team behavior", () => {
  const result = simulatePhoneDemo({
    channel: "sms",
    lang: "en",
    message: "SAVE M13A",
    access: "premium",
  });
  assert.equal(result.recognizedIntent, "save-team");
  assert.match(result.smsText ?? "", /Primary team saved/);
});

test("demo endpoint is disabled by default", async () => {
  const response = await handleAhmvPhoneDemo(
    new Request("https://ahmverdun.ca/api/ahmv/phone-demo", { method: "POST" }),
    {},
  );
  assert.equal(response?.status, 404);
});

test("demo endpoint requires a separate demo token", async () => {
  const response = await handleAhmvPhoneDemo(
    new Request("https://ahmverdun.ca/api/ahmv/phone-demo", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ channel: "sms", message: "M13A" }),
    }),
    { AHMV_PHONE_DEMO_ENABLED: "true", AHMV_PHONE_DEMO_TOKEN: "demo-secret" },
  );
  assert.equal(response?.status, 403);
});

test("authorized demo endpoint returns fictional-only output", async () => {
  const response = await handleAhmvPhoneDemo(
    new Request("https://ahmverdun.ca/api/ahmv/phone-demo", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-ahmv-demo-token": "demo-secret",
      },
      body: JSON.stringify({ channel: "sms", lang: "fr", message: "M13A", access: "trial" }),
    }),
    { AHMV_PHONE_DEMO_ENABLED: "true", AHMV_PHONE_DEMO_TOKEN: "demo-secret" },
  );
  assert.equal(response?.status, 200);
  const body = await response!.json() as Record<string, unknown>;
  assert.equal(body["demo"], true);
  assert.match(String(body["disclaimer"]), /DÉMO UNIQUEMENT/);
});
