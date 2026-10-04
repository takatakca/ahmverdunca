import test from "node:test";
import assert from "node:assert/strict";
import { authorizeTakatakAhmvControlRequest } from "../src/features/takatak-dashboard-ahmv/auth.server.ts";
import { assertControlRecordTransition, canTransitionControlRecord } from "../src/features/takatak-dashboard-ahmv/action-state.ts";
import { getTakatakAhmvBackendManifest } from "../src/features/takatak-dashboard-ahmv/manifest.server.ts";
import { canPrincipalPerform } from "../src/features/takatak-dashboard-ahmv/rbac.ts";
import { assertSafeControlPayload } from "../src/features/takatak-dashboard-ahmv/payload-security.ts";
import {
  assertIdempotencyCompatible,
  commandFingerprint,
  normalizeIdempotencyKey,
} from "../src/features/takatak-dashboard-ahmv/idempotency.ts";
import { assertExpectedRevision } from "../src/features/takatak-dashboard-ahmv/revision.ts";
import { parseTakatakAhmvCommand } from "../src/features/takatak-dashboard-ahmv/command.ts";
import { assertCompleteAdapterCatalog } from "../src/features/takatak-dashboard-ahmv/adapters.ts";
import { canRetryControlJob } from "../src/features/takatak-dashboard-ahmv/jobs.ts";
import {
  grantAllowsControlPlane,
  principalFromAssociationGrant,
} from "../src/features/takatak-dashboard-ahmv/subscription-access.ts";
import {
  assertSafeConnectorReference,
  buildConnectorExecutionRequest,
} from "../src/features/takatak-dashboard-ahmv/connectors.ts";
import { createTakatakUsageEvent } from "../src/features/takatak-dashboard-ahmv/usage-metering.ts";
import { retryDelaySeconds, safeWorkerErrorCode } from "../src/features/takatak-dashboard-ahmv/job-policy.ts";
import { parseControlProvenance } from "../src/features/takatak-dashboard-ahmv/provenance.ts";
import { hasUnpublishedChanges, publishedRevisionForRecord } from "../src/features/takatak-dashboard-ahmv/published.ts";
import { buildPortableControlBundle } from "../src/features/takatak-dashboard-ahmv/portability.ts";

function request(headers: Record<string, string> = {}) {
  return new Request("https://ahmverdun.ca/internal/takatak/ahmv", { headers });
}

const settings = {
  TAKATAK_AHMV_CONTROL_PLANE_ENABLED: "true",
  TAKATAK_AHMV_SERVICE_TOKEN: "secret",
};

const validHeaders: Record<string, string> = {
  authorization: "Bearer secret",
  "x-takatak-tenant": "ahmverdun",
  "x-takatak-product": "ahmv",
  "x-takatak-organization-id": "org_123",
  "x-takatak-actor-id": "user_123",
  "x-request-id": "req_123",
};

test("AHMV dashboard adapter never auto-mounts UI", () => {
  const manifest = getTakatakAhmvBackendManifest();
  assert.equal(manifest.standaloneApplication, true);
  assert.equal(manifest.autoMountInDashboard, false);
  assert.equal(manifest.ui.mounted, false);
  assert.equal(manifest.ui.autoVisible, false);
  assert.equal(manifest.billingAuthority, "takatak");
});

test("control-plane authorization is disabled by default", () => {
  assert.equal(
    authorizeTakatakAhmvControlRequest(request(validHeaders), {}),
    null,
  );
});

test("control-plane authorization requires exact server identity context", () => {
  assert.ok(authorizeTakatakAhmvControlRequest(request(validHeaders), settings));

  for (const key of [
    "authorization",
    "x-takatak-tenant",
    "x-takatak-product",
    "x-takatak-organization-id",
    "x-takatak-actor-id",
    "x-request-id",
  ]) {
    const headers = { ...validHeaders };
    delete headers[key];
    assert.equal(authorizeTakatakAhmvControlRequest(request(headers), settings), null);
  }
});

test("control records support draft/archive/restore semantics", () => {
  assert.equal(canTransitionControlRecord("draft", "queued"), true);
  assert.equal(canTransitionControlRecord("active", "archived"), true);
  assert.equal(canTransitionControlRecord("archived", "draft"), true);
  assert.equal(canTransitionControlRecord("archived", "active"), false);
  assert.throws(
    () => assertControlRecordTransition("archived", "active"),
    /invalid_control_record_transition/,
  );
});

