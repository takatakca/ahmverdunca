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
  note?: Localized;
}

export const RESOURCES: Resource[] = [
  { id: "r1", name: "Hockey Québec", description: { fr: "Fédération provinciale : règlements, catégories, formation.", en: "Provincial federation: rules, categories, training." }, category: "minor", url: EXTERNAL_LINKS.hockeyQuebec, urlVerified: true },
  { id: "r2", name: "Hockey Canada", description: { fr: "Organisme national : programmes, sécurité, développement.", en: "National body: programs, safety, development." }, category: "development", url: EXTERNAL_LINKS.hockeyCanada, urlVerified: true },
  { id: "r3", name: "LNH", description: { fr: "Ligue nationale de hockey — site officiel.", en: "National Hockey League — official site." }, category: "pro", url: EXTERNAL_LINKS.nhl, urlVerified: true },
  { id: "r4", name: "Spordle", description: { fr: "Plateforme utilisée pour l'inscription hockey et les services officiels.", en: "Platform used for hockey registration and official services." }, category: "minor", url: EXTERNAL_LINKS.spordleRegister, urlVerified: true },
  { id: "r5", name: "WLLV — Les Chacals", description: { fr: "Hockey AA/BB de la région (Lac Saint-Louis / Verdun).", en: "Regional AA/BB hockey (Lac Saint-Louis / Verdun)." }, category: "minor", url: EXTERNAL_LINKS.wllv, urlVerified: true },
  { id: "r6", name: "Programme Timbits — Tim Hortons", description: { fr: "Programme d'initiation au sport pour les plus jeunes.", en: "Youth sports initiation program." }, category: "development", url: EXTERNAL_LINKS.timbits, urlVerified: true },
  {
    id: "r7",
    name: "Fondation Bon départ de Canadian Tire du Québec",
    description: { fr: "Fondation actuellement référencée par l'AHM Verdun dans son information sur l'aide financière.", en: "Foundation currently referenced by AHM Verdun in its financial-assistance information." },
    category: "funding",
    url: EXTERNAL_LINKS.bonDepartQuebec,
    urlVerified: true,
    note: { fr: "Vérifiez directement les programmes et critères disponibles auprès de la Fondation.", en: "Check available programs and eligibility directly with the Foundation." },
  },
  {
    id: "r8",
    name: "Fonds d'aide — Fondation Hockey Canada",
    description: { fr: "Programme d'aide financière de la Fondation Hockey Canada.", en: "Financial-assistance program from the Hockey Canada Foundation." },
    category: "funding",
    url: EXTERNAL_LINKS.hockeyCanadaAssistFund,
    urlVerified: true,
    note: { fr: "Au 1er octobre 2026, le portail indique que les fonds 2026–2027 ont déjà été consentis et invite les familles à s'inscrire aux avis pour 2027–2028.", en: "As of October 1, 2026, the portal says 2026–2027 funding has already been allocated and invites families to receive notices for 2027–2028." },
  },
  {
    id: "r9",
    name: "KidSport Québec",
    description: { fr: "Ressource externe additionnelle pour soutenir la participation sportive.", en: "Additional external resource supporting sport participation." },
    category: "funding",
    url: EXTERNAL_LINKS.kidsport,
    urlVerified: true,
    note: { fr: "L'admissibilité et les montants peuvent changer; consultez la source officielle.", en: "Eligibility and amounts can change; consult the official source." },
  },
  {
    id: "r10",
    name: "Bon départ / Jumpstart — subventions individuelles",
    description: { fr: "Ressource externe additionnelle pour les frais liés à la participation sportive.", en: "Additional external resource for sport participation costs." },
    category: "funding",
    url: EXTERNAL_LINKS.jumpstart,
    urlVerified: true,
    note: { fr: "L'admissibilité et la disponibilité peuvent changer; consultez la source officielle.", en: "Eligibility and availability can change; consult the official source." },
  },
];
