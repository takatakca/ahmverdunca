import { canonicalLink } from "@/lib/seo";
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { RESOURCES, RESOURCE_CATEGORIES } from "@/data/resources";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { OFFICIAL_MEDIA } from "@/data/official-media";
import { HouseSponsorSlot } from "@/components/house-sponsor-slot";

export const Route = createFileRoute("/ressources")({
  head: () => ({
    links: canonicalLink("/ressources"),
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
        <section className="mb-7 grid gap-px overflow-hidden border border-navy/12 bg-navy/12 sm:grid-cols-[1fr_auto]">
          <div className="bg-navy p-6 text-white md:p-8">
            <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Répertoire famille & hockey" : "Family & hockey directory"}</p>
            <p className="mt-3 max-w-2xl font-display text-3xl font-extrabold uppercase leading-[0.9] sm:text-4xl">
              {lang === "fr" ? "Une source claire. Un lien direct." : "A clear source. A direct link."}
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/65">
              {lang === "fr"
                ? "Le portail regroupe les organismes et programmes utiles sans recopier leurs règles ni leurs critères. Chaque fiche mène vers la source concernée."
                : "The portal groups useful organizations and programs without copying their rules or eligibility criteria. Each entry points to its source."}
            </p>
          </div>
          <div className="flex min-w-48 flex-col justify-center bg-ice p-6 md:p-8">
            <p className="font-display text-6xl font-extrabold tracking-[-0.05em] text-navy">{String(RESOURCES.length).padStart(2, "0")}</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.17em] text-muted-foreground">
              {lang === "fr" ? "ressources publiques" : "public resources"}
            </p>
          </div>
        </section>
        <section className="mb-6 grid overflow-hidden border border-navy/12 bg-competition text-white lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative min-h-[220px] overflow-hidden sm:min-h-[280px]">
            <img
              src={OFFICIAL_MEDIA.practiceGroup.url}
              alt={lang === "fr" ? OFFICIAL_MEDIA.practiceGroup.alt.fr : OFFICIAL_MEDIA.practiceGroup.alt.en}
              loading="eager"
              decoding="async"
              className="absolute inset-0 size-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,16,43,0.10),rgba(7,16,43,0.90))]" />
            <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
              <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Familles · bénévoles · hockey" : "Families · volunteers · hockey"}</p>
              <p className="mt-2 font-display text-3xl font-extrabold uppercase leading-[0.88]">
                {lang === "fr" ? "Les bons liens, sans détour." : "The right links, without the detour."}
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-center p-5 md:p-7">
            <p className="text-sm leading-relaxed text-white/62">
              {lang === "fr"
                ? "Chaque ressource mène directement vers son organisme d’autorité. Le portail sert à vous orienter, pas à remplacer la source officielle."
                : "Every resource goes directly to its authoritative organization. The portal guides you; it does not replace the official source."}
            </p>
            <p className="mt-5 text-[9px] font-bold uppercase tracking-[0.14em] text-sport-foreground">
              {String(RESOURCES.length).padStart(2, "0")} · {lang === "fr" ? "ressources référencées" : "referenced resources"}
            </p>
          </div>
        </section>

        <HouseSponsorSlot placement="resources-help" count={1} compact className="mb-6" />

        <div className="mb-6 border border-navy/12 bg-ice p-5">
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
              aria-pressed={cat === c.id}
              onClick={() => setCat(c.id)}
              className={cn(
                "premium-control shrink-0 border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors",
                cat === c.id ? "border-sport bg-sport text-sport-foreground" : "border-input hover:bg-secondary",
              )}
            >
              {l(c.label)}
            </button>
          ))}
        </div>

        <div className="grid gap-px overflow-hidden border border-navy/12 bg-navy/12 md:grid-cols-2 lg:grid-cols-3">
          {list.map((r) => (
            <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer" className="interactive-surface group bg-background p-5 hover:bg-ice/55">
              <h2 className="heading-card flex items-center gap-2 group-hover:text-sport">
                {r.name} <ExternalLink className="size-4 shrink-0" aria-hidden />
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{l(r.description)}</p>
              {r.note && (
                <p className="mt-3 border-l-2 border-sport bg-ice px-3 py-2 text-xs leading-relaxed text-muted-foreground">
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
