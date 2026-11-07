import test from "node:test";
import assert from "node:assert/strict";
import {
  buildOfficialWeekSnapshot,
  torontoLocalToIso,
  validateOfficialWeekSourceTimestamp,
} from "../src/lib/official-week-snapshot.ts";
import { OFFICIAL_WEEK_META, WEEKLY_SCHEDULE_DOCUMENTS } from "../src/data/official-week.ts";

const SOURCE_UPDATED_AT = "2026-11-04T22:30:00-05:00";
const weekPdf = (week: number) => WEEKLY_SCHEDULE_DOCUMENTS.find((document) => document.week === week)?.sourceUrl;

test("Toronto local schedule times become exact UTC instants", () => {
  assert.equal(
    torontoLocalToIso("2026-10-05", "20:30"),
    "2026-10-06T00:30:00.000Z",
  );
  assert.equal(
    torontoLocalToIso("2026-11-08", "08:00"),
    "2026-11-08T13:00:00.000Z",
  );
});

test("source publication timestamp must be explicit and on the published Toronto date", () => {
  assert.equal(
    validateOfficialWeekSourceTimestamp(SOURCE_UPDATED_AT),
    "2026-11-05T03:30:00.000Z",
  );
  assert.throws(
    () => validateOfficialWeekSourceTimestamp("2026-11-04"),
    /offset-aware ISO timestamp/,
  );
  assert.throws(
    () => validateOfficialWeekSourceTimestamp("2026-11-05T12:00:00-05:00"),
    /published date/,
  );
});

test("snapshot keeps all 119 activities of weeks 9–11, each citing its own weekly PDF", () => {
  const snapshot = buildOfficialWeekSnapshot(SOURCE_UPDATED_AT);
  assert.equal(snapshot.status, "active");
  assert.equal(snapshot.sourceUrl, OFFICIAL_WEEK_META.sourceUrl);
  assert.equal(snapshot.events.length, 119);
  assert.equal(snapshot.events[0]?.id, "ow-1102-2030-chacals");
  assert.equal(snapshot.events.at(-1)?.id, "ow-1122-1800-chacals");
  assert.equal(snapshot.events[0]?.sourceUrl, weekPdf(9));
  assert.equal(snapshot.events[0]?.officialUrl, weekPdf(9));
  assert.equal(snapshot.events.find((event) => event.id === "ow-1114-1500-louves-b")?.sourceUrl, weekPdf(10));
  assert.equal(snapshot.events.at(-1)?.sourceUrl, weekPdf(11));
});

test("verified arena addresses are included without guessing unknown locations", () => {
  const snapshot = buildOfficialWeekSnapshot(SOURCE_UPDATED_AT);
  const denis = snapshot.events.find((event) => event.id === "ow-1103-1700-m11");
  const saintCharles = snapshot.events.find((event) => event.id === "ow-1104-2100-chacals");
  assert.match(denis?.venueAddress ?? "", /4110/);
  assert.match(saintCharles?.venueAddress ?? "", /1055/);
});

test("category labels are derived only from labels explicitly present in the source", () => {
  const snapshot = buildOfficialWeekSnapshot(SOURCE_UPDATED_AT);
  assert.equal(
    snapshot.events.find((event) => event.id === "ow-1103-1700-m11")?.category,
    "M11",
  );
  assert.equal(
    snapshot.events.find((event) => event.id === "ow-1103-1800-hsm")?.category,
    "Hockey sur mesure",
  );
  assert.equal(
    snapshot.events.find((event) => event.id === "ow-1102-2030-chacals")?.category,
    "WLLV",
  );
});
