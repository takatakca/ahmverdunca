import type { NewsCategory } from "@/data/news";
import { uploadedAhmvMediaById } from "@/data/uploaded-media";

const NEWS_VISUAL_IDS: Record<NewsCategory, number> = {
  feminine: 50,
  cancellations: 10,
  teams: 2,
  games: 52,
  tournaments: 26,
  camps: 40,
  registration: 39,
  association: 17,
  releases: 25,
};

/**
 * Contextual AHMV media for editorial cards when a story has no dedicated
 * image. The photo is presented as AHMV context, not as proof of the exact
 * people/event described by the story.
 */
export function newsVisualForCategory(category: NewsCategory) {
  return uploadedAhmvMediaById(NEWS_VISUAL_IDS[category]);
}
