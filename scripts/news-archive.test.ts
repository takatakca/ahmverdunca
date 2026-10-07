import { expect, test } from "bun:test";
import { montrealPublicationDate } from "../src/lib/news-archive";

test("archives preserve Montreal dates when UTC has already reached the next day", () => {
  expect(montrealPublicationDate("2025-09-15T02:27:08.000Z")).toBe("2025-09-14");
  expect(montrealPublicationDate("2025-08-08T00:58:47.000Z")).toBe("2025-08-07");
  expect(montrealPublicationDate("2025-01-01T04:59:59.000Z")).toBe("2024-12-31");
});

test("publication days follow Montreal midnight in summer and winter", () => {
  expect(montrealPublicationDate("2025-07-01T03:59:59.000Z")).toBe("2025-06-30");
  expect(montrealPublicationDate("2025-07-01T04:00:00.000Z")).toBe("2025-07-01");
  expect(montrealPublicationDate("2025-01-12T04:59:59.000Z")).toBe("2025-01-11");
  expect(montrealPublicationDate("2025-01-12T05:00:00.000Z")).toBe("2025-01-12");
  expect(montrealPublicationDate("2025-01-12T00:00:00-05:00")).toBe("2025-01-12");
});

test("missing offsets and impossible source dates are rejected instead of inferred", () => {
  for (const value of [
    "",
    "2025-09-14",
    "2025-09-14T23:27:08",
    "invalid",
    "2025-02-30T12:00:00Z",
  ]) {
    expect(montrealPublicationDate(value)).toBeUndefined();
  }
});
