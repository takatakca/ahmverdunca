import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseMarketingConsentCommand } from "../src/features/ahmv-phone/contacts/marketing-consent.ts";
import {
  marketingLegalInfoUrl,
  marketingMessageBody,
  validateMarketingCampaignInput,
} from "../src/features/ahmv-phone/marketing/campaign.ts";
import { handleTakatakMarketingCampaign } from "../src/features/ahmv-phone/marketing/handler.server.ts";
import { handleAhmvMarketingCampaignCron } from "../src/features/ahmv-phone/marketing/cron-handler.server.ts";
import {
  validateTakatakMarketingConsentInput,
} from "../src/features/ahmv-phone/marketing/consent-sync.server.ts";
import { handleTakatakMarketingConsentSync } from "../src/features/ahmv-phone/marketing/consent-handler.server.ts";

const now = new Date("2026-10-03T12:00:00.000Z");

test("marketing consent requires an explicit affirmative or negative command", () => {
  assert.deepEqual(parseMarketingConsentCommand("OFFRES OUI"), {
    kind: "marketing-opt-in",
  });
  assert.deepEqual(parseMarketingConsentCommand("offres non"), {
    kind: "marketing-opt-out",
  });
  assert.deepEqual(parseMarketingConsentCommand("OFFERS YES"), {
    kind: "marketing-opt-in",
  });
  assert.deepEqual(parseMarketingConsentCommand("MARKETING NO"), {
    kind: "marketing-opt-out",
  });
  assert.equal(parseMarketingConsentCommand("M13A"), null);
  assert.equal(parseMarketingConsentCommand("OUI"), null);
  assert.equal(parseMarketingConsentCommand("YES"), null);
});

test("campaign validator accepts a bounded bilingual opted-in audience", () => {
  const value = validateMarketingCampaignInput(
    {
      campaignId: "camp_2026_10_03_001",
      campaignName: "Rappel inscription",
      bodyFr: "Les inscriptions sont ouvertes.",
      bodyEn: "Registration is open.",
      audience: { kind: "all_opted_in" },
      scheduledAt: "2026-10-04T12:00:00.000Z",
    },
    now,
  );
  assert.equal(value?.campaignId, "camp_2026_10_03_001");
  assert.deepEqual(value?.audience, { kind: "all_opted_in" });
});

test("campaign team audience rejects unknown team identifiers", () => {
  const invalid = validateMarketingCampaignInput(
    {
      campaignId: "camp_team_001",
      campaignName: "Team message",
      bodyFr: "Message.",
      bodyEn: "Message.",
      audience: { kind: "teams", teamIds: ["unknown-team"] },
      scheduledAt: "2026-10-04T12:00:00.000Z",
    },
    now,
  );
  assert.equal(invalid, null);
});

test("campaign validator rejects stale far-future and oversized content", () => {
  assert.equal(
    validateMarketingCampaignInput(
      {
        campaignId: "camp_stale",
        campaignName: "Stale",
        bodyFr: "Message",
        bodyEn: "Message",
        audience: { kind: "all_opted_in" },
        scheduledAt: "2026-10-03T11:00:00.000Z",
      },
      now,
    ),
    null,
  );

  assert.equal(
    validateMarketingCampaignInput(
      {
        campaignId: "camp_long",
        campaignName: "Long",
        bodyFr: "x".repeat(801),
        bodyEn: "Message",
        audience: { kind: "all_opted_in" },
        scheduledAt: "2026-10-04T12:00:00.000Z",
      },
      now,
    ),
    null,
  );
});

test("commercial message body always identifies sender info link and STOP", () => {
  const body = marketingMessageBody(
    "Les inscriptions sont ouvertes.",
    "https://takatak.ca/sms-info",
  );
  assert.match(body, /GROUPE TAKATAK \/ AHMV/);
  assert.match(body, /https:\/\/takatak\.ca\/sms-info/);
  assert.match(body, /STOP$/);
});

test("commercial information URL must be HTTPS", () => {
  assert.equal(
    marketingLegalInfoUrl({
      TAKATAK_SMS_CEM_INFO_URL: "https://takatak.ca/sms-info",
    }),
    "https://takatak.ca/sms-info",
  );
  assert.equal(
    marketingLegalInfoUrl({
      TAKATAK_SMS_CEM_INFO_URL: "http://takatak.ca/sms-info",
    }),
    null,
  );
});

test("campaign API is disabled by default", async () => {
  const response = await handleTakatakMarketingCampaign(
    new Request("https://ahmverdun.ca/api/ahmv/takatak/campaigns", {
      method: "POST",
    }),
    {},
  );
  assert.equal(response?.status, 404);
});

test("campaign API rejects bad bearer token before database access", async () => {
  const response = await handleTakatakMarketingCampaign(
    new Request("https://ahmverdun.ca/api/ahmv/takatak/campaigns", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: "Bearer wrong",
      },
      body: JSON.stringify({}),
    }),
    {
      AHMV_PHONE_CAMPAIGNS_ENABLED: "true",
      TAKATAK_AHMV_SERVICE_TOKEN: "secret",
    },
  );
  assert.equal(response?.status, 403);
});