test("RBAC intersects role permission with subscribed service scope", () => {
  const manager = {
    actorId: "user_123",
    organizationId: "org_123",
    role: "manager" as const,
    enabledServices: ["seo", "website"] as const,
  };

  assert.equal(canPrincipalPerform(manager, "seo", "publish"), true);
  assert.equal(canPrincipalPerform(manager, "seo", "execute"), false);
  assert.equal(canPrincipalPerform(manager, "voice", "read"), false);

  const owner = { ...manager, role: "owner" as const };
  assert.equal(canPrincipalPerform(owner, "website", "delete"), true);

  const admin = { ...manager, role: "admin" as const };
  assert.equal(canPrincipalPerform(admin, "website", "delete"), false);
});

test("control payloads reject provider credentials and unsafe size/depth", () => {
  assert.doesNotThrow(() =>
    assertSafeControlPayload({
      title: "Horaire",
      settings: { enabled: true },
    }),
  );

  assert.throws(
    () => assertSafeControlPayload({ api_key: "should-never-live-here" }),
    /control_payload_forbidden_key/,
  );
  assert.throws(
    () => assertSafeControlPayload({ nested: { refresh_token: "secret" } }),
    /control_payload_forbidden_key/,
  );
  assert.throws(
    () => assertSafeControlPayload({ accessToken: "secret" }),
    /control_payload_forbidden_key/,
  );
  assert.throws(
    () => assertSafeControlPayload({ apiKey: "secret" }),
    /control_payload_forbidden_key/,
  );
});

test("idempotency keys and fingerprints are deterministic", () => {
  assert.equal(normalizeIdempotencyKey("cmd_12345678"), "cmd_12345678");
  assert.equal(normalizeIdempotencyKey("bad key"), null);

  const left = commandFingerprint({ b: 2, a: { y: 2, x: 1 } });
  const right = commandFingerprint({ a: { x: 1, y: 2 }, b: 2 });
  assert.equal(left, right);

  assert.doesNotThrow(() =>
    assertIdempotencyCompatible(
      { key: "cmd_12345678", fingerprint: left, status: "pending" },
      right,
    ),
  );
  assert.throws(
    () =>
      assertIdempotencyCompatible(
        { key: "cmd_12345678", fingerprint: left, status: "pending" },
        commandFingerprint({ a: 999 }),
      ),
    /idempotency_key_reused_with_different_command/,
  );
});

test("optimistic concurrency rejects stale dashboard revisions", () => {
  assert.equal(assertExpectedRevision(4, 4), 5);
  assert.throws(() => assertExpectedRevision(4, 3), /revision_conflict/);
  assert.throws(() => assertExpectedRevision(4, undefined), /expected_revision_required/);
});

test("command parsing requires safe scoped and idempotent input", () => {
  const command = parseTakatakAhmvCommand({
    tenant: "ahmverdun",
    organizationId: "org_123",
    actorId: "user_123",
    requestId: "req_123",
    idempotencyKey: "cmd_12345678",
    service: "seo",
    action: "save_draft",
    resourceType: "page_meta",
    resourceId: "home",
    payload: { title: { fr: "Accueil", en: "Home" } },
  });

  assert.equal(command.service, "seo");
  assert.equal(command.action, "save_draft");
  assert.match(command.fingerprint, /^[a-f0-9]{64}$/);

  assert.throws(
    () =>
      parseTakatakAhmvCommand({
        ...command,
        idempotencyKey: "cmd_99999999",
        payload: { access_token: "nope" },
      }),
    /control_payload_forbidden_key/,
  );
});

test("every managed service has an explicit adapter descriptor", () => {
  assert.equal(assertCompleteAdapterCatalog(), true);
});

test("failed jobs retry only while attempts remain", () => {
  const base = {
    id: "job_1",
    tenant: "ahmverdun" as const,
    organizationId: "org_123",
    actorId: "user_123",
    requestId: "req_123",
    idempotencyKey: "cmd_12345678",
    service: "seo" as const,
    action: "publish" as const,
    resourceType: "page",
    resourceId: "home",
    expectedRevision: 2,
    payload: { title: "Accueil" },
    payloadFingerprint: "abc",
    status: "failed" as const,
    attempts: 1,
    maxAttempts: 3,
    availableAt: new Date().toISOString(),
    startedAt: null,
    completedAt: null,
    lastErrorCode: "provider_unavailable",
  };

  assert.equal(canRetryControlJob(base), true);
  assert.equal(canRetryControlJob({ ...base, attempts: 3 }), false);
  assert.equal(
    canRetryControlJob({ ...base, completedAt: new Date().toISOString() }),
    false,
  );
  assert.equal(canRetryControlJob({ ...base, status: "succeeded" }), false);
});


