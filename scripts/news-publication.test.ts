import { describe, expect, test } from "bun:test";
import {
  matchesPublicationRange,
  overridePublicationTime,
  publicationDateLabel,
  publicationFieldValue,
  resolvePublicationTime,
  sortByPublication,
} from "../src/lib/news-publication";

const day = (date: string) => resolvePublicationTime({ date });
const instant = (publishedAt: string) => resolvePublicationTime({ publishedAt });
const unknown = resolvePublicationTime({});

describe("publication precision", () => {
  test("date-only metadata never gains an hour or offset", () => {
    const publication = day("2026-10-06");
    expect(publication).toEqual({ precision: "day", day: "2026-10-06" });
    expect(publicationFieldValue(publication)).toBe("2026-10-06");
    expect(resolvePublicationTime({ publishedAt: "2026-10-06" })).toEqual(publication);
  });

  test("exact timestamps preserve summer and winter Montreal publication days", () => {
    expect(instant("2025-09-15T02:27:08.000Z")).toMatchObject({
      precision: "instant",
      day: "2025-09-14",
    });
    const winter = instant("2026-01-11T15:05:25.000Z");
    expect(winter).toMatchObject({
      precision: "instant",
      day: "2026-01-11",
      epochMs: Date.UTC(2026, 0, 11, 15, 5, 25),
    });
    expect(publicationDateLabel(winter, "en")).toContain("10:05");
  });

  test("invalid or timezone-free API timestamps remain safe unknown dates", () => {
    for (const value of [
      undefined,
      null,
      42,
      "",
      "bad",
      "2026-10-06T12:00:00",
      "2026-02-30T12:00:00Z",
    ]) {
      const publication = resolvePublicationTime({ publishedAt: value });
      expect(publication).toEqual(unknown);
      expect(() => publicationDateLabel(publication, "fr")).not.toThrow();
      expect(publicationFieldValue(publication)).toBeNull();
    }
  });

  test("date corrections keep their calendar day and invalid corrections preserve the source", () => {
    const base = instant("2026-09-22T12:51:00.000Z");
    const correction = overridePublicationTime(base, "2026-09-25");
    expect(correction).toEqual({ precision: "day", day: "2026-09-25" });
    expect(publicationDateLabel(correction, "fr")).toMatch(/^25 /);
    expect(overridePublicationTime(base, "2026-02-30")).toBe(base);
    expect(overridePublicationTime(base, "September 25")).toBe(base);
    expect(publicationDateLabel(unknown, "en", "Spring 2026")).toBe("Spring 2026");
  });
});

describe("Montreal news time windows", () => {
  test("the rolling hour uses verified instants and ages as the clock advances", () => {
    const now = Date.parse("2026-10-06T16:00:00Z");
    const edge = instant("2026-10-06T15:00:00Z");
    expect(matchesPublicationRange(edge, "hour", now)).toBe(true);
    expect(matchesPublicationRange(edge, "hour", now + 1)).toBe(false);
    expect(matchesPublicationRange(day("2026-10-06"), "hour", now)).toBe(false);
    expect(matchesPublicationRange(instant("2026-10-06T16:00:01Z"), "hour", now)).toBe(false);
  });

  test("today switches at Montreal midnight instead of retaining the last 24 hours", () => {
    const midnight = Date.parse("2026-10-06T04:00:00Z");
    const yesterday = instant("2026-10-06T03:59:59Z");
    expect(matchesPublicationRange(yesterday, "day", midnight - 1)).toBe(true);
    expect(matchesPublicationRange(yesterday, "day", midnight)).toBe(false);
    expect(matchesPublicationRange(day("2026-10-06"), "day", midnight)).toBe(true);
    const winterMidnight = Date.parse("2026-01-12T05:00:00Z");
    expect(matchesPublicationRange(day("2026-01-11"), "day", winterMidnight - 1)).toBe(true);
    expect(matchesPublicationRange(day("2026-01-11"), "day", winterMidnight)).toBe(false);
  });

  test("7 and 30 calendar days include today and survive a daylight saving transition", () => {
    const spring = Date.parse("2026-03-08T07:01:00Z");
    expect(matchesPublicationRange(day("2026-03-02"), "week", spring)).toBe(true);
    expect(matchesPublicationRange(day("2026-03-01"), "week", spring)).toBe(false);
    expect(matchesPublicationRange(day("2026-02-07"), "month", spring)).toBe(true);
    expect(matchesPublicationRange(day("2026-02-06"), "month", spring)).toBe(false);
    const fall = Date.parse("2026-11-01T06:30:00Z");
    expect(matchesPublicationRange(instant("2026-11-01T01:30:00-04:00"), "hour", fall)).toBe(true);
    expect(matchesPublicationRange(instant("2026-11-01T01:30:00-04:00"), "hour", fall + 1)).toBe(
      false,
    );
  });

  test("unknown dates appear only in all time and future publication dates stay hidden", () => {
    const now = Date.parse("2026-10-06T16:00:00Z");
    for (const range of ["all", "hour", "day", "week", "month"] as const) {
      expect(matchesPublicationRange(unknown, range, now)).toBe(range === "all");
      expect(matchesPublicationRange(day("2026-10-07"), range, now)).toBe(false);
      expect(matchesPublicationRange(instant("2026-10-06T16:01:00Z"), range, now)).toBe(false);
    }
    expect(matchesPublicationRange(unknown, "all", Number.NaN)).toBe(false);
  });
});

test("sorting never assigns an hour to date-only entries and always keeps unknowns last", () => {
  const items = [
    { id: "unknown-1", publication: unknown },
    { id: "date-a", publication: day("2026-10-06") },
    { id: "date-b", publication: day("2026-10-06") },
    { id: "older", publication: day("2026-10-05") },
    { id: "late", publication: instant("2026-10-06T15:00:00Z") },
    { id: "early", publication: instant("2026-10-06T14:00:00Z") },
    { id: "unknown-2", publication: unknown },
  ];
  expect(sortByPublication(items, "newest").map((item) => item.id)).toEqual([
    "late",
    "early",
    "date-a",
    "date-b",
    "older",
    "unknown-1",
    "unknown-2",
  ]);
  expect(sortByPublication(items, "oldest").map((item) => item.id)).toEqual([
    "older",
    "early",
    "late",
    "date-a",
    "date-b",
    "unknown-1",
    "unknown-2",
  ]);
  expect(items.map((item) => item.id)).toEqual([
    "unknown-1",
    "date-a",
    "date-b",
    "older",
    "late",
    "early",
    "unknown-2",
  ]);
});
