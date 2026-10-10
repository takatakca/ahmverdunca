import { useEffect, useMemo, useState } from "react";
import { ExternalLink, MapPin, Navigation, Radio, Trophy } from "lucide-react";
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

function teamInitials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "—";
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
  const sourceLabel = doubleLetter
    ? (lang === "fr" ? "WLLV officiel" : "Official WLLV")
    : (lang === "fr" ? "AHMV officiel" : "Official AHMV");

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

  const hasPublishedScore = Boolean(
    latestResult &&
    Number.isFinite(latestResult.homeScore) &&
    Number.isFinite(latestResult.awayScore)
  );

  return (
    <section
      id="match-center"
      aria-labelledby="team-game-center-title"
      className="overflow-hidden border border-white/12 bg-navy-deep text-white shadow-[0_26px_60px_-48px_rgba(0,0,0,0.8)]"
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
            <div className="flex items-center justify-between gap-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-sport-foreground">
                {lang === "fr" ? "Prochaine partie" : "Next game"}
              </p>
              {nextDate && (
                <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/48">
                  {nextDate}
                </span>
              )}
            </div>

            {nextGame ? (
              <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3 border border-white/12 bg-white/[0.035] p-4 sm:p-5">
                <div className="min-w-0 text-center">
                  <span className="mx-auto flex size-14 items-center justify-center rounded-full border border-white/14 bg-white/[0.06] font-display text-lg font-extrabold text-white sm:size-16 sm:text-xl">
                    {teamInitials(nextGame.awayTeam)}
                  </span>
                  <p className="mt-3 line-clamp-2 font-display text-lg font-extrabold uppercase leading-[0.92] text-white sm:text-xl">
                    {nextGame.awayTeam}
                  </p>
                </div>
                <div className="text-center">
                  <span className="block text-[8px] font-bold uppercase tracking-[0.18em] text-white/38">
                    {nextGame.status === "cancelled"
                      ? (lang === "fr" ? "Annulé" : "Cancelled")
                      : (lang === "fr" ? "Avant-match" : "Pregame")}
                  </span>
                  <span className="mt-1 block whitespace-nowrap font-display text-3xl font-extrabold tabular-nums text-sport-foreground sm:text-4xl">
                    {nextGame.status === "cancelled" ? "—" : "0 – 0"}
                  </span>
                </div>
                <div className="min-w-0 text-center">
                  <span className="mx-auto flex size-14 items-center justify-center rounded-full border border-sport/45 bg-sport/10 font-display text-lg font-extrabold text-sport-foreground sm:size-16 sm:text-xl">
                    {teamInitials(nextGame.homeTeam)}
                  </span>
                  <p className="mt-3 line-clamp-2 font-display text-lg font-extrabold uppercase leading-[0.92] text-white sm:text-xl">
                    {nextGame.homeTeam}
                  </p>
                </div>
                {(nextGame.venue || nextDate) && (
                  <div className="col-span-3 mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1 border-t border-white/10 pt-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/56">
                    {nextDate && <span>{nextDate}</span>}
                    {nextGame.venue && <span>{nextGame.venue}</span>}
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-4 border border-white/12 bg-white/[0.035] p-5">
                <p className="font-display text-2xl font-extrabold uppercase leading-[0.92] text-white sm:text-3xl">
                  {loading
                    ? (lang === "fr" ? "Vérification de l’horaire…" : "Checking schedule…")
                    : (lang === "fr" ? "Aucune partie exacte publiée" : "No exact game published")}
                </p>
                {!loading && (
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/58">
                    {lang === "fr"
                      ? "La source officielle reste accessible ci-dessous dès qu’une mise à jour est publiée."
                      : "The official source remains available below whenever an update is published."}
                  </p>
                )}
              </div>
            )}
          </div>

          {directions && (
            <a
              href={directions.google}
              target="_blank"
              rel="noopener noreferrer"
              className="premium-control mt-6 flex min-h-14 w-full items-center justify-between bg-sport px-5 text-[11px] font-extrabold uppercase tracking-[0.13em] text-sport-foreground sm:w-auto"
            >
              <span className="flex items-center gap-2">
                <Navigation className="size-5" />
                {lang === "fr" ? "Partir maintenant" : "Leave now"}
              </span>
              <span aria-hidden>→</span>
            </a>
          )}


        </div>

        <div className="grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-1">
          <article className="bg-navy p-5 text-white md:p-6">
            <p className="eyebrow text-sport">{lang === "fr" ? "Dernier résultat" : "Latest result"}</p>
            {hasPublishedScore && latestResult ? (
              <div className="mt-4 overflow-hidden rounded-xl border border-white/12 bg-navy-deep">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-3 py-2">
                  <span className="text-[9px] font-bold uppercase tracking-[0.13em] text-sport-foreground">
                    {latestResult.status === "final"
                      ? (lang === "fr" ? "Match final" : "Final")
                      : (lang === "fr" ? "Résultat publié" : "Published result")}
                  </span>
                  {latestResult.startsAt && (
                    <time className="text-[9px] text-white/55" dateTime={latestResult.startsAt}>
                      {formatGameDate(latestResult.startsAt, lang)}
                    </time>
                  )}
                </div>
                <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 px-3 py-4 text-center">
                  <div className="min-w-0">
                    <span className="mx-auto flex size-10 items-center justify-center rounded-full border border-white/20 bg-white/[0.055] font-display text-sm font-bold">
                      {teamInitials(latestResult.awayTeam)}
                    </span>
                    <p className="mt-2 line-clamp-2 text-[10px] font-bold leading-tight text-white/80">{latestResult.awayTeam}</p>
                  </div>
                  <div className="whitespace-nowrap font-display text-4xl font-extrabold tabular-nums tracking-tight text-white" aria-label={lang === "fr" ? "Pointage" : "Score"}>
                    {latestResult.awayScore} <span className="text-sport-foreground">–</span> {latestResult.homeScore}
                  </div>
                  <div className="min-w-0">
                    <span className="mx-auto flex size-10 items-center justify-center rounded-full border border-sport/50 bg-sport/10 font-display text-sm font-bold text-sport-foreground">
                      {teamInitials(latestResult.homeTeam)}
                    </span>
                    <p className="mt-2 line-clamp-2 text-[10px] font-bold leading-tight text-white/80">{latestResult.homeTeam}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-3 font-display text-xl font-extrabold uppercase leading-[0.95] text-white">
                {lang === "fr" ? "Consulter les résultats officiels" : "See official results"}
              </p>
            )}
            <a
              href={latestResult?.scoresheetUrl || officialResults}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.14em] text-sport-foreground"
            >
              {lang === "fr" ? "Feuille / résultats" : "Scoresheet / results"} <ExternalLink className="size-3.5" />
            </a>
          </article>

          <article className="bg-navy p-5 text-white md:p-6">
            <p className="eyebrow text-sport">{lang === "fr" ? "Classement" : "Standings"}</p>
            <p className="mt-3 font-display text-3xl font-extrabold uppercase leading-none text-white">
              {standing?.rank
                ? `#${standing.rank}`
                : (lang === "fr" ? "Source officielle" : "Official source")}
            </p>
            {standing?.points !== undefined && (
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.11em] text-white/52">
                {standing.points} {lang === "fr" ? "points" : "points"} · {standing.gamesPlayed ?? 0} PJ
              </p>
            )}
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.14em] text-sport-foreground"
            >
              {lang === "fr" ? "Voir le classement" : "View standings"} <ExternalLink className="size-3.5" />
            </a>
          </article>
        </div>
      </div>

      <div className="grid border-t border-white/10 bg-navy-deep sm:grid-cols-[1fr_auto]">
        <div className="p-5 md:px-6">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 size-5 shrink-0 text-sport" />
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/45">
                {lang === "fr" ? "Aréna & trajet" : "Arena & directions"}
              </p>
              <p className="mt-1 font-display text-xl font-extrabold uppercase text-white">
                {nextGame?.venue || (lang === "fr" ? "Disponible avec la prochaine partie" : "Available with next game")}
              </p>
              {nextGame?.venueAddress && (
                <p className="mt-1 text-xs text-white/52">
                  <span className="font-semibold">{lang === "fr" ? "Adresse :" : "Address:"}</span> {nextGame.venueAddress}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-white/10 p-4 sm:border-l sm:border-t-0">
          {directions ? (
            <>
              <a href={directions.google} target="_blank" rel="noopener noreferrer" className="premium-control min-h-10 border border-white/16 px-3 text-[9px] font-bold uppercase tracking-[0.12em] text-white">
                Google Maps
              </a>
              <a href={directions.waze} target="_blank" rel="noopener noreferrer" className="premium-control min-h-10 border border-white/16 px-3 text-[9px] font-bold uppercase tracking-[0.12em] text-white">
                Waze
              </a>
              <a href={directions.apple} target="_blank" rel="noopener noreferrer" className="premium-control min-h-10 border border-white/16 px-3 text-[9px] font-bold uppercase tracking-[0.12em] text-white">
                Apple Plans
              </a>
            </>
          ) : (
            <a
              href="/arenas"
              className="premium-control inline-flex min-h-10 items-center gap-2 border border-white/16 px-3 text-[9px] font-bold uppercase tracking-[0.12em] text-white"
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
