import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ExternalLink, MapPin, Search, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoiceSearchButton } from "@/components/voice-search-button";
import { AddToCalendarButton } from "@/components/add-to-calendar-button";
import { ShareButton } from "@/components/share-button";
import {
  HAS_NEWER_PUBLISHED_SCHEDULE,
  LATEST_PUBLISHED_SCHEDULE_DOCUMENT,
  OFFICIAL_WEEK_ACTIVITIES,
  LEGACY_SCHEDULE_DOCUMENTS,
  OFFICIAL_WEEK_META,
  WEEKLY_SCHEDULE_DOCUMENTS,
  type OfficialWeekActivity,
} from "@/data/official-week";
import { formatDate, useI18n } from "@/lib/i18n";
import { arenaDirectionsTargetForVenue, getArenaForVenue } from "@/data/arenas";
import { mapsDirectionsUrl } from "@/lib/site";
import { montrealDateKey, montrealTimeKey } from "@/lib/montreal-date";
import { cn } from "@/lib/utils";

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr-CA")
    .trim();
}

function displayTime(value: string) {
  const [hourRaw, minute] = value.split(":");
  const hour = Number(hourRaw);
  if (Number.isNaN(hour)) return value;
  return minute === "00" ? `${hour} h` : `${hour} h ${minute}`;
}

