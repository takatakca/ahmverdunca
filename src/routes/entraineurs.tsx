import { canonicalLink } from "@/lib/seo";
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { COACH_CATEGORIES, COACH_RESOURCES } from "@/data/coaches";
import { OFFICIAL_MEDIA } from "@/data/official-media";
import { formatShortDate, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { HouseSponsorSlot } from "@/components/house-sponsor-slot";

export const Route = createFileRoute("/entraineurs")({
  head: () => ({
    links: canonicalLink("/entraineurs"),
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
        <section className="mb-8 grid overflow-hidden border border-navy/12 bg-navy text-white lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative min-h-[300px] overflow-hidden sm:min-h-[380px]">
            <img
              src={OFFICIAL_MEDIA.volunteerArchive.url}
              alt={lang === "fr" ? OFFICIAL_MEDIA.volunteerArchive.alt.fr : OFFICIAL_MEDIA.volunteerArchive.alt.en}
              loading="eager"
              decoding="async"
              className="absolute inset-0 size-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,16,43,0.08),rgba(7,16,43,0.84))]" />
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
              <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Bénévoles · Encadrement · Hockey" : "Volunteers · Coaching · Hockey"}</p>
              <h2 className="mt-2 max-w-2xl font-display text-4xl font-extrabold uppercase leading-[0.88] tracking-[-0.03em] sm:text-5xl">
                {lang === "fr" ? "Les outils du banc, au même endroit." : "Bench tools, all in one place."}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/72">
                {lang === "fr"
                  ? "Formations, formulaires et accès officiels regroupés sans recopier ni conserver les données sensibles."
                  : "Training, forms and official access grouped together without copying or storing sensitive data."}
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-between border-t border-white/12 p-6 lg:border-l lg:border-t-0 md:p-8">
            <div>
              <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Répertoire officiel" : "Official directory"}</p>
              <p className="mt-4 font-display text-6xl font-extrabold">{String(COACH_RESOURCES.length).padStart(2, "0")}</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.17em] text-white/48">
                {lang === "fr" ? "ressources référencées" : "referenced resources"}
              </p>
            </div>
            <a
              href={OFFICIAL_MEDIA.volunteerArchive.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 text-[10px] font-bold uppercase tracking-[0.15em] text-white/55 hover:text-white"
            >
              {lang === "fr" ? "Photo : archive publique AHMV" : "Photo: AHMV public archive"}
            </a>
          </div>
        </section>
        <div className="broadcast-rail mb-7 border border-navy/12 bg-ice p-5 pl-7">
          <p className="eyebrow text-sport">
            {lang === "fr" ? "Ressources externes" : "External resources"}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {lang === "fr"
              ? "Les liens ci-dessous ouvrent les services actuellement référencés par l'AHM Verdun. La fiche médicale n'est jamais remplie ni conservée sur ce site."
              : "The links below open services currently referenced by AHM Verdun. The medical form is never completed or stored on this site."}
          </p>
        </div>

        <HouseSponsorSlot placement="coaches-path" count={1} compact className="mb-6" />

        <div className="scrollbar-none -mx-1 mb-6 flex gap-2 overflow-x-auto px-1 pb-1">
          {[{ id: "all", label: { fr: "Tout", en: "All" } }, ...COACH_CATEGORIES].map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={cat === c.id}
              onClick={() => setCat(c.id)}
              className={cn(
                "shrink-0 border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors",
                cat === c.id ? "border-sport bg-sport text-sport-foreground" : "border-input hover:bg-secondary",
              )}
            >
              {l(c.label)}
            </button>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {list.map((r) => (
            <div key={r.id} className="interactive-surface border border-navy/12 bg-background p-5 hover:border-sport/40">
              <div className="flex items-start justify-between gap-3">
                <h2 className="heading-card">{l(r.title)}</h2>
                {r.sensitive && (
                  <span className="inline-flex shrink-0 items-center gap-1 bg-status-cancelled-soft px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-status-cancelled">
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
              </Button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
