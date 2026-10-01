import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, ExternalLink, FileText, Trophy, Users } from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/share-button";
import { EXTERNAL_LINKS } from "@/lib/site";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/tournois")({
  head: () => ({
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
        <section className="overflow-hidden rounded-xl border border-border bg-background shadow-card">
          <div className="competition-panel p-6 text-navy-foreground md:p-8 lg:p-10">
            <Trophy className="size-9 text-sport-foreground" aria-hidden />
            <p className="eyebrow mt-7 text-sport-foreground">
              {lang === "fr" ? "30e édition" : "30th edition"}
            </p>
            <h2 className="mt-2 max-w-4xl font-display text-4xl font-extrabold uppercase leading-none md:text-6xl">
              {lang === "fr" ? "Tournoi Provincial M11 de Verdun" : "Verdun Provincial U11 Tournament"}
            </h2>
            <p className="mt-4 max-w-2xl text-base text-navy-foreground/75">
              {lang === "fr"
                ? "Du 18 au 31 janvier 2027 à l'Auditorium de Verdun. Les inscriptions sont annoncées ouvertes jusqu'au 15 novembre 2026 sur le site officiel du tournoi."
                : "January 18–31, 2027 at the Verdun Auditorium. Registration is announced as open until November 15, 2026 on the tournament's official site."}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="sport" size="lg">
                <a href={EXTERNAL_LINKS.verdunM11Tournament} target="_blank" rel="noopener noreferrer">
                  {lang === "fr" ? "Site officiel du tournoi" : "Official tournament site"} <ExternalLink className="size-4" />
                </a>
              </Button>
              <ShareButton
                variant="outline-light"
                title={lang === "fr" ? "Tournoi Provincial M11 de Verdun" : "Verdun Provincial U11 Tournament"}
                text={
                  lang === "fr"
                    ? "18 au 31 janvier 2027 · Auditorium de Verdun"
                    : "January 18–31, 2027 · Verdun Auditorium"
                }
              />
            </div>
          </div>
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
          <div className="grid gap-4 md:grid-cols-3">
            <a
              href={EXTERNAL_LINKS.m11TournamentSchedule}
              target="_blank"
              rel="noopener noreferrer"
              className="card-elevated group p-6"
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
              className="card-elevated group p-6"
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
                  ? "Ouvrir le document actuellement publié par l'AHM Verdun."
                  : "Open the document currently published by AHM Verdun."}
              </p>
            </a>

            <a
              href={EXTERNAL_LINKS.m7FestivalSchedule}
              target="_blank"
              rel="noopener noreferrer"
              className="card-elevated group p-6"
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

          <div className="card-elevated mt-5 p-6">
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
