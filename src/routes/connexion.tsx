import { canonicalLink } from "@/lib/seo";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, ExternalLink, Mail, ShieldCheck, Trophy, Users } from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { EXTERNAL_LINKS } from "@/lib/site";
import { useI18n } from "@/lib/i18n";
import { OFFICIAL_MEDIA } from "@/data/official-media";
import { usePreferredTeam } from "@/lib/team-preference";
import { officialTeamResultsUrl, publicTeamHubUrl } from "@/data/team-directory";
import { HouseSponsorSlot } from "@/components/house-sponsor-slot";

export const Route = createFileRoute("/connexion")({
  head: () => ({
    links: canonicalLink("/connexion"),
    meta: [
      { title: "Services hockey — AHM Verdun" },
      {
        name: "description",
        content:
          "Accédez aux services hockey officiels de l'AHM Verdun. Les communications numériques restent distinctes des opérations hockey.",
      },
      { property: "og:title", content: "Services hockey — AHM Verdun" },
      {
        property: "og:description",
        content: "Accès simple vers la plateforme officielle utilisée pour l'inscription et les services hockey.",
      },
    ],
  }),
  component: AccessPage,
});

function AccessPage() {
  const { lang } = useI18n();
  const { selectedTeams } = usePreferredTeam();
  const primaryTeam = selectedTeams[0];
  const showPlannedServices = import.meta.env["VITE_PUBLIC_INDEXING"] !== "true";

  return (
    <div className="bg-navy-deep text-white">
      <PageHeader
        eyebrow={lang === "fr" ? "Accès officiel" : "Official access"}
        title={lang === "fr" ? "Services hockey" : "Hockey services"}
        description={
          lang === "fr"
            ? "Retrouvez rapidement votre équipe, vos résultats et les services d’inscription."
            : "Quickly find your team, results and registration services."
        }
        actions={
          <Button asChild variant="sport" size="lg">
            <a href={EXTERNAL_LINKS.spordleLogin} target="_blank" rel="noopener noreferrer">
              {lang === "fr" ? "Ouvrir Spordle" : "Open Spordle"} <ExternalLink className="size-4" />
            </a>
          </Button>
        }
      />

      <div className="container-site max-w-6xl space-y-10 py-8 md:py-12">
        <section className="grid overflow-hidden border border-navy/12 bg-competition text-white lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative min-h-[280px] overflow-hidden sm:min-h-[360px]">
            <img
              src={OFFICIAL_MEDIA.practiceGroup.url}
              alt={lang === "fr" ? OFFICIAL_MEDIA.practiceGroup.alt.fr : OFFICIAL_MEDIA.practiceGroup.alt.en}
              loading="eager"
              decoding="async"
              className="absolute inset-0 size-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,16,43,0.08),rgba(7,16,43,0.9))]" />
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
              <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Pour les familles" : "For families"}</p>
              <h2 className="mt-2 max-w-2xl font-display text-4xl font-extrabold uppercase leading-[0.86] tracking-[-0.03em] sm:text-5xl">
                {lang === "fr" ? "Choisissez le bon accès." : "Choose the right access."}
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/66">
                {lang === "fr"
                  ? "Tout part d’ici : votre équipe, vos résultats et le bon accès pour les services hockey."
                  : "Start here for your team, results and the right hockey-service access."}
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center p-5 md:p-7">
            <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Accès rapide" : "Quick access"}</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {primaryTeam ? (
                <>
                  <a href={publicTeamHubUrl(primaryTeam)} className="premium-control flex min-h-20 flex-col justify-between border border-white/14 bg-white/[0.035] p-3 text-white">
                    <Users className="size-4 text-sport-foreground" />
                    <span className="font-display text-lg font-extrabold uppercase leading-none">{lang === "fr" ? "Mon équipe" : "My team"}</span>
                  </a>
                  <a href={officialTeamResultsUrl(primaryTeam)} target="_blank" rel="noopener noreferrer" className="premium-control flex min-h-20 flex-col justify-between border border-white/14 bg-white/[0.035] p-3 text-white">
                    <Trophy className="size-4 text-sport-foreground" />
                    <span className="font-display text-lg font-extrabold uppercase leading-none">{lang === "fr" ? "Résultats" : "Results"}</span>
                  </a>
                </>
              ) : (
                <>
                  <Link to="/equipes" className="premium-control flex min-h-20 flex-col justify-between border border-white/14 bg-white/[0.035] p-3 text-white">
                    <Users className="size-4 text-sport-foreground" />
                    <span className="font-display text-lg font-extrabold uppercase leading-none">{lang === "fr" ? "Équipes" : "Teams"}</span>
                  </Link>
                  <Link to="/horaires" className="premium-control flex min-h-20 flex-col justify-between border border-white/14 bg-white/[0.035] p-3 text-white">
                    <CalendarDays className="size-4 text-sport-foreground" />
                    <span className="font-display text-lg font-extrabold uppercase leading-none">{lang === "fr" ? "Horaires" : "Schedules"}</span>
                  </Link>
                </>
              )}
              <a href={EXTERNAL_LINKS.spordleLogin} target="_blank" rel="noopener noreferrer" className="premium-control col-span-2 flex min-h-12 items-center justify-between bg-sport px-4 text-[9px] font-bold uppercase tracking-[0.12em] text-sport-foreground">
                <span className="flex items-center gap-2"><ShieldCheck className="size-4" />Spordle · {lang === "fr" ? "service officiel" : "official service"}</span>
                <ExternalLink className="size-4" />
              </a>
            </div>
          </div>
        </section>

        <HouseSponsorSlot placement="access-gateway" count={1} compact />

        <div className="border border-white/12 bg-competition p-5 text-white">
          <p className="eyebrow text-sport-foreground">
            {lang === "fr" ? "Le bon service, tout de suite" : "The right service, right away"}
          </p>
          <p className="mt-2 text-sm text-white/58">
            {lang === "fr"
              ? "Pour les inscriptions et services membres hockey, utilisez Spordle. Pour l'information générale et les communications AHMV, restez sur ce site."
              : "For hockey registration and member services, use Spordle. For general AHMV information and communications, stay on this site."}
          </p>
        </div>

        <div className={showPlannedServices ? "grid gap-5 md:grid-cols-2" : "grid gap-5"}>
          <section className="competition-panel rounded-xl p-6 text-navy-foreground md:p-8">
            <p className="eyebrow text-sport-foreground">Spordle</p>
            <h2 className="heading-section mt-2">
              {lang === "fr" ? "Inscription et accès hockey" : "Registration and hockey access"}
            </h2>
            <p className="mt-3 text-sm text-navy-foreground/75">
              {lang === "fr"
                ? "Pour les services membres déjà gérés dans Spordle, continuez sur la plateforme officielle. Pour une nouvelle inscription AHMV, utilisez la page Inscriptions du site."
                : "For member services already managed in Spordle, continue to the official platform. For a new AHMV registration, use this site's Registration page."}
            </p>
            <Button asChild variant="sport" size="lg" className="mt-6">
              <a href={EXTERNAL_LINKS.spordleLogin} target="_blank" rel="noopener noreferrer">
                {lang === "fr" ? "Continuer vers Spordle" : "Continue to Spordle"} <ExternalLink className="size-4" />
              </a>
            </Button>
          </section>

          {showPlannedServices && (
            <section className="interactive-surface border border-white/12 bg-navy p-6 text-white md:p-8">
              <Mail className="size-7 text-sport-foreground" aria-hidden />
              <p className="eyebrow mt-6 text-sport-foreground">{lang === "fr" ? "Communications" : "Communications"}</p>
              <h2 className="heading-section mt-2">
                {lang === "fr" ? "Communications AHMV" : "AHMV communications"}
              </h2>
              <p className="mt-3 text-sm text-white/55">
                {lang === "fr"
                  ? "Les infolettres, nouvelles générales, campagnes et préférences de communication seront gérées séparément des opérations hockey."
                  : "Newsletters, general updates, campaigns and communication preferences will be managed separately from hockey operations."}
              </p>
              <Button asChild variant="outline-light" className="mt-6">
                <Link to="/contact">
                  {lang === "fr" ? "Contacter l'association" : "Contact the association"} <ArrowRight className="size-4" />
                </Link>
              </Button>
            </section>
          )}
        </div>

        <section>
          <SectionHeading
            className="border-white/12 [&_h2]:text-white [&_p]:text-white/55"
            title={lang === "fr" ? "Vous voulez inscrire un enfant?" : "Want to register a child?"}
            description={
              lang === "fr"
                ? "Consultez d'abord l'information AHMV, puis poursuivez sur le service officiel."
                : "Review the AHMV information first, then continue to the official service."
            }
          />
          <Button asChild variant="outline-light">
            <Link to="/inscriptions">
              {lang === "fr" ? "Voir les inscriptions" : "View registration information"} <ArrowRight className="size-4" />
            </Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