test("association subscription grant is required and expires server-side", () => {
  const grant = {
    organizationId: "org_123",
    actorId: "user_123",
    role: "admin" as const,
    subscriptionId: "sub_123",
    productCode: "managed_hockey_association",
    status: "active" as const,
    enabledServices: ["website", "seo"] as const,
    validUntil: "2026-10-31T23:59:59.000Z",
  };

  const now = new Date("2026-10-04T12:00:00.000Z");
  assert.equal(grantAllowsControlPlane(grant, now), true);
  assert.deepEqual(principalFromAssociationGrant(grant, now).enabledServices, [
    "website",
    "seo",
  ]);

  assert.equal(
    grantAllowsControlPlane({ ...grant, status: "cancelled" }, now),
    false,
  );
  assert.equal(
    grantAllowsControlPlane(
      { ...grant, validUntil: "2026-10-01T00:00:00.000Z" },
      now,
    ),
    false,
  );
});

test("connector contract carries references but never provider secrets", () => {
  const connector = assertSafeConnectorReference({
    connectorId: "connector_twilio_01",
    provider: "twilio",
    accountRef: "account_primary",
    service: "voice",
    secretLocation: "takatak_vault",
  });

  const request = buildConnectorExecutionRequest({
    connector,
    operation: "voice_call",
    resourceRef: "lead_123",
    idempotencyKey: "cmd_12345678",
    payloadFingerprint: "abc",
  });

  assert.equal(request.secretMaterialIncluded, false);
  assert.throws(
    () =>
      assertSafeConnectorReference({
        ...connector,
        connectorId: "bad connector id",
      }),
    /invalid_takatak_connector_reference/,
  );
});

test("AHMV emits usage facts but never becomes billing authority", () => {
  const event = createTakatakUsageEvent({
    eventId: "usage_123",
    organizationId: "org_123",
    service: "sms",
    unit: "segment",
    quantity: 2,
    occurredAt: new Date("2026-10-04T12:00:00.000Z"),
  });

  assert.equal(event.quantity, 2);
  assert.equal(event.billingAuthority, "takatak");
  assert.throws(
    () =>
      createTakatakUsageEvent({
        eventId: "usage_124",
        organizationId: "org_123",
        service: "sms",
        unit: "segment",
        quantity: 0,
      }),
    /invalid_usage_quantity/,
  );
});


test("worker retry policy backs off and sanitizes errors", () => {
  assert.equal(retryDelaySeconds(1), 30);
  assert.equal(retryDelaySeconds(2), 60);
  assert.equal(retryDelaySeconds(10), 900);
  assert.equal(
    safeWorkerErrorCode(new Error("Provider 503: Temporary Failure!")),
    "worker_exception",
  );
  assert.equal(
    safeWorkerErrorCode(new Error("provider_unavailable")),
    "provider_unavailable",
  );
});


test("website draft schemas allow content corrections but protect structural identifiers", () => {
  const command = parseTakatakAhmvCommand({
    tenant: "ahmverdun",
    organizationId: "org_123",
    actorId: "user_123",
    requestId: "req_web_123",
    idempotencyKey: "cmd_web_12345678",
    service: "website",
    action: "save_draft",
    resourceType: "news_post",
    resourceId: "annulations-22-26-septembre-2026",
    payload: {
      title: { fr: "Annulations mises à jour", en: "Updated cancellations" },
      sourceUrl: "https://www.ahmverdun.com/news/39",
      contentPending: false,
    },
  });

  assert.equal(command.service, "website");
  assert.equal(command.resourceType, "news_post");

  assert.throws(
    () =>
      parseTakatakAhmvCommand({
        tenant: "ahmverdun",
        organizationId: "org_123",
        actorId: "user_123",
        requestId: "req_web_124",
        idempotencyKey: "cmd_web_87654321",
        service: "website",
        action: "save_draft",
        resourceType: "news_post",
        resourceId: "annulations-22-26-septembre-2026",
        payload: {
          slug: "attempt-to-change-identity",
          title: { fr: "Titre" },
        },
      }),
    /invalid_website_control_payload/,
  );
});

test("website control rejects unknown resource types instead of accepting arbitrary JSON", () => {
  assert.throws(
    () =>
      parseTakatakAhmvCommand({
        tenant: "ahmverdun",
        organizationId: "org_123",
        actorId: "user_123",
        requestId: "req_web_125",
        idempotencyKey: "cmd_web_11223344",
        service: "website",
        action: "save_draft",
        resourceType: "unknown_blob",
        resourceId: "anything",
        payload: { anything: true },
      }),
    /unsupported_website_control_resource_type/,
  );
});


