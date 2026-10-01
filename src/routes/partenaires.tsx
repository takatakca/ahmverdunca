import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink, Handshake, Megaphone, RefreshCw } from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { SPONSORS } from "@/data/sponsors";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/partenaires")({
  head: () => ({
    meta: [
      { title: "Partenaires et commanditaires — AHM Verdun" },
      {
        name: "description",
        content:
          "Partenaires de l'AHM Verdun et aperçu du futur espace de commandites géré avec GROUPE TAKATAK.",
      },
      { property: "og:title", content: "Partenaires et commanditaires — AHM Verdun" },
      {
        property: "og:description",
        content: "Découvrez les partenaires de l'association et les possibilités de visibilité.",
      },
    ],
  }),
  component: PartnersPage,
});

function PartnersPage() {
  const { lang } = useI18n();

  return (
    <>
      <PageHeader
        eyebrow={lang === "fr" ? "Communauté & visibilité" : "Community & visibility"}
        title={lang === "fr" ? "Partenaires et commanditaires" : "Partners and sponsors"}
        description={
          lang === "fr"
            ? "Une vitrine propre pour les organisations qui soutiennent le hockey mineur à Verdun, avec une gestion numérique qui pourra évoluer dans GROUPE TAKATAK."
            : "A clean showcase for organizations supporting minor hockey in Verdun, with digital management that can evolve in GROUPE TAKATAK."
        }
        actions={
          <Button asChild variant="sport" size="lg">
            <Link to="/contact">
              {lang === "fr" ? "Devenir partenaire" : "Become a partner"} <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
      />

      <div className="container-site space-y-12 py-8 md:py-12">
        <div className="rounded-xl border border-border bg-ice p-5">
          <p className="eyebrow text-sport">
            {lang === "fr" ? "Identités protégées" : "Protected identities"}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {lang === "fr"
              ? "Les partenaires sont présentés par leur nom tant que l'utilisation de leur logo et leur niveau de visibilité n'ont pas été confirmés. Aucun logo n'est fabriqué."
              : "Partners are shown by name until logo use and visibility level are confirmed. No logo is fabricated."}
          </p>
        </div>

        <section>
          <SectionHeading
            eyebrow={lang === "fr" ? "Partenaires actuels" : "Current partners"}
            title={lang === "fr" ? "Ils soutiennent AHM Verdun" : "They support AHM Verdun"}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {SPONSORS.map((sponsor) => (
              <article key={sponsor.name} className="card-elevated flex min-h-40 flex-col justify-between p-5">
                <div className="flex items-center justify-between">
                  <Handshake className="size-6 text-sport" aria-hidden />
                  {sponsor.website && <ExternalLink className="size-4 text-muted-foreground" aria-hidden />}
                </div>
                <div className="mt-8">
                  <h2 className="heading-card">{sponsor.name}</h2>
                  <p className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">
                    {lang === "fr" ? "Identité visuelle à valider" : "Visual identity to approve"}
                  </p>
                  {sponsor.website && (
                    <a
                      href={sponsor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex text-sm font-semibold text-sport hover:underline"
                    >
                      {lang === "fr" ? "Visiter le partenaire" : "Visit partner"}
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="competition-panel rounded-xl p-6 text-navy-foreground md:p-8">
          <SectionHeading
            eyebrow="GROUPE TAKATAK"
            title={lang === "fr" ? "Gestion commanditaire à venir" : "Sponsor management coming"}
            description={
              lang === "fr"
                ? "Le futur espace numérique pourra centraliser les offres, renouvellements, campagnes, visibilité et rapports, sans toucher aux opérations hockey."
                : "The future digital workspace can centralize offers, renewals, campaigns, visibility and reporting without touching hockey operations."
            }
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                Icon: Handshake,
                fr: "Partenariats",
                en: "Partnerships",
                frText: "Fiches, niveaux, périodes et visibilité.",
                enText: "Profiles, levels, terms and visibility.",
              },
              {
                Icon: RefreshCw,
                fr: "Renouvellements",
                en: "Renewals",
                frText: "Rappels et suivis structurés.",
                enText: "Structured reminders and follow-up.",
              },
              {
                Icon: Megaphone,
                fr: "Campagnes",
                en: "Campaigns",
                frText: "Site, infolettres et réseaux sociaux.",
                enText: "Website, newsletters and social channels.",
              },
            ].map(({ Icon, fr, en, frText, enText }) => (
              <div key={fr} className="rounded-lg border border-navy-foreground/10 bg-navy-foreground/[0.04] p-5">
                <Icon className="size-6 text-sport-foreground" aria-hidden />
                <h3 className="mt-5 font-display text-2xl font-bold uppercase">{lang === "fr" ? fr : en}</h3>
                <p className="mt-2 text-sm text-navy-foreground/65">{lang === "fr" ? frText : enText}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
