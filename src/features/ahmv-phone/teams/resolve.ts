import { PUBLIC_TEAM_DIRECTORY, type PublicTeamDirectoryEntry } from "../../../data/team-directory";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

export type TeamResolution =
  | { kind: "exact"; team: PublicTeamDirectoryEntry }
  | { kind: "ambiguous"; teams: PublicTeamDirectoryEntry[] }
  | { kind: "none"; teams: [] };

export function resolvePublicTeam(query: string): TeamResolution {
  const key = normalize(query);
  if (!key) return { kind: "none", teams: [] };

  const byId = PUBLIC_TEAM_DIRECTORY.find((item) => item.legacyScheduleTeamId === query.trim());
  if (byId) return { kind: "exact", team: byId };

  const exactNameMatches = PUBLIC_TEAM_DIRECTORY.filter(
    (item) => normalize(`${item.categorySlug} ${item.level} ${item.name}`) === key
      || normalize(item.name) === key,
  );
  if (exactNameMatches.length === 1) return { kind: "exact", team: exactNameMatches[0]! };
  if (exactNameMatches.length > 1) return { kind: "ambiguous", teams: exactNameMatches };

  const categoryLevelMatches = PUBLIC_TEAM_DIRECTORY.filter(
    (item) => normalize(`${item.categorySlug}${item.level}`) === key,
  );
  if (categoryLevelMatches.length === 1) return { kind: "exact", team: categoryLevelMatches[0]! };
  if (categoryLevelMatches.length > 1) return { kind: "ambiguous", teams: categoryLevelMatches };

  const categoryMatches = PUBLIC_TEAM_DIRECTORY.filter(
    (item) => normalize(item.categorySlug) === key,
  );
  if (categoryMatches.length) return { kind: "ambiguous", teams: categoryMatches };

  return { kind: "none", teams: [] };
}

export function compactTeamChoices(teams: PublicTeamDirectoryEntry[], max = 5) {
  return teams.slice(0, max).map((team) => `${team.categorySlug.toUpperCase()} ${team.level} ${team.name}`);
}