test("verified provenance requires a source reference and verification timestamp", () => {
  assert.throws(
    () =>
      parseControlProvenance({
        sourceKind: "official",
        verificationStatus: "verified",
      }),
    /requires_source_and_timestamp/,
  );

  const provenance = parseControlProvenance({
    sourceKind: "official",
    verificationStatus: "verified",
    sourceRef: "https://www.ahmverdun.com/news/39",
    verifiedAt: "2026-10-04T16:00:00-04:00",
  });

  assert.equal(provenance.verificationStatus, "verified");
  assert.equal(provenance.sourceKind, "official");
});

test("website drafts keep verification metadata separate from editable payload", () => {
  const command = parseTakatakAhmvCommand({
    tenant: "ahmverdun",
    organizationId: "org_123",
    actorId: "user_123",
    requestId: "req_web_prov_1",
    idempotencyKey: "cmd_web_prov_12345",
    service: "website",
    action: "save_draft",
    resourceType: "arena_info",
    resourceId: "jacques-lemaire",
    provenance: {
      sourceKind: "official",
      verificationStatus: "verified",
      sourceRef: "https://montreal.ca/lieux/arena-jacques-lemaire",
      verifiedAt: "2026-10-04T16:00:00-04:00",
    },
    payload: {
      address: "8681, boulevard Champlain, Montréal (Québec) H8P 1B8",
      addressVerified: true,
    },
  });

  assert.equal(command.provenance?.verificationStatus, "verified");
  assert.equal(
    (command.payload as { addressVerified?: boolean }).addressVerified,
    true,
  );
});


test("published snapshots stay pinned while a newer draft exists", () => {
  const record = {
    id: "record_1",
    tenant: "ahmverdun" as const,
    organizationId: "org_123",
    service: "website",
    resourceType: "news_post",
    resourceId: "news_1",
    status: "draft" as const,
    revision: 4,
    publishedRevision: 3,
    lastPublishedAt: "2026-10-04T20:00:00.000Z",
    payload: { title: "new draft" },
    provenance: parseControlProvenance({
      sourceKind: "association",
      verificationStatus: "unverified",
    }),
    createdAt: "2026-10-04T18:00:00.000Z",
    updatedAt: "2026-10-04T21:00:00.000Z",
    archivedAt: null,
  };

  assert.equal(publishedRevisionForRecord(record), 3);
  assert.equal(hasUnpublishedChanges(record), true);
  assert.equal(
    publishedRevisionForRecord({ ...record, status: "archived" }),
    null,
  );
});


test("portable AHMV export excludes TAKATAK commercial and operator internals", () => {
  const provenance = parseControlProvenance({
    sourceKind: "association",
    verificationStatus: "verified",
    sourceRef: "https://www.ahmverdun.com/news/39",
    verifiedAt: "2026-10-04T20:00:00.000Z",
  });

  const bundle = buildPortableControlBundle({
    organizationId: "org_123",
    generatedAt: new Date("2026-10-04T21:00:00.000Z"),
    records: [
      {
        id: "record_1",
        tenant: "ahmverdun",
        organizationId: "org_123",
        service: "website",
        resourceType: "news_post",
        resourceId: "news_1",
        status: "active",
        revision: 2,
        publishedRevision: 2,
        lastPublishedAt: "2026-10-04T20:30:00.000Z",
        payload: { title: { fr: "Nouvelle" } },
        provenance,
        createdAt: "2026-10-04T19:00:00.000Z",
        updatedAt: "2026-10-04T20:30:00.000Z",
        archivedAt: null,
      },
    ],
    versions: [
      {
        id: "version_1",
        controlRecordId: "record_1",
        revision: 2,
        status: "draft",
        payload: { title: { fr: "Nouvelle" } },
        provenance,
        actorId: "internal_operator_should_not_export",
        createdAt: "2026-10-04T20:00:00.000Z",
      },
    ],
  });

  const serialized = JSON.stringify(bundle);
  assert.equal(bundle.excluded.billing, true);
  assert.equal(bundle.excluded.connectorCredentials, true);
  assert.doesNotMatch(serialized, /internal_operator_should_not_export/);
  assert.doesNotMatch(serialized, /idempotencyKey|providerSecret|subscriptionId/);
  assert.equal(bundle.records[0]?.recordKey, "website:news_post:news_1");
});
