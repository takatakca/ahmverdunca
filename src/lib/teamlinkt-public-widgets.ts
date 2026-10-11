/**
 * TeamLinkt publicly documents iframe widgets for Schedule, Scores, Standings
 * and Locations on third-party websites:
 * https://help.teamlinkt.com/en/articles/4938768-embed-teamlinkt-widgets-on-an-external-website
 *
 * A league administrator must copy the approved PUBLIC widget iframe URL from
 * Website > Builder > Widgets and provide publication approval. There is no
 * inferred public API, private TeamLinkt chat, account token or roster access.
 */
export type TeamLinktPublicWidgetKind = "schedule" | "scores" | "standings" | "locations";

export type TeamLinktPublicWidgets = Partial<Record<TeamLinktPublicWidgetKind, string>>;

const TEAMLINKT_HOST = "teamlinkt.com";

/** Validate vendor origins and reject credentials, fragments and insecure URLs. */
export function approvedTeamLinktWidgetSrc(raw: string | undefined): string | null {
  if (!raw || raw.trim().length === 0 || raw.length > 2048) return null;

  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();
    if (url.protocol !== "https:") return null;
    if (!(host === TEAMLINKT_HOST || host.endsWith(`.${TEAMLINKT_HOST}`))) return null;
    if (url.username || url.password || url.hash) return null;
    if (url.port && url.port !== "443") return null;
    if (!url.pathname.startsWith("/") || url.pathname.includes("..")) return null;
    return url.href;
  } catch {
    return null;
  }
}

export function publicTeamLinktWidgetFor(
  widgets: TeamLinktPublicWidgets | undefined,
  kind: TeamLinktPublicWidgetKind,
): string | null {
  return approvedTeamLinktWidgetSrc(widgets?.[kind]);
}
