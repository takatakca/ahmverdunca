import test from "node:test";
import assert from "node:assert/strict";
import { handleAhmvPhoneOpsSummary } from "../src/features/ahmv-phone/ops/handler.server.ts";
import { handleAhmvPhoneOpsFunnel } from "../src/features/ahmv-phone/ops/funnel-handler.server.ts";

test("phone ops endpoint is disabled by default", async () => {
  const response = await handleAhmvPhoneOpsSummary(
    new Request("https://ahmverdun.ca/api/ahmv/phone-ops/summary"),
    {},
  );
  assert.equal(response?.status, 404);
});

test("phone ops endpoint is read only", async () => {
  const response = await handleAhmvPhoneOpsSummary(
    new Request("https://ahmverdun.ca/api/ahmv/phone-ops/summary", {
      method: "POST",
    }),
    {
      AHMV_PHONE_OPS_ENABLED: "true",
      TAKATAK_AHMV_SERVICE_TOKEN: "secret",
    },
  );
  assert.equal(response?.status, 405);
});

test("phone ops endpoint rejects missing or incorrect bearer token before database access", async () => {
  const settings = {
    AHMV_PHONE_OPS_ENABLED: "true",
    TAKATAK_AHMV_SERVICE_TOKEN: "secret",
  };

  const missing = await handleAhmvPhoneOpsSummary(
    new Request("https://ahmverdun.ca/api/ahmv/phone-ops/summary"),
    settings,
  );
  assert.equal(missing?.status, 403);

  const wrong = await handleAhmvPhoneOpsSummary(
    new Request("https://ahmverdun.ca/api/ahmv/phone-ops/summary", {
      headers: { authorization: "Bearer wrong" },
    }),
    settings,
  );
  assert.equal(wrong?.status, 403);
  assert.doesNotMatch(await wrong!.text(), /secret/);
});


test("phone funnel endpoint is disabled by default", async () => {
  const response = await handleAhmvPhoneOpsFunnel(
    new Request("https://ahmverdun.ca/api/ahmv/phone-ops/funnel"),
    {},
  );
  assert.equal(response?.status, 404);
});

test("phone funnel endpoint rejects bad bearer token before database access", async () => {
  const settings = {
    AHMV_PHONE_OPS_ENABLED: "true",
    TAKATAK_AHMV_SERVICE_TOKEN: "secret",
  };

  const response = await handleAhmvPhoneOpsFunnel(
    new Request("https://ahmverdun.ca/api/ahmv/phone-ops/funnel", {
      headers: { authorization: "Bearer wrong" },
    }),
    settings,
  );

  assert.equal(response?.status, 403);
  const body = await response!.text();
  assert.doesNotMatch(body, /secret|phone_e164|provider_sid|payload/i);
});

test("phone funnel endpoint is read only", async () => {
  const response = await handleAhmvPhoneOpsFunnel(
    new Request("https://ahmverdun.ca/api/ahmv/phone-ops/funnel", {
      method: "POST",
    }),
    {
      AHMV_PHONE_OPS_ENABLED: "true",
      TAKATAK_AHMV_SERVICE_TOKEN: "secret",
    },
  );
  assert.equal(response?.status, 405);
});
