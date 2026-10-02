import { canonicalLink } from "@/lib/seo";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { TEAMS } from "@/data/teams";
import { teamsForCategory } from "@/data/team-directory";
import { useI18n } from "@/lib/i18n";
import { usePreferredTeam } from "@/lib/team-preference";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/equipes/")({
  head: () => ({
    links: canonicalLink("/equipes"),
    meta: [
      { title: "Équipes et catégories — AHM Verdun" },
      { name: "description", content: "M5 à M18, Junior et hockey féminin : toutes les catégories de l'AHM Verdun pour la saison 2026–2027." },
      { property: "og:title", content: "Équipes et catégories — AHM Verdun" },
      { property: "og:description", content: "Toutes les catégories de l'AHM Verdun, avec page dédiée pour chacune." },
    ],
  }),
  component: TeamsPage,
});

function TeamsPage() {
  const { t, l, lang } = useI18n();
  const { preferredTeam, savePreferredTeam } = usePreferredTeam();

  return (
    <>
      <PageHeader
        eyebrow={`${t("common.season")} · 2026–2027`}
        title={t("teams.title")}
        description={lang === "fr"
          ? "Du premier coup de patin au parcours Junior : choisissez une catégorie pour retrouver son horaire, ses équipes publiques, ses arénas et ses informations."
          : "From the first skate to Junior: choose a category to find its schedule, public teams, arenas and information."}
      />

      <div className="container-site py-9 md:py-14">
        <div className="grid gap-px border border-navy/12 bg-navy/12 md:grid-cols-2">
          <div className="bg-navy p-6 text-navy-foreground md:p-8">
            <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Répertoire public" : "Public directory"}</p>
            <p className="mt-3 font-display text-4xl font-extrabold uppercase leading-[0.88] tracking-[-0.03em]">
              {lang === "fr" ? "Catégories d’abord." : "Categories first."}
            </p>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-navy-foreground/65">{t("teams.divisionsNote")}</p>
          </div>
          <div className="rink-surface p-6 md:p-8">
            <p className="eyebrow text-sport">{lang === "fr" ? "Confidentialité" : "Privacy"}</p>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">{t("teams.privacyNote")}</p>
          </div>
        </div>

        <div className="mt-9 border-t-2 border-navy">
          {TEAMS.map((team, index) => {
            const saved = preferredTeam === team.slug;
            const publicTeams = teamsForCategory(team.slug);
            return (
              <article
                key={team.slug}
                className={cn(
                  "group grid border-b border-navy/12 md:grid-cols-[5rem_8rem_minmax(0,1fr)_13rem] md:items-stretch",
                  saved && "bg-sport/[0.045]",
                )}
              >
                <div className="flex items-center py-5 md:border-r md:border-navy/10 md:py-7">
                  <span className="font-display text-4xl font-extrabold tracking-[-0.06em] text-navy/12">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <Link
                  to="/equipes/$slug"
                  params={{ slug: team.slug }}
                  className="flex items-center md:border-r md:border-navy/10 md:px-5"
                >
                  <span className="font-display text-5xl font-extrabold uppercase leading-none tracking-[-0.04em] text-navy transition-colors group-hover:text-sport">
                    {team.code}
                  </span>
                </Link>

                <Link to="/equipes/$slug" params={{ slug: team.slug }} className="py-5 md:px-6 md:py-7">
                  <div className="flex flex-wrap items-center gap-2">
                    {saved && (
                      <span className="bg-sport px-2 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-sport-foreground">
                        {lang === "fr" ? "Ma catégorie" : "My category"}
                      </span>
                    )}
                    {publicTeams.length > 0 && (
                      <span className="border border-navy/12 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                        {publicTeams.length} {lang === "fr" ? "équipe(s) publique(s)" : "public team(s)"}
                      </span>
                    )}
                  </div>
                  <h2 className="mt-3 font-display text-3xl font-extrabold uppercase leading-[0.9] text-navy md:text-4xl">
                    {l(team.name)}
                  </h2>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-sport">
                    {t("teams.ages")} · {l(team.ages)}
                  </p>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{l(team.description)}</p>
                </Link>

                <div className="flex flex-col justify-center gap-2 border-t border-navy/10 py-4 md:border-l md:border-t-0 md:px-5">
                  <Link
                    to="/equipes/$slug"
                    params={{ slug: team.slug }}
                    className="inline-flex min-h-11 items-center justify-between border border-navy/12 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-navy hover:border-sport hover:text-sport"
                  >
                    {lang === "fr" ? "Ouvrir" : "Open"} <ArrowRight className="size-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => savePreferredTeam(saved ? "" : team.slug)}
                    className={cn(
                      "min-h-11 border px-3 text-[10px] font-bold uppercase tracking-[0.13em] transition-colors",
                      saved
                        ? "border-sport bg-sport text-sport-foreground"
                        : "border-navy/12 bg-background text-navy hover:border-sport",
                    )}
                  >
                    {saved
                      ? (lang === "fr" ? "Mémorisée ✓" : "Saved ✓")
                      : (lang === "fr" ? "Définir comme mienne" : "Set as mine")}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </>
  );
}
