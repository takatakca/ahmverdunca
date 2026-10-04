import { canonicalLink } from "@/lib/seo";
import { createFileRoute, Link } from "@tanstack/react-router";
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
  RefreshCw,
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
import { HOUSE_SPONSORS } from "@/data/house-sponsors";
import { RUNWAY_AD_CREATIVES } from "@/data/runway-ad-creatives";

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
    { Icon: CalendarDays, fr: "Horaires", en: "Schedules", frText: "Visibilité près d’un parcours parent à forte utilité.", enText: "Visibility near a high-utility parent journey." },
    { Icon: Users, fr: "Équipes", en: "Teams", frText: "Emplacements autour des catégories et mini-sites d’équipes.", enText: "Placements around categories and team mini-sites." },
    { Icon: GalleryHorizontal, fr: "Galerie", en: "Gallery", frText: "Association possible avec des albums et moments AHMV réels.", enText: "Possible association with real AHMV albums and moments." },
    { Icon: Newspaper, fr: "Nouvelles", en: "News", frText: "Visibilité éditoriale clairement séparée du contenu officiel.", enText: "Editorial visibility clearly separated from official content." },
    { Icon: MapPin, fr: "Arénas", en: "Arenas", frText: "Présence près des pages d’itinéraire et d’information pratique.", enText: "Presence near directions and practical-information pages." },
  ];

  const formats = [
    {
      Icon: Megaphone,
      fr: "Emplacement rotatif",
      en: "Rotating placement",
      frText: "Bannière ou créatif dans l’inventaire publicitaire du portail.",
      enText: "Banner or creative inside the portal advertising inventory.",
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
      frText: "Présence événementielle lorsque l’espace et les données officielles existent.",
      enText: "Event visibility when the placement and official event data exist.",
    },
    {
      Icon: MousePointerClick,
      fr: "Campagne mesurable",
      en: "Measurable campaign",
      frText: "Impressions et clics pourront être suivis lorsque l’analytics autorisé est actif.",
      enText: "Impressions and clicks can be tracked once approved analytics is active.",
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow={lang === "fr" ? "Visibilité locale · Hockey mineur" : "Local visibility · Minor hockey"}
        title={lang === "fr" ? "Votre entreprise ici" : "Your business here"}
        description={
          lang === "fr"
            ? "Une page de commandite claire pour comprendre où une entreprise peut être visible sur le portail AHMV, sans inventer de portée, d’audience ou de performance."
            : "A clear sponsorship page showing where a business can appear across the AHMV portal, without inventing reach, audience or performance."
        }
        actions={
          <Button asChild variant="sport" size="lg">
            <Link to="/contact">
              {lang === "fr" ? "Demander les disponibilités" : "Ask about availability"} <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
      />

      <div className="container-site space-y-12 py-8 md:py-12">
        <section className="grid overflow-hidden border border-navy/12 bg-navy text-white lg:grid-cols-[1.15fr_0.85fr]">
          <div className="technical-grid p-7 md:p-10">
            <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Hockey · Familles · Verdun" : "Hockey · Families · Verdun"}</p>
            <p className="mt-5 max-w-3xl font-display text-4xl font-extrabold uppercase leading-[0.86] tracking-[-0.03em] sm:text-5xl md:text-6xl">
              {lang === "fr" ? "Soutenir le hockey. Être vu au bon endroit." : "Support hockey. Be seen in the right place."}
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/65">
              {lang === "fr"
                ? "Le portail sert d’abord les parents. La commandite vient ensuite, dans des emplacements identifiés qui ne bloquent jamais l’information urgente, les horaires ou les itinéraires."
                : "The portal serves parents first. Sponsorship comes afterward, in identified placements that never block urgent information, schedules or directions."}
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
              <Link to="/contact">{lang === "fr" ? "Parler commandite" : "Discuss sponsorship"} <ArrowRight className="size-4" /></Link>
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
            eyebrow={lang === "fr" ? "Inventaire disponible" : "Available inventory"}
            title={lang === "fr" ? "Où votre marque peut apparaître" : "Where your brand can appear"}
            description={
              lang === "fr"
                ? "Aucune statistique de portée n’est affichée tant qu’elle n’est pas réellement mesurée. Les emplacements ci-dessous décrivent seulement les surfaces disponibles ou prévues."
                : "No reach statistics are shown until they are actually measured. The placements below describe only available or planned surfaces."
            }
          />
          <div className="mt-7 grid gap-px overflow-hidden border border-navy/12 bg-navy/12 sm:grid-cols-2 lg:grid-cols-3">
            {placements.map(({ Icon, fr, en, frText, enText }) => (
              <article key={fr} className="bg-background p-5 md:p-6">
                <Icon className="size-5 text-sport" aria-hidden />
                <h3 className="mt-5 font-display text-2xl font-extrabold uppercase leading-none text-navy">
                  {lang === "fr" ? fr : en}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
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
                ? "Les niveaux Platine, Or, Argent ou autres appellations ne seront utilisés que s’ils sont officiellement approuvés par AHMV."
                : "Platinum, Gold, Silver or other tier names will only be used if officially approved by AHMV."
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
          <div className="bg-ice p-6 md:p-8">
            <ShieldCheck className="size-7 text-sport" aria-hidden />
            <p className="eyebrow mt-6 text-sport">{lang === "fr" ? "Transparence" : "Transparency"}</p>
            <h2 className="mt-2 font-display text-4xl font-extrabold uppercase leading-[0.9] text-navy">
              {lang === "fr" ? "Pas de chiffres inventés." : "No invented numbers."}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {lang === "fr"
                ? "Nous ne publions pas de nombre de visiteurs, impressions, clics ou taux de conversion avant que ces données soient réellement collectées et vérifiables."
                : "We do not publish visitor, impression, click or conversion numbers until those metrics are actually collected and verifiable."}
            </p>
          </div>
          <div className="bg-background p-6 md:p-8">
            <p className="eyebrow text-sport">{lang === "fr" ? "Demande commanditaire" : "Sponsor inquiry"}</p>
            <h2 className="mt-2 font-display text-4xl font-extrabold uppercase leading-[0.9] text-navy">
              {lang === "fr" ? "Quel espace vous intéresse?" : "Which placement interests you?"}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {lang === "fr"
                ? "Indiquez votre entreprise, le type de visibilité recherché et la période souhaitée dans le formulaire de contact. L’équipe pourra ensuite confirmer ce qui est réellement disponible."
                : "Use the contact form to share your business, preferred visibility type and desired period. The team can then confirm what is actually available."}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild variant="sport" size="lg">
                <Link to="/contact">
                  {lang === "fr" ? "Envoyer une demande" : "Send an inquiry"} <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/">{lang === "fr" ? "Voir le portail" : "View the portal"}</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div>
            <p className="eyebrow text-sport">
              {lang === "fr" ? "Promotion maison · distincte des commanditaires" : "House promotion · separate from sponsors"}
            </p>
            <h2 className="mt-2 font-display text-4xl font-extrabold uppercase leading-[0.9] text-navy sm:text-5xl">
              {lang === "fr" ? "Galerie des créatives publicitaires" : "Advertising creative gallery"}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {lang === "fr"
                ? "Ces créatives servent de remplissage publicitaire tant qu’un espace n’est pas attribué à AdSense ou à une commandite officielle. Elles ne sont pas présentées comme des commanditaires AHMV."
                : "These creatives fill advertising inventory until a placement is assigned to AdSense or an official sponsorship. They are not presented as AHMV sponsors."}
            </p>
          </div>

          <HouseSponsorSlot placement="partners-house-network" count={4} />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {HOUSE_SPONSORS.map((sponsor) => (
              <article
                key={sponsor.id}
                className="group overflow-hidden border border-navy/12 bg-background"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-ice">
                  {sponsor.creative ? (
                    <img
                      src={sponsor.creative}
                      alt={sponsor.name}
                      loading="lazy"
                      decoding="async"
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.015]"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-navy text-white">
                      <span className="font-display text-4xl font-extrabold uppercase">{sponsor.short}</span>
                    </div>
                  )}
                </div>
                <div className="border-t border-navy/10 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-display text-2xl font-extrabold uppercase leading-none text-navy">
                        {sponsor.name}
                      </p>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                        {lang === "fr" ? sponsor.tagline.fr : sponsor.tagline.en}
                      </p>
                    </div>
                    <span className="shrink-0 border border-navy/10 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      {lang === "fr" ? "Maison" : "House"}
                    </span>
                  </div>
                  {sponsor.href ? (
                    <a
                      href={sponsor.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.1em] text-sport hover:underline"
                    >
                      {lang === "fr" ? "Visiter" : "Visit"} <ArrowRight className="size-3.5" />
                    </a>
                  ) : (
                    <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                      {lang === "fr" ? "Lien public à confirmer" : "Public link to confirm"}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div>
            <p className="eyebrow text-sport">
              {lang === "fr" ? "Laboratoire créatif · 16:9" : "Creative lab · 16:9"}
            </p>
            <h2 className="mt-2 font-display text-4xl font-extrabold uppercase leading-[0.9] text-navy sm:text-5xl">
              {lang === "fr" ? "54 créatives prêtes à classer" : "54 creatives ready to classify"}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {lang === "fr"
                ? "Ces visuels proviennent des six planches Runway confirmées. Ils ont été découpés en fichiers 16:9 permanents. Tant que le logo, le lien et l’entreprise n’ont pas été recoupés, ils restent des aperçus non cliquables et ne sont pas présentés comme des commanditaires officiels."
                : "These visuals come from the six confirmed Runway contact sheets. They were split into permanent 16:9 files. Until each logo, link and business is cross-checked, they remain non-clickable previews and are not presented as official sponsors."}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {RUNWAY_AD_CREATIVES.map((creative, index) => (
              <figure
                key={creative.id}
                className="overflow-hidden border border-navy/12 bg-background"
              >
                <div className="aspect-video overflow-hidden bg-ice">
                  <img
                    src={creative.path}
                    alt={lang === "fr"
                      ? `Aperçu créatif publicitaire ${index + 1}`
                      : `Advertising creative preview ${index + 1}`}
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover"
                  />
                </div>
                <figcaption className="flex items-center justify-between gap-3 border-t border-navy/10 px-3 py-2">
                  <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    {String(index + 1).padStart(2, "0")} · {creative.ratio}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-sport">
                    {creative.placement}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="border border-navy/12 bg-ice p-6 md:p-8">
          <SectionHeading
            eyebrow={lang === "fr" ? "Gestion partenaire" : "Partner management"}
            title={lang === "fr" ? "Une commandite plus simple à gérer" : "Simpler sponsorship management"}
            description={
              lang === "fr"
                ? "Le portail est préparé pour structurer les offres, renouvellements, campagnes et bilans lorsque les données et processus officiels seront disponibles."
                : "The portal is prepared to structure offers, renewals, campaigns and reporting once official data and processes are available."
            }
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                Icon: Handshake,
                fr: "Partenariats",
                en: "Partnerships",
                frText: "Emplacements, période et visibilité confirmés.",
                enText: "Confirmed placements, term and visibility.",
              },
              {
                Icon: RefreshCw,
                fr: "Renouvellements",
                en: "Renewals",
                frText: "Suivi structuré lorsque le processus officiel existe.",
                enText: "Structured follow-up once the official process exists.",
              },
              {
                Icon: Megaphone,
                fr: "Campagnes",
                en: "Campaigns",
                frText: "Site et autres canaux uniquement lorsqu’ils sont autorisés.",
                enText: "Website and other channels only when authorized.",
              },
            ].map(({ Icon, fr, en, frText, enText }) => (
              <div key={fr} className="border border-navy/10 bg-background p-5">
                <Icon className="size-6 text-sport" aria-hidden />
                <h3 className="mt-5 font-display text-2xl font-bold uppercase text-navy">{lang === "fr" ? fr : en}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{lang === "fr" ? frText : enText}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
