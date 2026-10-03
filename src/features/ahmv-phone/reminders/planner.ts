export interface ReminderEvent {
  providerEventId: string;
  publicTeamId: string;
  startsAt: string;
  venue: string;
  status: "scheduled" | "cancelled";
}

export interface PlannedGameReminder {
  providerEventId: string;
  publicTeamId: string;
  eventStartsAt: string;
  sendAt: string;
  venue: string;
  dedupeKey: string;
}

export function planGameReminder(
  event: ReminderEvent,
  leadMinutes = 120,
  now = new Date(),
): PlannedGameReminder | null {
  if (event.status !== "scheduled") return null;
  if (!Number.isInteger(leadMinutes) || leadMinutes < 5 || leadMinutes > 1440) {
    throw new Error("Reminder lead time must be between 5 and 1440 minutes");
  }

  const startsAt = Date.parse(event.startsAt);
  if (!Number.isFinite(startsAt) || startsAt <= now.getTime()) return null;

  const sendAt = new Date(startsAt - leadMinutes * 60_000);
  if (sendAt.getTime() < now.getTime()) {
    return null;
  }

  return {
    providerEventId: event.providerEventId,
    publicTeamId: event.publicTeamId,
    eventStartsAt: new Date(startsAt).toISOString(),
    sendAt: sendAt.toISOString(),
    venue: event.venue,
    dedupeKey:
      "game-reminder:" +
      event.publicTeamId +
      ":" +
      event.providerEventId +
      ":" +
      new Date(startsAt).toISOString(),
  };
}

export function reminderLeadMinutes(
  settings: Record<string, string | undefined> = process.env,
) {
  const value = Number(settings["AHMV_GAME_REMINDER_LEAD_MINUTES"] ?? "120");
  return Number.isInteger(value) && value >= 5 && value <= 1440 ? value : 120;
}
