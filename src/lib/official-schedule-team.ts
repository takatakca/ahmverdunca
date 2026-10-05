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

export function officialWeekActivityMatchesPublicTeam(
  activity: OfficialWeekActivity,
  team: PublicTeamDirectoryEntry,
) {
  const scope = normalizePublishedLabel(`${activity.group} ${activity.activity}`);
  const teamName = normalizePublishedLabel(team.name);
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
