import assert from "node:assert/strict";
import {
  applyConversationDraft,
  cloneConversationSession,
} from "../src/turn-controller.js";

const session = {
  messages: [{ role: "user", content: "hello" }],
  smsItems: [],
  smsEnabled: true,
  smsConsentAt: "2026-10-03T00:00:00.000Z",
  usage: { estimatedSessionUsd: 0.1 },
  metrics: { scheduleLookups: 1 },
  costGuardExceeded: false,
  handoffRequested: false,
  handoffReason: null,
  handoffPreferredWindow: null,
};

const draft = cloneConversationSession(session);
draft.usage.estimatedSessionUsd = 0.25;
draft.metrics.scheduleLookups = 2;
draft.handoffRequested = true;
draft.handoffReason = "registration";
draft.handoffPreferredWindow = "evening";

assert.equal(session.usage.estimatedSessionUsd, 0.1);
assert.equal(session.metrics.scheduleLookups, 1);
assert.equal(session.handoffRequested, false);

applyConversationDraft(session, draft);

assert.equal(session.usage.estimatedSessionUsd, 0.25);
assert.equal(session.metrics.scheduleLookups, 2);
assert.equal(session.handoffRequested, true);
assert.equal(session.handoffReason, "registration");
assert.equal(session.handoffPreferredWindow, "evening");

console.log(JSON.stringify({
  ok: true,
  test: "turn-state-isolation",
  nestedDraftStateLeaksBeforeCommit: false,
}, null, 2));
