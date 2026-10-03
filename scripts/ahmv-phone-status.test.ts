import test from "node:test";
import assert from "node:assert/strict";
import {
  getAhmvPhonePublicStatus,
  handleAhmvPhoneStatus,
} from "../src/lib/ahmv-phone-status.server.ts";

const completeSettings = {
  AHMV_PHONE_ENABLED: "true",
  AHMV_PHONE_PUBLIC: "true",
  TWILIO_AUTH_TOKEN: "placeholder",
  TWILIO_ACCOUNT_SID: "account-placeholder",
  AHMV_WEBHOOK_ORIGIN: "https://ahmverdun.ca",
  AHMV_PUBLIC_PHONE: "+15816666246",
};

test("phone stays private until routing is explicitly verified", () => {
  assert.equal(
    getAhmvPhonePublicStatus({
      ...completeSettings,
      AHMV_PHONE_PUBLIC: "false",
    }).public,
    false,
  );
});

test("verified phone requires complete secure server configuration", () => {
  assert.equal(getAhmvPhonePublicStatus(completeSettings).public, true);
  assert.equal(
    getAhmvPhonePublicStatus({ ...completeSettings, TWILIO_AUTH_TOKEN: "" }).public,
    false,
  );
  assert.equal(
    getAhmvPhonePublicStatus({ ...completeSettings, AHMV_WEBHOOK_ORIGIN: "http://ahmverdun.ca" }).public,
    false,
  );
  assert.equal(
    getAhmvPhonePublicStatus({ ...completeSettings, AHMV_PUBLIC_PHONE: "+15145550000" }).public,
    false,
  );
});

test("public status endpoint exposes no server credentials", async () => {
  const response = handleAhmvPhoneStatus(
    new Request("https://ahmverdun.ca/api/ahmv/phone-status"),
    completeSettings,
  );
  assert.equal(response?.status, 200);
  assert.equal(response?.headers.get("cache-control"), "no-store");

  const body = await response!.text();
  assert.match(body, /"public":true/);
  assert.match(body, /1 \(581\) 666-6AHM/);
  assert.doesNotMatch(body, /placeholder|TWILIO|ACCOUNT/i);
});

test("public status endpoint is read only", () => {
  const response = handleAhmvPhoneStatus(
    new Request("https://ahmverdun.ca/api/ahmv/phone-status", { method: "POST" }),
    completeSettings,
  );
  assert.equal(response?.status, 405);
});
