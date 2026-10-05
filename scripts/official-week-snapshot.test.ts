import test from "node:test";
import assert from "node:assert/strict";
import {
  buildOfficialWeekSnapshot,
  torontoLocalToIso,
  validateOfficialWeekSourceTimestamp,
} from "../src/lib/official-week-snapshot.ts";
import { OFFICIAL_WEEK_META } from "../src/data/official-week.ts";

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
    validateOfficialWeekSourceTimestamp("2026-10-02T16:00:00-04:00"),
    "2026-10-02T20:00:00.000Z",
  );
  assert.throws(
    () => validateOfficialWeekSourceTimestamp("2026-10-02"),
    /offset-aware ISO timestamp/,
  );
  assert.throws(
    () => validateOfficialWeekSourceTimestamp("2026-10-03T00:00:00-04:00"),
    /published date/,
  );
});

test("weekly snapshot preserves the certified AHMV source and all 39 activities", () => {
  const snapshot = buildOfficialWeekSnapshot("2026-10-02T16:00:00-04:00");
  assert.equal(snapshot.status, "active");
  assert.equal(snapshot.sourceUrl, OFFICIAL_WEEK_META.sourceUrl);
  assert.equal(snapshot.events.length, 39);
  assert.equal(snapshot.events[0]?.id, "ow-1005-2030-dollard");
  assert.equal(snapshot.events.at(-1)?.id, "ow-1011-1730-m19");
  assert.equal(snapshot.events[0]?.sourceUrl, OFFICIAL_WEEK_META.sourceUrl);
  assert.equal(snapshot.events[0]?.officialUrl, OFFICIAL_WEEK_META.sourceUrl);
});

test("verified arena addresses are included without guessing unknown locations", () => {
  const snapshot = buildOfficialWeekSnapshot("2026-10-02T16:00:00-04:00");
  const denis = snapshot.events.find((event) => event.id === "ow-1006-1700-m11");
  const saintCharles = snapshot.events.find((event) => event.id === "ow-1007-2100-chacals");
  assert.match(denis?.venueAddress ?? "", /4110/);
  assert.match(saintCharles?.venueAddress ?? "", /1055/);
});

test("category labels are derived only from labels explicitly present in the source", () => {
  const snapshot = buildOfficialWeekSnapshot("2026-10-02T16:00:00-04:00");
  assert.equal(
    snapshot.events.find((event) => event.id === "ow-1006-1700-m11")?.category,
    "M11",
  );
  assert.equal(
    snapshot.events.find((event) => event.id === "ow-1006-1800-hsm")?.category,
    "Hockey sur mesure",
  );
  assert.equal(
    snapshot.events.find((event) => event.id === "ow-1005-2030-dollard")?.category,
    "WLLV",
  );
});
