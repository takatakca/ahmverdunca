import { canonicalLink } from "@/lib/seo";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink, Handshake, Megaphone, RefreshCw } from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { SPONSORS } from "@/data/sponsors";
import { useI18n } from "@/lib/i18n";
import { HouseSponsorSlot } from "@/components/house-sponsor-slot";
import { OfficialSponsorShowcase, SponsorIdentityNotice } from "@/components/official-sponsor-showcase";

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
        <SponsorIdentityNotice />

        <section>
          <SectionHeading
            eyebrow={lang === "fr" ? "Partenaires actuels" : "Current partners"}
            title={lang === "fr" ? "Ils soutiennent AHM Verdun" : "They support AHM Verdun"}
          />
          <OfficialSponsorShowcase />
        </section>

        <section className="space-y-4">
          <div>
            <p className="eyebrow text-sport">{lang === "fr" ? "Promotion maison · distincte des commanditaires" : "House promotion · separate from sponsors"}</p>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {lang === "fr"
                ? "Ces créatives servent de remplissage publicitaire tant qu’un espace n’est pas attribué à AdSense ou à une commandite officielle. Elles ne sont pas présentées comme des commanditaires AHMV."
                : "These creatives fill advertising inventory until a placement is assigned to AdSense or an official sponsorship. They are not presented as AHMV sponsors."}
            </p>
          </div>
          <HouseSponsorSlot placement="partners-house-network" count={4} />
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
