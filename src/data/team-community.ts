import type { Localized } from "@/lib/i18n";

export interface TeamCommunityPost {
  id: string;
  publicTeamId: string;
  title: Localized;
  excerpt: Localized;
  publishedAt: string;
  sourceUrl?: string;
}

export interface TeamVolunteerNeed {
  id: string;
  publicTeamId: string;
  title: Localized;
  description: Localized;
  neededUntil?: string;
}

export interface TeamFundraisingCampaign {
  id: string;
  publicTeamId: string;
  title: Localized;
  description: Localized;
  beneficiary: string;
  goalCents: number;
  paymentUrl: string;
  paymentVerified: boolean;
  status: "active" | "closed";
}

export interface TeamDocument {
  id: string;
  publicTeamId: string;
  title: Localized;
  url: string;
  publishedAt: string;
}

/**
 * Public, reviewed team-community records only.
 *
 * These collections intentionally start empty. Content may be added after human
 * review or replaced by an approved GROUPE TAKATAK/AHMV ingestion endpoint.
 * Never put roster information or private minor data here.
 */
export const TEAM_COMMUNITY_POSTS: TeamCommunityPost[] = [];
export const TEAM_VOLUNTEER_NEEDS: TeamVolunteerNeed[] = [];
export const TEAM_FUNDRAISING_CAMPAIGNS: TeamFundraisingCampaign[] = [];
export const TEAM_DOCUMENTS: TeamDocument[] = [];

export const communityPostsForTeam = (publicTeamId: string) =>
  TEAM_COMMUNITY_POSTS.filter((item) => item.publicTeamId === publicTeamId);

export const volunteerNeedsForTeam = (publicTeamId: string) =>
  TEAM_VOLUNTEER_NEEDS.filter((item) => item.publicTeamId === publicTeamId);

export const fundraisingCampaignsForTeam = (publicTeamId: string) =>
  TEAM_FUNDRAISING_CAMPAIGNS.filter(
    (item) => item.publicTeamId === publicTeamId && item.status === "active" && item.paymentVerified,
  );

export const documentsForTeam = (publicTeamId: string) =>
  TEAM_DOCUMENTS.filter((item) => item.publicTeamId === publicTeamId);