function ActivityRow({ item }: { item: OfficialWeekActivity }) {
  const { lang } = useI18n();
  const cancelled = item.status === "cancelled";
  const today = montrealDateKey();
  const nowTime = montrealTimeKey();
  const upcoming =
    item.date > today || (item.date === today && item.end > nowTime);
  const arena = getArenaForVenue(item.venue);
  const directionTarget = arenaDirectionsTargetForVenue(item.venue);
  const encodedTarget = encodeURIComponent(directionTarget);
  const googleUrl = mapsDirectionsUrl(directionTarget);
  const wazeUrl = `https://www.waze.com/ul?q=${encodedTarget}&navigate=yes`;
  const appleUrl = `https://maps.apple.com/?daddr=${encodedTarget}`;

  return (
    <article
      className={cn(
        "interactive-surface grid gap-3 border border-white/12 bg-navy-deep p-4 text-white sm:grid-cols-[7.5rem_minmax(0,1fr)_auto] sm:items-center",
        cancelled && "border-status-cancelled/40 bg-status-cancelled-soft/40",
      )}
    >
      <div>
        <p
          className={cn(
            "font-display text-xl font-extrabold tabular-nums text-white",
            cancelled && "text-status-cancelled line-through decoration-2",
          )}
        >
          {displayTime(item.start)}
        </p>
        <p className="mt-0.5 text-xs text-white/42">→ {displayTime(item.end)}</p>
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="font-display text-lg font-bold uppercase leading-tight">{item.group}</h4>
          {cancelled && (
            <span className="inline-flex items-center gap-1  bg-status-cancelled px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
              <XCircle className="size-3" aria-hidden />
              {lang === "fr" ? "Annulée" : "Cancelled"}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm font-semibold text-sport-foreground">{item.activity}</p>
        <p className="mt-1 flex items-start gap-1.5 text-sm text-white/52">
          <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          {item.venue}
        </p>
      </div>

      <div className="w-full sm:w-auto">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {arena ? (
            <Button asChild variant="sport" size="sm" className="w-full">
              <Link to="/arenas/$slug" params={{ slug: arena.slug }}>
                {lang === "fr" ? "Fiche" : "Arena"}
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline-light" size="sm" className="w-full">
              <a href={googleUrl} target="_blank" rel="noopener noreferrer">
                {lang === "fr" ? "Itinéraire" : "Directions"}
              </a>
            </Button>
          )}
          <Button asChild variant="outline-light" size="sm" className="w-full">
            <a href={googleUrl} target="_blank" rel="noopener noreferrer">Google</a>
          </Button>
          <Button asChild variant="outline-light" size="sm" className="w-full">
            <a href={wazeUrl} target="_blank" rel="noopener noreferrer">Waze</a>
          </Button>
          <Button asChild variant="outline-light" size="sm" className="w-full">
            <a href={appleUrl} target="_blank" rel="noopener noreferrer">Apple</a>
          </Button>
        </div>
        {!cancelled && upcoming && (
          <div className="mt-2">
            <AddToCalendarButton
              id={item.id}
              date={item.date}
              start={item.start}
              end={item.end}
              title={`AHMV — ${item.group} · ${item.activity}`}
              location={directionTarget}
            />
          </div>
        )}
      </div>
    </article>
  );
}

export function OfficialWeekSchedule({ initialQuery = "" }: { initialQuery?: string }) {
  const { lang } = useI18n();
  const publicLaunch = import.meta.env["VITE_PUBLIC_INDEXING"] === "true";
  const [query, setQuery] = useState(initialQuery);
  const [showPast, setShowPast] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const today = montrealDateKey();
  const weekActive = today >= OFFICIAL_WEEK_META.start && today <= OFFICIAL_WEEK_META.end;
  const weekExpired = today > OFFICIAL_WEEK_META.end;
  const weekUpcoming = today < OFFICIAL_WEEK_META.start;

  const rangeLabel = `${formatDate(OFFICIAL_WEEK_META.start, lang, {
    day: "numeric",
    month: "long",
  })} — ${formatDate(OFFICIAL_WEEK_META.end, lang, {
    day: "numeric",
    month: "long",
    year: "numeric",
  })}`;
  const publishedLabel = formatDate(OFFICIAL_WEEK_META.publishedAt, lang, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const newerPublishedDocument =
    HAS_NEWER_PUBLISHED_SCHEDULE ? LATEST_PUBLISHED_SCHEDULE_DOCUMENT : null;
  const newerPublishedIsActive = Boolean(
    newerPublishedDocument &&
      today >= newerPublishedDocument.start &&
      today <= newerPublishedDocument.end,
  );
  const newerPublishedRangeLabel = newerPublishedDocument
    ? `${formatDate(newerPublishedDocument.start, lang, { day: "numeric", month: "long" })} — ${formatDate(
        newerPublishedDocument.end,
        lang,
        { day: "numeric", month: "long", year: "numeric" },
      )}`
    : "";
  const newerPublishedAtLabel = newerPublishedDocument
    ? formatDate(newerPublishedDocument.publishedAt, lang, {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const filtered = useMemo(() => {
    const needle = normalizeSearch(query);
    if (!needle) return OFFICIAL_WEEK_ACTIVITIES;
    return OFFICIAL_WEEK_ACTIVITIES.filter((item) =>
      normalizeSearch(`${item.group} ${item.activity} ${item.venue} ${item.date} ${item.start} ${item.end}`).includes(needle),
    );
  }, [query]);

  const displayed = useMemo(() => {
    if (weekExpired && !showArchive) return [];
    if (query.trim() || !weekActive || showPast) return filtered;
    return filtered.filter((item) => item.date >= today);
  }, [filtered, query, showArchive, showPast, today, weekActive, weekExpired]);

  const hasPast = weekActive && filtered.some((item) => item.date < today);

  const days = useMemo(
    () =>
      Array.from(new Set(displayed.map((item) => item.date))).sort(),
    [displayed],
  );

  return (
    <section
      aria-labelledby="official-week-heading"
      className="broadcast-cut overflow-hidden border border-sport/30 bg-competition text-white shadow-[0_24px_60px_-48px_rgba(7,16,43,0.85)]"
    >
      <div className="scoreboard-panel grid gap-5 border-b border-navy-foreground/10 p-5 text-navy-foreground md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:p-7">
        <div>
          <p className="eyebrow text-sport-foreground">
            {weekExpired
              ? (lang === "fr" ? "Dernier horaire intégré — archive" : "Last integrated schedule — archive")
              : weekUpcoming
                ? (lang === "fr" ? "Horaire officiel publié — à venir" : "Published official schedule — upcoming")
                : (lang === "fr" ? "Horaire officiel publié" : "Published official schedule")}
          </p>
          <h2 id="official-week-heading" className="heading-section mt-2 text-navy-foreground">
            {rangeLabel}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-navy-foreground/62">
            {lang === "fr"
              ? `Transcription fidèle du PDF hebdomadaire AHMV publié le ${publishedLabel}. Aucune catégorie n'a été déduite ou renommée.`
              : `Faithful transcription of the AHMV weekly PDF published ${publishedLabel}. No category was inferred or renamed.`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ShareButton
            title={lang === "fr" ? "Horaire AHM Verdun" : "AHM Verdun schedule"}
            text={
              lang === "fr"
                ? "Horaire hebdomadaire officiel AHM Verdun"
                : "Official AHM Verdun weekly schedule"
            }
          />
          <div className="flex flex-wrap gap-2">
            {WEEKLY_SCHEDULE_DOCUMENTS.map((document, index) => (
              <Button key={document.week} asChild variant={index === 0 ? "sport" : "outline-light"} size="sm">
                <a href={document.sourceUrl} target="_blank" rel="noopener noreferrer">
                  {lang === "fr" ? `Semaine ${document.week}` : `Week ${document.week}`}
                  <ExternalLink className="size-4" />
                </a>
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {newerPublishedDocument && (
          <a
            href={newerPublishedDocument.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="interactive-surface mb-5 flex flex-col gap-4 border border-sport/45 bg-sport/10 p-4 text-white sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="eyebrow text-sport-foreground">
                {newerPublishedIsActive
                  ? (lang === "fr" ? "Horaire officiel plus récent disponible" : "Newer official schedule available")
                  : (lang === "fr" ? "Prochaine semaine déjà publiée" : "Next week already published")}
              </p>
              <p className="mt-1 font-display text-2xl font-extrabold uppercase leading-none text-white">
                {lang === "fr"
                  ? `Semaine ${newerPublishedDocument.week} · ${newerPublishedRangeLabel}`
                  : `Week ${newerPublishedDocument.week} · ${newerPublishedRangeLabel}`}
              </p>
              <p className="mt-2 max-w-2xl text-xs leading-relaxed text-white/58">
                {newerPublishedIsActive
                  ? (lang === "fr"
                      ? `Source officielle publiée le ${newerPublishedAtLabel}. Les activités structurées plus bas proviennent de la dernière semaine intégrée; ouvrez cette source pour les détails les plus récents.`
                      : `Official source published ${newerPublishedAtLabel}. The structured activities below come from the last integrated week; open this source for the latest details.`)
                  : (lang === "fr"
                      ? `Source officielle publiée le ${newerPublishedAtLabel}. Elle prendra le relais à partir du ${formatDate(newerPublishedDocument.start, lang, { day: "numeric", month: "long" })}.`
                      : `Official source published ${newerPublishedAtLabel}. It takes effect on ${formatDate(newerPublishedDocument.start, lang, { day: "numeric", month: "long" })}.`)}
              </p>
            </div>
            <span className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 bg-sport px-4 text-[10px] font-bold uppercase tracking-[0.12em] text-sport-foreground">
              {lang === "fr" ? "Ouvrir la source officielle" : "Open official source"}
              <ExternalLink className="size-3.5" />
            </span>
          </a>
        )}

        {weekExpired && !showArchive ? (
          <div className="rounded-xl border border-border bg-background p-5 md:p-6">
            <p className="eyebrow text-sport">
              {lang === "fr" ? "Semaine terminée" : "Week completed"}
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {lang === "fr"
                ? `Ce PDF couvre ${rangeLabel}. Pour l'horaire actuel, utilisez les sources officielles présentées plus haut sur la page. L'archive demeure accessible pour référence.`
                : `This PDF covers ${rangeLabel}. For the current schedule, use the official sources shown above on this page. The archive remains available for reference.`}
            </p>
            <Button type="button" variant="outline" className="mt-4" onClick={() => setShowArchive(true)}>
              {lang === "fr" ? "Voir l'archive" : "View archive"}
            </Button>
          </div>
        ) : (
          <>
            {weekExpired && (
              <div className="mb-4 flex flex-col gap-3 rounded-lg border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  {lang === "fr"
                    ? "Archive seulement — vérifiez les sources officielles pour l'horaire courant."
                    : "Archive only — check official sources for the current schedule."}
                </p>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowArchive(false)}>
                  {lang === "fr" ? "Fermer l'archive" : "Close archive"}
                </Button>
              </div>
            )}
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
          <label className="relative block">
            <span className="sr-only">
              {lang === "fr" ? "Rechercher dans l'horaire officiel" : "Search official schedule"}
            </span>
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/38" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={
                lang === "fr"
                  ? "M11, Louves, Chacals, Denis Savard…"
                  : "U11, Louves, Chacals, Denis Savard…"
              }
              className="h-12 w-full border border-white/14 bg-navy-deep pl-11 pr-11 text-base text-white placeholder:text-white/34 outline-none transition-colors focus:border-sport"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="premium-control absolute right-2 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center text-white/42 hover:bg-white/[0.06] hover:text-white"
                aria-label={lang === "fr" ? "Effacer la recherche" : "Clear search"}
              >
                <XCircle className="size-4" aria-hidden />
              </button>
            )}
          </label>
          <VoiceSearchButton onTranscript={setQuery} />
        </div>

        {query.trim() && (
          <p className="mt-3 text-sm font-semibold text-muted-foreground" aria-live="polite">
            {lang === "fr"
              ? `${displayed.length} résultat${displayed.length === 1 ? "" : "s"} dans l’horaire publié`
              : `${displayed.length} result${displayed.length === 1 ? "" : "s"} in the published schedule`}
          </p>
        )}

        {hasPast && !query.trim() && (
          <div className="mt-3 flex justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowPast((value) => !value)}>
              {showPast
                ? (lang === "fr" ? "Masquer les jours passés" : "Hide past days")
                : (lang === "fr" ? "Voir les jours passés" : "Show past days")}
            </Button>
          </div>
        )}

        {displayed.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {lang === "fr"
              ? "Aucune activité ne correspond à cette recherche dans le PDF de cette semaine."
              : "No activity matches this search in this week's PDF."}
          </p>
        ) : (
          <div className="mt-6 space-y-8">
            {days.map((date) => (
              <section key={date}>
                <div className="mb-3 flex items-center justify-between gap-3 border-b border-border pb-2">
                  <h3 className="font-display text-xl font-bold uppercase">
                    {formatDate(date, lang, { weekday: "long", day: "numeric", month: "long" })}
                  </h3>
                  {date === today && (
                    <span className=" bg-sport px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-sport-foreground">
                      {lang === "fr" ? "Aujourd'hui" : "Today"}
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {displayed
                    .filter((item) => item.date === date)
                    .sort((a, b) => a.start.localeCompare(b.start))
                    .map((item) => (
                      <ActivityRow key={item.id} item={item} />
                    ))}
                </div>
              </section>
            ))}
          </div>
        )}

        <details className="mt-6 border-t border-white/10 pt-4">
          <summary className="cursor-pointer text-xs font-bold uppercase tracking-[0.14em] text-white/70">
            {lang === "fr" ? "Archives documentaires du site précédent" : "Previous-site document archive"}
          </summary>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {LEGACY_SCHEDULE_DOCUMENTS.map((document) => (
              <a
                key={document.sourceUrl}
                href={document.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 border border-white/12 bg-navy-deep px-4 py-3 text-sm font-semibold text-white/72 hover:border-sport hover:text-sport-foreground"
              >
                <span>
                  {document.label[lang]}
                  <span className="mt-0.5 block text-[10px] font-normal uppercase tracking-[0.12em] text-muted-foreground">
                    {document.fileSize}
                  </span>
                </span>
                <ExternalLink className="size-4 shrink-0" />
              </a>
            ))}
          </div>
        </details>

        <p className="mt-6 border-t border-white/10 pt-4 text-xs text-white/45">
          {weekExpired
            ? (lang === "fr"
                ? "Archive historique — ne l'utilisez pas comme horaire courant."
                : "Historical archive — do not use it as the current schedule.")
            : (lang === "fr"
                ? (publicLaunch
                    ? "Horaire sujet à changement — utilisez les calendriers officiels présentés plus haut pour la version la plus récente."
                    : "Horaire sujet à changement — consultez le site du club ou le PDF source pour la version la plus récente.")
                : (publicLaunch
                    ? "Schedule subject to change — use the official calendars shown above for the latest version."
                    : "Schedule subject to change — check the club website or source PDF for the latest version."))}
        </p>
          </>
        )}
      </div>
    </section>
  );
}
