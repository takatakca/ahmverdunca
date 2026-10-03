export type TeamSocialPlatform = "facebook" | "instagram";

export interface TeamSocialLink {
  /** Category-level account, for example the overall girls' hockey program. */
  teamSlug?: string;
  /** Exact public team identifier from the AHMV/GameData directory. */
  publicTeamId?: string;
  platform: TeamSocialPlatform;
  url: string;
}

/**
 * Only association-approved team accounts belong here.
 *
 * Keep this empty until an account is explicitly verified/authorized. The UI
 * automatically hides social controls when no approved account exists.
 *
 * Individual-team accounts should use publicTeamId so two teams with the same
 * display name remain distinct. Category-wide accounts may use teamSlug.
 */
export const TEAM_SOCIAL_LINKS: TeamSocialLink[] = [];

export function getTeamSocialLinks(teamSlug: string) {
  return TEAM_SOCIAL_LINKS.filter((item) => item.teamSlug === teamSlug);
}

export function getPublicTeamSocialLinks(publicTeamId: string) {
  return TEAM_SOCIAL_LINKS.filter((item) => item.publicTeamId === publicTeamId);
}
