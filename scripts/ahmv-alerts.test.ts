import { describe, expect, test } from "bun:test";
import type { Alert } from "../src/data/alerts";
import { getActiveAlerts } from "../src/lib/active-alerts";
import { montrealDateKey } from "../src/lib/montreal-date";

function notice(overrides: Partial<Alert> = {}): Alert {
  return {
    id: "notice",
    level: "info",
    title: { fr: "Avis", en: "Notice" },
    message: { fr: "Information publiée", en: "Published information" },
    dates: ["2026-10-06"],
    publishedAt: "2026-10-06",
    expiresAt: "2026-10-08",
    archived: false,
    ...overrides,
  };
}

describe("Published AHMV notices", () => {
  test("a future notice stays hidden even when its expiry is in the future", () => {
    expect(getActiveAlerts([notice()], "2026-10-05")).toEqual([]);
  });

  test("a notice appears on its publication day", () => {
    const current = notice();
    expect(getActiveAlerts([current], "2026-10-06")).toEqual([current]);
  });

  test("a notice stays active through its expiry day and disappears the next day", () => {
    const current = notice();
    expect(getActiveAlerts([current], "2026-10-08")).toEqual([current]);
    expect(getActiveAlerts([current], "2026-10-09")).toEqual([]);
  });

  test("a notice published and expiring on the same day is visible only that day", () => {
    const current = notice({ expiresAt: "2026-10-06" });
    expect(getActiveAlerts([current], "2026-10-05")).toEqual([]);
    expect(getActiveAlerts([current], "2026-10-06")).toEqual([current]);
    expect(getActiveAlerts([current], "2026-10-07")).toEqual([]);
  });

  test("archived notices remain hidden during their publication window", () => {
    expect(getActiveAlerts([notice({ archived: true })], "2026-10-07")).toEqual([]);
  });

  test("urgent notices come first, preserving published order within each priority", () => {
    const notices = [
      notice({ id: "info-1" }),
      notice({ id: "urgent-1", level: "urgent" }),
      notice({ id: "info-2" }),
      notice({ id: "urgent-2", level: "urgent" }),
    ];
    const originalOrder = notices.map((item) => item.id);
    expect(getActiveAlerts(notices, "2026-10-07").map((item) => item.id))
      .toEqual(["urgent-1", "urgent-2", "info-1", "info-2"]);
    expect(notices.map((item) => item.id)).toEqual(originalOrder);
  });

  test("publication follows Montreal midnight rather than UTC midnight", () => {
    const current = notice();
    const before = montrealDateKey(new Date("2026-10-06T03:59:59Z"));
    const after = montrealDateKey(new Date("2026-10-06T04:00:00Z"));
    expect(getActiveAlerts([current], before)).toEqual([]);
    expect(getActiveAlerts([current], after)).toEqual([current]);
  });

  test("winter expiry follows Montreal midnight after the daylight-saving transition", () => {
    const current = notice({ publishedAt: "2026-11-01", expiresAt: "2026-11-08" });
    const before = montrealDateKey(new Date("2026-11-09T04:59:59Z"));
    const after = montrealDateKey(new Date("2026-11-09T05:00:00Z"));
    expect(getActiveAlerts([current], before)).toEqual([current]);
    expect(getActiveAlerts([current], after)).toEqual([]);
  });
});
