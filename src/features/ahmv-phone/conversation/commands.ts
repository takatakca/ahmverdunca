export type AhmvPhoneCommand =
  | { kind: "next"; teamQuery: string }
  | { kind: "today"; teamQuery: string }
  | { kind: "tomorrow"; teamQuery: string }
  | { kind: "week"; teamQuery: string }
  | { kind: "save"; teamQuery: string }
  | { kind: "calendar"; teamQuery: string }
  | { kind: "departure"; teamQuery: string }
  | { kind: "reminder-on"; teamQuery: string }
  | { kind: "reminder-off"; teamQuery: string };

export function parsePhoneCommand(query: string): AhmvPhoneCommand {
  const value = query.trim().slice(0, 160);

  const departure = /^(D[ÉE]PART|DEPART|LEAVE|ROUTE|SALIDA|RUTA)\s+(.+)$/i.exec(value);
  if (departure) {
    return {
      kind: "departure",
      teamQuery: departure[2]!.trim(),
    };
  }

  const calendar = /^(CALENDRIER|CALENDAR|CALENDARIO|CAL)\s+(.+)$/i.exec(value);
  if (calendar) {
    return {
      kind: "calendar",
      teamQuery: calendar[2]!.trim(),
    };
  }

  const reminderOff =
    /^(RAPPEL|REMIND|RECORDATORIO)\s+(OFF|NON|NO|STOP)\s+(.+)$/i.exec(value);
  if (reminderOff) {
    return {
      kind: "reminder-off",
      teamQuery: reminderOff[3]!.trim(),
    };
  }

  const reminderOn = /^(RAPPEL|REMIND|RECORDATORIO)\s+(.+)$/i.exec(value);
  if (reminderOn) {
    return {
      kind: "reminder-on",
      teamQuery: reminderOn[2]!.trim(),
    };
  }

  const match =
    /^(AUJOURD['’]?HUI|TODAY|HOY|DEMAIN|TOMORROW|MAÑANA|MANANA|SEMAINE|WEEK|SEMANA|SAUVE|SAVE|GUARDA|GUARDAR)\s+(.+)$/i.exec(value);
  if (!match) return { kind: "next", teamQuery: value };

  const keyword = match[1]!.toUpperCase().replace("’", "'");
  const teamQuery = match[2]!.trim();

  if (keyword === "TODAY" || keyword === "HOY" || keyword.startsWith("AUJOURD")) {
    return { kind: "today", teamQuery };
  }
  if (keyword === "DEMAIN" || keyword === "TOMORROW" || keyword === "MAÑANA" || keyword === "MANANA") {
    return { kind: "tomorrow", teamQuery };
  }
  if (keyword === "SEMAINE" || keyword === "WEEK" || keyword === "SEMANA") {
    return { kind: "week", teamQuery };
  }
  return { kind: "save", teamQuery };
}
