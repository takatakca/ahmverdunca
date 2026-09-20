import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { DemoNotice } from "@/components/demo-notice";
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
      <PageHeader eyebrow={t("common.toValidate")} title={t("nav.coaches")} description="Ressources destinées aux entraîneurs, gérants et bénévoles. Les documents officiels seront ajoutés par l'association." />
      <div className="container-site py-8 md:py-12">
        <DemoNotice kind="connect" className="mb-6">
          Les documents confidentiels (fiches médicales) ne seront jamais publiés ici : ils exigent un espace sécurisé réservé aux personnes autorisées.
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
                {r.restricted && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-status-cancelled-soft px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-status-cancelled">
                    <Lock className="size-3" aria-hidden /> Accès restreint
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{l(r.description)}</p>
              <p className="mt-3 text-xs text-muted-foreground">{t("common.updated")} {formatShortDate(r.updatedAt, lang)}</p>
              {!r.url && <p className="mt-2 text-xs italic text-demo-foreground">Document officiel à fournir par l'association.</p>}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
