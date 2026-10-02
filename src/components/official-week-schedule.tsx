import { useEffect, useMemo, useState } from "react";
import { ExternalLink, MapPin, Search, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoiceSearchButton } from "@/components/voice-search-button";
import { AddToCalendarButton } from "@/components/add-to-calendar-button";
import { ShareButton } from "@/components/share-button";
import {
  OFFICIAL_WEEK_ACTIVITIES,
  OFFICIAL_WEEK_META,
  type OfficialWeekActivity,
} from "@/data/official-week";
import { formatDate, useI18n } from "@/lib/i18n";
import { mapsDirectionsUrl } from "@/lib/site";
import { montrealDateKey, montrealTimeKey } from "@/lib/montreal-date";
import { cn } from "@/lib/utils";

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

  return (
    <article
      className={cn(
        "grid gap-3 rounded-lg border border-border bg-background p-4 sm:grid-cols-[7.5rem_minmax(0,1fr)_auto] sm:items-center",
        cancelled && "border-status-cancelled/40 bg-status-cancelled-soft/40",
      )}
    >
      <div>
        <p
          className={cn(
            "font-display text-xl font-extrabold tabular-nums text-navy",
            cancelled && "text-status-cancelled line-through decoration-2",
          )}
        >
          {displayTime(item.start)}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">→ {displayTime(item.end)}</p>
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="font-display text-lg font-bold uppercase leading-tight">{item.group}</h4>
          {cancelled && (
            <span className="inline-flex items-center gap-1 rounded-full bg-status-cancelled px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
              <XCircle className="size-3" aria-hidden />
              {lang === "fr" ? "Annulée" : "Cancelled"}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm font-semibold text-sport">{item.activity}</p>
        <p className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          {item.venue}
        </p>
      </div>

      <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:grid-cols-1">
        <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
          <a href={mapsDirectionsUrl(item.venue)} target="_blank" rel="noopener noreferrer">
            {lang === "fr" ? "Itinéraire" : "Directions"}
          </a>
        </Button>
        {!cancelled && upcoming && (
          <AddToCalendarButton
            id={item.id}
            date={item.date}
            start={item.start}
            end={item.end}
            title={`AHMV — ${item.group} · ${item.activity}`}
            location={item.venue}
          />
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

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return OFFICIAL_WEEK_ACTIVITIES;
    return OFFICIAL_WEEK_ACTIVITIES.filter((item) =>
      `${item.group} ${item.activity} ${item.venue}`.toLowerCase().includes(needle),
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
      className="overflow-hidden rounded-xl border border-sport/25 bg-ice shadow-card"
    >
      <div className="grid gap-5 border-b border-border bg-background p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:p-6">
        <div>
          <p className="eyebrow text-sport">
            {weekExpired
              ? (lang === "fr" ? "Dernier horaire intégré — archive" : "Last integrated schedule — archive")
              : weekUpcoming
                ? (lang === "fr" ? "Horaire officiel publié — à venir" : "Published official schedule — upcoming")
                : (lang === "fr" ? "Horaire officiel publié" : "Published official schedule")}
          </p>
          <h2 id="official-week-heading" className="heading-section mt-2">
            {rangeLabel}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
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
          {!publicLaunch && (
            <div className="flex flex-wrap gap-2">
              {WEEKLY_SCHEDULE_DOCUMENTS.map((document) => (
                <Button key={document.week} asChild variant={document.week === 5 ? "sport" : "outline"} size="sm">
                  <a href={document.sourceUrl} target="_blank" rel="noopener noreferrer">
                    {lang === "fr" ? `Semaine ${document.week}` : `Week ${document.week}`}
                    <ExternalLink className="size-4" />
                  </a>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 md:p-6">
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
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={
                lang === "fr"
                  ? "M11, Louves, Chacals, Denis Savard…"
                  : "U11, Louves, Chacals, Denis Savard…"
              }
              className="h-12 w-full rounded-lg border border-input bg-background pl-11 pr-4 text-base"
            />
          </label>
          <VoiceSearchButton onTranscript={setQuery} />
        </div>

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
                    <span className="rounded-full bg-sport px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-sport-foreground">
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

        <p className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">
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
