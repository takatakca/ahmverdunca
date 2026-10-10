import test from "node:test";
import assert from "node:assert/strict";
import { assessTeamLinktPublicWidget, TEAMLINKT_DEFAULT_CAPABILITIES } from "../src/lib/teamlinkt-public-connector.ts";

const approved = {
  teamId: "m12b-to-be-confirmed",
  widgetType: "schedule" as const,
  iframeSourceUrl: "https://widgets.teamlinkt.com/public/schedule",
  approved: true,
};

test("approved public widget is eligible for review, not automatically published", () => {
  const result = assessTeamLinktPublicWidget(approved);
  assert.equal(result.status, "ready-for-private-review");
  if (result.status === "ready-for-private-review") {
    assert.equal(result.widgetType, "schedule");
    assert.equal(result.teamId, "m12b-to-be-confirmed");
  }
});

test("unapproved widget, forged host and insecure links fail closed", () => {
  for (const config of [
    { ...approved, approved: false },
    { ...approved, iframeSourceUrl: "http://widgets.teamlinkt.com/public/schedule" },
    { ...approved, iframeSourceUrl: "https://teamlinkt.com.evil.example/widget" },
    { ...approved, iframeSourceUrl: "https://evil-teamlinkt.com/widget" },
    { ...approved, iframeSourceUrl: "https://widgets.teamlinkt.com/widget?access_token=secret" },
    { ...approved, iframeSourceUrl: "https://user:secret@teamlinkt.com/widget" },
    { ...approved, iframeSourceUrl: "https://teamlinkt.com/widget#secret" },
  ]) {
    assert.equal(assessTeamLinktPublicWidget(config).status, "blocked");
  }
});

test("provider chat is not claimed to be embeddable", () => {
  assert.equal(TEAMLINKT_DEFAULT_CAPABILITIES.teamChat, "private-provider-only");
  assert.equal(TEAMLINKT_DEFAULT_CAPABILITIES.calendarSubscription, "documented-not-connected");
  assert.equal(TEAMLINKT_DEFAULT_CAPABILITIES.publicScheduleWidget, "documented-not-connected");
});
