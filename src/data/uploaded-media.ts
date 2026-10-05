import type { Localized } from "@/lib/i18n";

export type AhmvMediaCategory =
  | "training"
  | "teams"
  | "feminine"
  | "tournaments"
  | "community"
  | "schedules"
  | "registration"
  | "camps"
  | "association"
  | "press"
  | "branding"
  | "partners"
  | "events"
  | "news";

export const AHMV_MEDIA_CATEGORY_LABELS: Record<AhmvMediaCategory, Localized> = {
  training: { fr: "Entraînements", en: "Practices" },
  teams: { fr: "Équipes", en: "Teams" },
  feminine: { fr: "Hockey féminin", en: "Girls hockey" },
  tournaments: { fr: "Tournois et honneurs", en: "Tournaments & honours" },
  community: { fr: "Communauté", en: "Community" },
  schedules: { fr: "Horaires", en: "Schedules" },
  registration: { fr: "Inscriptions", en: "Registration" },
  camps: { fr: "Camps", en: "Camps" },
  association: { fr: "Association", en: "Association" },
  press: { fr: "Presse", en: "Press" },
  branding: { fr: "Identité AHMV", en: "AHMV identity" },
  partners: { fr: "Partenaires", en: "Partners" },
  events: { fr: "Événements", en: "Events" },
  news: { fr: "Nouvelles", en: "News" },
};

export interface UploadedAhmvMedia {
  id: number;
  url: string;
  sourceUrl: string;
  alt: Localized;
  label: Localized;
  category: AhmvMediaCategory;
  categoryLabel: Localized;
  kind: "photo" | "poster" | "document" | "schedule" | "branding";
  containsMinors: boolean;
  /** Exact AHMV public team/category slugs proven by this media item. Omit when unknown. */
  teamSlugs?: readonly string[];
  /** Exact season explicitly stated by the supplied media. Omit when unknown. */
  season?: string;
}

const BASE =
  "https://utuvzrqvivqyziibobvu.supabase.co/storage/v1/object/public/ahmv-media-public/imports/2026-10-04/public";

const META: Array<
  Omit<UploadedAhmvMedia, "url" | "sourceUrl" | "categoryLabel">
