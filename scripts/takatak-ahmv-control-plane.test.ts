import test from "node:test";
import assert from "node:assert/strict";
import { authorizeTakatakAhmvControlRequest } from "../src/features/takatak-dashboard-ahmv/auth.server.ts";
import { assertControlRecordTransition, canTransitionControlRecord } from "../src/features/takatak-dashboard-ahmv/action-state.ts";
import { getTakatakAhmvBackendManifest } from "../src/features/takatak-dashboard-ahmv/manifest.server.ts";

function request(headers: Record<string, string> = {}) {
  return new Request("https://ahmverdun.ca/internal/takatak/ahmv", { headers });
}

const settings = {
  TAKATAK_AHMV_CONTROL_PLANE_ENABLED: "true",
  TAKATAK_AHMV_SERVICE_TOKEN: "secret",
};

const validHeaders = {
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
    delete headers[key as keyof typeof headers];
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
