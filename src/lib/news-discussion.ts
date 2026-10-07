const FACEBOOK_HOSTS = new Set([
  "facebook.com",
  "www.facebook.com",
  "m.facebook.com",
  "mobile.facebook.com",
]);

/** Only an identified official post or photo can open an exact discussion. */
export function exactFacebookThreadUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      !FACEBOOK_HOSTS.has(url.hostname) ||
      url.username ||
      url.password ||
      url.port
    )
      return undefined;

    const officialPost = /^\/AHMVerdun\/posts\/(?:pfbid[A-Za-z0-9]+|\d+)\/?$/.test(url.pathname);
    const photoIds = url.searchParams.getAll("fbid");
    const identifiedPhoto =
      /^\/photo(?:\.php)?\/?$/.test(url.pathname) &&
      photoIds.length === 1 &&
      /^\d+$/.test(photoIds[0] ?? "");
    return officialPost || identifiedPhoto ? url.href : undefined;
  } catch {
    return undefined;
  }
}

/** A mirrored comment must link to the comment itself, not merely its post. */
export function exactFacebookCommentUrl(value: string | undefined): string | undefined {
  const threadUrl = exactFacebookThreadUrl(value);
  if (!threadUrl) return undefined;
  const commentIds = new URL(threadUrl).searchParams.getAll("comment_id");
  return commentIds.length === 1 && /^\d+$/.test(commentIds[0] ?? "") ? threadUrl : undefined;
}

function exactIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/** Unknown dates remain absent; supplied author, body, date and provenance must be valid. */
export function newsCommentProblems(value: unknown): string[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return ["must be an object"];
  const comment = value as Record<string, unknown>;
  const problems: string[] = [];
  if (typeof comment["author"] !== "string" || !comment["author"].trim())
    problems.push("author must be non-empty");
  if (typeof comment["body"] !== "string" || !comment["body"].trim())
    problems.push("body must be non-empty");
  if (
    comment["date"] !== undefined &&
    (typeof comment["date"] !== "string" || !exactIsoDate(comment["date"]))
  ) {
    problems.push("date must be a valid YYYY-MM-DD date when known");
  }
  if (comment["source"] !== "facebook" && comment["source"] !== "member")
    problems.push("source must be facebook or member");
  if (
    comment["source"] === "facebook" &&
    (typeof comment["sourceUrl"] !== "string" || !exactFacebookCommentUrl(comment["sourceUrl"]))
  )
    problems.push("Facebook sourceUrl must identify an exact comment");
  return problems;
}
