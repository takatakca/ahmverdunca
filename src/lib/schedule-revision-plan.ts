/**
 * Draft-only AHMV PDF schedule revision planning.
 *
 * Email/PDF input is untrusted. No publication, external API call, approval
 * or cancellation is performed by this module.
 */
export interface ScheduleDraftRow {
  rowId: string;
  date: string;
  start: string;
  end: string;
  venue: string;
  activity: string;
  group: string;
  sourcePage: number;
  note?: string;
}

export interface ScheduleDraftDocument {
  week: number;
  weekStart: string;
  weekEnd: string;
  sourceSha256: string;
  sourceName: string;
  receivedAt?: string;
  rows: readonly ScheduleDraftRow[];
}

export interface ScheduleDraftChange {
  kind: "added" | "modified" | "unchanged" | "missing-unconfirmed";
  rowId: string;
  previous?: ScheduleDraftRow;
  incoming?: ScheduleDraftRow;
}

export interface ScheduleRevisionPlan {
  status: "needs-review" | "duplicate" | "invalid";
  errors: string[];
  changes: ScheduleDraftChange[];
  /** True only indicates a row changed, NEVER permission to publish. */
  hasChanges: boolean;
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const SHA = /^[a-fA-F0-9]{64}$/;

function isCalendarDate(value: string): boolean {
  if (!DATE.test(value)) return false;
  const d = new Date(value + "T12:00:00Z");
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

function sameRow(a: ScheduleDraftRow, b: ScheduleDraftRow): boolean {
  return (
    a.date === b.date && a.start === b.start && a.end === b.end &&
    a.venue === b.venue && a.activity === b.activity &&
    a.group === b.group && (a.note ?? "") === (b.note ?? "")
  );
}

/** Keeps potential corrections visible for human review; never silently deletes an event. */
export function planScheduleRevision(
  incoming: ScheduleDraftDocument,
  previous?: ScheduleDraftDocument,
): ScheduleRevisionPlan {
  const errors: string[] = [];
  if (!Number.isInteger(incoming.week) || incoming.week < 1 || incoming.week > 60) {
    errors.push("Invalid week number");
  }
  if (!isCalendarDate(incoming.weekStart) || !isCalendarDate(incoming.weekEnd) || incoming.weekStart > incoming.weekEnd) {
    errors.push("Invalid week range");
  }
  if (!SHA.test(incoming.sourceSha256) || !incoming.sourceName.trim()) {
    errors.push("Document must have a source name and SHA-256 digest");
  }
  if (previous && (previous.week !== incoming.week || previous.weekStart !== incoming.weekStart || previous.weekEnd !== incoming.weekEnd)) {
    errors.push("Never diff separate weeks as if they were revisions");
  }
  const seen = new Set<string>();
  for (const row of incoming.rows) {
    if (!row.rowId.trim() || seen.has(row.rowId)) {
      errors.push("Missing or duplicate source row ID: " + row.rowId);
    }
    seen.add(row.rowId);
    if (!isCalendarDate(row.date) || row.date < incoming.weekStart || row.date > incoming.weekEnd) {
      errors.push("Invalid or out-of-week date: " + row.rowId);
    }
    if (!TIME.test(row.start) || !TIME.test(row.end) || row.start >= row.end) {
      errors.push("Invalid activity time: " + row.rowId);
    }
    if (!row.venue.trim() || !row.activity.trim() || !row.group.trim()) {
      errors.push("Missing venue, activity or published group: " + row.rowId);
    }
    if (!Number.isInteger(row.sourcePage) || row.sourcePage < 1) {
      errors.push("Missing source PDF page: " + row.rowId);
    }
  }
  if (errors.length > 0) return { status: "invalid", errors, changes: [], hasChanges: false };
  if (previous?.sourceSha256.toLowerCase() === incoming.sourceSha256.toLowerCase()) {
    return { status: "duplicate", errors: [], changes: [], hasChanges: false };
  }

  const oldRows = new Map(previous?.rows.map((row) => [row.rowId, row]) ?? []);
  const newRows = new Set<string>();
  const changes: ScheduleDraftChange[] = incoming.rows.map((row) => {
    newRows.add(row.rowId);
    const old = oldRows.get(row.rowId);
    if (!old) return { kind: "added" as const, rowId: row.rowId, incoming: row };
    return {
      kind: sameRow(old, row) ? "unchanged" as const : "modified" as const,
      rowId: row.rowId, previous: old, incoming: row,
    };
  });
  for (const row of previous?.rows ?? []) {
    if (!newRows.has(row.rowId)) {
      // Partial PDFs or renamed rows must not cancel previously approved events.
      changes.push({ kind: "missing-unconfirmed", rowId: row.rowId, previous: row });
    }
  }
  return {
    status: "needs-review",
    errors: [],
    changes,
    hasChanges: changes.some((change) => change.kind !== "unchanged"),
  };
}

/**
 * Generic labels (M12 Louves) do not prove which exact M12A/M12B
 * team is involved. TeamLinkt membership, chat and attendance are private.
 */
export function exactLouvesGroup(group: string): "m12a" | "m12b" | null {
  const normalized = group.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  if (!/LOUVES?/.test(normalized)) return null;
  if (/\bM12\s*(?:B|B\b)/.test(normalized) || /\bM12B\b/.test(normalized)) return "m12b";
  if (/\bM12\s*A\b/.test(normalized) || /\bM12A\b/.test(normalized)) return "m12a";
  return null;
}
