export type TeamSocialPlatform = "facebook" | "instagram";

export interface TeamSocialLink {
  teamSlug: string;
  platform: TeamSocialPlatform;
  url: string;
}

/**
 * Only association-approved team accounts belong here.
 *
 * Keep this empty until an account is explicitly authorized. The team page
 * hides the social section when no approved account exists, so public launch
 * never shows empty "coming soon" cards.
 */
export const TEAM_SOCIAL_LINKS: TeamSocialLink[] = [];

export function getTeamSocialLinks(teamSlug: string) {
  return TEAM_SOCIAL_LINKS.filter((item) => item.teamSlug === teamSlug);
}
