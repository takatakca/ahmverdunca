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
