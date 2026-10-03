import { CalendarDays, ChevronRight, Clock3, ExternalLink, MapPin, Trophy } from "lucide-react";
import type { PublicTeamDirectoryEntry } from "@/data/team-directory";
import { legacyTeamScheduleUrl, officialTeamResultsUrl } from "@/data/team-directory";
import { OFFICIAL_MEDIA } from "@/data/official-media";
import { OFFICIAL_WEEK_ACTIVITIES, OFFICIAL_WEEK_META } from "@/data/official-week";

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

const DEMO_GAMES = [
  { dayFr: "SAM.", dayEn: "SAT.", time: "08:00", noteFr: "Adversaire à connecter", noteEn: "Opponent to connect" },
  { dayFr: "DIM.", dayEn: "SUN.", time: "13:30", noteFr: "Match suivant", noteEn: "Next match" },
  { dayFr: "SAM.", dayEn: "SAT.", time: "17:15", noteFr: "Horaire saison", noteEn: "Season schedule" },
] as const;

const DEMO_PRACTICES: CalendarRow[] = [
  { dayFr: "À VENIR", dayEn: "COMING", time: "—", noteFr: "Pratique à connecter", noteEn: "Practice to connect" },
  { dayFr: "SOURCE", dayEn: "SOURCE", time: "—", noteFr: "Grille AHMV officielle", noteEn: "Official AHMV grid" },
];

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
  sourceHref?: string;
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
        {rows.map((row, index) => (
          <a
            key={`${kind}-${index}`}
            href={row.href ?? eventHref(team, kind, index + 1)}
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
  const heroMedia = team.categorySlug === "m11" ? OFFICIAL_MEDIA.tournamentM11Primary : OFFICIAL_MEDIA.practiceGroup;

  const categoryToken = team.categorySlug === "feminin"
    ? "M12"
    : team.categorySlug === "junior"
      ? "JUNIOR"
      : team.categorySlug.toUpperCase();

  const publishedPracticeRows: CalendarRow[] = OFFICIAL_WEEK_ACTIVITIES
    .filter((activity) => {
      const scope = `${activity.group} ${activity.activity}`.toUpperCase();
      return scope.includes(categoryToken) && /PRATIQUE|HOCKEY SUR MESURE|WLLV/.test(scope);
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

  const practiceRows = publishedPracticeRows.length > 0 ? publishedPracticeRows : DEMO_PRACTICES;

  return (
    <section className="overflow-hidden border border-navy/12 bg-competition text-white shadow-[0_30px_70px_-52px_rgba(7,16,43,0.9)]">
      <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative min-h-[300px] overflow-hidden sm:min-h-[390px] lg:min-h-[520px]">
          <img
            src={heroMedia.url}
            alt={lang === "fr" ? heroMedia.alt.fr : heroMedia.alt.en}
            loading="eager"
            decoding="async"
            className="absolute inset-0 size-full object-cover"
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
                ? "Photo AHMV réelle · horaire ci-contre en démonstration jusqu’au branchement du flux officiel."
                : "Real AHMV photo · schedule preview is demo-only until the official feed is connected."}
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-3 border-t border-white/12 p-4 sm:p-5 lg:border-l lg:border-t-0 lg:p-6">
          <div className="mb-1 flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow text-sport-foreground">{lang === "fr" ? "À venir" : "Coming up"}</p>
              <p className="mt-1 text-xs leading-relaxed text-white/48">
                {lang === "fr" ? "Deux calendriers rapides, pensés pour le pouce." : "Two quick calendars designed for one-thumb use."}
              </p>
            </div>
            <span className="border border-sport/30 bg-sport/10 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.15em] text-sport-foreground">
              {publishedPracticeRows.length > 0 ? "PUBLIC + DEMO" : "DEMO"}
            </span>
          </div>

          <MiniCalendar
            title={lang === "fr" ? "Parties" : "Games"}
            eyebrow={lang === "fr" ? "Prochaines games" : "Upcoming games"}
            rows={DEMO_GAMES}
            team={team}
            kind="game"
            lang={lang}
          />

          <MiniCalendar
            title={lang === "fr" ? "Pratiques" : "Practices"}
            eyebrow={lang === "fr" ? "Prochaines glaces" : "Upcoming ice"}
            rows={practiceRows}
            team={team}
            kind="practice"
            lang={lang}
            sourceHref={publishedPracticeRows.length > 0 ? OFFICIAL_WEEK_META.sourceUrl : undefined}
          />
        </div>
      </div>

      <div className="grid gap-px border-t border-white/10 bg-white/10 sm:grid-cols-3">
        {[
          { icon: Trophy, fr: "Résultats", en: "Results", href: officialTeamResultsUrl(team) },
          { icon: MapPin, fr: "Arénas", en: "Arenas", href: "/arenas" },
          { icon: CalendarDays, fr: "Horaire officiel", en: "Official schedule", href: legacyTeamScheduleUrl(team) },
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
