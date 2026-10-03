import type { PublicTeamDirectoryEntry } from "@/data/team-directory";

export type TeamPortalServiceStatus =
  | "official"
  | "available"
  | "not_connected"
  | "connected"
  | "subscribed";

export type TeamPortalModule =
  | "schedule"
  | "results"
  | "social"
  | "news"
  | "photos"
  | "volunteers"
  | "fundraising"
  | "documents";

export interface TeamPortalService {
  module: TeamPortalModule;
  status: TeamPortalServiceStatus;
  provider: "AHMV" | "official-hockey" | "GROUPE TAKATAK";
}

/**
 * Public AHMV team mini-sites are presentation surfaces.
 *
 * Identity, social OAuth, subscriptions, provider tokens and cross-app
 * permissions belong to GROUPE TAKATAK. AHMV only receives approved,
 * tenant-scoped public content for the exact team ID.
 */
export function teamPortalServices(team: PublicTeamDirectoryEntry): TeamPortalService[] {
  void team;
  return [
    { module: "schedule", status: "official", provider: "official-hockey" },
    { module: "results", status: "official", provider: "official-hockey" },
    { module: "news", status: "available", provider: "AHMV" },
    { module: "photos", status: "available", provider: "AHMV" },
    { module: "volunteers", status: "available", provider: "AHMV" },
    { module: "documents", status: "available", provider: "AHMV" },
    { module: "fundraising", status: "not_connected", provider: "GROUPE TAKATAK" },
    { module: "social", status: "not_connected", provider: "GROUPE TAKATAK" },
  ];
}

export function teamPortalService(
  team: PublicTeamDirectoryEntry,
  module: TeamPortalModule,
) {
  return teamPortalServices(team).find((service) => service.module === module);
}

export const TAKATAK_TEAM_PORTAL_CONTRACT = {
  authority: "GROUPE TAKATAK",
  tenantKey: "publicTeamId",
  rules: [
    "AHMV never stores provider OAuth tokens.",
    "Every social connection is scoped to one exact public team ID.",
    "Disconnected providers render no stale feed.",
    "A connected provider without an active subscription renders no live feed.",
    "Published feed items must be approved for public display.",
    "No minor roster or private player data is accepted through the team portal.",
  ],
} as const;
