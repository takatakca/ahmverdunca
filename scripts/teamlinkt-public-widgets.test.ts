import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  approvedTeamLinktWidgetSrc,
  publicTeamLinktWidgetFor,
} from "../src/lib/teamlinkt-public-widgets.ts";
import { LOUVES_M12B_MICROSITE } from "../src/data/team-microsites.ts";

test("published TeamLinkt docs support widgets only after approval", () => {
  const url = "https://widgets.teamlinkt.com/public/schedules?team=louves";
  assert.equal(approvedTeamLinktWidgetSrc(url), url);
  assert.equal(approvedTeamLinktWidgetSrc("https://teamlinkt.com/widget/scores"), "https://teamlinkt.com/widget/scores");
  assert.equal(approvedTeamLinktWidgetSrc("https://safe.teamlinkt.com/widget/standings"), "https://safe.teamlinkt.com/widget/standings");
  assert.equal(publicTeamLinktWidgetFor({ schedule: url }, "schedule"), url);
  assert.equal(publicTeamLinktWidgetFor({ schedule: url }, "scores"), null);
});

test("block fake/lookalike URLs, insecure iframes, private or fragment-bearing links", () => {
  const invalid = [
    undefined,
    "",
    "http://teamlinkt.com/widgets",
    "https://teamlinkt.com.evil.example/scores",
    "https://evilteamlinkt.com/scores",
    "https://user:password@teamlinkt.com/scores",
    "https://teamlinkt.com/scores#private",
    "https://teamlinkt.com:8443/scores",
    "javascript:alert(1)",
    "data:text/html,hi",
    "https://127.0.0.1/embed",
    "https://teamlinkt.com/" + "x".repeat(2100),
  ];
  for (const value of invalid) assert.equal(approvedTeamLinktWidgetSrc(value), null);
});

test("pilot has no configured provider identifiers or unapproved widgets", () => {
  assert.equal(LOUVES_M12B_MICROSITE.exactProviderTeamId, undefined);
  assert.equal(LOUVES_M12B_MICROSITE.teamLinktIcalUrl, undefined);
  assert.equal(LOUVES_M12B_MICROSITE.teamLinktPublicWidgets, undefined);
});

test("widgets are rendered only from provider-approved sources; AHMV remains a distinct app shell", () => {
  const app = readFileSync("src/components/team-premium-microsite.tsx", "utf8");
  const widget = readFileSync("src/components/teamlinkt-public-widget.tsx", "utf8");
  const root = readFileSync("src/routes/__root.tsx", "utf8");
  assert.match(app, /publicTeamLinktWidgetFor/);
  assert.match(app, /id="calendrier"/);
  assert.match(app, /id="pointages"/);
  assert.match(app, /id="photos-equipe"/);
  assert.match(app, /id="vie-equipe"/);
  assert.match(app, /TeamIceBagChecklist/);
  assert.match(app, /TeamPageShare/);
  assert.match(app, /pendingModules\.map/);
  assert.match(root, /isLouvesApp = location\.pathname === "\/equipes\/louves-m12b"/);
  assert.match(root, /isLouvesApp \?/);
  assert.match(root, /<main id="contenu"/);
  assert.match(widget, /sandbox="allow-scripts allow-same-origin allow-forms allow-popups"/);
  assert.match(widget, /referrerPolicy="no-referrer"/);
  assert.doesNotMatch(app, /fetch\(.*teamlinkt|TeamLinkt.*access_token/i);
});
