import { canonicalLink } from "@/lib/seo";
import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, Clock3, ExternalLink, MapPin, Navigation, ShieldCheck, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HouseSponsorSlot } from "@/components/house-sponsor-slot";
import { OFFICIAL_MEDIA } from "@/data/official-media";
import { getPublicTeamById, legacyTeamScheduleUrl, officialTeamResultsUrl } from "@/data/team-directory";
import { useI18n } from "@/lib/i18n";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/equipe-event/$id")({
  head: ({ params }) => ({
    links: canonicalLink(`/equipe-event/${params.id}`),
    meta: [
      { title: "Aperçu activité équipe — AHM Verdun" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: TeamEventDemoPage,
});

function TeamEventDemoPage() {
  const { lang } = useI18n();
  const { id } = Route.useParams();
  const currentHref = useRouterState({ select: (state) => state.location.href });
  const search = new URL(currentHref, SITE.domain).searchParams;
  const teamId = search.get("teamId") ?? "";
  const teamName = search.get("team") ?? "Équipe AHMV";
  const level = search.get("level") ?? "";
  const type = search.get("type") === "practice" ? "practice" : "game";
  const slot = search.get("slot") ?? "1";
  const team = getPublicTeamById(teamId);
  const officialUrl = team
    ? type === "game"
      ? officialTeamResultsUrl(team)
      : legacyTeamScheduleUrl(team)
    : "/horaires";
  const media = type === "game" ? OFFICIAL_MEDIA.practicePlayers : OFFICIAL_MEDIA.practiceCoach;

  return (
    <>
      <section className="relative overflow-hidden bg-competition text-white">
        <img
          src={media.url}
          alt={lang === "fr" ? media.alt.fr : media.alt.en}
          className="absolute inset-0 size-full object-cover opacity-52"
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,16,43,0.96)_0%,rgba(7,16,43,0.78)_55%,rgba(7,16,43,0.48)_100%)]" />
        <div className="container-site relative py-10 md:py-14">
          <a
            href={team ? `/equipes/${team.categorySlug}?teamId=${encodeURIComponent(team.legacyScheduleTeamId)}` : "/equipes"}
            className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.14em] text-white/62 hover:text-white"
          >
            <ArrowLeft className="size-3.5 text-sport-foreground" />
            {lang === "fr" ? "Retour au mini-site" : "Back to team mini-site"}
          </a>

          <div className="mt-8 flex flex-wrap gap-2">
            <span className="bg-sport px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.15em] text-sport-foreground">DEMO</span>
            {level && <span className="border border-white/18 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-white/70">{level}</span>}
            <span className="border border-white/18 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-white/70">
              {type === "game" ? (lang === "fr" ? "Partie" : "Game") : (lang === "fr" ? "Pratique" : "Practice")}
            </span>
          </div>

          <h1 className="mt-4 max-w-[12ch] font-display text-[clamp(3.2rem,8vw,7.2rem)] font-extrabold uppercase leading-[0.82] tracking-[-0.045em]">
            {teamName}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/62">
            {lang === "fr"
              ? "Cette fiche montre exactement à quoi ressemblera le détail d’une activité une fois le flux officiel branché. Les données ci-dessous sont volontairement des placeholders de démonstration."
              : "This page shows exactly how an activity detail will look once the official feed is connected. The values below are intentionally demo placeholders."}
          </p>
        </div>
      </section>

      <div className="container-site space-y-8 py-8 md:py-12">
        <section className="grid overflow-hidden border border-navy/12 bg-background lg:grid-cols-[1.15fr_0.85fr]">
          <div className="p-5 md:p-7">
            <p className="eyebrow text-sport">
              {type === "game"
                ? (lang === "fr" ? "Détail de la partie" : "Game detail")
                : (lang === "fr" ? "Détail de la pratique" : "Practice detail")}
            </p>

            <div className="mt-6 grid gap-px bg-navy/10 sm:grid-cols-2">
              {[
                { Icon: CalendarDays, labelFr: "Date", labelEn: "Date", valueFr: `À connecter · slot ${slot}`, valueEn: `To connect · slot ${slot}` },
                { Icon: Clock3, labelFr: "Heure", labelEn: "Time", valueFr: "Source officielle", valueEn: "Official source" },
                { Icon: MapPin, labelFr: "Aréna", labelEn: "Arena", valueFr: "À connecter", valueEn: "To connect" },
                { Icon: type === "game" ? Trophy : ShieldCheck, labelFr: type === "game" ? "Adversaire" : "Groupe", labelEn: type === "game" ? "Opponent" : "Group", valueFr: "À connecter", valueEn: "To connect" },
              ].map(({ Icon, labelFr, labelEn, valueFr, valueEn }) => (
                <article key={labelFr} className="bg-background p-5">
                  <Icon className="size-5 text-sport" />
                  <p className="mt-4 text-[8px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{lang === "fr" ? labelFr : labelEn}</p>
                  <p className="mt-1 font-display text-2xl font-extrabold uppercase text-navy">{lang === "fr" ? valueFr : valueEn}</p>
                </article>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild variant="sport">
                <a href={officialUrl} target={officialUrl.startsWith("http") ? "_blank" : undefined} rel={officialUrl.startsWith("http") ? "noopener noreferrer" : undefined}>
                  <ExternalLink className="size-4" />
                  {lang === "fr" ? "Ouvrir la source officielle" : "Open official source"}
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href="/arenas">
                  <Navigation className="size-4" />
                  {lang === "fr" ? "Arénas & itinéraires" : "Arenas & directions"}
                </a>
              </Button>
            </div>
          </div>

          <aside className="border-t border-navy/10 bg-ice p-5 lg:border-l lg:border-t-0 md:p-7">
            <p className="eyebrow text-sport">{lang === "fr" ? "Quand le flux sera actif" : "When the feed is live"}</p>
            <div className="mt-5 space-y-3">
              {[
                lang === "fr" ? "Date, heure et aréna officiels" : "Official date, time and arena",
                lang === "fr" ? "Adversaire et statut du match" : "Opponent and game status",
                lang === "fr" ? "Score final et feuille de match" : "Final score and scoresheet",
                lang === "fr" ? "Buts, pénalités et liens officiels si disponibles" : "Goals, penalties and official links when available",
                lang === "fr" ? "Google Maps, Waze et Apple Plans" : "Google Maps, Waze and Apple Maps",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 border-b border-navy/10 pb-3 text-sm text-navy last:border-b-0">
                  <span className="mt-1 size-2 shrink-0 rounded-full bg-sport" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <HouseSponsorSlot placement={`team-event-${teamId || id}`} />
      </div>
    </>
  );
}
