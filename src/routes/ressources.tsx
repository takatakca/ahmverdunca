import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { DemoNotice } from "@/components/demo-notice";
import { RESOURCES, RESOURCE_CATEGORIES } from "@/data/resources";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ressources")({
  head: () => ({
    meta: [
      { title: "Ressources hockey — AHM Verdun" },
      { name: "description", content: "Liens utiles pour les familles : Hockey Québec, Hockey Canada, Spordle, WLLV, programmes d'aide financière." },
      { property: "og:title", content: "Ressources hockey — AHM Verdun" },
      { property: "og:description", content: "Organismes, formations et programmes d'aide autour du hockey mineur." },
    ],
  }),
  component: ResourcesPage,
});

function ResourcesPage() {
  const { t, l } = useI18n();
  const [cat, setCat] = useState("all");
  const list = cat === "all" ? RESOURCES : RESOURCES.filter((r) => r.category === cat);

  return (
    <>
      <PageHeader eyebrow={t("common.externalLink")} title={t("nav.resources")} description="Ressources externes utiles aux familles et aux bénévoles. Les liens s'ouvrent dans un nouvel onglet." />
      <div className="container-site py-8 md:py-12">
        <DemoNotice kind="info" className="mb-6">
          L'AHM Verdun n'est pas responsable du contenu des sites externes. Les programmes d'aide financière ne garantissent aucune admissibilité.
        </DemoNotice>

        <div className="scrollbar-none -mx-1 mb-6 flex gap-2 overflow-x-auto px-1 pb-1">
          {[{ id: "all", label: { fr: "Tout", en: "All" } }, ...RESOURCE_CATEGORIES].map((c) => (
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list.map((r) => (
            <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer" className="card-elevated group p-5">
              <h2 className="heading-card flex items-center gap-2 group-hover:text-sport">
                {r.name} <ExternalLink className="size-4 shrink-0" aria-hidden />
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{l(r.description)}</p>
              {r.note && (
                <p className="mt-3 rounded-md bg-ice px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                  {l(r.note)}
                </p>
              )}
              {!r.urlVerified && <p className="mt-3 text-xs italic text-demo-foreground">Lien à confirmer avec l'association.</p>}
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
