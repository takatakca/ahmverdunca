import { canonicalLink } from "@/lib/seo";
import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, Clock3, ExternalLink, MapPin, Navigation, ShieldCheck, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HouseSponsorSlot } from "@/components/house-sponsor-slot";
import { OFFICIAL_MEDIA } from "@/data/official-media";
import { getPublicTeamById, legacyTeamScheduleUrl, officialTeamResultsUrl } from "@/data/team-directory";
import { useI18n } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { OFFICIAL_WEEK_META } from "@/data/official-week";

export const Route = createFileRoute("/equipe-event/$id")({
  head: () => ({
    links: canonicalLink("/equipes"),
    meta: [
      { title: "Aperçu activité équipe — AHM Verdun" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: TeamEventPage,
});

function TeamEventPage() {
  const { lang } = useI18n();
  const currentHref = useRouterState({ select: (state) => state.location.href });
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const id = pathname.split("/").filter(Boolean).at(-1) ?? "activity";
  const search = new URL(currentHref, SITE.domain).searchParams;
  const teamId = search.get("teamId") ?? "";
  const teamName = search.get("team") ?? "Équipe AHMV";
  const level = search.get("level") ?? "";
  const type = search.get("type") === "practice" ? "practice" : "game";
  const published = search.get("published") === "ahmv-week";
  const publishedDate = search.get("date") ?? "";
  const publishedTime = search.get("time") ?? "";
  const publishedVenue = search.get("venue") ?? "";
  const publishedActivity = search.get("activity") ?? "";
  const publishedGroup = search.get("group") ?? "";
  const isPublishedPractice = type === "practice" && published && Boolean(publishedDate && publishedTime && publishedVenue);
  const team = getPublicTeamById(teamId);
  const officialUrl = isPublishedPractice
    ? OFFICIAL_WEEK_META.sourceUrl
    : team
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
            {lang === "fr" ? "Retour à l’équipe" : "Back to team"}
          </a>

          <div className="mt-8 flex flex-wrap gap-2">
            <span className="bg-sport px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.15em] text-sport-foreground">
              {isPublishedPractice ? (lang === "fr" ? "SOURCE AHMV" : "AHMV SOURCE") : (lang === "fr" ? "SOURCE OFFICIELLE" : "OFFICIAL SOURCE")}
            </span>
            {level && <span className="border border-white/18 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-white/70">{level}</span>}
            <span className="border border-white/18 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-white/70">
              {type === "game" ? (lang === "fr" ? "Partie" : "Game") : (lang === "fr" ? "Pratique" : "Practice")}
            </span>
          </div>

          <h1 className="mt-4 max-w-[12ch] font-display text-[clamp(3.2rem,8vw,7.2rem)] font-extrabold uppercase leading-[0.82] tracking-[-0.045em]">
            {teamName}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/62">
            {isPublishedPractice
              ? (lang === "fr"
                  ? "Cette activité provient de la grille hebdomadaire publique AHMV intégrée au site. Le groupe publié est affiché tel quel afin de ne pas attribuer à tort une glace à une équipe précise."
                  : "This activity comes from the public AHMV weekly grid integrated into the site. The published group is shown as-is so the rink time is not incorrectly assigned to a specific team.")
              : (lang === "fr"
                  ? "Le détail exact de cette activité n’est pas publié localement. Utilisez la source officielle ci-dessous pour confirmer l’horaire, l’aréna et les informations sportives."
                  : "Exact activity details are not published locally. Use the official source below to confirm the schedule, arena and sport information.")}
          </p>
        </div>
      </section>

      <div className="container-site space-y-8 py-8 md:py-12">
        <section className="grid overflow-hidden border border-white/12 bg-navy-deep text-white lg:grid-cols-[1.15fr_0.85fr]">
          <div className="p-5 md:p-7">
            <p className="eyebrow text-sport-foreground">
              {type === "game"
                ? (lang === "fr" ? "Détail de la partie" : "Game detail")
                : (lang === "fr" ? "Détail de la pratique" : "Practice detail")}
            </p>

            <div className="mt-6 grid gap-px bg-white/10 sm:grid-cols-2">
              {[
                {
                  Icon: CalendarDays,
                  labelFr: "Date",
                  labelEn: "Date",
                  valueFr: isPublishedPractice ? publishedDate : "Non publié",
                  valueEn: isPublishedPractice ? publishedDate : "Not published",
                },
                {
                  Icon: Clock3,
                  labelFr: "Heure",
                  labelEn: "Time",
                  valueFr: isPublishedPractice ? publishedTime : "Source officielle",
                  valueEn: isPublishedPractice ? publishedTime : "Official source",
                },
                {
                  Icon: MapPin,
                  labelFr: "Aréna",
                  labelEn: "Arena",
                  valueFr: isPublishedPractice ? publishedVenue : "Non publié",
                  valueEn: isPublishedPractice ? publishedVenue : "Not published",
                },
                {
                  Icon: type === "game" ? Trophy : ShieldCheck,
                  labelFr: type === "game" ? "Adversaire" : "Groupe",
                  labelEn: type === "game" ? "Opponent" : "Group",
                  valueFr: isPublishedPractice ? (publishedGroup || publishedActivity) : "Non publié",
                  valueEn: isPublishedPractice ? (publishedGroup || publishedActivity) : "Not published",
                },
              ].map(({ Icon, labelFr, labelEn, valueFr, valueEn }) => (
                <article key={labelFr} className="bg-competition p-5 text-white">
                  <Icon className="size-5 text-sport-foreground" />
                  <p className="mt-4 text-[8px] font-bold uppercase tracking-[0.16em] text-white/42">{lang === "fr" ? labelFr : labelEn}</p>
                  <p className="mt-1 font-display text-2xl font-extrabold uppercase text-white">{lang === "fr" ? valueFr : valueEn}</p>
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
              <Button asChild variant="outline-light">
                <a href="/arenas">
                  <Navigation className="size-4" />
                  {lang === "fr" ? "Arénas & itinéraires" : "Arenas & directions"}
                </a>
              </Button>
            </div>
          </div>

          <aside className="border-t border-white/10 bg-competition p-5 lg:border-l lg:border-t-0 md:p-7">
            <p className="eyebrow text-sport">
              {isPublishedPractice
                ? (lang === "fr" ? "Source de l’activité" : "Activity source")
                : (lang === "fr" ? "Vérification officielle" : "Official verification")}
            </p>
            <div className="mt-5 space-y-3">
              {(isPublishedPractice
                ? [
                    lang === "fr" ? OFFICIAL_WEEK_META.title : OFFICIAL_WEEK_META.title,
                    lang === "fr" ? `Publié le ${OFFICIAL_WEEK_META.publishedAt}` : `Published ${OFFICIAL_WEEK_META.publishedAt}`,
                    lang === "fr" ? `Activité : ${publishedActivity || "Pratique"}` : `Activity: ${publishedActivity || "Practice"}`,
                    lang === "fr" ? "Groupe affiché exactement comme dans la grille publique" : "Group shown exactly as published in the public grid",
                    lang === "fr" ? "Aucune attribution d’équipe supplémentaire n’est déduite" : "No additional team assignment is inferred",
                  ]
                : [
                    lang === "fr" ? "Le site n’invente aucune date, heure ou aréna." : "The site does not invent any date, time or arena.",
                    lang === "fr" ? "La source officielle ci-contre demeure la référence sportive." : "The official source remains the sport reference.",
                    lang === "fr" ? "Les résultats et classements restent reliés au circuit officiel." : "Results and standings remain linked to the official circuit.",
                    lang === "fr" ? "Les itinéraires sont accessibles depuis le répertoire des arénas." : "Directions are available from the arena directory.",
                  ]).map((item) => (
                <div key={item} className="flex items-start gap-3 border-b border-white/10 pb-3 text-sm text-white/68 last:border-b-0">
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
