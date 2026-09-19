import type { Localized } from "@/lib/i18n";
import { EXTERNAL_LINKS } from "@/lib/site";

export type ResourceCategory = "minor" | "feminine" | "junior" | "senior" | "pro" | "training" | "equipment" | "development" | "funding";

export const RESOURCE_CATEGORIES: { id: ResourceCategory; label: Localized }[] = [
  { id: "minor", label: { fr: "Hockey mineur", en: "Minor hockey" } },
  { id: "feminine", label: { fr: "Hockey féminin", en: "Girls' hockey" } },
  { id: "junior", label: { fr: "Hockey junior", en: "Junior hockey" } },
  { id: "senior", label: { fr: "Hockey senior", en: "Senior hockey" } },
  { id: "pro", label: { fr: "Hockey professionnel", en: "Pro hockey" } },
  { id: "training", label: { fr: "Formation", en: "Training" } },
  { id: "equipment", label: { fr: "Équipement", en: "Equipment" } },
  { id: "development", label: { fr: "Développement des jeunes", en: "Youth development" } },
  { id: "funding", label: { fr: "Aides financières", en: "Financial assistance" } },
];

export interface Resource {
  id: string;
  name: string;
  description: Localized;
  category: ResourceCategory;
  url: string;
  urlVerified: boolean;
}

export const RESOURCES: Resource[] = [
  { id: "r1", name: "Hockey Québec", description: { fr: "Fédération provinciale : règlements, catégories, formation.", en: "Provincial federation: rules, categories, training." }, category: "minor", url: EXTERNAL_LINKS.hockeyQuebec, urlVerified: false },
  { id: "r2", name: "Hockey Canada", description: { fr: "Organisme national : programmes, sécurité, développement.", en: "National body: programs, safety, development." }, category: "development", url: EXTERNAL_LINKS.hockeyCanada, urlVerified: false },
  { id: "r3", name: "LNH", description: { fr: "Ligue nationale de hockey — site officiel.", en: "National Hockey League — official site." }, category: "pro", url: EXTERNAL_LINKS.nhl, urlVerified: false },
  { id: "r4", name: "Spordle", description: { fr: "Plateforme officielle d'inscription et de gestion des membres.", en: "Official registration and membership platform." }, category: "minor", url: EXTERNAL_LINKS.spordle, urlVerified: false },
  { id: "r5", name: "WLLV — Les Chacals", description: { fr: "Hockey AA/BB de la région (Lac Saint-Louis / Verdun).", en: "Regional AA/BB hockey (Lac Saint-Louis / Verdun)." }, category: "minor", url: EXTERNAL_LINKS.wllv, urlVerified: true },
  { id: "r6", name: "Programme Timbits — Tim Hortons", description: { fr: "Programme d'initiation au hockey pour les plus jeunes.", en: "Hockey initiation program for the youngest players." }, category: "development", url: EXTERNAL_LINKS.timbits, urlVerified: false },
  { id: "r7", name: "KidSport", description: { fr: "Aide financière pour permettre aux enfants de pratiquer un sport. Admissibilité selon les critères de l'organisme.", en: "Financial assistance so children can play sports. Eligibility per the organization's criteria." }, category: "funding", url: EXTERNAL_LINKS.kidsport, urlVerified: false },
  { id: "r8", name: "Bon départ — Canadian Tire", description: { fr: "Programme d'aide aux frais d'inscription et d'équipement. Aucune garantie d'admissibilité.", en: "Assistance with registration and equipment costs. No guarantee of eligibility." }, category: "funding", url: EXTERNAL_LINKS.jumpstart, urlVerified: false },
];
