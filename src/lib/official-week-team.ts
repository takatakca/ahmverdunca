import type { OfficialWeekActivity } from "@/data/official-week";
import type { PublicTeamDirectoryEntry } from "@/data/team-directory";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

function categoryToken(team: PublicTeamDirectoryEntry) {
  if (team.categorySlug === "feminin") return "M12";
  if (team.categorySlug === "junior") return "JUNIOR";
  return team.categorySlug.toUpperCase();
}

const COLOUR_GROUP = /\b(BLANC|BLEU|ROUGE|WHITE|BLUE|RED)\b/;

export function officialWeekActivityMatchesTeam(
  activity: OfficialWeekActivity,
  team: PublicTeamDirectoryEntry,
) {
  const scope = normalize(`${activity.group} ${activity.activity}`);
  const teamWords = normalize(team.name)
    .split(/\s+/)
    .filter((word) => word.length > 4 && word !== "VERDUN");

  if (teamWords.some((word) => scope.includes(word))) {
    return true;
  }

  const token = normalize(categoryToken(team));
  if (!scope.includes(token)) {
    return false;
  }

  // A colour-only group is not enough evidence to assign an activity to one
  // public team. Keep it in the central weekly schedule until the source names
  // the team or a reviewed mapping exists.
  if (COLOUR_GROUP.test(scope)) {
    return false;
  }

  return true;
}
