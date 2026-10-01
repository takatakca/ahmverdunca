import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { TEAMS } from "@/data/teams";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/equipes/")({
  head: () => ({
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
  const { t, l } = useI18n();
  return (
    <>
      <PageHeader eyebrow={t("common.season")} title={t("teams.title")} description={t("teams.subtitle")} />
      <div className="container-site py-8 md:py-12">
        <div className="mb-7 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-ice p-5">
            <p className="eyebrow text-sport">{t("teams.title")}</p>
            <p className="mt-2 text-sm text-muted-foreground">{t("teams.divisionsNote")}</p>
          </div>
          <div className="rounded-xl border border-border bg-ice p-5">
            <p className="eyebrow text-sport">{l({ fr: "Confidentialité", en: "Privacy" })}</p>
            <p className="mt-2 text-sm text-muted-foreground">{t("teams.privacyNote")}</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TEAMS.map((team) => (
            <Link key={team.slug} to="/equipes/$slug" params={{ slug: team.slug }} className="card-elevated group p-5">
              <div className="flex items-baseline justify-between">
                <span className="font-display text-4xl font-extrabold uppercase text-navy">{team.code}</span>
                <span className="text-xs text-muted-foreground">{t("teams.ages")} : {l(team.ages)}</span>
              </div>
              <h2 className="heading-card mt-2 group-hover:text-sport">{l(team.name)}</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">{l(team.description)}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
