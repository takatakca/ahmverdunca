/**
 * Illustrative image registry. All images here are AI-generated placeholders,
 * clearly marked in the UI, to be replaced by official AHMV photos.
 */
import heroHockey from "@/assets/hero-hockey.jpg";
import newsCancellation from "@/assets/news-cancellation.jpg";
import newsSeason from "@/assets/news-season.jpg";
import newsAcademy from "@/assets/news-academy.jpg";
import galleryParty from "@/assets/gallery-party.jpg";
import galleryFeminine from "@/assets/gallery-feminine.jpg";
import galleryTournament from "@/assets/gallery-tournament.jpg";

export const IMAGES: Record<string, string> = {
  "hero-hockey": heroHockey,
  "news-cancellation": newsCancellation,
  "news-season": newsSeason,
  "news-academy": newsAcademy,
  "gallery-party": galleryParty,
  "gallery-feminine": galleryFeminine,
  "gallery-tournament": galleryTournament,
};

export const img = (key?: string) => (key ? IMAGES[key] : undefined);
