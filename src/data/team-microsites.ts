/**
 * AHMV exact-team microsites: public presentation only, never a roster store.
 *
 * Louves M12B is supported by the team manager's supplied TeamLinkt captures,
 * NOT by the older AHMV directory's M12 A team ID. Do not interchange them.
 */
export type MicrositeModuleKey =
  | "schedule"
  | "gallery"
  | "documents"
  | "messages"
  | "roster"
  | "polls"
  | "challenges"
  | "fundraising"
  | "budget";

export type MicrositeModuleAccess = "public" | "private-provider" | "awaiting-approval";

export interface MicrositeModule {
  key: MicrositeModuleKey;
  title: { fr: string; en: string };
  description: { fr: string; en: string };
  access: MicrositeModuleAccess;
  /** A link is supplied only for a reviewed, existing public destination. */
  href?: string;
}

export interface TeamMicrositeDefinition {
  slug: string;
  name: { fr: string; en: string };
  level: string;
  categorySlug: string;
  accent: "louves" | "sport";
  /** No invented provider ID, roster, score, message count or membership. */
  exactProviderTeamId?: string;
  teamLinktIcalUrl?: string;
  teamLinktWidgetUrl?: string;
  logoUrl?: string;
  modules: readonly MicrositeModule[];
}

/**
 * The current directory has an older M12 A Louves record. M12B does not
 * inherit that identifier. The PDF week 6 record is review-only, so no
 * specific M12B event may become a confirmed public upcoming event yet.
 */
export const LOUVES_M12B_MICROSITE: TeamMicrositeDefinition = {
  slug: "louves-m12b",
  name: { fr: "Louves M12B", en: "Louves U12B" },
  level: "M12B",
  categorySlug: "feminin",
  accent: "louves",
  logoUrl: "/images/teams/louves-m12b-crest.webp",
  modules: [
    {
      key: "schedule",
      title: { fr: "Calendrier", en: "Schedule" },
      description: {
        fr: "Consulter l’horaire publié par AHM Verdun. Les activités M12B seront identifiées séparément après validation.",
        en: "Browse the AHM Verdun published schedule. Exact U12B events will be identified after review.",
      },
      access: "public",
      href: "/horaires?team=feminin",
    },
    {
      key: "gallery",
      title: { fr: "Photos et vidéos", en: "Photos & videos" },
      description: {
        fr: "Découvrir la galerie publique du hockey féminin AHMV, sans l’attribuer à cet effectif en particulier.",
        en: "Explore the public AHMV girls hockey gallery without attributing it to this exact roster.",
      },
      access: "public",
      href: "/galerie/hockey-feminin-2026-2027",
    },
    {
      key: "documents",
      title: { fr: "Documents", en: "Documents" },
      description: {
        fr: "Documents vérifiés de l’équipe, dès qu’ils seront autorisés pour la publication.",
        en: "Reviewed team documents will appear after publication approval.",
      },
      access: "awaiting-approval",
    },
    {
      key: "messages",
      title: { fr: "Messages", en: "Messages" },
      description: {
        fr: "Les discussions entre familles demeurent dans l’espace privé TeamLinkt.",
        en: "Family conversations stay in the private TeamLinkt team space.",
      },
      access: "private-provider",
    },
    {
      key: "roster",
      title: { fr: "Membres", en: "Members" },
      description: {
        fr: "La liste des joueuses et les données des mineurs ne sont pas publiques.",
        en: "Player rosters and minors’ information are not public.",
      },
      access: "private-provider",
    },
    {
      key: "polls",
      title: { fr: "Sondages", en: "Polls" },
      description: {
        fr: "Les réponses aux sondages sont réservées aux membres autorisés de TeamLinkt.",
        en: "Poll responses are for authorized TeamLinkt members only.",
      },
      access: "private-provider",
    },
    {
      key: "challenges",
      title: { fr: "Défis d’équipe", en: "Team challenges" },
      description: {
        fr: "Activités d’équipe à connecter quand le responsable partagera les droits nécessaires.",
        en: "Team activities will connect once the manager authorizes access.",
      },
      access: "awaiting-approval",
    },
    {
      key: "fundraising",
      title: { fr: "Financement", en: "Fundraising" },
      description: {
        fr: "Seules les campagnes confirmées, approuvées et associées à l’équipe seront présentées.",
        en: "Only approved, verified team campaigns will be presented.",
      },
      access: "awaiting-approval",
    },
    {
      key: "budget",
      title: { fr: "Budget", en: "Budget" },
      description: {
        fr: "Le budget opérationnel reste privé et sous le contrôle des responsables.",
        en: "Operating budgets remain private and controlled by team managers.",
      },
      access: "private-provider",
    },
  ],
};

/** Defensive contract consumed by all future cloned team microsites. */
export function getPublicMicrositeModules(site: TeamMicrositeDefinition) {
  return site.modules.map((module) => ({
    ...module,
    href: module.access === "public" && module.href?.startsWith("/") && !module.href.startsWith("//")
      ? module.href
      : undefined,
  }));
}
