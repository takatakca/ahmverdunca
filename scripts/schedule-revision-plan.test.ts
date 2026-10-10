import test from "node:test";
import assert from "node:assert/strict";
import { AHMV_WEEK6_REVIEW_DOCUMENT } from "../src/data/ahmv-week6-review.ts";
import { exactLouvesGroup, planScheduleRevision } from "../src/lib/schedule-revision-plan.ts";

const source = AHMV_WEEK6_REVIEW_DOCUMENT;

test("week 6 captures 38 PDF source slots, not just Louves", () => {
  assert.equal(source.week, 6);
  assert.equal(source.rows.length, 38);
  assert.deepEqual(planScheduleRevision(source).errors, []);
  assert.equal(source.rows[0]?.date, "2026-10-12");
  assert.equal(source.rows.at(-1)?.date, "2026-10-18");
  assert.ok(source.rows.some((row) => row.group === "M5"));
  assert.ok(source.rows.some((row) => row.group.includes("M19")));
  assert.ok(source.rows.some((row) => row.group === "M12 B Louves (697955)"));
});

test("M12B practice has correct date/time and remains practice, not a game", () => {
  const louves = source.rows.find((row) => row.group === "M12 B Louves (697955)");
  assert.deepEqual(
    [louves?.date, louves?.start, louves?.end, louves?.activity],
    ["2026-10-17", "15:00", "16:00", "Pratique"],
  );
});

test("initial PDF creates review-only additions, never auto-publication", () => {
  const plan = planScheduleRevision(source);
  assert.equal(plan.status, "needs-review");
  assert.equal(plan.changes.length, 38);
  assert.ok(plan.changes.every((change) => change.kind === "added"));
});

test("same PDF hash is a duplicate and creates no publication candidate", () => {
  const plan = planScheduleRevision(source, { ...source, rows: [...source.rows] });
  assert.equal(plan.status, "duplicate");
  assert.equal(plan.hasChanges, false);
});

test("a corrected PDF preserves differences and does not cancel missing activities", () => {
  const revised = {
    ...source,
    sourceSha256: "f".repeat(64),
    rows: [
      { ...source.rows[0]!, start: "20:00" },
      ...source.rows.slice(1, -1),
    ],
  };
  const plan = planScheduleRevision(revised, source);
  assert.equal(plan.status, "needs-review");
  assert.equal(plan.changes.find((change) => change.rowId === source.rows[0]?.rowId)?.kind, "modified");
  assert.equal(plan.changes.find((change) => change.rowId === source.rows.at(-1)?.rowId)?.kind, "missing-unconfirmed");
  assert.ok(!plan.changes.some((change) => change.kind === ("cancelled" as string)));
});

test("different weeks cannot be compared as corrections", () => {
  const plan = planScheduleRevision({ ...source, week: 7 }, source);
  assert.equal(plan.status, "invalid");
});

test("bad times, out-of-range dates and duplicate row IDs are rejected", () => {
  const bad = {
    ...source,
    rows: [
      { ...source.rows[0]!, date: "2026-10-19", start: "28:30" },
      { ...source.rows[0]! },
    ],
  };
  assert.equal(planScheduleRevision(bad).status, "invalid");
  assert.ok(planScheduleRevision(bad).errors.length >= 2);
});

test("only explicitly designated M12 A/B Louves can route to exact team", () => {
  assert.equal(exactLouvesGroup("M12 Louves"), null);
  assert.equal(exactLouvesGroup("M12 Fille Louves"), null);
  assert.equal(exactLouvesGroup("M12 B Louves (697955)"), "m12b");
  assert.equal(exactLouvesGroup("M12 A Louves"), "m12a");
  assert.equal(exactLouvesGroup("M12 Broncos"), null);
  assert.equal(exactLouvesGroup("M12 Broncos Louves"), null);
});
