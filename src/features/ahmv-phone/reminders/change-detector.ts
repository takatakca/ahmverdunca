export interface AuthoritativeEventSnapshot {
  providerEventId: string;
  publicTeamId: string;
  startsAt: string;
  venue: string;
  status: "scheduled" | "cancelled";
}

export type EventChangeKind =
  | "cancelled"
  | "restored"
  | "time_changed"
  | "venue_changed";

export interface EventChange {
  kind: EventChangeKind;
  previous: AuthoritativeEventSnapshot;
  current: AuthoritativeEventSnapshot;
}

function requireValidTimestamp(value: string) {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    throw new Error("Invalid authoritative event timestamp");
  }
  return new Date(timestamp).toISOString();
}

function normalizedVenue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleLowerCase("fr-CA")
    .replace(/\s+/g, " ");
}

export function detectAuthoritativeEventChanges(
  previous: AuthoritativeEventSnapshot,
  current: AuthoritativeEventSnapshot,
): EventChange[] {
  if (
    previous.providerEventId !== current.providerEventId ||
    previous.publicTeamId !== current.publicTeamId
  ) {
    throw new Error("Cannot compare different authoritative events");
  }

  const previousStart = requireValidTimestamp(previous.startsAt);
  const currentStart = requireValidTimestamp(current.startsAt);
  const changes: EventChange[] = [];

  if (previous.status !== current.status) {
    changes.push({
      kind: current.status === "cancelled" ? "cancelled" : "restored",
      previous,
      current,
    });
  }

  if (previousStart !== currentStart) {
    changes.push({
      kind: "time_changed",
      previous,
      current,
    });
  }

  if (normalizedVenue(previous.venue) !== normalizedVenue(current.venue)) {
    changes.push({
      kind: "venue_changed",
      previous,
      current,
    });
  }

  return changes;
}

export function eventChangeDedupeKey(current: AuthoritativeEventSnapshot) {
  const start = requireValidTimestamp(current.startsAt);
  return [
    "event-change",
    current.publicTeamId,
    current.providerEventId,
    start,
    normalizedVenue(current.venue),
    current.status,
  ].join(":");
}
