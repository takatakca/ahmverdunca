import { canonicalLink } from "@/lib/seo";
import { canonicalLink } from "@/lib/seo";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { TEAMS } from "@/data/teams";
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
          {TEAMS.map((team) => {
            const saved = preferredTeam === team.slug;
            return (
              <article
                key={team.slug}
                className={cn(
                  "card-elevated group relative p-5",
                  saved && "border-sport ring-2 ring-sport/15",
                )}
              >
                {saved && (
                  <span className="absolute right-4 top-4 rounded-full bg-sport px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-sport-foreground">
                    {lang === "fr" ? "Mon équipe" : "My team"}
                  </span>
                )}
                <Link to="/equipes/$slug" params={{ slug: team.slug }} className="block">
                  <div className="flex items-baseline justify-between gap-3 pr-16">
                    <span className="font-display text-4xl font-extrabold uppercase text-navy">{team.code}</span>
                    <span className="text-xs text-muted-foreground">{t("teams.ages")} : {l(team.ages)}</span>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{l(team.description)}</p>
                  <span className="mt-5 inline-flex text-xs font-semibold uppercase tracking-wide text-sport">
                    {l({ fr: "Ouvrir la catégorie", en: "Open category" })}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => savePreferredTeam(saved ? "" : team.slug)}
                  className={cn(
                    "mt-4 min-h-11 w-full rounded-md border px-3 text-xs font-semibold uppercase tracking-wide transition-colors",
                    saved
                      ? "border-sport/30 bg-sport/10 text-sport"
                      : "border-input bg-background text-foreground hover:border-sport/40 hover:bg-ice",
                  )}
                >
                  {saved
                    ? (lang === "fr" ? "Équipe mémorisée ✓" : "Team saved ✓")
                    : (lang === "fr" ? "Définir comme mon équipe" : "Set as my team")}
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </>
  );
}
