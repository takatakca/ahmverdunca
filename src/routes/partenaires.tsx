import { canonicalLink } from "@/lib/seo";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink, Handshake, Megaphone, RefreshCw } from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { SPONSORS } from "@/data/sponsors";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/partenaires")({
  head: () => ({
    links: canonicalLink("/partenaires"),
    meta: [
      { title: "Partenaires et commanditaires — AHM Verdun" },
      {
        name: "description",
        content:
          "Partenaires de l'AHM Verdun et possibilités de visibilité pour les organisations qui soutiennent le hockey mineur.",
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
            ? "Une vitrine claire pour les organisations qui soutiennent le hockey mineur à Verdun et souhaitent faire connaître leur contribution."
            : "A clear showcase for organizations supporting minor hockey in Verdun and the contribution they make."
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
        <section className="grid overflow-hidden border border-navy/12 bg-navy text-white lg:grid-cols-[1.15fr_0.85fr]">
          <div className="technical-grid p-7 md:p-10">
            <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Hockey · Communauté · Verdun" : "Hockey · Community · Verdun"}</p>
            <p className="mt-5 max-w-3xl font-display text-4xl font-extrabold uppercase leading-[0.86] tracking-[-0.03em] sm:text-5xl md:text-6xl">
              {lang === "fr" ? "Soutenir le hockey mineur, visiblement." : "Support minor hockey, visibly."}
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/65">
              {lang === "fr" ? "Une vitrine sobre pour reconnaître les organisations qui appuient l’association, sans inventer de logo ni de niveau de commandite." : "A clean showcase recognizing organizations supporting the association, without inventing logos or sponsorship levels."}
            </p>
          </div>
          <div className="flex flex-col justify-between border-t border-white/12 p-7 lg:border-l lg:border-t-0 md:p-10">
            <Handshake className="size-9 text-sport-foreground" />
            <div className="mt-10">
              <p className="font-display text-6xl font-extrabold">{String(SPONSORS.length).padStart(2, "0")}</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.17em] text-white/48">{lang === "fr" ? "partenaires répertoriés" : "listed partners"}</p>
            </div>
            <Button asChild variant="sport" size="lg" className="mt-8">
              <Link to="/contact">{lang === "fr" ? "Devenir partenaire" : "Become a partner"} <ArrowRight className="size-4" /></Link>
            </Button>
          </div>
        </section>
        <div className="border border-navy/12 bg-ice p-5">
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
          <div className="grid gap-px overflow-hidden border border-navy/12 bg-navy/12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {SPONSORS.map((sponsor, index) => {
              const card = (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex size-11 items-center justify-center border border-navy/12 bg-ice">
                      <Handshake className="size-5 text-sport" aria-hidden />
                    </div>
                    <span className="font-display text-2xl font-extrabold text-navy/12">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="mt-10">
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-sport">
                      {lang === "fr" ? "Partenaire AHMV" : "AHMV partner"}
                    </p>
                    <h2 className="mt-2 font-display text-2xl font-extrabold uppercase leading-[0.9] tracking-[-0.02em] text-navy">
                      {sponsor.name}
                    </h2>
                    <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                      {sponsor.websiteVerified
                        ? (lang === "fr" ? "Lien officiel vérifié" : "Verified official link")
                        : (lang === "fr" ? "Identité répertoriée" : "Listed identity")}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-navy/10 pt-4 text-[10px] font-bold uppercase tracking-[0.12em]">
                    <span className={sponsor.website ? "text-sport" : "text-muted-foreground"}>
                      {sponsor.website
                        ? (lang === "fr" ? "Visiter" : "Visit")
                        : (lang === "fr" ? "Lien à confirmer" : "Link to confirm")}
                    </span>
                    {sponsor.website && <ExternalLink className="size-3.5 text-sport" aria-hidden />}
                  </div>
                </>
              );

              return sponsor.website ? (
                <a
                  key={sponsor.name}
                  href={sponsor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="interactive-surface flex min-h-64 flex-col justify-between bg-background p-5 hover:bg-ice/55"
                >
                  {card}
                </a>
              ) : (
                <article
                  key={sponsor.name}
                  className="interactive-surface flex min-h-64 flex-col justify-between bg-background p-5"
                >
                  {card}
                </article>
              );
            })}
          </div>
        </section>

        <section className="competition-panel border border-navy/12 p-6 text-navy-foreground md:p-8">
          <SectionHeading
            eyebrow={lang === "fr" ? "Commandites AHMV" : "AHMV sponsorships"}
            title={lang === "fr" ? "Une commandite plus simple à gérer" : "Simpler sponsorship management"}
            description={
              lang === "fr"
                ? "Des options claires pour présenter les offres, renouvellements, campagnes, visibilité et bilans aux partenaires."
                : "Clear options for presenting offers, renewals, campaigns, visibility and reporting to partners."
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
              <div key={fr} className="border border-navy-foreground/10 bg-navy-foreground/[0.04] p-5">
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
