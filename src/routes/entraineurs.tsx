import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { DemoNotice } from "@/components/demo-notice";
import { Button } from "@/components/ui/button";
import { COACH_CATEGORIES, COACH_RESOURCES } from "@/data/coaches";
import { formatShortDate, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/entraineurs")({
  head: () => ({
    meta: [
      { title: "Zone entraîneurs — AHM Verdun" },
      { name: "description", content: "Formations, formulaires et démarches pour les entraîneurs et bénévoles de l'AHM Verdun." },
      { property: "og:title", content: "Zone entraîneurs — AHM Verdun" },
      { property: "og:description", content: "Formations obligatoires, formulaires et démarches pour l'encadrement." },
    ],
  }),
  component: CoachesPage,
});

function CoachesPage() {
  const { t, l, lang } = useI18n();
  const [cat, setCat] = useState("all");
  const list = cat === "all" ? COACH_RESOURCES : COACH_RESOURCES.filter((r) => r.category === cat);

  return (
    <>
      <PageHeader
        eyebrow={lang === "fr" ? "Ressources officielles" : "Official resources"}
        title={t("nav.coaches")}
        description={
          lang === "fr"
            ? "Accès rapide aux formulaires et formations actuellement publiés par l'AHM Verdun."
            : "Quick access to forms and training links currently published by AHM Verdun."
        }
      />
      <div className="container-site py-8 md:py-12">
        <DemoNotice kind="info" className="mb-6">
          {lang === "fr"
            ? "Les liens ci-dessous ouvrent les services externes actuellement référencés par l'AHM Verdun. La fiche médicale n'est jamais remplie ni conservée sur ce site."
            : "The links below open external services currently referenced by AHM Verdun. The medical form is never completed or stored on this site."}
        </DemoNotice>

        <div className="scrollbar-none -mx-1 mb-6 flex gap-2 overflow-x-auto px-1 pb-1">
          {[{ id: "all", label: { fr: "Tout", en: "All" } }, ...COACH_CATEGORIES].map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCat(c.id)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors",
                cat === c.id ? "border-sport bg-sport text-sport-foreground" : "border-input hover:bg-secondary",
              )}
            >
              {l(c.label)}
            </button>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {list.map((r) => (
            <div key={r.id} className="card-elevated p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="heading-card">{l(r.title)}</h2>
                {r.sensitive && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-status-cancelled-soft px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-status-cancelled">
                    <ShieldAlert className="size-3" aria-hidden />
                    {lang === "fr" ? "Données sensibles" : "Sensitive data"}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{l(r.description)}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                {lang === "fr" ? "Lien vérifié" : "Link verified"} {formatShortDate(r.verifiedAt, lang)}
              </p>
              <Button asChild variant="outline" size="sm" className="mt-4">
                <a href={r.url} target="_blank" rel="noopener noreferrer">
                  {lang === "fr" ? "Ouvrir la ressource" : "Open resource"} <ExternalLink className="size-4" />
                </a>
              </Button>}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
