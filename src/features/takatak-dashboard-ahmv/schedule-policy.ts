export type PublicationScheduleWindow = {
  publishAt: string;
  expiresAt: string | null;
};

function offsetAwareIso(value: string) {
  return /(?:Z|[+-]\d{2}:\d{2})$/i.test(value);
}

export function normalizePublicationSchedule(input: {
  publishAt: string;
  expiresAt?: string | null | undefined;
  now?: Date | undefined;
}): PublicationScheduleWindow {
  const now = input.now ?? new Date();
  if (!offsetAwareIso(input.publishAt)) {
    throw new Error("publication_schedule_timezone_required");
  }

  const publishAt = new Date(input.publishAt);
  if (!Number.isFinite(publishAt.getTime())) {
    throw new Error("invalid_publication_schedule_time");
  }
  if (publishAt.getTime() <= now.getTime()) {
    throw new Error("publication_schedule_must_be_future");
  }
  if (publishAt.getTime() > now.getTime() + 366 * 86_400_000) {
    throw new Error("publication_schedule_too_far");
  }

  let expiresAt: Date | null = null;
  if (input.expiresAt) {
    if (!offsetAwareIso(input.expiresAt)) {
      throw new Error("publication_expiry_timezone_required");
    }
    expiresAt = new Date(input.expiresAt);
    if (!Number.isFinite(expiresAt.getTime())) {
      throw new Error("invalid_publication_expiry_time");
    }
    if (expiresAt.getTime() <= publishAt.getTime()) {
      throw new Error("publication_expiry_must_follow_publish");
    }
    if (expiresAt.getTime() > publishAt.getTime() + 366 * 86_400_000) {
      throw new Error("publication_expiry_too_far");
    }
  }

  return {
    publishAt: publishAt.toISOString(),
    expiresAt: expiresAt?.toISOString() ?? null,
  };
}

export function publicationWindowVisible(
  input: {
    publishAt: string;
    expiresAt: string | null;
  },
  now = new Date(),
) {
  const start = new Date(input.publishAt).getTime();
  const end = input.expiresAt ? new Date(input.expiresAt).getTime() : null;
  return (
    Number.isFinite(start) &&
    now.getTime() >= start &&
    (end === null || (Number.isFinite(end) && now.getTime() < end))
  );
}
