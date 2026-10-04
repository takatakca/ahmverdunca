export const CONTROL_RECORD_STATUSES = [
  "draft",
  "queued",
  "active",
  "archived",
] as const;

export type ControlRecordStatus = (typeof CONTROL_RECORD_STATUSES)[number];

const TRANSITIONS: Record<ControlRecordStatus, readonly ControlRecordStatus[]> = {
  draft: ["queued", "archived"],
  queued: ["draft", "active", "archived"],
  active: ["draft", "archived"],
  archived: ["draft"],
};

export function canTransitionControlRecord(
  from: ControlRecordStatus,
  to: ControlRecordStatus,
) {
  return TRANSITIONS[from].includes(to);
}

export function assertControlRecordTransition(
  from: ControlRecordStatus,
  to: ControlRecordStatus,
) {
  if (!canTransitionControlRecord(from, to)) {
    throw new Error(`invalid_control_record_transition:${from}->${to}`);
  }
}

export type ControlRecord<T> = {
  id: string;
  tenant: "ahmverdun";
  organizationId: string;
  status: ControlRecordStatus;
  revision: number;
  publishedRevision: number | null;
  lastPublishedAt: string | null;
  payload: T;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
};
