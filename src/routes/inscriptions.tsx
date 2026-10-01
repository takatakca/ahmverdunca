import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink, Mail, ShieldCheck } from "lucide-react";
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
      { name: "description", content: "Parcours d'inscription AHM Verdun : information, suivi et passage vers la plateforme officielle de hockey." },
      { property: "og:title", content: "Inscriptions 2026–2027 — AHM Verdun" },
      { property: "og:description", content: "Un parcours simple pour les familles, avec continuité vers la plateforme officielle de hockey." },
    ],
  }),
  component: RegistrationPage,
});

const STEPS = [
  {
    fr: "Commencez sur le site AHM Verdun pour choisir la catégorie et recevoir les informations utiles.",
    en: "Start on the AHM Verdun site to choose a category and receive the useful information.",
  },
  {
    fr: "Le futur parcours GROUPE TAKATAK pourra enregistrer vos préférences de communication et assurer le suivi de l’association.",
    en: "The future GROUPE TAKATAK flow can save your communication preferences and support association follow-up.",
  },
  {
    fr: "Les informations propres à l’inscription hockey, les documents requis et le paiement demeurent sur la plateforme officielle.",
    en: "Hockey registration details, required documents and payment remain on the official platform.",
  },
  {
    fr: "Continuez vers Spordle pour compléter l’inscription hockey officielle.",
    en: "Continue to Spordle to complete the official hockey registration.",
  },
];

function RegistrationPage() {
  const { t, l, lang } = useI18n();

  return (
    <>
      <PageHeader
        eyebrow={t("common.season")}
        title={t("reg.title")}
        description={
          lang === "fr"
            ? "Un parcours plus simple : AHM Verdun et GROUPE TAKATAK pour l’information et le suivi, puis Spordle pour l’inscription hockey officielle."
            : "A simpler path: AHM Verdun and GROUPE TAKATAK for information and follow-up, then Spordle for the official hockey registration."
        }
        actions={
          <Button asChild variant="sport" size="lg">
            <a href="#parcours">
              {lang === "fr" ? "Voir le parcours" : "See the flow"} <ArrowRight className="size-4" />
            </a>
          </Button>
        }
      />

      <div className="container-site space-y-12 py-8 md:py-12">
        <DemoNotice kind="info">
          {lang === "fr"
            ? "La connexion GROUPE TAKATAK n’est pas encore activée dans cette maquette. Aucun lead ni préférence d’infolettre n’est transmis pour le moment."
            : "The GROUPE TAKATAK connection is not active in this prototype yet. No lead or newsletter preference is currently transmitted."}
        </DemoNotice>

        <section id="parcours">
          <SectionHeading
            eyebrow={lang === "fr" ? "Expérience future" : "Future experience"}
            title={lang === "fr" ? "Une inscription en 4 étapes" : "Registration in 4 steps"}
          />
          <ol className="grid gap-4 md:grid-cols-2">
            {STEPS.map((step, index) => (
              <li key={index} className="card-elevated flex gap-4 p-5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-navy font-display text-xl font-extrabold text-navy-foreground">
                  {index + 1}
                </span>
                <p className="self-center text-base">{l(step)}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="competition-panel rounded-xl p-6 text-navy-foreground md:p-8">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="eyebrow text-sport-foreground">
                {lang === "fr" ? "Inscription hockey officielle" : "Official hockey registration"}
              </p>
              <h2 className="heading-section mt-2">
                {lang === "fr" ? "Continuer sur Spordle" : "Continue on Spordle"}
              </h2>
              <p className="mt-3 max-w-2xl text-sm text-navy-foreground/75">
                {lang === "fr"
                  ? "Spordle demeure la destination officielle pour compléter l’inscription hockey, les documents et le paiement."
                  : "Spordle remains the official destination for hockey registration, documents and payment."}
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
            title={t("teams.title")}
            action={<Button asChild variant="outline" size="sm"><Link to="/equipes">{t("common.seeAll")}</Link></Button>}
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

        <section className="grid gap-4 md:grid-cols-2">
          <div className="card-elevated p-6">
            <Mail className="size-6 text-sport" aria-hidden />
            <h2 className="heading-card mt-5">
              {lang === "fr" ? "Infolettres et suivis" : "Newsletters and follow-up"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {lang === "fr"
                ? "Ce volet sera relié au backend GROUPE TAKATAK après approbation, avec consentement explicite et gestion des préférences."
                : "This will connect to the GROUPE TAKATAK backend after approval, with explicit consent and preference management."}
            </p>
          </div>
          <div className="card-elevated p-6">
            <ShieldCheck className="size-6 text-sport" aria-hidden />
            <h2 className="heading-card mt-5">
              {lang === "fr" ? "Données séparées" : "Separated data"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {lang === "fr"
                ? "Les suivis marketing resteront séparés des données sensibles de joueurs et des informations nécessaires à l’inscription hockey."
                : "Marketing follow-up will remain separated from sensitive player data and official hockey registration information."}
            </p>
          </div>
        </section>

        <section>
          <SectionHeading title={lang === "fr" ? "Aide financière" : "Financial assistance"} />
          <p className="max-w-2xl text-base text-muted-foreground">
            {lang === "fr"
              ? "Des programmes externes peuvent soutenir la participation sportive. Leur présence ne garantit ni l’admissibilité ni l’obtention d’une aide."
              : "External programs may help support sport participation. Their availability does not guarantee eligibility or funding."}
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/ressources">{t("nav.resources")}</Link>
          </Button>
        </section>
      </div>
    </>
  );
}
