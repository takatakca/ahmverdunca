import { useEffect, useMemo, useState } from "react";
import { ExternalLink, MapPin, Search, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoiceSearchButton } from "@/components/voice-search-button";
import {
  OFFICIAL_WEEK_ACTIVITIES,
  OFFICIAL_WEEK_META,
  type OfficialWeekActivity,
} from "@/data/official-week";
import { formatDate, useI18n } from "@/lib/i18n";
import { mapsDirectionsUrl } from "@/lib/site";
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

      <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
        <a href={mapsDirectionsUrl(item.venue)} target="_blank" rel="noopener noreferrer">
          {lang === "fr" ? "Itinéraire" : "Directions"}
        </a>
      </Button>
    </article>
  );
}

export function OfficialWeekSchedule({ initialQuery = "" }: { initialQuery?: string }) {
  const { lang } = useI18n();
  const [query, setQuery] = useState(initialQuery);

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

  const days = useMemo(
    () =>
      Array.from(new Set(filtered.map((item) => item.date))).sort(),
    [filtered],
  );

  return (
    <section
      aria-labelledby="official-week-heading"
      className="overflow-hidden rounded-xl border border-sport/25 bg-ice shadow-card"
    >
      <div className="grid gap-5 border-b border-border bg-background p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:p-6">
        <div>
          <p className="eyebrow text-sport">
            {lang === "fr" ? "Horaire officiel publié" : "Published official schedule"}
          </p>
          <h2 id="official-week-heading" className="heading-section mt-2">
            {lang === "fr" ? "28 septembre au 4 octobre" : "September 28 to October 4"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {lang === "fr"
              ? "Transcription fidèle du PDF hebdomadaire AHMV publié le 29 septembre 2026. Aucune catégorie n'a été déduite ou renommée."
              : "Faithful transcription of the AHMV weekly PDF published September 29, 2026. No category was inferred or renamed."}
          </p>
        </div>
        <Button asChild variant="outline">
          <a href={OFFICIAL_WEEK_META.sourceUrl} target="_blank" rel="noopener noreferrer">
            PDF officiel <ExternalLink className="size-4" />
          </a>
        </Button>
      </div>

      <div className="p-4 md:p-6">
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

        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {lang === "fr"
              ? "Aucune activité ne correspond à cette recherche dans le PDF de cette semaine."
              : "No activity matches this search in this week's PDF."}
          </p>
        ) : (
          <div className="mt-6 space-y-8">
            {days.map((date) => (
              <section key={date}>
                <h3 className="mb-3 border-b border-border pb-2 font-display text-xl font-bold uppercase">
                  {formatDate(date, lang, { weekday: "long", day: "numeric", month: "long" })}
                </h3>
                <div className="space-y-2">
                  {filtered
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
          {lang === "fr"
            ? "Horaire sujet à changement — consultez le site du club ou le PDF source pour la version la plus récente."
            : "Schedule subject to change — check the club website or source PDF for the latest version."}
        </p>
      </div>
    </section>
  );
}
