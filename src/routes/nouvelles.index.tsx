import { canonicalLink } from "@/lib/seo";
import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SportArtwork } from "@/components/sport-artwork";
import { NEWS, NEWS_CATEGORIES, newsDateLabel } from "@/data/news";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/nouvelles/")({
  head: () => ({
    links: canonicalLink("/nouvelles"),
    meta: [
      { title: "Nouvelles et communiqués — AHM Verdun" },
      {
        name: "description",
        content:
          "Nouvelles, communiqués et annonces de l'Association du hockey mineur de Verdun, classés par catégorie.",
      },
      { property: "og:title", content: "Nouvelles et communiqués — AHM Verdun" },
      {
        property: "og:description",
        content: "Les annonces de l'association, par catégorie et par saison.",
      },
    ],
  }),
  component: NewsPage,
});

function NewsPage() {
  const { t, l, lang } = useI18n();
  const [cat, setCat] = useState("all");
  const availableCategories = NEWS_CATEGORIES.filter((category) =>
    NEWS.some((article) => article.category === category.id),
  );
  const list = cat === "all" ? NEWS : NEWS.filter((article) => article.category === cat);
  const featured = list[0];
  const remaining = list.slice(1);

  return (
    <>
      <PageHeader
        eyebrow={lang === "fr" ? "Salle de presse · Archive officielle" : "Newsroom · Official archive"}
        title={t("home.news")}
        description={
          lang === "fr"
            ? "Une archive éditoriale claire des annonces publiques AHM Verdun : opérations, équipes, inscriptions, tournois et vie de l’association."
            : "A clear editorial archive of AHM Verdun public updates: operations, teams, registration, tournaments and association life."
        }
      />

      <div className="container-site py-9 md:py-14">
        <div className="grid gap-6 border-b border-navy/15 pb-7 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <p className="eyebrow text-sport">{lang === "fr" ? "Contenu public migré" : "Migrated public content"}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
              {lang === "fr"
                ? "Les publications ci-dessous reprennent le contenu public vérifié de l’ancien site. Les dates exactes ne sont affichées que lorsqu’elles ont pu être confirmées."
                : "The publications below mirror verified public content from the previous site. Exact dates are shown only when they could be confirmed."}
            </p>
          </div>
          <div className="flex items-end gap-3">
            <span className="section-index text-navy/10">{String(NEWS.length).padStart(2, "0")}</span>
            <span className="pb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              {lang === "fr" ? "entrées archivées" : "archived entries"}
            </span>
          </div>
        </div>

        <div
          className="scrollbar-none -mx-1 flex gap-1 overflow-x-auto border-b border-navy/10 px-1 py-5"
          aria-label={lang === "fr" ? "Filtres des nouvelles" : "News filters"}
        >
          {[{ id: "all", label: { fr: "Toutes", en: "All" } }, ...availableCategories].map((category) => (
            <button
              key={category.id}
              type="button"
              aria-pressed={cat === category.id}
              onClick={() => setCat(category.id)}
              className={cn(
                "shrink-0 border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] transition-colors",
                cat === category.id
                  ? "border-navy bg-navy text-navy-foreground"
                  : "border-navy/12 bg-background text-navy hover:border-sport hover:text-sport",
              )}
            >
              {l(category.label)}
            </button>
          ))}
        </div>

        {list.length === 0 && (
          <p className="border border-border bg-ice p-6 text-muted-foreground">{t("common.noResults")}</p>
        )}

        {featured && (
          <section className="mt-8 grid overflow-hidden border border-navy/12 lg:grid-cols-[0.9fr_1.1fr]">
            <SportArtwork
              index={String(featured.legacyId ?? "01").padStart(2, "0")}
              kicker={newsDateLabel(featured, lang)}
              title={l(featured.title)}
              code="AHMV"
              aspect="min-h-[320px] lg:min-h-[520px]"
            />
            <Link
              to="/nouvelles/$slug"
              params={{ slug: featured.slug }}
              className="group flex flex-col justify-between bg-background p-6 md:p-9 lg:p-12"
            >
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="bg-sport px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-sport-foreground">
                    {lang === "fr" ? "À la une" : "Featured"}
                  </span>
                  <span className="eyebrow text-muted-foreground">{newsDateLabel(featured, lang)}</span>
                </div>
                <h2 className="mt-6 max-w-3xl font-display text-[clamp(2.7rem,5vw,5.4rem)] font-extrabold uppercase leading-[0.82] tracking-[-0.04em] text-navy transition-colors group-hover:text-sport">
                  {l(featured.title)}
                </h2>
                <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
                  {l(featured.excerpt)}
                </p>
              </div>
              <span className="mt-8 inline-flex items-center gap-2 border-t border-navy/12 pt-5 text-xs font-bold uppercase tracking-[0.16em] text-navy">
                {t("common.readMore")} <ArrowRight className="size-4 text-sport transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </section>
        )}

        {remaining.length > 0 && (
          <div className="mt-8 border-t-2 border-navy">
            {remaining.map((article, index) => (
              <Link
                key={article.slug}
                to="/nouvelles/$slug"
                params={{ slug: article.slug }}
                className="group grid gap-4 border-b border-navy/12 py-6 md:grid-cols-[5rem_10rem_minmax(0,1fr)_auto] md:items-center md:gap-6"
              >
                <span className="font-display text-4xl font-extrabold tracking-[-0.06em] text-navy/12">
                  {String(index + 2).padStart(2, "0")}
                </span>
                <div>
                  <p className="eyebrow text-sport">{newsDateLabel(article, lang)}</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {l(NEWS_CATEGORIES.find((category) => category.id === article.category)?.label ?? { fr: "AHMV", en: "AHMV" })}
                  </p>
                </div>
                <div>
                  <h2 className="font-display text-2xl font-extrabold uppercase leading-[0.92] text-navy transition-colors group-hover:text-sport md:text-3xl">
                    {l(article.title)}
                  </h2>
                  <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                    {l(article.excerpt)}
                  </p>
                </div>
                <ArrowRight className="hidden size-5 text-sport transition-transform group-hover:translate-x-1 md:block" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
