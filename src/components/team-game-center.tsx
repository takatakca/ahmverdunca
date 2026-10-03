import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ExternalLink, MapPin, Navigation, Radio, Trophy } from "lucide-react";
import type { PublicTeamDirectoryEntry } from "@/data/team-directory";
import { legacyTeamScheduleUrl, officialTeamResultsUrl } from "@/data/team-directory";
import { EXTERNAL_LINKS } from "@/lib/site";

type TeamGame = {
  id: string;
  startsAt?: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  venue?: string;
  venueAddress?: string;
  status?: "scheduled" | "final" | "cancelled";
  officialUrl?: string;
  scoresheetUrl?: string;
};

type Standing = {
  rank?: number;
  gamesPlayed?: number;
  wins?: number;
  losses?: number;
  ties?: number;
  points?: number;
};

type TeamGameFeed = {
  status?: "active" | "not_connected" | "unavailable";
  updatedAt?: string;
  nextGame?: TeamGame;
  latestResult?: TeamGame;
  recentResults?: TeamGame[];
  standing?: Standing;
  sourceUrl?: string;
};

function isDoubleLetter(level: string) {
  return /(^|\s)(AA|BB)(\s|$)/i.test(level);
}

function directionsUrls(destination: string) {
  const target = encodeURIComponent(destination);
  return {
    google: `https://www.google.com/maps/dir/?api=1&destination=${target}`,
    apple: `https://maps.apple.com/?daddr=${target}`,
    waze: `https://www.waze.com/ul?q=${target}&navigate=yes`,
  };
}

