import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
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
      { name: "description", content: "Comment inscrire votre enfant au hockey mineur à Verdun : étapes, catégories et accès direct à la plateforme officielle Spordle." },
      { property: "og:title", content: "Inscriptions 2026–2027 — AHM Verdun" },
      { property: "og:description", content: "Étapes d'inscription et accès à la plateforme officielle Spordle." },
    ],
  }),
  component: RegistrationPage,
});

const STEPS = [
  { fr: "Vérifiez la catégorie correspondant à l'âge de votre enfant.", en: "Check the category matching your child's age." },
  { fr: "Créez ou utilisez votre compte sur la plateforme officielle Spordle.", en: "Create or use your account on the official Spordle platform." },
  { fr: "Remplissez le formulaire d'inscription et joignez les documents demandés.", en: "Complete the registration form and attach the requested documents." },
  { fr: "Effectuez le paiement directement sur Spordle.", en: "Complete payment directly on Spordle." },
  { fr: "Surveillez vos courriels : la confirmation et les convocations viennent de l'association.", en: "Watch your email: confirmation and invitations come from the association." },
];

function RegistrationPage() {
  const { t, l } = useI18n();
  return (
    <>
      <PageHeader
        eyebrow={t("common.season")}
        title={t("reg.title")}
        description="Les inscriptions se font uniquement sur la plateforme officielle Spordle. Ce site ne recueille aucune donnée personnelle."
        actions={
          <Button asChild variant="sport" size="lg">
            <a href={EXTERNAL_LINKS.spordleRegister} target="_blank" rel="noopener noreferrer">{t("reg.cta")} <ExternalLink className="size-4" /></a>
          </Button>
        }
      />
      <div className="container-site space-y-12 py-8 md:py-12">
        <DemoNotice kind="info">
          Tarifs, dates limites et documents exigés ne sont pas affichés : ces informations doivent être fournies par l'association.
        </DemoNotice>

        <section>
          <SectionHeading title="Étapes d'inscription" />
          <ol className="space-y-4">
            {STEPS.map((s, i) => (
              <li key={i} className="card-elevated flex gap-4 p-5">
                <span className="font-display text-3xl font-extrabold leading-none text-sport">{i + 1}</span>
                <p className="self-center text-base">{l(s)}</p>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <SectionHeading title={t("teams.title")} action={<Button asChild variant="outline" size="sm"><Link to="/equipes">{t("common.seeAll")}</Link></Button>} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TEAMS.map((tm) => (
              <Link key={tm.slug} to="/equipes/$slug" params={{ slug: tm.slug }} className="card-elevated flex items-center justify-between p-5 hover:text-sport">
                <span className="heading-card">{l(tm.name)}</span>
                <span className="text-xs text-muted-foreground">{l(tm.ages)}</span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <SectionHeading title="Aide financière" />
          <p className="max-w-2xl text-base text-muted-foreground">
            Des programmes externes existent pour soutenir la participation sportive. Leur existence ne garantit ni l'admissibilité ni l'obtention d'une aide.
          </p>
          <Button asChild variant="outline" className="mt-4"><Link to="/ressources">{t("nav.resources")}</Link></Button>
        </section>
      </div>
    </>
  );
}
