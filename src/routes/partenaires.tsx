import { PartnerGrowthKit } from "@/components/partner-growth-kit";
import { SponsorshipInquiry } from "@/components/sponsorship-inquiry";
import { canonicalLink } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  GalleryHorizontal,
  Handshake,
  MapPin,
  Megaphone,
  MousePointerClick,
  Newspaper,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react";
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

  const placements = [
    { Icon: Building2, fr: "Accueil", en: "Homepage", frText: "Présence de marque dans une zone de visibilité dédiée.", enText: "Brand presence in a dedicated visibility area." },
    { Icon: CalendarDays, fr: "Horaires", en: "Schedules", frText: "À côté des horaires consultés par les familles.", enText: "Alongside the schedules families consult." },
    { Icon: Users, fr: "Équipes", en: "Teams", frText: "Emplacements autour des catégories et pages d’équipes.", enText: "Placements around categories and team pages." },
    { Icon: GalleryHorizontal, fr: "Galerie", en: "Gallery", frText: "À côté des photos et des albums de l’association.", enText: "Alongside the association’s photos and albums." },
    { Icon: Newspaper, fr: "Nouvelles", en: "News", frText: "Des promotions identifiées, à côté des nouvelles de l’association.", enText: "Clearly labeled promotions alongside association news." },
    { Icon: MapPin, fr: "Arénas", en: "Arenas", frText: "Présence près des pages d’itinéraire et d’information pratique.", enText: "Presence near directions and practical-information pages." },
  ];

  const formats = [
    {
      Icon: Megaphone,
      fr: "Emplacement rotatif",
      en: "Rotating placement",
      frText: "Votre annonce parmi les promotions présentées sur le site.",
      enText: "Your advertisement among the promotions featured on the site.",
    },
    {
      Icon: Users,
      fr: "Commandite d’équipe",
      en: "Team sponsorship",
      frText: "Possibilité à confirmer selon l’équipe, l’autorisation et la disponibilité.",
      enText: "Subject to team, authorization and availability confirmation.",
    },
    {
      Icon: Trophy,
      fr: "Game Day / tournoi",
      en: "Game Day / tournament",
      frText: "Discutez des espaces disponibles autour d’un match ou d’un tournoi publié.",
      enText: "Ask about available placements around a published game or tournament.",
    },
    {
      Icon: MousePointerClick,
      fr: "Suivi de campagne",
      en: "Campaign tracking",
      frText: "Demandez les options de suivi disponibles pour votre campagne.",
      enText: "Ask which tracking options are available for your campaign.",
    },
  ];

  return (
    <div className="bg-navy-deep text-white">
      <PageHeader
        eyebrow={lang === "fr" ? "Visibilité locale · Hockey mineur" : "Local visibility · Minor hockey"}
        title={lang === "fr" ? "Votre entreprise ici" : "Your business here"}
        description={
          lang === "fr"
            ? "Découvrez les partenaires d’AHM Verdun et les possibilités de visibilité pour votre entreprise auprès des familles du hockey."
            : "Meet AHM Verdun’s partners and explore ways to introduce your business to hockey families."
        }
        actions={
          <>
          <Button asChild variant="sport" size="lg">
            <a href="#commandite">
              {lang === "fr" ? "Présenter ma commandite" : "Propose a sponsorship"} <ArrowRight className="size-4" />
            </a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href="#partager">{lang === "fr" ? "Partager AHM Verdun" : "Share AHM Verdun"}</a>
          </Button>
          </>
        }
      />

      <div className="container-site space-y-10 py-8 md:py-12">
        <section className="grid overflow-hidden border border-navy/12 bg-navy text-white lg:grid-cols-[1.15fr_0.85fr]">
          <div className="technical-grid p-7 md:p-10">
            <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Hockey · Familles · Verdun" : "Hockey · Families · Verdun"}</p>
            <p className="mt-5 max-w-3xl font-display text-4xl font-extrabold uppercase leading-[0.86] tracking-[-0.03em] sm:text-5xl md:text-6xl">
              {lang === "fr" ? "Soutenir le hockey. Être vu au bon endroit." : "Support hockey. Be seen in the right place."}
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/65">
              {lang === "fr"
                ? "Les familles passent d’abord. La commandite reste clairement identifiée et ne bloque jamais l’information urgente, les horaires ou les itinéraires."
                : "Families come first. Sponsorship stays clearly identified and never blocks urgent information, schedules or directions."}
            </p>
          </div>
          <div className="flex flex-col justify-between border-t border-white/12 p-7 lg:border-l lg:border-t-0 md:p-10">
            <Handshake className="size-9 text-sport-foreground" />
            <div className="mt-10">
              <p className="font-display text-6xl font-extrabold">{String(SPONSORS.length).padStart(2, "0")}</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.17em] text-white/48">
                {lang === "fr" ? "partenaires officiels répertoriés" : "listed official partners"}
              </p>
            </div>
            <Button asChild variant="sport" size="lg" className="mt-8">
              <a href="#commandite">{lang === "fr" ? "Parler commandite" : "Discuss sponsorship"} <ArrowRight className="size-4" /></a>
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

        <section>
          <SectionHeading
            eyebrow={lang === "fr" ? "Espaces de visibilité" : "Visibility options"}
            title={lang === "fr" ? "Où votre marque peut apparaître" : "Where your brand can appear"}
            description={
              lang === "fr"
                ? "Explorez les emplacements ci-dessous, puis contactez l’association pour confirmer les disponibilités."
                : "Explore the placements below, then contact the association to confirm availability."
            }
          />
          <div className="mt-7 grid gap-px overflow-hidden border border-navy/12 bg-navy/12 sm:grid-cols-2 lg:grid-cols-3">
            {placements.map(({ Icon, fr, en, frText, enText }) => (
              <article key={fr} className="bg-competition p-5 text-white md:p-6">
                <Icon className="size-5 text-sport-foreground" aria-hidden />
                <h3 className="mt-5 font-display text-2xl font-extrabold uppercase leading-none text-white">
                  {lang === "fr" ? fr : en}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/56">
                  {lang === "fr" ? frText : enText}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="competition-panel border border-navy/12 p-6 text-navy-foreground md:p-8">
          <SectionHeading
            eyebrow={lang === "fr" ? "Formats de commandite" : "Sponsorship formats"}
            title={lang === "fr" ? "Une offre simple à comprendre" : "A simple offer to understand"}
            description={
              lang === "fr"
                ? "Présentez votre projet à l’association pour confirmer le format et les conditions de votre commandite."
                : "Share your proposal with the association to confirm your sponsorship format and terms."
            }
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {formats.map(({ Icon, fr, en, frText, enText }) => (
              <div key={fr} className="border border-navy-foreground/10 bg-navy-foreground/[0.04] p-5">
                <Icon className="size-6 text-sport-foreground" aria-hidden />
                <h3 className="mt-5 font-display text-2xl font-bold uppercase">{lang === "fr" ? fr : en}</h3>
                <p className="mt-2 text-sm text-navy-foreground/65">{lang === "fr" ? frText : enText}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-px overflow-hidden border border-navy/12 bg-navy/12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="bg-navy-deep p-6 text-white md:p-8">
            <ShieldCheck className="size-7 text-sport-foreground" aria-hidden />
            <p className="eyebrow mt-6 text-sport-foreground">{lang === "fr" ? "Transparence" : "Transparency"}</p>
            <h2 className="mt-2 font-display text-4xl font-extrabold uppercase leading-[0.9] text-white">
              {lang === "fr" ? "Un projet à discuter." : "Let’s discuss your project."}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/58">
              {lang === "fr"
                ? "La période, les emplacements et les modalités de votre campagne se confirment directement avec l’association."
                : "Confirm your campaign dates, placements and terms directly with the association."}
            </p>
          </div>
          <div className="bg-competition p-6 text-white md:p-8">
            <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Demande commanditaire" : "Sponsor inquiry"}</p>
            <h2 className="mt-2 font-display text-4xl font-extrabold uppercase leading-[0.9] text-white">
              {lang === "fr" ? "Quel espace vous intéresse?" : "Which placement interests you?"}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/58">
              {lang === "fr"
                ? "Indiquez votre entreprise, le type de visibilité recherché et la période souhaitée dans le formulaire de contact. L’équipe pourra ensuite confirmer ce qui est réellement disponible."
                : "Use the contact form to share your business, preferred visibility type and desired period. The team can then confirm what is actually available."}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild variant="sport" size="lg">
                <a href="#commandite">
                  {lang === "fr" ? "Préparer une demande" : "Prepare an inquiry"} <ArrowRight className="size-4" />
                </a>
              </Button>
            </div>
          </div>
        </section>

        <SponsorshipInquiry />
        <PartnerGrowthKit />

        <section className="space-y-6">
          <div>
            <p className="eyebrow text-sport">
              {lang === "fr" ? "Découvertes locales" : "Local discoveries"}
            </p>
            <h2 className="mt-2 font-display text-4xl font-extrabold uppercase leading-[0.9] text-navy sm:text-5xl">
              {lang === "fr" ? "Entreprises d’ici" : "Local businesses"}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {lang === "fr"
                ? "Découvrez des entreprises et services locaux présentés séparément des partenaires officiels de l’AHMV."
                : "Discover local businesses and services presented separately from AHMV’s official partners."}
            </p>
          </div>

          <HouseSponsorSlot placement="partners-house-network" count={4} />

        </section>

      </div>
    </div>
  );
}
