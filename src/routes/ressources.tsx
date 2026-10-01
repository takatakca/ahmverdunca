import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/page-header";
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
  const { t, l, lang } = useI18n();
  const [cat, setCat] = useState("all");
  const availableCategories = RESOURCE_CATEGORIES.filter((category) =>
    RESOURCES.some((resource) => resource.category === category.id),
  );
  const list = cat === "all" ? RESOURCES : RESOURCES.filter((r) => r.category === cat);

  return (
    <>
      <PageHeader
        eyebrow={lang === "fr" ? "Liens officiels & aide" : "Official links & support"}
        title={t("nav.resources")}
        description={
          lang === "fr"
            ? "Ressources utiles aux familles et aux bénévoles : hockey, formation, développement et aide financière."
            : "Useful resources for families and volunteers: hockey, training, development and financial assistance."
        }
      />
      <div className="container-site py-8 md:py-12">
        <div className="mb-6 rounded-xl border border-border bg-ice p-5">
          <p className="eyebrow text-sport">
            {lang === "fr" ? "À savoir" : "Good to know"}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {lang === "fr"
              ? "Les liens ci-dessous ouvrent des organismes externes. Les critères, montants et disponibilités des programmes d'aide peuvent changer; vérifiez toujours la source officielle."
              : "Links below open external organizations. Financial-assistance criteria, amounts and availability may change; always verify the official source."}
          </p>
        </div>

        <div className="scrollbar-none -mx-1 mb-6 flex gap-2 overflow-x-auto px-1 pb-1">
          {[{ id: "all", label: { fr: "Tout", en: "All" } }, ...availableCategories].map((c) => (
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
