/**
 * Optional parent bag checklist for AHMV teams.
 * These are general packing reminders, NOT official safety-equipment rules.
 * No user identifiers, roster details or third-party data are collected.
 */
export const TEAM_ICE_BAG_ITEMS = [
  { id: "skates", fr: "Patins", en: "Skates" },
  { id: "helmet", fr: "Casque", en: "Helmet" },
  { id: "gloves", fr: "Gants", en: "Gloves" },
  { id: "stick", fr: "Bâton", en: "Stick" },
  { id: "neck-guard", fr: "Protège-cou", en: "Neck guard" },
  { id: "water", fr: "Gourde", en: "Water bottle" },
] as const;

export type TeamIceBagItemId = (typeof TEAM_ICE_BAG_ITEMS)[number]["id"];
export type TeamIceBagState = readonly TeamIceBagItemId[];

const VALID_ITEMS = new Set<string>(TEAM_ICE_BAG_ITEMS.map((item) => item.id));
const VALID_TEAM_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Only non-identifying booleans are allowed in this local-only preference. */
export function teamIceBagStorageKey(teamSlug: string): string | null {
  if (!VALID_TEAM_SLUG.test(teamSlug) || teamSlug.length > 80) return null;
  return `ahmv:ice-bag:v1:${teamSlug}`;
}

export function parseTeamIceBagState(raw: string | null): TeamIceBagItemId[] {
  if (!raw || raw.length > 512) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length > TEAM_ICE_BAG_ITEMS.length) return [];
    if (!parsed.every((id): id is string => typeof id === "string" && VALID_ITEMS.has(id))) {
      return [];
    }
    return [...new Set(parsed)] as TeamIceBagItemId[];
  } catch {
    return [];
  }
}

export function serializeTeamIceBagState(ids: TeamIceBagState): string {
  return JSON.stringify(
    TEAM_ICE_BAG_ITEMS.map((item) => item.id).filter((id) => ids.includes(id)),
  );
}

export function toggleTeamIceBagItem(
  previous: TeamIceBagState,
  id: TeamIceBagItemId,
): TeamIceBagItemId[] {
  if (!VALID_ITEMS.has(id)) return [...previous];
  return previous.includes(id)
    ? previous.filter((item) => item !== id)
    : [...previous, id];
}