> = [
  { id: 1, category: "teams", kind: "photo", containsMinors: true, label: { fr: "Groupe AHMV sur la glace", en: "AHMV group on the ice" }, alt: { fr: "Jeunes joueurs et entraîneurs AHMV regroupés sur la glace.", en: "AHMV youth players and coaches gathered on the ice." } },
  { id: 2, category: "training", kind: "photo", containsMinors: true, label: { fr: "Séance d’entraînement jeunesse", en: "Youth practice session" }, alt: { fr: "Jeunes hockeyeurs AHMV pendant une séance d’entraînement.", en: "AHMV youth hockey players during a practice session." } },
  { id: 3, category: "training", kind: "photo", containsMinors: true, label: { fr: "Développement sur glace", en: "On-ice development" }, alt: { fr: "Groupe de jeunes joueurs AHMV en activité sur la patinoire.", en: "Group of AHMV youth players active on the rink." } },
  { id: 4, category: "training", kind: "photo", containsMinors: true, label: { fr: "Gardien en entraînement", en: "Goalie practice" }, alt: { fr: "Jeune gardien AHMV devant le filet pendant un entraînement.", en: "Young AHMV goalie in front of the net during practice." } },
  { id: 5, category: "training", kind: "photo", containsMinors: true, label: { fr: "Joueurs près des bandes", en: "Players by the boards" }, alt: { fr: "Deux jeunes joueurs de hockey à l’entraînement près des bandes.", en: "Two young hockey players practicing near the boards." } },
  { id: 6, category: "training", kind: "photo", containsMinors: true, label: { fr: "Encadrement des jeunes", en: "Youth coaching" }, alt: { fr: "Entraîneur et jeunes joueurs AHMV réunis sur la glace.", en: "Coach and AHMV youth players together on the ice." } },
  { id: 7, category: "branding", kind: "branding", containsMinors: false, label: { fr: "Bannière AHM Verdun", en: "AHM Verdun banner" }, alt: { fr: "Bannière promotionnelle AHM Verdun aux couleurs bleu, blanc et rouge.", en: "AHM Verdun promotional banner in blue, white and red." } },
  { id: 8, category: "branding", kind: "branding", containsMinors: false, label: { fr: "Identité visuelle Verdun", en: "Verdun visual identity" }, alt: { fr: "Création graphique du logo Verdun avec feuille d’érable et rondelle.", en: "Verdun logo graphic with maple leaf and hockey puck." } },
  { id: 9, teamSlugs: ["m11", "m13"], category: "association", kind: "document", containsMinors: false, label: { fr: "Structure des équipes M11 et M13", en: "U11 and U13 team structure" }, alt: { fr: "Capture d’une publication AHMV expliquant la structure des équipes M11 et M13.", en: "Screenshot of an AHMV post explaining U11 and U13 team structure." } },
  { id: 10, season: "2026-2027", category: "schedules", kind: "schedule", containsMinors: false, label: { fr: "Horaire hebdomadaire AHMV", en: "AHMV weekly schedule" }, alt: { fr: "Horaire hebdomadaire Leafs et Louves de Verdun pour la saison 2026-2027.", en: "Leafs and Louves de Verdun weekly schedule for the 2026-2027 season." } },
  { id: 11, category: "events", kind: "poster", containsMinors: true, label: { fr: "Clinique pédagogique de la Victoire", en: "Victoire development clinic" }, alt: { fr: "Affiche de la clinique journée pédagogique de la Victoire de Montréal à l’Auditorium de Verdun.", en: "Poster for the Victoire de Montréal development clinic at the Verdun Auditorium." } },
  { id: 12, season: "2026-2027", teamSlugs: ["feminin"], category: "feminine", kind: "poster", containsMinors: true, label: { fr: "Joueuses de tout niveau bienvenues", en: "Players of all levels welcome" }, alt: { fr: "Affiche AHMV invitant les joueuses de hockey de tout niveau pour la saison 2026-2027.", en: "AHMV poster welcoming girls hockey players of all levels for the 2026-2027 season." } },
  { id: 13, category: "press", kind: "photo", containsMinors: false, label: { fr: "Portrait d’archive", en: "Archive portrait" }, alt: { fr: "Portrait institutionnel provenant des archives remises à l’AHMV.", en: "Institutional portrait from material supplied to AHMV." } },
  { id: 14, category: "branding", kind: "branding", containsMinors: false, label: { fr: "Illustration hockey", en: "Hockey illustration" }, alt: { fr: "Illustration minimaliste d’une rondelle et d’un bâton sur une glace.", en: "Minimal illustration of a puck and hockey stick on ice." } },
  { id: 15, category: "branding", kind: "branding", containsMinors: true, label: { fr: "Bannière jeunesse AHMV", en: "AHMV youth banner" }, alt: { fr: "Illustration AHM Verdun avec de jeunes hockeyeurs sur la glace.", en: "AHM Verdun illustration with young hockey players on the ice." } },
  { id: 16, season: "2026-2027", teamSlugs: ["feminin"], category: "feminine", kind: "poster", containsMinors: true, label: { fr: "Programme féminin 2026-2027", en: "Girls program 2026-2027" }, alt: { fr: "Affiche complète du programme féminin AHMV M9F, M12F et M15F.", en: "Full AHMV girls hockey poster for U9F, U12F and U15F." } },
  { id: 17, category: "community", kind: "photo", containsMinors: false, label: { fr: "Allocution à l’Espace Scotty Bowman", en: "Address at Espace Scotty Bowman" }, alt: { fr: "Intervenant au micro devant le lutrin de l’Auditorium de Verdun.", en: "Speaker at a microphone beside the Verdun Auditorium lectern." } },
  { id: 18, category: "community", kind: "photo", containsMinors: false, label: { fr: "Rencontre communautaire à l’Auditorium", en: "Community gathering at the Auditorium" }, alt: { fr: "Quatre adultes réunis lors d’un événement communautaire à l’Auditorium de Verdun.", en: "Four adults together at a community event at the Verdun Auditorium." } },
  { id: 19, category: "community", kind: "photo", containsMinors: true, label: { fr: "Remise à un jeune participant", en: "Youth participant presentation" }, alt: { fr: "Jeune participant tenant un sac remis lors d’un événement communautaire.", en: "Young participant holding a bag presented at a community event." } },
  { id: 20, category: "community", kind: "photo", containsMinors: true, label: { fr: "Remise de matériel jeunesse", en: "Youth equipment presentation" }, alt: { fr: "Adulte et jeune participant posant avec un sac de sport remis à l’événement.", en: "Adult and young participant posing with a sports bag presented at the event." } },
  { id: 21, category: "community", kind: "photo", containsMinors: true, label: { fr: "Jeunes récipiendaires", en: "Youth recipients" }, alt: { fr: "Jeunes participants tenant leurs récompenses lors d’une activité communautaire.", en: "Young participants holding their awards at a community activity." } },
  { id: 22, category: "community", kind: "photo", containsMinors: true, label: { fr: "Photo avec jeunes participants", en: "Photo with youth participants" }, alt: { fr: "Deux jeunes participants posent avec un représentant lors de l’événement.", en: "Two young participants pose with a representative during the event." } },
  { id: 23, category: "community", kind: "photo", containsMinors: true, label: { fr: "Reconnaissance jeunesse", en: "Youth recognition" }, alt: { fr: "Deux jeunes participants et une représentante lors d’une remise de reconnaissance.", en: "Two young participants and a representative during a recognition presentation." } },
  { id: 24, category: "community", kind: "photo", containsMinors: true, label: { fr: "Présentation devant les familles", en: "Presentation for families" }, alt: { fr: "Présentation à l’Espace Scotty Bowman devant des familles et jeunes participants.", en: "Presentation at Espace Scotty Bowman before families and young participants." } },
  { id: 25, category: "press", kind: "document", containsMinors: false, label: { fr: "Article sur la relance et les coûts de glace", en: "Article on the relaunch and ice costs" }, alt: { fr: "Article de presse sur la relance de l’AHMV et le modèle financier des coûts de glace.", en: "Press article about the AHMV relaunch and the financial model for ice costs." } },
  { id: 26, teamSlugs: ["m11"], category: "tournaments", kind: "poster", containsMinors: false, label: { fr: "30e Tournoi Atome de Verdun M11", en: "30th Verdun Atom U11 Tournament" }, alt: { fr: "Affiche de la 30e édition du Tournoi Atome de Verdun M11, janvier 2027.", en: "Poster for the 30th Verdun Atom U11 Tournament in January 2027." } },
  { id: 27, season: "2026-2027", teamSlugs: ["feminin"], category: "feminine", kind: "poster", containsMinors: true, label: { fr: "Hockey féminin — inscription", en: "Girls hockey — registration" }, alt: { fr: "Affiche AHMV pour l’inscription au hockey féminin 2026-2027.", en: "AHMV girls hockey registration poster for 2026-2027." } },
  { id: 28, category: "community", kind: "photo", containsMinors: false, label: { fr: "Rencontre sportive", en: "Sports community meeting" }, alt: { fr: "Deux adultes posant ensemble lors d’une activité sportive communautaire.", en: "Two adults posing together at a sports community activity." } },
  { id: 29, season: "2026-2027", category: "schedules", kind: "schedule", containsMinors: false, label: { fr: "Horaire du 7 au 13 septembre", en: "September 7–13 schedule" }, alt: { fr: "Horaire AHMV du 7 au 13 septembre pour la saison 2026-2027.", en: "AHMV schedule for September 7–13 in the 2026-2027 season." } },
  { id: 30, season: "2026-2027", teamSlugs: ["feminin"], category: "feminine", kind: "poster", containsMinors: true, label: { fr: "Portes ouvertes hockey féminin", en: "Girls hockey open house" }, alt: { fr: "Affiche AHMV annonçant les portes ouvertes du hockey féminin et les catégories 2026-2027.", en: "AHMV poster announcing the girls hockey open house and 2026-2027 categories." } },
  { id: 31, category: "partners", kind: "document", containsMinors: false, label: { fr: "Offre d’emploi ÉTS — page 1", en: "ÉTS job posting — page 1" }, alt: { fr: "Première page de l’offre d’emploi des Piranhas de l’ÉTS pour un préposé à l’équipement.", en: "First page of the ÉTS Piranhas equipment attendant job posting." } },
  { id: 32, category: "partners", kind: "document", containsMinors: false, label: { fr: "Offre d’emploi ÉTS — page 2", en: "ÉTS job posting — page 2" }, alt: { fr: "Deuxième page de l’offre d’emploi des Piranhas de l’ÉTS.", en: "Second page of the ÉTS Piranhas job posting." } },
  { id: 33, category: "teams", kind: "photo", containsMinors: true, label: { fr: "Portrait de gardien", en: "Goalie portrait" }, alt: { fr: "Portrait d’un jeune gardien de hockey en équipement devant son filet.", en: "Portrait of a young hockey goalie in equipment in front of the net." } },
  { id: 34, category: "camps", kind: "schedule", containsMinors: false, label: { fr: "Camp WLLV — horaire officiel", en: "WLLV camp — official schedule" }, alt: { fr: "Horaire officiel du camp WLLV pour les catégories M11 à M19.", en: "Official WLLV camp schedule for U11 through U19 categories." } },
  { id: 35, teamSlugs: ["feminin"], category: "feminine", kind: "photo", containsMinors: true, label: { fr: "Groupe hockey féminin AHMV", en: "AHMV girls hockey group" }, alt: { fr: "Groupe de jeunes joueuses AHMV avec leur personnel sur la glace.", en: "Group of AHMV youth girls hockey players with staff on the ice." } },
  { id: 36, teamSlugs: ["feminin"], category: "feminine", kind: "photo", containsMinors: true, label: { fr: "Entraînement hockey féminin", en: "Girls hockey practice" }, alt: { fr: "Joueuses AHMV participant à un exercice sur glace.", en: "AHMV girls hockey players taking part in an on-ice drill." } },
  { id: 37, category: "association", kind: "poster", containsMinors: false, label: { fr: "Recrutement de bénévoles", en: "Volunteer recruitment" }, alt: { fr: "Affiche bilingue AHMV recrutant des bénévoles pour la saison.", en: "Bilingual AHMV volunteer recruitment poster for the season." } },
  { id: 38, category: "news", kind: "poster", containsMinors: false, label: { fr: "Promotion LNH — Anthony Lapointe", en: "NHL promotion — Anthony Lapointe" }, alt: { fr: "Visuel Hockey Québec annonçant la promotion LNH d’Anthony Lapointe.", en: "Hockey Québec graphic announcing Anthony Lapointe’s NHL promotion." } },
  { id: 39, season: "2026-2027", category: "registration", kind: "poster", containsMinors: false, label: { fr: "Inscriptions saison 2026-2027", en: "2026-2027 season registration" }, alt: { fr: "Affiche AHM Verdun pour les inscriptions de la saison 2026-2027.", en: "AHM Verdun registration poster for the 2026-2027 season." } },
  { id: 40, season: "2026-2027", category: "camps", kind: "poster", containsMinors: false, label: { fr: "Camp de sélection WLLV Chacals", en: "WLLV Chacals selection camp" }, alt: { fr: "Affiche du camp de sélection WLLV Chacals pour la saison 2026-2027.", en: "WLLV Chacals selection camp poster for the 2026-2027 season." } },
  { id: 41, season: "2026-2027", category: "registration", kind: "poster", containsMinors: false, label: { fr: "Inscriptions AHMV — variante", en: "AHMV registration — alternate" }, alt: { fr: "Deuxième visuel AHM Verdun pour les inscriptions 2026-2027.", en: "Second AHM Verdun registration graphic for 2026-2027." } },
  { id: 42, category: "community", kind: "photo", containsMinors: false, label: { fr: "Événement civique à Verdun", en: "Verdun civic event" }, alt: { fr: "Participants réunis autour d’un lutrin lors d’un événement communautaire à Verdun.", en: "Participants gathered around a lectern at a Verdun community event." } },
  { id: 43, category: "community", kind: "photo", containsMinors: false, label: { fr: "Photo de groupe avec trophée", en: "Group photo with trophy" }, alt: { fr: "Groupe réuni sur un escalier autour d’un trophée lors d’une activité à Verdun.", en: "Group gathered on a staircase around a trophy at a Verdun event." } },
  { id: 44, category: "community", kind: "photo", containsMinors: false, label: { fr: "Rencontre communautaire", en: "Community gathering" }, alt: { fr: "Groupe de participants lors d’une rencontre communautaire à Verdun.", en: "Group of participants at a Verdun community gathering." } },
  { id: 45, category: "community", kind: "photo", containsMinors: false, label: { fr: "Public lors d’un événement", en: "Audience at an event" }, alt: { fr: "Participants applaudissant lors d’un événement communautaire.", en: "Participants applauding at a community event." } },
  { id: 46, teamSlugs: ["feminin"], category: "feminine", kind: "photo", containsMinors: true, label: { fr: "Joueuses aux bandes", en: "Players by the boards" }, alt: { fr: "Jeunes joueuses de hockey AHMV vues près des bandes de la patinoire.", en: "Young AHMV girls hockey players seen near the rink boards." } },
  { id: 47, category: "training", kind: "photo", containsMinors: true, label: { fr: "Parcours d’habiletés", en: "Skills course" }, alt: { fr: "Jeunes joueurs AHMV réalisant un exercice avec cônes sur la glace.", en: "AHMV youth players completing a cone drill on the ice." } },
  { id: 48, category: "training", kind: "photo", containsMinors: true, label: { fr: "Grand groupe d’entraînement", en: "Large practice group" }, alt: { fr: "Large groupe de jeunes hockeyeurs AHMV pendant un entraînement.", en: "Large group of AHMV youth hockey players during practice." } },
  { id: 49, category: "press", kind: "document", containsMinors: false, label: { fr: "Article — présidence de l’AHMV", en: "Article — AHMV presidency" }, alt: { fr: "Article communautaire portant sur la présidence de l’Association du hockey mineur de Verdun.", en: "Community article about the presidency of the Verdun Minor Hockey Association." } },
  { id: 50, teamSlugs: ["feminin"], category: "feminine", kind: "photo", containsMinors: true, label: { fr: "Équipe finaliste M12", en: "U12 finalist team" }, alt: { fr: "Équipe de jeunes joueuses de Verdun posant avec une bannière de finalistes M12.", en: "Verdun girls team posing with a U12 finalist banner." } },
  { id: 51, category: "training", kind: "photo", containsMinors: true, label: { fr: "Photo de groupe sur glace", en: "On-ice group photo" }, alt: { fr: "Jeunes joueurs et entraîneurs AHMV réunis pour une photo de groupe sur la glace.", en: "AHMV youth players and coaches gathered for an on-ice group photo." } },
  { id: 52, category: "tournaments", kind: "photo", containsMinors: true, label: { fr: "Équipe en célébration", en: "Team celebration" }, alt: { fr: "Équipe de hockey jeunesse de Verdun réunie pour une photo de célébration.", en: "Verdun youth hockey team gathered for a celebration photo." } },
  { id: 53, category: "teams", kind: "photo", containsMinors: true, label: { fr: "Photo d’équipe AHMV", en: "AHMV team photo" }, alt: { fr: "Équipe de hockey jeunesse AHMV posant ensemble sur la glace.", en: "AHMV youth hockey team posing together on the ice." } },
  { id: 54, category: "tournaments", kind: "photo", containsMinors: true, label: { fr: "Souvenir de tournoi", en: "Tournament memory" }, alt: { fr: "Groupe de jeunes hockeyeurs de Verdun posant après un événement ou tournoi.", en: "Group of Verdun youth hockey players posing after an event or tournament." } },
];

