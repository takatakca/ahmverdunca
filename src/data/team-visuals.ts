import { uploadedAhmvMediaById } from "@/data/uploaded-media";

const TEAM_VISUAL_IDS: Record<string, number> = {
  m5: 47,
  m7: 2,
  m9: 3,
  m11: 52,
  m13: 51,
  m15: 53,
  m17: 48,
  m19: 54,
  m22: 1,
  feminin: 35,
};

/**
 * Contextual AHMV imagery for category presentation.
 *
 * These are association media-library photos used as atmosphere and navigation
 * visuals. They are not asserted to be the exact roster/team represented by a
 * category card unless separate team metadata explicitly says so.
 */
export function teamVisualForCategory(slug: string) {
  const id = TEAM_VISUAL_IDS[slug];
  return id ? uploadedAhmvMediaById(id) : undefined;
}
