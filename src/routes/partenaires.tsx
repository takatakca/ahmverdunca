import { PartnerGrowthKit } from "@/components/partner-growth-kit";
import { SponsorshipInquiry } from "@/components/sponsorship-inquiry";
import { canonicalLink } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowRight,
  Building2,
  Handshake,
  MapPin,
  MonitorSmartphone,
  Trophy,
} from "lucide-react";
import { SPONSORS } from "@/data/sponsors";
import { publicUploadedAhmvMediaById } from "@/data/uploaded-media";
import { useI18n } from "@/lib/i18n";
import { HouseSponsorSlot } from "@/components/house-sponsor-slot";
import {
  OfficialSponsorShowcase,
  SponsorIdentityNotice,
} from "@/components/official-sponsor-showcase";

const PARTNERS_HERO = publicUploadedAhmvMediaById(53)!;

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
      { property: "og:image", content: PARTNERS_HERO.url },
      { property: "og:image:alt", content: PARTNERS_HERO.alt.fr },
    ],
  }),
  component: PartnersPage,
});

function PartnersPage() {
  const { lang } = useI18n();
  const fr = lang === "fr";
  const opportunities = [
    {
      Icon: Building2,
      title: fr ? "À l’aréna" : "At the arena",
      text: fr
        ? "Bandes, bancs, glace et espaces d’affichage."
        : "Boards, benches, ice and signage spaces.",
    },
    {
      Icon: Trophy,
      title: fr ? "Avec les équipes" : "With the teams",
      text: fr
        ? "Chandails, équipement, transport et tournois."
        : "Jerseys, equipment, transport and tournaments.",
    },
    {
      Icon: MonitorSmartphone,
      title: fr ? "En ligne" : "Online",
      text: fr
        ? "Site, pages d’équipes, infolettre et réseaux sociaux."
        : "Website, team pages, newsletter and social channels.",
    },
  ];

  return (
    <div className="bg-navy-deep text-white">
      <header className="container-site pt-4 sm:pt-6">
        <div className="overflow-hidden rounded-[1.75rem] border border-white/12 bg-competition shadow-[0_24px_80px_-40px_rgba(0,0,0,0.7)] md:grid md:grid-cols-[1fr_1.1fr]">
          <div className="relative isolate aspect-[16/10] overflow-hidden md:order-2 md:aspect-auto md:min-h-[420px]">
            <img
              src={PARTNERS_HERO.url}
              alt={PARTNERS_HERO.alt[lang]}
              width={900}
              height={603}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              className="absolute inset-0 size-full object-cover object-center"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-navy-deep/80 via-transparent to-transparent"
              aria-hidden
            />
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-white sm:bottom-6 sm:left-6">
              <span className="inline-flex min-h-9 items-center gap-2 rounded-full border border-white/25 bg-navy-deep/75 px-3 backdrop-blur">
                <MapPin className="size-3.5" aria-hidden /> Verdun · Montréal
              </span>
              <a
                href="#partenaires-officiels"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/25 bg-navy-deep/75 px-3 backdrop-blur transition-colors hover:bg-navy-deep focus-visible:outline-white"
              >
                <Handshake className="size-4" aria-hidden />
                {SPONSORS.length} {fr ? "partenaires" : "partners"}
                <ArrowDown className="size-3.5" aria-hidden />
              </a>
            </div>
          </div>
          <div className="flex flex-col justify-center px-5 py-6 sm:p-8 lg:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/65">
              {fr ? "Partenaires & commanditaires" : "Partners & sponsors"}
            </p>
            <h1 className="mt-4 max-w-[13ch] font-display text-[clamp(2.65rem,5.5vw,4.6rem)] font-extrabold uppercase leading-[0.98] tracking-[-0.035em] text-white text-balance">
              {fr ? "Ensemble, pour le hockey." : "Together, for hockey."}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/75">
              {fr
                ? "Faites partie du hockey de chez nous. Soutenez les jeunes de Verdun et donnez une place à votre entreprise dans leur communauté."
                : "Be part of our local hockey community. Support Verdun’s young players and bring your business closer to their families."}
            </p>
            <a
              href="#commandite"
              className="mt-6 inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-sport px-5 py-3 text-sm font-bold text-sport-foreground shadow-[0_8px_24px_-12px_var(--color-sport)] transition-colors hover:brightness-110 sm:self-start"
            >
              {fr ? "Proposer une commandite" : "Propose a sponsorship"}
              <ArrowRight className="size-4" aria-hidden />
            </a>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1">
              <a
                href="#partenaires-officiels"
                className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-white/80 hover:text-white"
              >
                {fr ? "Nos partenaires" : "Our partners"}{" "}
                <ArrowDown className="size-4" aria-hidden />
              </a>
              <a
                href="#partager"
                className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-white/80 hover:text-white"
              >
                {fr ? "Kit de partage" : "Sharing kit"}{" "}
                <ArrowRight className="size-4" aria-hidden />
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="container-site space-y-10 py-8 md:space-y-14 md:py-12">
        <section
          id="partenaires-officiels"
          aria-labelledby="official-partners-title"
          className="scroll-mt-24"
        >
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/55">
                AHM Verdun
              </p>
              <h2
                id="official-partners-title"
                className="mt-2 font-display text-3xl font-extrabold uppercase leading-none text-white sm:text-4xl"
              >
                {fr ? "Merci à nos partenaires" : "Thank you to our partners"}
              </h2>
            </div>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70">
              {SPONSORS.length} {fr ? "partenaires répertoriés" : "listed partners"}
            </span>
          </div>
          <SponsorIdentityNotice />
          <div className="mt-5">
            <OfficialSponsorShowcase />
          </div>
        </section>

        <section aria-labelledby="sponsor-options-title">
          <div className="mb-5 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/55">
              {fr ? "Votre projet, votre place" : "Your project, your place"}
            </p>
            <h2
              id="sponsor-options-title"
              className="mt-2 font-display text-3xl font-extrabold uppercase leading-none text-white sm:text-4xl"
            >
              {fr ? "Comment participer?" : "How can you take part?"}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-white/70">
              {fr
                ? "Choisissez les options qui vous ressemblent. L’association confirmera les disponibilités et les modalités avec vous."
                : "Choose the options that suit you. The association will confirm availability and terms with you."}
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {opportunities.map(({ Icon, title, text }) => (
              <a
                key={title}
                href="#commandite"
                className="group flex items-start gap-4 rounded-2xl border border-white/12 bg-competition p-5 transition-colors hover:border-white/30 hover:bg-white/5 md:flex-col"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/8 text-white">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="flex items-center justify-between gap-3 text-base font-bold text-white">
                    {title}{" "}
                    <ArrowRight
                      className="size-4 shrink-0 text-white/50 transition-transform motion-safe:group-hover:translate-x-1"
                      aria-hidden
                    />
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/65">{text}</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        <SponsorshipInquiry />
        <PartnerGrowthKit />

        <section aria-labelledby="local-businesses-title" className="space-y-5">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/55">
              {fr ? "Découvertes locales" : "Local discoveries"}
            </p>
            <h2
              id="local-businesses-title"
              className="mt-2 font-display text-3xl font-extrabold uppercase leading-none text-white sm:text-4xl"
            >
              {fr ? "Entreprises d’ici" : "Local businesses"}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-white/70">
              {fr
                ? "Des entreprises et services à découvrir, présentés séparément des partenaires officiels de l’AHMV."
                : "Businesses and services to discover, presented separately from AHMV’s official partners."}
            </p>
          </div>
          <HouseSponsorSlot placement="partners-house-network" count={4} />
        </section>
      </div>
    </div>
  );
}