const mediaUrl = (id: number) => `${BASE}/ahmv-media-${String(id).padStart(3, "0")}.jpg`;

export const UPLOADED_AHMV_MEDIA: readonly UploadedAhmvMedia[] = META.map((item) => ({
  ...item,
  url: mediaUrl(item.id),
  sourceUrl: mediaUrl(item.id),
  categoryLabel: AHMV_MEDIA_CATEGORY_LABELS[item.category],
}));

/**
 * Public imported media must fail closed for youth privacy.
 *
 * Supabase tracks consent separately from this static migration manifest. Until
 * a server-side consent lookup is wired into the public gallery, imported
 * assets known to contain minors are never included in the public collection.
 * Official media that was already publicly published by AHMV is maintained in
 * the separate official-media registry and is not governed by this fallback.
 */
export const PUBLIC_UPLOADED_AHMV_MEDIA: readonly UploadedAhmvMedia[] =
  UPLOADED_AHMV_MEDIA.filter((asset) => !asset.containsMinors);

export const uploadedAhmvMediaById = (id: number) =>
  UPLOADED_AHMV_MEDIA.find((asset) => asset.id === id);

export const publicUploadedAhmvMediaById = (id: number) =>
  PUBLIC_UPLOADED_AHMV_MEDIA.find((asset) => asset.id === id);
