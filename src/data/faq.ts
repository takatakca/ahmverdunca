import type { Localized } from "@/lib/i18n";

/**
 * Knowledge base shared by the FAQ page and the future AHMV assistant.
 * Single source — never duplicate answers. Answers marked `validated: false`
 * are structural placeholders awaiting official text.
 */
export type FaqTopic = "registration" | "schedules" | "cancellations" | "equipment" | "arenas" | "categories" | "feminine" | "coaches" | "funding" | "volunteering";

export const FAQ_TOPICS: { id: FaqTopic; label: Localized }[] = [
  { id: "registration", label: { fr: "Inscriptions", en: "Registration" } },
  { id: "schedules", label: { fr: "Horaires", en: "Schedules" } },
  { id: "cancellations", label: { fr: "Annulations", en: "Cancellations" } },
  { id: "equipment", label: { fr: "Équipement", en: "Equipment" } },
  { id: "arenas", label: { fr: "Arénas", en: "Arenas" } },
  { id: "categories", label: { fr: "Catégories", en: "Categories" } },
  { id: "feminine", label: { fr: "Hockey féminin", en: "Girls' hockey" } },
  { id: "coaches", label: { fr: "Entraîneurs", en: "Coaches" } },
  { id: "funding", label: { fr: "Financement", en: "Funding" } },
  { id: "volunteering", label: { fr: "Bénévolat", en: "Volunteering" } },
];

export interface FaqItem {
  id: string;
  topic: FaqTopic;
  question: Localized;
  answer: Localized;
  sourcePath?: string; // page the assistant should cite
  validated: boolean;
}

export const FAQ: FaqItem[] = [
  { id: "f1", topic: "registration", question: { fr: "Comment inscrire mon enfant ?", en: "How do I register my child?" }, answer: { fr: "Les inscriptions se font exclusivement sur la plateforme officielle Spordle. La page Inscriptions du site explique les étapes et mène directement au formulaire Spordle.", en: "Registration is done exclusively on the official Spordle platform. The Registration page explains the steps and links directly to the Spordle form." }, sourcePath: "/inscriptions", validated: true },
  { id: "f2", topic: "schedules", question: { fr: "Comment trouver son horaire ?", en: "How do I find my schedule?" }, answer: { fr: "Ouvrez la page Horaires, choisissez la semaine puis filtrez par équipe. Vous pouvez aussi passer par la page de votre équipe, dont le calendrier est déjà filtré.", en: "Open the Schedules page, choose the week, then filter by team. You can also open your team's page, where the calendar is already filtered." }, sourcePath: "/horaires", validated: true },
  { id: "f3", topic: "cancellations", question: { fr: "Que faire lorsqu'une activité est annulée ?", en: "What should I do when an activity is cancelled?" }, answer: { fr: "Les annulations publiées par l'AHM Verdun sont mises en évidence dans l'horaire lorsqu'elles sont présentes dans la source officielle. Pour une décision de dernière minute ou une reprise, vérifiez toujours la source hockey officielle indiquée sur la page Horaires.", en: "Cancellations published by AHM Verdun are highlighted in the schedule when they appear in the official source. For last-minute decisions or make-up activity information, always check the official hockey source shown on the Schedules page." }, sourcePath: "/horaires", validated: true },
  { id: "f4", topic: "arenas", question: { fr: "Où trouver l'aréna ?", en: "Where is the arena?" }, answer: { fr: "La page Arénas répertorie les installations utilisées avec leur adresse vérifiée et un bouton Itinéraire Google Maps. L'horaire officiel permet aussi d'ouvrir directement un itinéraire pour l'activité affichée.", en: "The Arenas page lists used facilities with verified addresses and a Google Maps Directions button. The official schedule also provides direct directions for displayed activities." }, sourcePath: "/arenas", validated: true },
  { id: "f5", topic: "equipment", question: { fr: "Quel équipement est nécessaire ?", en: "What equipment is required?" }, answer: { fr: "La liste d'équipement obligatoire selon la catégorie sera publiée à partir des directives officielles de l'association et de Hockey Québec.", en: "The mandatory equipment list per category will be published from the association's and Hockey Québec's official guidelines." }, sourcePath: "/ressources", validated: false },
  { id: "f6", topic: "volunteering", question: { fr: "Comment devenir bénévole ?", en: "How can I volunteer?" }, answer: { fr: "L'association compte sur ses bénévoles. La page Contact regroupera le canal officiel de recrutement dès qu'il aura été confirmé par l'AHM Verdun.", en: "The association relies on volunteers. The Contact page will provide the official recruitment channel once confirmed by AHM Verdun." }, sourcePath: "/contact", validated: false },
  { id: "f7", topic: "funding", question: { fr: "Existe-t-il des aides financières ?", en: "Is financial assistance available?" }, answer: { fr: "Oui, certaines ressources externes peuvent aider. L'AHM Verdun référence notamment la Fondation Bon départ de Canadian Tire du Québec et le Fonds d'aide de la Fondation Hockey Canada. La disponibilité et l'admissibilité changent : consultez toujours la page Ressources et la source officielle.", en: "Yes. External resources may help. AHM Verdun currently references the Canadian Tire Quebec Bon départ Foundation and the Hockey Canada Foundation Assist Fund. Availability and eligibility change, so always check the Resources page and the official source." }, sourcePath: "/ressources", validated: true },
  { id: "f8", topic: "categories", question: { fr: "Quelle catégorie correspond à l'âge de mon enfant ?", en: "Which category matches my child's age?" }, answer: { fr: "Les catégories vont de M5 à M18, puis Junior. La page Équipes présente les tranches d'âge indicatives; la répartition officielle suit les règles de Hockey Québec.", en: "Categories range from U5 to U18, then Junior. The Teams page shows indicative age ranges; the official breakdown follows Hockey Québec rules." }, sourcePath: "/equipes", validated: false },
  { id: "f9", topic: "feminine", question: { fr: "Y a-t-il un programme de hockey féminin ?", en: "Is there a girls' hockey program?" }, answer: { fr: "Oui. Pour 2026–2027, l'AHM Verdun a annoncé des inscriptions M9 Féminin et M12 Féminin. Les informations et modalités peuvent évoluer selon les inscriptions; utilisez la page officielle d'inscription pour la situation à jour.", en: "Yes. For 2026–2027, AHM Verdun announced U9 Girls and U12 Girls registration. Details may evolve based on registrations; use the official registration page for the current status." }, sourcePath: "/equipes/feminin", validated: true },
  { id: "f10", topic: "coaches", question: { fr: "Comment devenir entraîneur ?", en: "How do I become a coach?" }, answer: { fr: "La Zone entraîneurs donne accès aux liens actuellement publiés par l'AHM Verdun : devenir entraîneur, Respect et sport, formations M7–M9, M11–Junior et formation de soigneur.", en: "The Coaches' zone links to the resources currently published by AHM Verdun: becoming a coach, Respect in Sport, U7–U9 and U11–Junior training, plus trainer training." }, sourcePath: "/entraineurs", validated: true },
];
