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
    resourceType: "page",
    resourceId: "home",
    payload: { title: "Accueil" },
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
  assert.equal(canRetryControlJob({ ...base, status: "succeeded" }), false);
});
