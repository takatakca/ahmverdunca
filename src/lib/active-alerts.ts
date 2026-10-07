import type { Alert } from "../data/alerts";
import { montrealDateKey } from "./montreal-date";

/** Published notices remain active through their expiry day in Montreal. */
export function getActiveAlerts(alerts: readonly Alert[], today = montrealDateKey()) {
  return alerts
    .filter((alert) => !alert.archived && alert.publishedAt <= today && alert.expiresAt >= today)
    .sort((a, b) => Number(b.level === "urgent") - Number(a.level === "urgent"));
}
