import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, ExternalLink, Trophy, Users } from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/page-header";
import { Button } from "@/components/ui/button";
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
            <article className="card-elevated p-6">
              <CalendarDays className="size-6 text-sport" aria-hidden />
              <h3 className="heading-card mt-5">
                {lang === "fr" ? "Horaires & classements" : "Schedules & standings"}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {lang === "fr"
                  ? "Consultez toujours le site officiel du tournoi pour les données sportives."
                  : "Always use the official tournament site for sport data."}
              </p>
            </article>
            <article className="card-elevated p-6">
              <Users className="size-6 text-sport" aria-hidden />
              <h3 className="heading-card mt-5">
                {lang === "fr" ? "Bénévoles" : "Volunteers"}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {lang === "fr"
                  ? "Les occasions de bénévolat et les consignes officielles sont publiées par l'organisation du tournoi."
                  : "Volunteer opportunities and official instructions are published by the tournament organization."}
              </p>
            </article>
            <article className="card-elevated p-6">
              <Trophy className="size-6 text-sport" aria-hidden />
              <h3 className="heading-card mt-5">
                {lang === "fr" ? "Partenaires" : "Partners"}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {lang === "fr"
                  ? "La visibilité des partenaires pourra être amplifiée sur le site, les campagnes et les réseaux sociaux via GROUPE TAKATAK."
                  : "Partner visibility can be amplified across the site, campaigns and social channels through GROUPE TAKATAK."}
              </p>
            </article>
          </div>
        </section>
      </div>
    </>
  );
}
