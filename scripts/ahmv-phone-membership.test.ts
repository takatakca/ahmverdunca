import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  TAKATAK_AHMV_PRODUCT_CODE,
  validateMembershipSyncInput,
} from "../src/features/ahmv-phone/takatak/membership-sync.server.ts";
import { handleTakatakMembershipSync } from "../src/features/ahmv-phone/takatak/membership-handler.server.ts";
import { resolveTakatakPhoneEntitlement } from "../src/features/ahmv-phone/takatak/entitlements.server.ts";

const now = new Date("2026-10-03T12:00:00.000Z");

function validEvent(overrides: Record<string, unknown> = {}) {
  return {
    eventId: "evt_123",
    tenant: "ahmverdun",
    phoneE164: "+15816666246",
    identityId: "identity_123",
    productCode: TAKATAK_AHMV_PRODUCT_CODE,
    status: "active",
    expiresAt: "2026-10-10T12:00:00.000Z",
    occurredAt: "2026-10-03T11:59:00.000Z",
    ...overrides,
  };
}

test("membership event accepts exact AHMV product and bounded active expiry", () => {
  const value = validateMembershipSyncInput(validEvent(), now);
  assert.ok(value);
  assert.equal(value?.productCode, "hockey_member_weekly_10");
  assert.equal(value?.status, "active");
  assert.equal(value?.phoneE164, "+15816666246");
});

test("active membership event requires a future expiry", () => {
  assert.equal(
    validateMembershipSyncInput(validEvent({ expiresAt: undefined }), now),
    null,
  );
  assert.equal(
    validateMembershipSyncInput(
      validEvent({ expiresAt: "2026-10-03T11:00:00.000Z" }),
      now,
    ),
    null,
  );
});

test("membership event rejects wrong tenant product phone and future event time", () => {
  assert.equal(
    validateMembershipSyncInput(validEvent({ tenant: "other" }), now),
    null,
  );
  assert.equal(
    validateMembershipSyncInput(validEvent({ productCode: "other" }), now),
    null,
  );
  assert.equal(
    validateMembershipSyncInput(validEvent({ phoneE164: "5145551212" }), now),
    null,
  );
  assert.equal(
    validateMembershipSyncInput(
      validEvent({ occurredAt: "2026-10-03T12:06:00.000Z" }),
      now,
    ),
    null,
  );
});

test("inactive membership event does not require an expiry", () => {
  const value = validateMembershipSyncInput(
    validEvent({ status: "inactive", expiresAt: undefined }),
    now,
  );
  assert.equal(value?.status, "inactive");
  assert.equal(value?.expiresAt, undefined);
});

test("membership sync endpoint is disabled by default", async () => {
  const response = await handleTakatakMembershipSync(
    new Request("https://ahmverdun.ca/api/ahmv/takatak/membership", {
      method: "POST",
    }),
    {},
  );
  assert.equal(response?.status, 404);
});

test("membership sync endpoint requires TAKATAK bearer authentication", async () => {
  const response = await handleTakatakMembershipSync(
    new Request("https://ahmverdun.ca/api/ahmv/takatak/membership", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: "Bearer wrong",
      },
      body: JSON.stringify(validEvent()),
    }),
    {
      AHMV_TAKATAK_MEMBERSHIP_SYNC_ENABLED: "true",
      TAKATAK_AHMV_SERVICE_TOKEN: "secret",
    },
  );
  assert.equal(response?.status, 403);
});

test("membership sync validates payload before database access", async () => {
  const response = await handleTakatakMembershipSync(
    new Request("https://ahmverdun.ca/api/ahmv/takatak/membership", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: "Bearer secret",
      },
      body: JSON.stringify({ ...validEvent(), productCode: "wrong" }),
    }),
    {
      AHMV_TAKATAK_MEMBERSHIP_SYNC_ENABLED: "true",
      TAKATAK_AHMV_SERVICE_TOKEN: "secret",
    },
  );
  assert.equal(response?.status, 400);
});

test("membership projection migration is atomic idempotent and service-role only", () => {
  const sql = readFileSync(
    "supabase/migrations/20261003094500_ahmv_takatak_membership_projection.sql",
    "utf8",
  );
  assert.match(sql, /event_id text primary key/i);
  assert.match(sql, /pg_advisory_xact_lock/i);
  assert.match(sql, /for update/i);
  assert.match(sql, /premium_expires_at/i);
  assert.match(sql, /idx_ahmv_phone_contacts_takatak_identity/i);
  assert.match(sql, /identity\|/i);
  assert.match(sql, /phone\|/i);
  assert.match(sql, /already linked to another TAKATAK identity/i);
  assert.match(sql, /TAKATAK identity is already linked to another AHMV phone contact/i);
  assert.match(sql, /security definer/i);
  assert.match(sql, /revoke all on function/i);
  assert.match(sql, /grant execute on function[\s\S]*service_role/i);
  assert.doesNotMatch(
    sql,
    /update public\.ahmv_phone_contacts[\s\S]{0,900}marketing_sms_consent\s*=/i,
  );
});

test("remote active TAKATAK entitlement must include a future expiry", async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ active: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });

    const missingExpiry = await resolveTakatakPhoneEntitlement(
      {
        tenant: "ahmverdun",
        phoneE164: "+15816666246",
        capability: "calendar_sync",
      },
      {
        TAKATAK_AHMV_ENTITLEMENT_URL: "https://example.test/entitlement",
        TAKATAK_AHMV_SERVICE_TOKEN: "secret",
      },
    );
    assert.equal(missingExpiry, null);

    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          active: true,
          expiresAt: "2099-10-10T12:00:00.000Z",
          planCode: "hockey_member_weekly_10",
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      );

    const active = await resolveTakatakPhoneEntitlement(
      {
        tenant: "ahmverdun",
        phoneE164: "+15816666246",
        capability: "calendar_sync",
      },
      {
        TAKATAK_AHMV_ENTITLEMENT_URL: "https://example.test/entitlement",
        TAKATAK_AHMV_SERVICE_TOKEN: "secret",
      },
    );
    assert.equal(active?.active, true);
    assert.equal(active?.expiresAt, "2099-10-10T12:00:00.000Z");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
