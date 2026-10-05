import { CalendarDays, ChevronRight, Clock3, ExternalLink, MapPin, Trophy } from "lucide-react";
import type { PublicTeamDirectoryEntry } from "@/data/team-directory";
import { legacyTeamScheduleUrl, officialTeamResultsUrl } from "@/data/team-directory";
import { OFFICIAL_MEDIA } from "@/data/official-media";
import { teamVisualForCategory } from "@/data/team-visuals";
import { OFFICIAL_WEEK_ACTIVITIES, OFFICIAL_WEEK_META } from "@/data/official-week";
import { ContentContributionButton } from "@/components/content-contribution-button";
import { useContentOverlay } from "@/lib/community-content";
import { officialWeekActivityMatchesTeam } from "@/lib/official-week-team";

type Lang = "fr" | "en";

function eventHref(
  team: PublicTeamDirectoryEntry,
  kind: "game" | "practice",
  slot: number,
  details?: { date: string; time: string; venue: string; activity: string; group: string },
) {
  const params = new URLSearchParams({
    teamId: team.legacyScheduleTeamId,
    team: team.name,
    level: team.level,
    type: kind,
    slot: String(slot),
  });

  if (details) {
    params.set("published", "ahmv-week");
    params.set("date", details.date);
    params.set("time", details.time);
    params.set("venue", details.venue);
    params.set("activity", details.activity);
    params.set("group", details.group);
  }

  return `/equipe-event/${kind}-${slot}?${params.toString()}`;
}

type CalendarRow = {
  dayFr: string;
  dayEn: string;
  time: string;
  noteFr: string;
  noteEn: string;
  href?: string;
  verified?: boolean;
};

function weekdayLabel(date: string, locale: string) {
  const parsed = new Date(`${date}T12:00:00-04:00`);
  return new Intl.DateTimeFormat(locale, { weekday: "short" }).format(parsed).replace(".", "").toUpperCase();
}

function MiniCalendar({
  title,
  eyebrow,
  rows,
  team,
  kind,
  lang,
  sourceHref,
}: {
  title: string;
  eyebrow: string;
  rows: readonly CalendarRow[];
  team: PublicTeamDirectoryEntry;
  kind: "game" | "practice";
  lang: Lang;
  sourceHref?: string | undefined;
}) {
  return (
    <section className="overflow-hidden border border-white/12 bg-white/[0.04]">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-sport-foreground">{eyebrow}</p>
          <h3 className="mt-1 font-display text-xl font-extrabold uppercase leading-none text-white">{title}</h3>
        </div>
        {kind === "game" ? <Trophy className="size-4 text-sport-foreground" /> : <Clock3 className="size-4 text-sport-foreground" />}
      </div>

      <div className="divide-y divide-white/10">
        {rows.length === 0 && (
          <div className="px-4 py-5">
            <p className="text-sm font-semibold text-white/72">
              {lang === "fr"
                ? "Aucune activité exacte de cette équipe n’est publiée dans la grille AHMV actuellement chargée."
                : "No exact activity for this team is published in the currently loaded AHMV schedule."}
            </p>
            <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.13em] text-white/38">
              {lang === "fr" ? "Consultez la source officielle ci-dessous." : "Use the official source below."}
            </p>
          </div>
        )}
        {rows.map((row, index) => (
          <a
            key={`${kind}-${index}`}
            href={row.href ?? eventHref(team, kind, index + 1)}
            target={row.href?.startsWith("http") ? "_blank" : undefined}
            rel={row.href?.startsWith("http") ? "noopener noreferrer" : undefined}
            className="group grid grid-cols-[3.5rem_4.2rem_minmax(0,1fr)_auto] items-center gap-2 px-4 py-3 text-white transition-colors hover:bg-white/[0.055]"
          >
            <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/42">
              {lang === "fr" ? row.dayFr : row.dayEn}
            </span>
            <span className="font-display text-lg font-extrabold uppercase text-white">{row.time}</span>
            <span className="min-w-0">
              <span className="block truncate text-[10px] font-semibold uppercase tracking-[0.08em] text-white/54">
                {lang === "fr" ? row.noteFr : row.noteEn}
              </span>
              {row.verified && (
                <span className="mt-0.5 block text-[7px] font-bold uppercase tracking-[0.14em] text-sport-foreground">
                  {lang === "fr" ? "Publié AHMV" : "Published AHMV"}
                </span>
              )}
            </span>
            <ChevronRight className="size-3.5 text-sport-foreground transition-transform group-hover:translate-x-0.5" />
          </a>
        ))}
      </div>

      <a
        href={sourceHref ?? (kind === "game" ? officialTeamResultsUrl(team) : legacyTeamScheduleUrl(team))}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-10 items-center justify-between border-t border-white/10 px-4 text-[8px] font-bold uppercase tracking-[0.14em] text-white/48 hover:text-white"
      >
        <span>{lang === "fr" ? "Source officielle" : "Official source"}</span>
        <ExternalLink className="size-3.5" />
      </a>
    </section>
  );
}

