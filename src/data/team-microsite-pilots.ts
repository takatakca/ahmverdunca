/** Pilot microsites stay separate from the verified public GameData directory.
 * Never infer an official team ID, game, roster or result from a name.
 */
export type PilotTeamMicrosite = {
  slug: string;
  categorySlug: "feminin";
  name: string;
  level: string;
  crestSrc: string;
  verifiedOfficialTeamId?: string;
};

export const PILOT_TEAM_MICROSITES: readonly PilotTeamMicrosite[] = [
  {
    slug: "louves-m12b",
    categorySlug: "feminin",
    name: "Louves de Verdun",
    level: "M12B",
    crestSrc: "/images/teams/louves-m12b-crest.webp",
    // M12A exists in the public directory; its team ID must not be reused.
  },
];

export const getPilotTeamMicrosite = (slug: string) =>
  PILOT_TEAM_MICROSITES.find((team) => team.slug === slug);