test("campaign API validates payload before database access", async () => {
  const response = await handleTakatakMarketingCampaign(
    new Request("https://ahmverdun.ca/api/ahmv/takatak/campaigns", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: "Bearer secret",
      },
      body: JSON.stringify({
        campaignId: "bad",
        campaignName: "",
      }),
    }),
    {
      AHMV_PHONE_CAMPAIGNS_ENABLED: "true",
      TAKATAK_AHMV_SERVICE_TOKEN: "secret",
    },
  );
  assert.equal(response?.status, 400);
});

test("campaign cron is disabled by default", async () => {
  const response = await handleAhmvMarketingCampaignCron(
    new Request("https://ahmverdun.ca/api/ahmv/cron/phone-campaigns", {
      method: "POST",
    }),
    {},
  );
  assert.equal(response?.status, 404);
});

test("campaign cron remains POST-only before cron authentication", async () => {
  const response = await handleAhmvMarketingCampaignCron(
    new Request("https://ahmverdun.ca/api/ahmv/cron/phone-campaigns"),
    { AHMV_PHONE_CAMPAIGNS_ENABLED: "true" },
  );
  assert.equal(response?.status, 405);
});

test("marketing migration stores explicit consent evidence and campaign projection", () => {
  const sql = readFileSync(
    "supabase/migrations/20261003102000_ahmv_marketing_campaigns.sql",
    "utf8",
  );
  assert.match(sql, /marketing_sms_consented_at/i);
  assert.match(sql, /marketing_sms_consent_source/i);
  assert.match(sql, /marketing_sms_revoked_at/i);
  assert.match(sql, /sms_keyword/i);
  assert.match(sql, /takatak_verified/i);
  assert.match(sql, /ahmv_phone_campaign_executions/i);
  assert.match(sql, /takatak_campaign_id text not null unique/i);
  assert.match(sql, /enable row level security/i);
  assert.match(sql, /grant all[\s\S]*service_role/i);
});


test("TAKATAK verified consent input requires exact phone identity consent and bounded event time", () => {
  const valid = validateTakatakMarketingConsentInput(
    {
      eventId: "consent_evt_001",
      phoneE164: "+15816666246",
      identityId: "identity_123",
      consent: true,
      occurredAt: "2026-10-03T11:59:00.000Z",
    },
    now,
  );
  assert.equal(valid?.consent, true);
  assert.equal(valid?.phoneE164, "+15816666246");

  assert.equal(
    validateTakatakMarketingConsentInput(
      {
        eventId: "consent_evt_002",
        phoneE164: "5145551212",
        identityId: "identity_123",
        consent: true,
        occurredAt: "2026-10-03T11:59:00.000Z",
      },
      now,
    ),
    null,
  );

  assert.equal(
    validateTakatakMarketingConsentInput(
      {
        eventId: "consent_evt_003",
        phoneE164: "+15816666246",
        identityId: "identity_123",
        consent: true,
        occurredAt: "2026-10-03T12:06:00.000Z",
      },
      now,
    ),
    null,
  );
});

test("TAKATAK marketing consent sync is disabled by default", async () => {
  const response = await handleTakatakMarketingConsentSync(
    new Request("https://ahmverdun.ca/api/ahmv/takatak/marketing-consent", {
      method: "POST",
    }),
    {},
  );
  assert.equal(response?.status, 404);
});

test("TAKATAK marketing consent sync rejects bad bearer before database access", async () => {
  const response = await handleTakatakMarketingConsentSync(
    new Request("https://ahmverdun.ca/api/ahmv/takatak/marketing-consent", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: "Bearer wrong",
      },
      body: JSON.stringify({}),
    }),
    {
      AHMV_TAKATAK_MARKETING_CONSENT_SYNC_ENABLED: "true",
      TAKATAK_AHMV_SERVICE_TOKEN: "secret",
    },
  );
  assert.equal(response?.status, 403);
});

test("TAKATAK marketing consent sync validates input before database access", async () => {
  const response = await handleTakatakMarketingConsentSync(
    new Request("https://ahmverdun.ca/api/ahmv/takatak/marketing-consent", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: "Bearer secret",
      },
      body: JSON.stringify({
        eventId: "bad",
        phoneE164: "not-a-phone",
        identityId: "identity",
        consent: true,
        occurredAt: "2026-10-03T12:00:00.000Z",
      }),
    }),
    {
      AHMV_TAKATAK_MARKETING_CONSENT_SYNC_ENABLED: "true",
      TAKATAK_AHMV_SERVICE_TOKEN: "secret",
    },
  );
  assert.equal(response?.status, 400);
});

test("marketing consent migration uses immutable ordered evidence RPC", () => {
  const sql = readFileSync(
    "supabase/migrations/20261003102000_ahmv_marketing_campaigns.sql",
    "utf8",
  );
  assert.match(sql, /ahmv_phone_marketing_consent_events/i);
  assert.match(sql, /event_id text primary key/i);
  assert.match(sql, /carrier_opt_out/i);
  assert.match(sql, /pg_advisory_xact_lock/i);
  assert.match(sql, /for update/i);
  assert.match(sql, /applied boolean not null/i);
  assert.match(sql, /security definer/i);
  assert.match(sql, /revoke all on function/i);
  assert.match(sql, /grant execute on function[\s\S]*service_role/i);
});
