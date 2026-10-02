import { Link } from "@tanstack/react-router";
import { Clock, MapPin, Navigation } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/translations";
import type { ScheduleEvent } from "@/data/schedule";
import { getArena } from "@/data/arenas";
import { getTeam } from "@/data/teams";
import { cn } from "@/lib/utils";
import { mapsDirectionsUrl } from "@/lib/site";
import { Button } from "@/components/ui/button";

const statusStyle: Record<ScheduleEvent["status"], string> = {
  confirmed: "bg-status-confirmed-soft text-status-confirmed",
  modified: "bg-status-modified-soft text-status-modified",
  cancelled: "bg-status-cancelled-soft text-status-cancelled",
  pending: "bg-status-pending-soft text-status-pending",
};

export function EventCard({ event, compact = false }: { event: ScheduleEvent; compact?: boolean }) {
  const { t, l } = useI18n();
  const arena = getArena(event.arenaSlug);
  const team = getTeam(event.teamSlug);

  return (
    <article
      className={cn(
        "card-elevated stripe-sport flex flex-col gap-3 p-4 pl-5",
        !compact && "sm:flex-row sm:items-center sm:justify-between",
        compact && "min-w-0 p-2.5 pl-3",
        event.status === "cancelled" && "border-status-cancelled bg-status-cancelled-soft/35",
      )}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "font-display text-lg font-bold tabular-nums",
              event.status === "cancelled" && "text-status-cancelled line-through decoration-2",
            )}
          >
            {event.start} – {event.end}
          </span>
          <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide", statusStyle[event.status])}>
            {t(`status.${event.status}` as TranslationKey)}
          </span>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-secondary-foreground">
            {t(`type.${event.type}` as TranslationKey)}
          </span>
        </div>
        <h3 className={cn("heading-card mt-1.5", compact ? "break-words text-lg" : "truncate")}>
          {team ? l(team.name) : event.teamSlug}
          {event.opponent && <span className="text-muted-foreground"> · {event.opponent}</span>}
        </h3>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-3.5" aria-hidden />
            {arena?.name ?? event.arenaSlug}
            {event.rink ? ` — ${event.rink}` : ""}
          </span>
        </p>
        {event.note && <p className="mt-1.5 text-sm italic text-demo-foreground">{l(event.note)}</p>}
      </div>
      <div className={cn("flex flex-wrap gap-2", compact ? "min-w-0" : "shrink-0")}>
        {team && (
          <Button asChild variant="outline" size="sm" className={compact ? "h-8 min-h-8 px-2 text-[10px]" : ""}><Link
            to="/equipes/$slug"
            params={{ slug: team.slug }}
          >
            {t("common.viewTeam")}
          </Link></Button>
        )}
        {arena && (
          <>
            <Button asChild variant="outline" size="sm" className={compact ? "h-8 min-h-8 px-2 text-[10px]" : ""}><Link to="/arenas/$slug" params={{ slug: arena.slug }}><Clock className="size-3.5" aria-hidden />{t("common.viewArena")}</Link></Button>
            <Button asChild variant="outline" size="sm" className={compact ? "h-8 min-h-8 px-2 text-[10px]" : ""}><a href={mapsDirectionsUrl(arena.address)} target="_blank" rel="noopener noreferrer"><Navigation className="size-3.5" aria-hidden />{t("common.directions")}</a></Button>
          </>
        )}
      </div>
    </article>
  );
}