function formatGameDate(startsAt: string | undefined, lang: "fr" | "en") {
  if (!startsAt) return undefined;
  const date = new Date(startsAt);
  if (Number.isNaN(date.getTime())) return undefined;

  return new Intl.DateTimeFormat(lang === "fr" ? "fr-CA" : "en-CA", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function TeamGameCenter({
  team,
  lang,
}: {
  team: PublicTeamDirectoryEntry;
  lang: "fr" | "en";
}) {
  const [feed, setFeed] = useState<TeamGameFeed | null>(null);
  const [loading, setLoading] = useState(true);

  const officialSchedule = legacyTeamScheduleUrl(team);
  const officialResults = officialTeamResultsUrl(team);
  const doubleLetter = isDoubleLetter(team.level);
  const fallbackCompetition = doubleLetter ? EXTERNAL_LINKS.wllvSchedules : officialSchedule;
  const sourceLabel = doubleLetter ? "WLLV · Scoresheets" : "AHMV · GameData · Scoresheets";

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/ahmv/team-games?teamId=${encodeURIComponent(team.legacyScheduleTeamId)}`, {
      headers: { accept: "application/json" },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) return null;
        return await response.json() as TeamGameFeed;
      })
      .then((value) => {
        if (value?.status === "active") setFeed(value);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [team.legacyScheduleTeamId]);

  const nextGame = feed?.nextGame;
  const latestResult = feed?.latestResult;
  const standing = feed?.standing;
  const sourceUrl = feed?.sourceUrl || fallbackCompetition;

  const nextDate = formatGameDate(nextGame?.startsAt, lang);
  const venueTarget = nextGame?.venueAddress || nextGame?.venue;
  const directions = useMemo(
    () => venueTarget ? directionsUrls(venueTarget) : undefined,
    [venueTarget],
  );

  const scoreLine = latestResult && latestResult.homeScore !== undefined && latestResult.awayScore !== undefined
    ? `${latestResult.homeTeam} ${latestResult.homeScore} – ${latestResult.awayScore} ${latestResult.awayTeam}`
    : undefined;

  return (
    <section
      id="match-center"
      aria-labelledby="team-game-center-title"
      className="overflow-hidden border border-navy/12 bg-background shadow-[0_26px_60px_-48px_rgba(7,16,43,0.75)]"
    >
      <div className="grid lg:grid-cols-[1.32fr_0.68fr]">
        <div className="competition-panel p-5 text-white sm:p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="eyebrow text-sport-foreground">
                {lang === "fr" ? "Centre de match" : "Game centre"}
              </p>
              <h2
                id="team-game-center-title"
                className="mt-2 font-display text-4xl font-extrabold uppercase leading-[0.84] tracking-[-0.035em] sm:text-5xl"
              >
                {team.name}
              </h2>
            </div>
            <span className="inline-flex min-h-8 items-center gap-2 border border-white/14 bg-white/[0.04] px-3 text-[9px] font-bold uppercase tracking-[0.14em] text-white/68">
              <Radio className="size-3.5 text-sport-foreground" />
              {sourceLabel}
            </span>
          </div>

          <div className="mt-6 border-t border-white/12 pt-5">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-sport-foreground">
              {lang === "fr" ? "Prochaine partie" : "Next game"}
            </p>

            {nextGame ? (
              <>
                <p className="mt-2 font-display text-2xl font-extrabold uppercase leading-none text-white sm:text-3xl">
                  {nextGame.awayTeam} <span className="text-white/38">vs</span> {nextGame.homeTeam}
                </p>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold uppercase tracking-[0.1em] text-white/62">
                  {nextDate && <span>{nextDate}</span>}
                  {nextGame.venue && <span>{nextGame.venue}</span>}
                </div>
              </>
            ) : (
              <>
                <p className="mt-2 font-display text-2xl font-extrabold uppercase leading-[0.92] text-white sm:text-3xl">
                  {loading
                    ? (lang === "fr" ? "Synchronisation de l’horaire…" : "Syncing schedule…")
                    : (lang === "fr" ? "Horaire officiel prêt à ouvrir" : "Official schedule ready")}
                </p>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/58">
                  {lang === "fr"
                    ? "Le mini-site est prêt à afficher automatiquement la prochaine partie dès que le flux équipe est branché. D’ici là, le bouton ci-dessous ouvre directement la source officielle."
                    : "The mini-site is ready to show the next game automatically as soon as the team feed is connected. Until then, the button below opens the official source directly."}
                </p>
              </>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <a
              href={nextGame?.officialUrl || officialSchedule}
              target="_blank"
              rel="noopener noreferrer"
              className="premium-control inline-flex min-h-11 items-center gap-2 bg-sport px-4 text-[10px] font-bold uppercase tracking-[0.12em] text-sport-foreground"
            >
              <CalendarDays className="size-4" />
              {lang === "fr" ? "Horaire officiel" : "Official schedule"}
            </a>
            <a
              href={latestResult?.scoresheetUrl || officialResults}
              target="_blank"
              rel="noopener noreferrer"
              className="premium-control inline-flex min-h-11 items-center gap-2 border border-white/18 px-4 text-[10px] font-bold uppercase tracking-[0.12em] text-white hover:border-sport"
            >
              <Trophy className="size-4 text-sport-foreground" />
              {lang === "fr" ? "Résultats / classement" : "Results / standings"}
            </a>
          </div>
        </div>

        <div className="grid gap-px bg-navy/10 sm:grid-cols-2 lg:grid-cols-1">
          <article className="bg-background p-5 md:p-6">
            <p className="eyebrow text-sport">{lang === "fr" ? "Dernier résultat" : "Latest result"}</p>
            <p className="mt-3 font-display text-2xl font-extrabold uppercase leading-[0.92] text-navy">
              {scoreLine || (lang === "fr" ? "Voir la source officielle" : "View official source")}
            </p>
            <a
              href={latestResult?.scoresheetUrl || officialResults}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.14em] text-sport"
            >
              {lang === "fr" ? "Feuille / résultats" : "Scoresheet / results"} <ExternalLink className="size-3.5" />
            </a>
          </article>

          <article className="bg-background p-5 md:p-6">
            <p className="eyebrow text-sport">{lang === "fr" ? "Classement" : "Standings"}</p>
            <p className="mt-3 font-display text-3xl font-extrabold uppercase leading-none text-navy">
              {standing?.rank
                ? `#${standing.rank}`
                : (lang === "fr" ? "Source officielle" : "Official source")}
            </p>
            {standing?.points !== undefined && (
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                {standing.points} {lang === "fr" ? "points" : "points"} · {standing.gamesPlayed ?? 0} PJ
              </p>
            )}
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.14em] text-sport"
            >
              {lang === "fr" ? "Voir le classement" : "View standings"} <ExternalLink className="size-3.5" />
            </a>
          </article>
        </div>
      </div>

      <div className="grid border-t border-navy/10 sm:grid-cols-[1fr_auto]">
        <div className="p-5 md:px-6">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 size-5 shrink-0 text-sport" />
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                {lang === "fr" ? "Aréna & trajet" : "Arena & directions"}
              </p>
              <p className="mt-1 font-display text-xl font-extrabold uppercase text-navy">
                {nextGame?.venue || (lang === "fr" ? "Disponible avec la prochaine partie" : "Available with next game")}
              </p>
              {venueTarget && <p className="mt-1 text-xs text-muted-foreground">{nextGame?.venueAddress}</p>}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-navy/10 p-4 sm:border-l sm:border-t-0">
          {directions ? (
            <>
              <a href={directions.google} target="_blank" rel="noopener noreferrer" className="premium-control min-h-10 border border-navy/12 px-3 text-[9px] font-bold uppercase tracking-[0.12em] text-navy">
                Google Maps
              </a>
              <a href={directions.waze} target="_blank" rel="noopener noreferrer" className="premium-control min-h-10 border border-navy/12 px-3 text-[9px] font-bold uppercase tracking-[0.12em] text-navy">
                Waze
              </a>
              <a href={directions.apple} target="_blank" rel="noopener noreferrer" className="premium-control min-h-10 border border-navy/12 px-3 text-[9px] font-bold uppercase tracking-[0.12em] text-navy">
                Apple Plans
              </a>
            </>
          ) : (
            <a
              href="/arenas"
              className="premium-control inline-flex min-h-10 items-center gap-2 border border-navy/12 px-3 text-[9px] font-bold uppercase tracking-[0.12em] text-navy"
            >
              <Navigation className="size-3.5 text-sport" />
              {lang === "fr" ? "Voir les arénas" : "View arenas"}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
