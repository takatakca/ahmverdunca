import type { Team } from "@/data/teams";

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
