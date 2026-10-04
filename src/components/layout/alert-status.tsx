import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, CircleCheck } from "lucide-react";
import { ALERTS } from "@/data/alerts";

function todayInMontreal() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

/** Published association notices only; expired and future notices stay hidden. */
export function AlertStatus({ language = "fr" }: { language?: string }) {
  const [today, setToday] = useState(todayInMontreal);
  useEffect(() => {
    const refresh = () => setToday(todayInMontreal());
    const timer = window.setInterval(refresh, 60_000);
    window.addEventListener("focus", refresh);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", refresh); };
  }, []);
  const active = ALERTS.filter((alert) => !alert.archived && alert.publishedAt <= today && alert.expiresAt >= today)
    .sort((a, b) => Number(b.level === "urgent") - Number(a.level === "urgent"));
  const lang = language === "en" ? "en" : "fr";
  const empty = language === "es" ? "No hay alertas por ahora" : lang === "fr" ? "Aucune alerte en cours" : "No alerts right now";
  return (
    <div className="px-4 py-3 text-white" role="status" aria-live="polite" aria-atomic="true">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em]">
        {active.length ? <Bell className="size-4 shrink-0 text-amber-300" aria-hidden /> : <CircleCheck className="size-4 shrink-0 text-emerald-300" aria-hidden />}
        <span>{language === "es" ? "Alertas AHMV" : lang === "fr" ? "Alertes AHMV" : "AHMV alerts"}</span>
      </div>
      {active.length === 0 ? <p className="mt-1 text-xs text-white/75">{empty}</p> : (
        <ul className="mt-2 space-y-3">
          {active.map((alert) => (
            <li key={alert.id} className="border-l-2 border-amber-300 pl-3">
              <p className="text-sm font-bold">{alert.title[lang]}</p>
              <p className="mt-1 text-xs leading-relaxed text-white/80">{alert.message[lang]}</p>
              {alert.linkTo && <Link to={alert.linkTo} className="mt-1 inline-block text-xs font-semibold text-amber-200 underline underline-offset-4">{lang === "fr" ? "Lire l’avis" : "Read notice"}</Link>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