export function TeamMicrositeHero({
  team,
  categoryCode,
  lang,
}: {
  team: PublicTeamDirectoryEntry;
  categoryCode: string;
  lang: Lang;
}) {
  const heroMedia = teamVisualForCategory(team.categorySlug) ?? (team.categorySlug === "m11" ? OFFICIAL_MEDIA.tournamentM11Primary : OFFICIAL_MEDIA.practiceGroup);
  const publicContent = useContentOverlay(
    "team",
    `team:${team.legacyScheduleTeamId}`,
    {
      heroImageUrl: heroMedia.url,
      scheduleUrl: legacyTeamScheduleUrl(team),
      resultsUrl: officialTeamResultsUrl(team),
    },
  );
  const heroImageUrl = typeof publicContent.heroImageUrl === "string" ? publicContent.heroImageUrl : heroMedia.url;
  const scheduleUrl = typeof publicContent.scheduleUrl === "string" ? publicContent.scheduleUrl : legacyTeamScheduleUrl(team);
  const resultsUrl = typeof publicContent.resultsUrl === "string" ? publicContent.resultsUrl : officialTeamResultsUrl(team);
  const contributionFields = [
    { key: "heroImageUrl", label: { fr: "Photo / visuel", en: "Photo / visual" }, kind: "image-url" as const, current: heroImageUrl },
    { key: "scheduleUrl", label: { fr: "Lien d’horaire officiel", en: "Official schedule link" }, kind: "url" as const, current: scheduleUrl },
    { key: "resultsUrl", label: { fr: "Lien de résultats officiels", en: "Official results link" }, kind: "url" as const, current: resultsUrl },
  ];

  const publishedPracticeRows: CalendarRow[] = OFFICIAL_WEEK_ACTIVITIES
    .filter((activity) => {
      const scope = `${activity.group} ${activity.activity}`.toUpperCase();
      return officialWeekActivityMatchesTeam(activity, team) && /PRATIQUE|HOCKEY SUR MESURE|WLLV/.test(scope);
    })
    .slice(0, 3)
    .map((activity, index) => ({
      dayFr: weekdayLabel(activity.date, "fr-CA"),
      dayEn: weekdayLabel(activity.date, "en-CA"),
      time: activity.start,
      noteFr: `${activity.group} · ${activity.venue}`,
      noteEn: `${activity.group} · ${activity.venue}`,
      verified: true,
      href: eventHref(team, "practice", index + 1, {
        date: activity.date,
        time: activity.start,
        venue: activity.venue,
        activity: activity.activity,
        group: activity.group,
      }),
    }));

  const gameRows: CalendarRow[] = [
    {
      dayFr: "HORAIRE",
      dayEn: "SCHEDULE",
      time: "—",
      noteFr: "Prochaine partie · source officielle",
      noteEn: "Next game · official source",
      href: scheduleUrl,
    },
    {
      dayFr: "SCORES",
      dayEn: "SCORES",
      time: "—",
      noteFr: "Résultats et classement officiels",
      noteEn: "Official results and standings",
      href: resultsUrl,
    },
  ];

  const practiceRows = publishedPracticeRows;

  return (
    <section className="premium-depth relative overflow-hidden border border-navy/12 bg-competition text-white shadow-[0_30px_70px_-52px_rgba(7,16,43,0.9)]">
      <ContentContributionButton
        resourceType="team"
        resourceKey={`team:${team.legacyScheduleTeamId}`}
        title={`${team.name} · ${team.level}`}
        snapshot={{ heroImageUrl, scheduleUrl, resultsUrl }}
        fields={contributionFields}
        appearance="menu"
        className="absolute right-3 top-3 z-30"
      />
      <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative min-h-[300px] overflow-hidden sm:min-h-[390px] lg:min-h-[520px]">
          <img
            src={heroImageUrl}
            alt={lang === "fr" ? heroMedia.alt.fr : heroMedia.alt.en}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="premium-depth-media absolute inset-0 size-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,16,43,0.06)_20%,rgba(7,16,43,0.90)_100%)]" />
          <div className="ahmv-motion-sheen" aria-hidden />
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 md:p-8">
            <div className="flex flex-wrap gap-2">
              <span className="bg-sport px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.15em] text-sport-foreground">
                {categoryCode}
              </span>
              <span className="border border-white/20 bg-black/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-white/78 backdrop-blur">
                {team.level}
              </span>
              <span className="border border-white/20 bg-black/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-white/78 backdrop-blur">
                {lang === "fr" ? "Mini-site équipe" : "Team mini-site"}
              </span>
            </div>

            <h1 className="mt-4 max-w-[10ch] font-display text-[clamp(3rem,7vw,6.8rem)] font-extrabold uppercase leading-[0.82] tracking-[-0.045em]">
              {team.name}
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/66">
              {lang === "fr"
                ? "Votre point d’entrée pour les parties, pratiques, nouvelles, photos, réseaux sociaux et services de l’équipe."
                : "Your starting point for games, practices, news, photos, social channels and team services."}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <a href="#match-center" className="premium-control inline-flex min-h-10 items-center gap-2 bg-white px-4 text-[9px] font-bold uppercase tracking-[0.12em] text-navy">
                <CalendarDays className="size-4 text-sport" />
                {lang === "fr" ? "Calendrier" : "Calendar"}
              </a>
              <a href="#social-equipe" className="premium-control inline-flex min-h-10 items-center gap-2 border border-white/18 px-4 text-[9px] font-bold uppercase tracking-[0.12em] text-white">
                {lang === "fr" ? "Réseaux sociaux" : "Social"}
              </a>
            </div>

            <p className="mt-4 text-[8px] font-bold uppercase tracking-[0.15em] text-white/35">
              {lang === "fr"
                ? "Photo AHMV de la catégorie · elle sert de contexte visuel et ne prétend pas représenter l’alignement exact. Aucune heure de partie n’est inventée."
                : "AHMV category photo · used as visual context and not presented as the exact roster. No game time is fabricated."}
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-3 border-t border-white/12 p-4 sm:p-5 lg:border-l lg:border-t-0 lg:p-6">
          <div className="mb-1 flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Parties & pratiques" : "Games & practices"}</p>
              <p className="mt-1 text-xs leading-relaxed text-white/48">
                {lang === "fr"
                  ? "Les données publiées d’abord; la source officielle lorsque le détail exact n’est pas disponible ici."
                  : "Published data first; the official source whenever exact detail is not available here."}
              </p>
            </div>
            <span className="border border-sport/30 bg-sport/10 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.15em] text-sport-foreground">
              {publishedPracticeRows.length > 0 ? (lang === "fr" ? "PUBLIC + LIENS OFFICIELS" : "PUBLIC + OFFICIAL LINKS") : (lang === "fr" ? "LIENS OFFICIELS" : "OFFICIAL LINKS")}
            </span>
          </div>

          <MiniCalendar
            title={lang === "fr" ? "Parties" : "Games"}
            eyebrow={lang === "fr" ? "Source officielle" : "Official source"}
            rows={gameRows}
            team={team}
            kind="game"
            lang={lang}
            sourceHref={resultsUrl}
          />

          <MiniCalendar
            title={lang === "fr" ? "Pratiques" : "Practices"}
            eyebrow={lang === "fr" ? "Grille AHMV publiée" : "Published AHMV grid"}
            rows={practiceRows}
            team={team}
            kind="practice"
            lang={lang}
            sourceHref={publishedPracticeRows.length > 0 ? OFFICIAL_WEEK_META.sourceUrl : scheduleUrl}
          />
        </div>
      </div>

      <div className="grid gap-px border-t border-white/10 bg-white/10 sm:grid-cols-3">
        {[
          { icon: Trophy, fr: "Résultats", en: "Results", href: resultsUrl },
          { icon: MapPin, fr: "Arénas", en: "Arenas", href: "/arenas" },
          { icon: CalendarDays, fr: "Horaire officiel", en: "Official schedule", href: scheduleUrl },
        ].map(({ icon: Icon, fr, en, href }) => (
          <a
            key={fr}
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="group flex min-h-14 items-center justify-between bg-competition px-4 text-[9px] font-bold uppercase tracking-[0.13em] text-white/66 hover:bg-white/[0.045] hover:text-white"
          >
            <span className="flex items-center gap-2"><Icon className="size-4 text-sport-foreground" />{lang === "fr" ? fr : en}</span>
            <ChevronRight className="size-3.5 text-sport-foreground transition-transform group-hover:translate-x-0.5" />
          </a>
        ))}
      </div>
    </section>
  );
}
