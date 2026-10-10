/**
 * TeamLinkt integration boundary: public widgets only, no access to chat or
 * player rosters. Administrator-provided URLs must be reviewed before use.
 *
 * Supported provider documentation:
 * https://help.teamlinkt.com/en/articles/4938768-embed-teamlinkt-widgets-on-an-external-website
 * https://help.teamlinkt.com/en/articles/4938653-subscribe-to-your-teamlinkt-calendar
 */
export type TeamLinktPublicWidget = "schedule" | "scores" | "standings" | "locations";

export interface TeamLinktPublicConfig {
  teamId: string;
  widgetType: TeamLinktPublicWidget;
  iframeSourceUrl: string;
  approved: boolean;
}

export type TeamLinktWidgetAssessment =
  | { status: "ready-for-private-review"; sanitizedUrl: string; teamId: string; widgetType: TeamLinktPublicWidget }
  | { status: "blocked"; reason: string };

const SUPPORTED_WIDGETS = new Set<string>(["schedule", "scores", "standings", "locations"]);

/**
 * Never embed unrestricted HTML or message threads returned from the provider.
 * It is the site operator's responsibility to confirm the exact approved
 * widget URL and that it exposes *public* data only.
 */
export function assessTeamLinktPublicWidget(config: TeamLinktPublicConfig): TeamLinktWidgetAssessment {
  if (!config.approved || !config.teamId.trim() || !SUPPORTED_WIDGETS.has(config.widgetType)) {
    return { status: "blocked", reason: "Team identity, widget type and owner approval are required" };
  }

  let url: URL;
  try {
    url = new URL(config.iframeSourceUrl);
  } catch {
    return { status: "blocked", reason: "Malformed widget URL" };
  }

  const host = url.hostname.toLowerCase();
  if (url.protocol !== "https:" || (host !== "teamlinkt.com" && !host.endsWith(".teamlinkt.com"))) {
    return { status: "blocked", reason: "Only HTTPS TeamLinkt-hosted public widgets are eligible" };
  }
  if (url.username || url.password || url.hash) {
    return { status: "blocked", reason: "Credentials or fragments are not accepted in widget URLs" };
  }
  if ([...url.searchParams.keys()].some((key) => /token|key|secret|password|auth|session/i.test(key))) {
    return { status: "blocked", reason: "No credential-bearing widget query parameters" };
  }
  return {
    status: "ready-for-private-review",
    sanitizedUrl: url.toString(),
    teamId: config.teamId,
    widgetType: config.widgetType,
  };
}

export interface TeamLinktCapabilityStatus {
  calendarSubscription: "documented-not-connected" | "configured";
  publicScheduleWidget: "documented-not-connected" | "configured";
  teamChat: "private-provider-only" | "provider-approved-embed";
}

/** Default is conservative: TeamLinkt chat remains inside TeamLinkt. */
export const TEAMLINKT_DEFAULT_CAPABILITIES: TeamLinktCapabilityStatus = {
  calendarSubscription: "documented-not-connected",
  publicScheduleWidget: "documented-not-connected",
  teamChat: "private-provider-only",
};
