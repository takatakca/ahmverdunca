import type { Localized } from "@/lib/i18n";
import { PUBLIC_TEAM_DIRECTORY } from "@/data/team-directory";
import { SITE } from "@/lib/site";

export interface FacebookTeamAlbumManifestEntry {
  publicTeamId: string;
  categorySlug: string;
  level: string;
  teamName: string;
  season: string;
  reconciliationKey: string;
  expectedAlbumName: string;
  expectedDescription: Localized;
}

function teamDescriptor(categorySlug: string, level: string) {
  if (categorySlug === "feminin") return level;
  if (categorySlug === "junior") return `Junior ${level}`;
  return `${categorySlug.toUpperCase()} ${level}`;
}

function baseAlbumName(entry: (typeof PUBLIC_TEAM_DIRECTORY)[number]) {
  return `AHMV | ${teamDescriptor(entry.categorySlug, entry.level)} | ${entry.name} | ${SITE.season}`;
}

const baseNameCounts = new Map<string, number>();
for (const entry of PUBLIC_TEAM_DIRECTORY) {
  const name = baseAlbumName(entry);
  baseNameCounts.set(name, (baseNameCounts.get(name) ?? 0) + 1);
}

export const FACEBOOK_TEAM_ALBUM_MANIFEST: readonly FacebookTeamAlbumManifestEntry[] =
  PUBLIC_TEAM_DIRECTORY.map((entry) => {
    const baseName = baseAlbumName(entry);
    const collision = (baseNameCounts.get(baseName) ?? 0) > 1;
    const suffix = entry.legacyScheduleTeamId.slice(-4);
    const descriptor = teamDescriptor(entry.categorySlug, entry.level);

    return {
      publicTeamId: entry.legacyScheduleTeamId,
      categorySlug: entry.categorySlug,
      level: entry.level,
      teamName: entry.name,
      season: SITE.season,
      reconciliationKey: `ahmv:facebook:team:${entry.legacyScheduleTeamId}`,
      expectedAlbumName: collision ? `${baseName} | ${suffix}` : baseName,
      expectedDescription: {
        fr: `Photos, activités et moments de ${entry.name} — ${descriptor} — ${SITE.season}. Album d’équipe AHM Verdun.`,
        en: `Photos, activities and moments from ${entry.name} — ${descriptor} — ${SITE.season}. AHM Verdun team album.`,
      },
    };
  });
