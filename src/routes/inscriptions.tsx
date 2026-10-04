import { canonicalLink } from "@/lib/seo";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ExternalLink, Info } from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { CURRENT_TEAMS } from "@/data/teams";
import { uploadedAhmvMediaById } from "@/data/uploaded-media";
import { teamVisualForCategory } from "@/data/team-visuals";
import { EXTERNAL_LINKS } from "@/lib/site";
import { useI18n } from "@/lib/i18n";
import { HouseSponsorSlot } from "@/components/house-sponsor-slot";
import { MediaZoomTrigger } from "@/components/media/media-zoom-trigger";

const REGISTRATION_POSTER = uploadedAhmvMediaById(39)!;

export const Route = createFileRoute("/inscriptions")({
  head: () => ({
    links: canonicalLink("/inscriptions"),
    meta: [
      { title: "Inscriptions 2026–2027 — AHM Verdun" },
      {
        name: "description",
        content:
          "Informations d'inscription AHM Verdun et accès direct à la plateforme officielle de hockey.",
      },
      { property: "og:title", content: "Inscriptions 2026–2027 — AHM Verdun" },
      { property: "og:image", content: REGISTRATION_POSTER.url },
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
  const registrationPoster = REGISTRATION_POSTER;

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
        <section className="grid overflow-hidden border border-navy/12 bg-navy text-white lg:grid-cols-[1.15fr_0.85fr]">
          <MediaZoomTrigger
            items={[registrationPoster]}
            lang={lang}
            className="relative min-h-[300px] overflow-hidden sm:min-h-[380px]"
          >
            <img
              src={registrationPoster.url}
              alt={lang === "fr" ? registrationPoster.alt.fr : registrationPoster.alt.en}
              loading="eager"
              decoding="async"
              className="absolute inset-0 size-full bg-navy-deep object-contain transition-transform duration-700 group-hover:scale-[1.015]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,16,43,0.08),rgba(7,16,43,0.84))]" />
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
              <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Saison 2026–2027" : "2026–2027 season"}</p>
              <h2 className="mt-2 max-w-2xl font-display text-4xl font-extrabold uppercase leading-[0.88] tracking-[-0.03em] sm:text-5xl">
                {lang === "fr" ? "Du bon groupe au bon système." : "From the right group to the right system."}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/72">
                {lang === "fr"
                  ? "AHM Verdun vous aide à repérer la catégorie et les informations utiles; l’inscription officielle demeure ensuite dans Spordle."
                  : "AHM Verdun helps you identify the category and useful information; official registration then continues in Spordle."}
              </p>
            </div>
          </MediaZoomTrigger>
          <div className="flex flex-col justify-center border-t border-white/12 p-6 lg:border-l lg:border-t-0 md:p-8">
            <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Accès officiel" : "Official access"}</p>
            <p className="mt-4 font-display text-4xl font-extrabold uppercase leading-[0.9]">{lang === "fr" ? "Prêt à inscrire?" : "Ready to register?"}</p>
            <p className="mt-4 text-sm leading-relaxed text-white/65">
              {lang === "fr"
                ? "Documents, paiements et confirmation finale sont traités dans le parcours officiel. Le portail AHMV reste votre guide avant et après l’inscription."
                : "Documents, payments and final confirmation are handled in the official process. The AHMV portal remains your guide before and after registration."}
            </p>
            <a
              href={EXTERNAL_LINKS.spordleRegister}
              target="_blank"
              rel="noopener noreferrer"
              className="premium-control mt-6 inline-flex min-h-12 items-center justify-between bg-sport px-5 font-display text-base font-bold uppercase tracking-wide text-sport-foreground"
            >
              {t("reg.cta")} <ExternalLink className="size-4" />
            </a>
          </div>
        </section>
        <div className="broadcast-rail border border-white/12 bg-competition p-5 pl-7 text-white">
          <p className="eyebrow text-sport-foreground">
            {lang === "fr" ? "Parcours officiel" : "Official pathway"}
          </p>
          <p className="mt-2 text-sm text-white/62">
            {lang === "fr"
              ? "AHM Verdun explique le parcours ici, puis l'inscription elle-même se poursuit sur Spordle, la plateforme officielle déjà utilisée par l'association."
              : "AHM Verdun explains the process here, then registration continues on Spordle, the official platform already used by the association."}
          </p>
        </div>

        <HouseSponsorSlot placement="registration-path" count={1} compact />

        <section aria-labelledby="registration-steps-title">
          <SectionHeading
            id="registration-steps-title"
            eyebrow={lang === "fr" ? "3 étapes" : "3 steps"}
            title={lang === "fr" ? "Simple du début à la fin" : "Simple from start to finish"}
            description={
              lang === "fr"
                ? "Le site vous prépare, puis Spordle prend le relais pour l'inscription hockey officielle."
                : "This site prepares you, then Spordle takes over for the official hockey registration."
            }
          />
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                Icon: Info,
                number: "01",
                frTitle: "Choisir la catégorie",
                enTitle: "Choose the category",
                frText: "Repérez la catégorie qui correspond à votre enfant et ouvrez sa page AHMV.",
                enText: "Find the category that matches your child and open its AHMV page.",
              },
              {
                Icon: ExternalLink,
                number: "02",
                frTitle: "Ouvrir Spordle",
                enTitle: "Open Spordle",
                frText: "Continuez ensuite vers la plateforme officielle d'inscription.",
                enText: "Then continue to the official registration platform.",
              },
              {
                Icon: CheckCircle2,
                number: "03",
                frTitle: "Suivre les étapes officielles",
                enTitle: "Follow the official steps",
                frText: "Documents, paiements et confirmations restent dans le processus Spordle.",
                enText: "Documents, payments and confirmations stay in the Spordle process.",
              },
            ].map(({ Icon, number, frTitle, enTitle, frText, enText }) => (
              <div key={number} className="interactive-surface relative overflow-hidden border border-white/12 bg-competition p-6 text-white">
                <span className="absolute right-4 top-2 font-display text-5xl font-extrabold text-white/5">
                  {number}
                </span>
                <Icon className="size-6 text-sport" aria-hidden />
                <h3 className="mt-6 font-display text-2xl font-extrabold uppercase leading-[0.92] text-white">{lang === "fr" ? frTitle : enTitle}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/58">
                  {lang === "fr" ? frText : enText}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="competition-panel relative overflow-hidden border border-navy-foreground/10 p-6 text-navy-foreground md:p-8">
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
          <div className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
            {CURRENT_TEAMS.map((team) => {
              const media = teamVisualForCategory(team.slug);
              return (
                <Link
                  key={team.slug}
                  to="/equipes/$slug"
                  params={{ slug: team.slug }}
                  className="interactive-surface group relative min-h-40 w-[74vw] max-w-[20rem] shrink-0 snap-center overflow-hidden border border-navy/12 bg-navy sm:w-auto sm:max-w-none"
                >
                  {media && (
                    <img
                      src={media.url}
                      alt={lang === "fr" ? media.alt.fr : media.alt.en}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 size-full object-cover opacity-76 transition-[transform,opacity] duration-500 group-hover:scale-[1.035] group-hover:opacity-92"
                    />
                  )}
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,16,43,0.16),rgba(7,16,43,0.94))]" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-sport-foreground">
                          {lang === "fr" ? "Catégorie AHMV" : "AHMV category"}
                        </span>
                        <p className="mt-1 font-display text-2xl font-extrabold uppercase leading-none">{l(team.name)}</p>
                        <p className="mt-1.5 text-[10px] font-semibold text-white/58">{l(team.ages)}</p>
                      </div>
                      <span className="font-display text-3xl font-extrabold uppercase text-white/30">{team.code}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>



        <section className="border border-white/12 bg-competition p-6 text-white md:p-8">
          <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Soutien aux familles" : "Family support"}</p>
          <h2 className="mt-2 font-display text-4xl font-extrabold uppercase leading-[0.9]">
            {lang === "fr" ? "Aide financière" : "Financial assistance"}
          </h2>
          <p className="mt-4 max-w-2xl text-base text-white/62">
            {lang === "fr"
              ? "Des programmes externes peuvent soutenir la participation sportive. Consultez toujours les critères directement auprès du programme concerné."
              : "External programs may support sport participation. Always verify eligibility directly with the relevant program."}
          </p>
          <Button asChild variant="outline-light" className="mt-5">
            <Link to="/ressources">{t("nav.resources")}</Link>
          </Button>
        </section>
      </div>
    </>
  );
}
