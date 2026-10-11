import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { publicTeamShareUrl, sharePublicTeamPage } from "../src/lib/team-page-share.ts";

test("public team link uses exactly the origin and approved slug", () => {
  assert.equal(publicTeamShareUrl("https://ahmverdun.ca", "louves-m12b"), "https://ahmverdun.ca/equipes/louves-m12b");
  assert.equal(publicTeamShareUrl("http://localhost:8080/untrusted?invite=private#chat", "louves-m12b"), "http://localhost:8080/equipes/louves-m12b");
  for (const slug of ["", "../members", "louves%2Fprivate", "Louves-M12B", "abc?token=1", "x".repeat(81)]) {
    assert.equal(publicTeamShareUrl("https://ahmverdun.ca", slug), null);
  }
  for (const origin of ["javascript:alert(1)", "data:text/plain,secret", "https://secret@ahmverdun.ca", "not-a-url"]) {
    assert.equal(publicTeamShareUrl(origin, "louves-m12b"), null);
  }
});

test("native share resolves only when the share completes", async () => {
  const payload = { title: "Louves M12B", text: "AHM Verdun", url: "https://ahmverdun.ca/equipes/louves-m12b" };
  const calls: string[] = [];
  const outcome = await sharePublicTeamPage({
    share: async (received) => { assert.deepEqual(received, payload); calls.push("native"); },
    clipboard: { writeText: async () => { calls.push("clipboard"); } },
  }, payload);
  assert.equal(outcome, "shared");
  assert.deepEqual(calls, ["native"]);
});

test("aborted shares do not misreport success or copy without permission", async () => {
  let copied = false;
  const outcome = await sharePublicTeamPage({
    share: async () => { const e = new Error("User cancelled"); e.name = "AbortError"; throw e; },
    clipboard: { writeText: async () => { copied = true; } },
  }, { title: "Louves", text: "Team", url: "https://ahmverdun.ca/equipes/louves-m12b" });
  assert.equal(outcome, "cancelled");
  assert.equal(copied, false);
});

test("failed native share safely falls back to clipboard, then manual link", async () => {
  const data = { title: "Louves", text: "Team", url: "https://ahmverdun.ca/equipes/louves-m12b" };
  let copied = "";
  const fallback = await sharePublicTeamPage({
    share: async () => { throw new Error("unsupported"); },
    clipboard: { writeText: async (url) => { copied = url; } },
  }, data);
  assert.equal(fallback, "copied");
  assert.equal(copied, data.url);
  assert.equal(await sharePublicTeamPage({}, data), "manual");
  assert.equal(await sharePublicTeamPage({
    clipboard: { writeText: async () => { throw new Error("denied"); } },
  }, data), "manual");
});

test("share is a public click action, never a private TeamLinkt invite", () => {
  const source = readFileSync("src/components/team-page-share.tsx", "utf8");
  const page = readFileSync("src/components/team-premium-microsite.tsx", "utf8");
  assert.match(source, /onClick=\{onShare\}/);
  assert.match(source, /disabled=\{!hydrated\}/);
  assert.match(source, /data-ahmv-share-ready=\{hydrated/);
  assert.match(source, /aria-live="polite"/);
  assert.match(source, /inputRef\.current\?\.select/);
  assert.match(source, /readOnly/);
  assert.doesNotMatch(source, /fetch\(|sendBeacon\(|localStorage|teamLinktIcalUrl|exactProviderTeamId/);
  assert.match(page, /TeamPageShare teamSlug=\{site\.slug\}/);
});
