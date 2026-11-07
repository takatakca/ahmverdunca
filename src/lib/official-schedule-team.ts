import type { Team } from "@/data/teams";
import type { PublicTeamDirectoryEntry } from "@/data/team-directory";
import type { OfficialWeekActivity } from "@/data/official-week";

export function officialScheduleTermsForTeam(team: Team | undefined) {
  if (!team) return [] as string[];

  if (team.slug === "feminin") {
    return ["Louves", "fille"];
  }

  if (team.slug === "junior") {
    return ["M22", "junior"];
  }

  return team.code.startsWith("M") ? [team.code] : [];
}

export function officialScheduleQueryForTeam(team: Team | undefined) {
  return officialScheduleTermsForTeam(team)[0] ?? "";
}


const EXPLICIT_TEAM_NAMES = [
  "LEAFS",
  "BULLDOGS",
  "BRONCOS",
  "COYOTES",
  "DUCKS",
  "FLAMES",
  "JETS",
  "OILERS",
  "DYNAMOS",
  "LOUVES",
] as const;

function normalizePublishedLabel(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

export type LouvesSide = "A" | "B";

/**
 * Louves teams a published label names: "M12 Louves A", "M12 B louves",
 * "Louves A et B", "M12 Louves A et M12 Louves B". An empty set means the label
 * names no side ("M12 Louves"), i.e. it concerns both teams.
 */
export function louvesSidesInLabel(label: string) {
  const scope = normalizePublishedLabel(label);
  const sides = new Set<LouvesSide>();
  if (!scope.includes("LOUVE")) return sides;
  if (/LOUVES?\s+A\b|\bA\s+LOUVES?\b/.test(scope)) sides.add("A");
  if (/LOUVES?\s+(?:A\s+ET\s+)?B\b|\bB\s+LOUVES?\b/.test(scope)) sides.add("B");
  return sides;
}

/** Whether an activity concerns a given Louves team (an unspecified label concerns both). */
export function officialWeekActivityConcernsLouves(activity: OfficialWeekActivity, side: LouvesSide) {
  const sides = louvesSidesInLabel(activity.group);
  return normalizePublishedLabel(activity.group).includes("LOUVE") && (sides.size === 0 || sides.has(side));
}

export function officialWeekActivityMatchesPublicTeam(
  activity: OfficialWeekActivity,
  team: PublicTeamDirectoryEntry,
) {
  const scope = normalizePublishedLabel(`${activity.group} ${activity.activity}`);
  const teamName = normalizePublishedLabel(team.name);

  // Louves A and Louves B are distinct teams: match the side the label names.
  if (scope.includes("LOUVE") && team.categorySlug === "feminin") {
    const teamSide = /\bM12\s*B\b/.test(normalizePublishedLabel(team.level)) ? "B" : "A";
    return officialWeekActivityConcernsLouves(activity, teamSide);
  }
  const explicitNames = EXPLICIT_TEAM_NAMES.filter((name) => scope.includes(name));

  if (explicitNames.length > 0) {
    return explicitNames.some((name) => teamName.includes(name));
  }

  if (scope.includes("HOCKEY SUR MESURE")) {
    return team.level === "Hockey sur mesure";
  }

  if (scope.includes("LOUVE")) {
    return team.categorySlug === "feminin";
  }

  if (/\b(BLANC|BLEU|ROUGE)\b/.test(scope)) {
    return false;
  }

  const categoryToken =
    team.categorySlug === "feminin"
      ? "M12"
      : team.categorySlug === "junior"
        ? "JUNIOR"
        : team.categorySlug.toUpperCase();

  return scope.includes(categoryToken);
}
