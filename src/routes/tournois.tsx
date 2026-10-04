import { canonicalLink } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, ExternalLink, FileText, Trophy, Users } from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/share-button";
import { EXTERNAL_LINKS } from "@/lib/site";
import { OFFICIAL_MEDIA } from "@/data/official-media";
import { uploadedAhmvMediaById } from "@/data/uploaded-media";
import { useI18n } from "@/lib/i18n";
import { HouseSponsorSlot } from "@/components/house-sponsor-slot";

export const Route = createFileRoute("/tournois")({
  head: () => ({
    links: canonicalLink("/tournois"),
    meta: [
      { title: "Tournois — AHM Verdun" },
      {
        name: "description",
        content:
          "Portail AHM Verdun vers les informations officielles des tournois, notamment la 30e édition du Tournoi Provincial M11 de Verdun.",
      },
      { property: "og:title", content: "Tournois — AHM Verdun" },
      {
        property: "og:description",
        content: "Accès rapide aux informations officielles des tournois AHM Verdun.",
      },
    ],
  }),
  component: TournamentsPage,
});

function TournamentsPage() {
  const { lang } = useI18n();
  const tournamentPoster = uploadedAhmvMediaById(26)!;

  return (
    <>
      <PageHeader
        eyebrow={lang === "fr" ? "Événements AHMV" : "AHMV events"}
        title={lang === "fr" ? "Tournois" : "Tournaments"}
        description={
          lang === "fr"
            ? "Le site AHM Verdun vous mène vers les informations officielles du tournoi sans recréer les horaires, classements ou inscriptions."
            : "The AHM Verdun site sends you to official tournament information without recreating schedules, standings or registration."
        }
      />

      <div className="container-site space-y-12 py-8 md:py-12">
        <section className="grid overflow-hidden border border-navy/12 bg-navy text-navy-foreground lg:grid-cols-[1.25fr_0.75fr]">
          <div className="relative min-h-[420px] overflow-hidden sm:min-h-[520px]">
            <img
              src={tournamentPoster.url}
              alt={lang === "fr" ? tournamentPoster.alt.fr : tournamentPoster.alt.en}
              loading="eager"
              decoding="async"
              className="absolute inset-0 size-full bg-navy-deep object-contain"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,16,43,0.08),rgba(7,16,43,0.92))]" />
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 lg:p-10">
              <p className="eyebrow text-sport-foreground">{lang === "fr" ? "30e édition · Verdun" : "30th edition · Verdun"}</p>
              <h2 className="mt-3 max-w-4xl font-display text-4xl font-extrabold uppercase leading-[0.86] tracking-[-0.03em] sm:text-5xl md:text-6xl">
                {lang === "fr" ? "Tournoi Provincial M11 de Verdun" : "Verdun Provincial U11 Tournament"}
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/75">
                {lang === "fr"
                  ? "Du 18 au 31 janvier 2027 à l'Auditorium de Verdun. Les inscriptions sont annoncées ouvertes jusqu'au 15 novembre 2026 sur le site officiel du tournoi."
                  : "January 18–31, 2027 at the Verdun Auditorium. Registration is announced as open until November 15, 2026 on the tournament's official site."}
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-between border-t border-white/12 p-6 lg:border-l lg:border-t-0 md:p-8 lg:p-10">
            <div>
              <Trophy className="size-9 text-sport-foreground" aria-hidden />
              <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                {lang === "fr" ? "Dates" : "Dates"}
              </p>
              <p className="mt-1 font-display text-3xl font-extrabold uppercase">18–31 JAN 2027</p>
              <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                {lang === "fr" ? "Lieu" : "Venue"}
              </p>
              <p className="mt-1 font-display text-2xl font-extrabold uppercase">{lang === "fr" ? "Auditorium de Verdun" : "Verdun Auditorium"}</p>
            </div>
            <div className="mt-8 flex flex-col gap-3">
              <Button asChild variant="sport" size="lg">
                <a href={EXTERNAL_LINKS.verdunM11Tournament} target="_blank" rel="noopener noreferrer">
                  {lang === "fr" ? "Site officiel du tournoi" : "Official tournament site"} <ExternalLink className="size-4" />
                </a>
              </Button>
              <ShareButton
                variant="outline-light"
                title={lang === "fr" ? "Tournoi Provincial M11 de Verdun" : "Verdun Provincial U11 Tournament"}
                text={lang === "fr" ? "18 au 31 janvier 2027 · Auditorium de Verdun" : "January 18–31, 2027 · Verdun Auditorium"}
              />
            </div>
          </div>
        </section>

        <HouseSponsorSlot placement="tournaments-path" count={1} compact />

        <section className="grid h-44 grid-cols-2 gap-2 overflow-hidden sm:h-56 md:grid-cols-3">
          {[OFFICIAL_MEDIA.tournamentM11Secondary, OFFICIAL_MEDIA.tournamentM11Tertiary, OFFICIAL_MEDIA.tournamentM11Primary].map((media) => (
            <a
              key={media.url}
              href={media.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="interactive-surface group relative overflow-hidden bg-navy last:hidden md:last:block"
            >
              <img
                src={media.url}
                alt={lang === "fr" ? media.alt.fr : media.alt.en}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </a>
          ))}
        </section>

        <section>
          <SectionHeading
            eyebrow={lang === "fr" ? "Accès direct" : "Quick access"}
            title={lang === "fr" ? "Tout au bon endroit" : "Everything in the right place"}
            description={
              lang === "fr"
                ? "AHM Verdun présente l'événement; les opérations du tournoi restent dans leur système officiel."
                : "AHM Verdun showcases the event; tournament operations remain in their official system."
            }
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <a
              href={EXTERNAL_LINKS.verdunM11Registration}
              target="_blank"
              rel="noopener noreferrer"
              className="interactive-surface group border border-navy/12 bg-background p-6 hover:border-sport/40"
            >
              <div className="flex items-center justify-between">
                <Users className="size-6 text-sport" aria-hidden />
                <ExternalLink className="size-4 text-muted-foreground" aria-hidden />
              </div>
              <h3 className="heading-card mt-5 group-hover:text-sport">
                {lang === "fr" ? "Inscriptions M11" : "U11 registration"}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {lang === "fr"
                  ? "Inscriptions ouvertes sur le site officiel jusqu’au 15 novembre 2026."
                  : "Registration is open on the official site until November 15, 2026."}
              </p>
            </a>

            <a
              href={EXTERNAL_LINKS.m11TournamentSchedule}
              target="_blank"
              rel="noopener noreferrer"
              className="interactive-surface group border border-navy/12 bg-background p-6 hover:border-sport/40"
            >
              <div className="flex items-center justify-between">
                <CalendarDays className="size-6 text-sport" aria-hidden />
                <ExternalLink className="size-4 text-muted-foreground" aria-hidden />
              </div>
              <h3 className="heading-card mt-5 group-hover:text-sport">
                {lang === "fr" ? "Horaires & classements M11" : "U11 schedules & standings"}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {lang === "fr"
                  ? "Ouvrir les données sportives officielles dans Spordle."
                  : "Open official sport data in Spordle."}
              </p>
            </a>

            <a
              href={EXTERNAL_LINKS.m11TournamentRules}
              target="_blank"
              rel="noopener noreferrer"
              className="interactive-surface group border border-navy/12 bg-background p-6 hover:border-sport/40"
            >
              <div className="flex items-center justify-between">
                <FileText className="size-6 text-sport" aria-hidden />
                <ExternalLink className="size-4 text-muted-foreground" aria-hidden />
              </div>
              <h3 className="heading-card mt-5 group-hover:text-sport">
                {lang === "fr" ? "Règlements M11" : "U11 tournament rules"}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {lang === "fr"
                  ? "Consulter les règlements actuellement publiés sur le site officiel du tournoi."
                  : "Read the rules currently published on the tournament’s official site."}
              </p>
            </a>

            <a
              href={EXTERNAL_LINKS.m7FestivalSchedule}
              target="_blank"
              rel="noopener noreferrer"
              className="interactive-surface group border border-navy/12 bg-background p-6 hover:border-sport/40"
            >
              <div className="flex items-center justify-between">
                <Trophy className="size-6 text-sport" aria-hidden />
                <ExternalLink className="size-4 text-muted-foreground" aria-hidden />
              </div>
              <h3 className="heading-card mt-5 group-hover:text-sport">
                {lang === "fr" ? "Festival M7" : "U7 Festival"}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {lang === "fr"
                  ? "Accéder à l'horaire officiel actuellement publié."
                  : "Open the currently published official schedule."}
              </p>
            </a>
          </div>

          <div className="mt-5 border border-navy/12 bg-ice p-6">
            <Users className="size-6 text-sport" aria-hidden />
            <h3 className="heading-card mt-5">
              {lang === "fr" ? "Bénévoles & partenaires" : "Volunteers & partners"}
            </h3>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              {lang === "fr"
                ? "Pour contribuer au tournoi comme bénévole ou partenaire, communiquez avec l’association. Les inscriptions, horaires et résultats demeurent sur les plateformes officielles."
                : "To support the tournament as a volunteer or partner, contact the association. Registration, schedules and results remain on the official platforms."}
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
