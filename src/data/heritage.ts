import type { Localized } from "@/lib/i18n";

export interface HeritageMilestone {
  id: string;
  title: Localized;
  description: Localized;
  timing: Localized;
}

export const HOCKEY_HERITAGE = {
  title: {
    fr: "125 ans d’histoire du hockey à Verdun",
    en: "125 years of hockey history in Verdun",
  },
  summary: {
    fr: "En 2027, Verdun soulignera 125 ans de hockey avec une programmation commémorative pensée pour réunir les générations, préserver les souvenirs et mettre en valeur celles et ceux qui ont bâti le hockey verdunois.",
    en: "In 2027, Verdun will mark 125 years of hockey with commemorative programming designed to bring generations together, preserve memories and recognize the people who built Verdun hockey.",
  },
  archiveCall: {
    fr: "Photos d’équipes, chandails, trophées, programmes, articles, vidéos, billets, rondelles et témoignages peuvent contribuer à la mémoire collective.",
    en: "Team photos, jerseys, trophies, programs, articles, videos, tickets, pucks and personal stories can contribute to the community archive.",
  },
  sourceUrl: "https://www.facebook.com/AHMVerdun",
  milestones: [
    {
      id: "winter-classic",
      title: { fr: "Classique hivernale", en: "Winter Classic" },
      description: {
        fr: "Un rendez-vous extérieur envisagé sur la patinoire Bleu Blanc Rouge du parc Willibrord pour renouer avec le hockey en plein air.",
        en: "An outdoor event envisioned for the Bleu Blanc Rouge rink at Willibrord Park, reconnecting with outdoor hockey.",
      },
      timing: { fr: "Projet 2027", en: "2027 project" },
    },
    {
      id: "exhibition",
      title: { fr: "Grande exposition historique", en: "Major historical exhibition" },
      description: {
        fr: "Photos, objets, chandails, archives, témoignages, équipes et personnalités marquantes réunis à Notre-Dame-des-Sept-Douleurs.",
        en: "Photos, objects, jerseys, archives, testimonials, teams and notable figures gathered at Notre-Dame-des-Sept-Douleurs.",
      },
      timing: { fr: "Été 2027", en: "Summer 2027" },
    },
    {
      id: "reunion",
      title: { fr: "Conventum des anciens", en: "Alumni reunion" },
      description: {
        fr: "Un grand rassemblement d’anciens joueurs, entraîneurs, dirigeants, bénévoles et bâtisseurs du hockey verdunois.",
        en: "A major gathering of former players, coaches, leaders, volunteers and builders of Verdun hockey.",
      },
      timing: { fr: "Juin 2027", en: "June 2027" },
    },
    {
      id: "souvenir",
      title: { fr: "Revue souvenir", en: "Commemorative publication" },
      description: {
        fr: "Une publication consacrée aux moments marquants, aux équipes et aux personnes qui ont façonné l’histoire du hockey à Verdun.",
        en: "A publication dedicated to memorable moments, teams and people who shaped hockey history in Verdun.",
      },
      timing: { fr: "Juin 2027", en: "June 2027" },
    },
  ] satisfies HeritageMilestone[],
} as const;

export const AHMV_SOCIAL_ARCHIVE_REFERENCES = [
  {
    id: "facebook-share-19JZX8MAwx",
    url: "https://www.facebook.com/share/19JZX8MAwx/",
    label: { fr: "Archive Facebook AHMV — hockey féminin M12", en: "AHMV Facebook archive — U12 girls hockey" },
    resolved: true,
  },
  {
    id: "facebook-share-1ETu9F11iM",
    url: "https://www.facebook.com/share/1ETu9F11iM/",
    label: { fr: "Archive Facebook AHMV à classer", en: "AHMV Facebook archive to classify" },
    resolved: false,
  },
  {
    id: "facebook-share-1EiHDV2MtQ",
    url: "https://www.facebook.com/share/1EiHDV2MtQ/",
    label: { fr: "Archive Facebook AHMV à classer", en: "AHMV Facebook archive to classify" },
    resolved: false,
  },
  {
    id: "facebook-share-19NFbfroz7",
    url: "https://www.facebook.com/share/19NFbfroz7/",
    label: { fr: "Archive Facebook AHMV à classer", en: "AHMV Facebook archive to classify" },
    resolved: false,
  },
  {
    id: "facebook-share-18mfCpFFa4",
    url: "https://www.facebook.com/share/18mfCpFFa4/",
    label: { fr: "Archive Facebook AHMV à classer", en: "AHMV Facebook archive to classify" },
    resolved: false,
  },
] as const;
