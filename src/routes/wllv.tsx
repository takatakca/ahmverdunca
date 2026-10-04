import { canonicalLink } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, ExternalLink, ShieldCheck } from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { EXTERNAL_LINKS } from "@/lib/site";
import { useI18n } from "@/lib/i18n";
import { uploadedAhmvMediaById } from "@/data/uploaded-media";
import { HouseSponsorSlot } from "@/components/house-sponsor-slot";
import { MediaZoomTrigger } from "@/components/media/media-zoom-trigger";

export const Route = createFileRoute("/wllv")({
  head: () => ({
    links: canonicalLink("/wllv"),
    meta: [
      { title: "Hockey AA/BB — WLLV Les Chacals | AHM Verdun" },
      {
        name: "description",
        content:
          "Passerelle AHM Verdun vers le WLLV et les informations officielles du hockey AA/BB.",
      },
      { property: "og:title", content: "Hockey AA/BB — WLLV Les Chacals" },
      {
        property: "og:description",
        content: "Accédez au WLLV et aux informations officielles du hockey double lettre.",
      },
    ],
  }),
  component: WllvPage,
});

function WllvPage() {
  const { t, lang } = useI18n();
  const wllvCampPoster = uploadedAhmvMediaById(40)!;
  const wllvCampSchedule = uploadedAhmvMediaById(34)!;
  const wllvMedia = [wllvCampPoster, wllvCampSchedule];

  return (
    <>
      <PageHeader
        eyebrow="AA / BB"
        title="WLLV — Les Chacals"
        description={
          lang === "fr"
            ? "Le hockey double lettre demeure géré par le WLLV. AHM Verdun vous donne un accès simple aux bonnes ressources sans recréer cette opération."
            : "Double-letter hockey remains managed by WLLV. AHM Verdun gives families a simple path to the right resources without recreating that operation."
        }
        actions={
          <Button asChild variant="sport">
            <a href={EXTERNAL_LINKS.wllv} target="_blank" rel="noopener noreferrer">
              {t("common.officialSite")} <ExternalLink className="size-4" />
            </a>
          </Button>
        }
      />

      <div className="container-site space-y-10 py-8 md:py-12">
        <section className="grid overflow-hidden border border-navy/12 bg-navy text-navy-foreground lg:grid-cols-[1.25fr_0.75fr]">
          <div className="relative min-h-[390px] overflow-hidden p-7 md:min-h-[460px] md:p-10 lg:p-12">
            <MediaZoomTrigger
              items={wllvMedia}
              initialIndex={0}
              lang={lang}
              className="absolute inset-0"
            >
              <img
                src={wllvCampPoster.url}
                alt={lang === "fr" ? wllvCampPoster.alt.fr : wllvCampPoster.alt.en}
                loading="eager"
                decoding="async"
                className="absolute inset-0 size-full bg-navy-deep object-contain transition-transform duration-700 group-hover:scale-[1.012]"
              />
            </MediaZoomTrigger>
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,16,43,0.96)_0%,rgba(7,16,43,0.76)_58%,rgba(7,16,43,0.34)_100%)]" />
            <div className="relative flex h-full flex-col justify-end">
            <p className="eyebrow text-sport-foreground">AA / BB · WLLV</p>
            <p className="mt-5 font-display text-[clamp(4.5rem,12vw,9rem)] font-extrabold uppercase leading-[0.72] tracking-[-0.07em] text-white">
              WLLV
            </p>
            <p className="mt-5 max-w-2xl font-display text-3xl font-extrabold uppercase leading-[0.9] sm:text-4xl">
              {lang === "fr" ? "Les Chacals · double lettre" : "Les Chacals · double letter"}
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/65 md:text-base">
              {lang === "fr"
                ? "AHM Verdun sert de passerelle. Les équipes, camps, opérations et données AA/BB restent sous l’autorité du WLLV et de ses systèmes officiels."
                : "AHM Verdun acts as a gateway. AA/BB teams, camps, operations and data remain under WLLV and its official systems."}
            </p>
            <p className="mt-4 text-[8px] font-bold uppercase tracking-[0.14em] text-white/34">
              {lang === "fr" ? "Affiche de camp WLLV conservée dans la médiathèque AHMV. Les opérations AA/BB demeurent sous l’autorité du WLLV." : "WLLV camp artwork preserved in the AHMV media library. AA/BB operations remain under WLLV authority."}
            </p>
            </div>
          </div>
          <div className="flex flex-col justify-between border-t border-white/12 p-7 lg:border-l lg:border-t-0 md:p-10">
            <div>
              <ShieldCheck className="size-8 text-sport-foreground" />
              <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.18em] text-white/42">
                {lang === "fr" ? "Source d’autorité" : "Authority"}
              </p>
              <p className="mt-2 font-display text-3xl font-extrabold uppercase">WLLV</p>
              <p className="mt-4 text-sm leading-relaxed text-white/62">
                {lang === "fr"
                  ? "Pour les décisions, inscriptions, camps et informations de structure AA/BB, vérifiez toujours directement la source WLLV."
                  : "For AA/BB decisions, registration, camps and structure information, always verify directly with WLLV."}
              </p>
            </div>
            <Button asChild variant="sport" size="lg" className="mt-8">
              <a href={EXTERNAL_LINKS.wllv} target="_blank" rel="noopener noreferrer">
                {t("common.officialSite")} <ExternalLink className="size-4" />
              </a>
            </Button>
          </div>
        </section>
        <HouseSponsorSlot placement="wllv-gateway" count={1} compact />

        <section className="border border-white/12 bg-navy-deep p-4 text-white sm:p-6">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-sport-foreground">
                {lang === "fr" ? "Camp WLLV · médias officiels" : "WLLV camp · official media"}
              </p>
              <p className="mt-2 font-display text-3xl font-extrabold uppercase leading-none">
                {lang === "fr" ? "Affiche + horaire" : "Poster + schedule"}
              </p>
            </div>
            <p className="hidden text-[9px] font-bold uppercase tracking-[0.14em] text-white/45 sm:block">
              {lang === "fr" ? "Touchez pour agrandir" : "Tap to enlarge"}
            </p>
          </div>

          <div className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-[0.85fr_1.15fr] sm:overflow-visible sm:px-0">
            {wllvMedia.map((media, index) => (
              <MediaZoomTrigger
                key={media.url}
                items={wllvMedia}
                initialIndex={index}
                lang={lang}
                className="interactive-surface relative min-h-[300px] w-[84vw] max-w-[24rem] shrink-0 snap-center overflow-hidden border border-white/10 bg-navy sm:min-h-[380px] sm:w-auto sm:max-w-none"
              >
                <img
                  src={media.url}
                  alt={lang === "fr" ? media.alt.fr : media.alt.en}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 size-full object-contain transition-transform duration-500 group-hover:scale-[1.018]"
                />
              </MediaZoomTrigger>
            ))}
          </div>
        </section>


        <section className="overflow-hidden border border-navy/12 bg-background">
          <div className="bg-ice p-5 md:p-6">
            <p className="eyebrow text-sport">{lang === "fr" ? "Saison 2026–2027" : "2026–2027 season"}</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold uppercase leading-[0.9] text-navy md:text-4xl">
              {lang === "fr" ? "Parcours Chacals" : "Chacals pathway"}
            </h2>
          </div>
          <div className="grid gap-px bg-navy/10 sm:grid-cols-3 lg:grid-cols-6">
            {["M11", "M13", "M15", "M17", "M19", "M21"].map((category) => (
              <a
                key={category}
                href={EXTERNAL_LINKS.wllvSchedules}
                target="_blank"
                rel="noopener noreferrer"
                className="interactive-surface flex min-h-24 flex-col justify-between bg-background p-4 hover:bg-ice"
              >
                <span className="text-[8px] font-bold uppercase tracking-[0.16em] text-muted-foreground">WLLV</span>
                <span className="font-display text-3xl font-extrabold uppercase text-navy">{category}</span>
              </a>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <a
            href={EXTERNAL_LINKS.wllv}
            target="_blank"
            rel="noopener noreferrer"
            className="interactive-surface group border border-navy/12 bg-background p-6 hover:border-sport/40"
          >
            <div className="flex items-center justify-between">
              <ShieldCheck className="size-6 text-sport" aria-hidden />
              <ExternalLink className="size-4 text-muted-foreground" aria-hidden />
            </div>
            <h2 className="heading-card mt-6 group-hover:text-sport">
              {lang === "fr" ? "Site officiel WLLV" : "Official WLLV site"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {lang === "fr"
                ? "Structure, camps, équipes et informations administratives du double lettre."
                : "Structure, camps, teams and administrative information for double-letter hockey."}
            </p>
          </a>

          <a
            href={EXTERNAL_LINKS.wllvSchedules}
            target="_blank"
            rel="noopener noreferrer"
            className="interactive-surface group border border-navy/12 bg-background p-6 hover:border-sport/40"
          >
            <div className="flex items-center justify-between">
              <CalendarDays className="size-6 text-sport" aria-hidden />
              <ExternalLink className="size-4 text-muted-foreground" aria-hidden />
            </div>
            <h2 className="heading-card mt-6 group-hover:text-sport">
              {lang === "fr" ? "Horaires & classements AA/BB" : "AA/BB schedules & standings"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {lang === "fr"
                ? "Accès direct aux données sportives officielles."
                : "Direct access to official sport data."}
            </p>
          </a>
        </section>

        <section>
          <SectionHeading
            title={lang === "fr" ? "Ce que fait AHM Verdun ici" : "What AHM Verdun does here"}
          />
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                fr: "Orienter",
                en: "Guide",
                frText: "Diriger les familles vers la bonne ressource officielle.",
                enText: "Send families to the correct official resource.",
              },
              {
                fr: "Simplifier",
                en: "Simplify",
                frText: "Éviter de chercher dans plusieurs menus ou vieux liens.",
                enText: "Avoid hunting through multiple menus or old links.",
              },
              {
                fr: "Respecter la source",
                en: "Respect the source",
                frText: "Ne pas dupliquer ni modifier les opérations WLLV.",
                enText: "Do not duplicate or modify WLLV operations.",
              },
            ].map((item) => (
              <div key={item.fr} className="interactive-surface border border-navy/12 bg-ice p-5">
                <h3 className="heading-card">{lang === "fr" ? item.fr : item.en}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {lang === "fr" ? item.frText : item.enText}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
