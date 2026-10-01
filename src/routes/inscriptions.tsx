import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, Mail, ShieldCheck } from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/page-header";
import { DemoNotice } from "@/components/demo-notice";
import { Button } from "@/components/ui/button";
import { TEAMS } from "@/data/teams";
import { EXTERNAL_LINKS } from "@/lib/site";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/inscriptions")({
  head: () => ({
    meta: [
      { title: "Inscriptions 2026–2027 — AHM Verdun" },
      {
        name: "description",
        content:
          "Informations d'inscription AHM Verdun et accès direct à la plateforme officielle de hockey.",
      },
      { property: "og:title", content: "Inscriptions 2026–2027 — AHM Verdun" },
      {
        property: "og:description",
        content:
          "Consultez les informations utiles puis poursuivez l'inscription hockey sur la plateforme officielle.",
      },
    ],
  }),
  component: RegistrationPage,
});

function RegistrationPage() {
  const { t, l, lang } = useI18n();

  return (
    <>
      <PageHeader
        eyebrow={t("common.season")}
        title={t("reg.title")}
        description={
          lang === "fr"
            ? "Tout ce qu'il faut pour comprendre le parcours, puis un accès direct au système officiel d'inscription hockey."
            : "Everything you need to understand the process, then direct access to the official hockey registration system."
        }
        actions={
          <Button asChild variant="sport" size="lg">
            <a href={EXTERNAL_LINKS.spordleRegister} target="_blank" rel="noopener noreferrer">
              {t("reg.cta")} <ExternalLink className="size-4" />
            </a>
          </Button>
        }
      />

      <div className="container-site space-y-12 py-8 md:py-12">
        <DemoNotice kind="info">
          {lang === "fr"
            ? "Le site AHM Verdun informe et dirige. L'inscription hockey elle-même reste dans la plateforme officielle déjà utilisée par l'association."
            : "The AHM Verdun site informs and directs. Hockey registration itself remains in the official platform already used by the association."}
        </DemoNotice>

        <section className="competition-panel rounded-xl p-6 text-navy-foreground md:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="eyebrow text-sport-foreground">
                {lang === "fr" ? "Inscription hockey officielle" : "Official hockey registration"}
              </p>
              <h2 className="heading-section mt-2">
                {lang === "fr" ? "Prêt? Continuez sur Spordle" : "Ready? Continue on Spordle"}
              </h2>
              <p className="mt-3 max-w-2xl text-sm text-navy-foreground/75">
                {lang === "fr"
                  ? "Les renseignements d'inscription, documents requis et étapes officielles restent dans Spordle. AHM Verdun demeure l'autorité pour ses règles et informations hockey."
                  : "Registration information, required documents and official steps remain in Spordle. AHM Verdun remains the authority for its hockey rules and information."}
              </p>
            </div>
            <Button asChild variant="sport" size="lg">
              <a href={EXTERNAL_LINKS.spordleRegister} target="_blank" rel="noopener noreferrer">
                {t("reg.cta")} <ExternalLink className="size-4" />
              </a>
            </Button>
          </div>
        </section>

        <section>
          <SectionHeading
            eyebrow={lang === "fr" ? "Choisir sa catégorie" : "Choose a category"}
            title={t("teams.title")}
            description={
              lang === "fr"
                ? "Accédez rapidement à la page de votre catégorie pour voir les informations publiques disponibles."
                : "Quickly open your category page to see the available public information."
            }
            action={
              <Button asChild variant="outline" size="sm">
                <Link to="/equipes">{t("common.seeAll")}</Link>
              </Button>
            }
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TEAMS.map((team) => (
              <Link
                key={team.slug}
                to="/equipes/$slug"
                params={{ slug: team.slug }}
                className="card-elevated flex items-center justify-between p-5 hover:text-sport"
              >
                <span className="heading-card">{l(team.name)}</span>
                <span className="text-xs text-muted-foreground">{l(team.ages)}</span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <SectionHeading
            eyebrow="GROUPE TAKATAK"
            title={lang === "fr" ? "Infolettres et communications" : "Newsletters and communications"}
            description={
              lang === "fr"
                ? "Une couche distincte pour les nouvelles générales, événements, rappels et campagnes autorisées."
                : "A separate layer for general news, events, reminders and authorized campaigns."
            }
          />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="card-elevated p-6">
              <Mail className="size-6 text-sport" aria-hidden />
              <h3 className="heading-card mt-5">
                {lang === "fr" ? "Restez informé" : "Stay informed"}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {lang === "fr"
                  ? "Le futur branchement TAKATAK permettra de choisir les communications que vous souhaitez recevoir, avec consentement explicite."
                  : "The future TAKATAK connection will let you choose which communications you want to receive, with explicit consent."}
              </p>
            </div>
            <div className="card-elevated p-6">
              <ShieldCheck className="size-6 text-sport" aria-hidden />
              <h3 className="heading-card mt-5">
                {lang === "fr" ? "Séparé du hockey" : "Separate from hockey"}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {lang === "fr"
                  ? "Les communications marketing restent distinctes des dossiers, paiements et opérations sportives."
                  : "Marketing communications remain separate from records, payments and sport operations."}
              </p>
            </div>
          </div>
        </section>

        <section>
          <SectionHeading title={lang === "fr" ? "Aide financière" : "Financial assistance"} />
          <p className="max-w-2xl text-base text-muted-foreground">
            {lang === "fr"
              ? "Des programmes externes peuvent soutenir la participation sportive. Consultez toujours les critères directement auprès du programme concerné."
              : "External programs may support sport participation. Always verify eligibility directly with the relevant program."}
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/ressources">{t("nav.resources")}</Link>
          </Button>
        </section>
      </div>
    </>
  );
}
