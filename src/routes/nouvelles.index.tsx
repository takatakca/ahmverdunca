import { canonicalLink } from "@/lib/seo";
import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PlaceholderImage } from "@/components/placeholder-image";
import { NEWS, NEWS_CATEGORIES, newsDateLabel } from "@/data/news";
import { useI18n } from "@/lib/i18n";
import { img } from "@/lib/images";
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
        eyebrow={t("common.season")}
        title={t("home.news")}
        description={
          lang === "fr"
            ? "Actualités, communiqués, équipes, tournois et vie de l’association réunis dans une salle de presse plus simple à parcourir."
            : "News, releases, teams, tournaments and association updates gathered in one easy-to-browse newsroom."
        }
      />

      <div className="container-site py-8 md:py-12">
        <div className="mb-6 flex flex-col gap-2 rounded-xl border border-border bg-ice px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow text-sport">
              {lang === "fr" ? "Nouvelles vérifiées" : "Verified news"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {lang === "fr"
                ? "Ces articles sont des résumés du contenu public AHM Verdun actuellement vérifié."
                : "These articles summarize currently verified public AHM Verdun content."}
            </p>
          </div>
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {NEWS.length} {lang === "fr" ? "articles intégrés" : "articles integrated"}
          </span>
        </div>

        <div
          className="scrollbar-none -mx-1 mb-8 flex gap-2 overflow-x-auto px-1 pb-1"
          aria-label={lang === "fr" ? "Filtres des nouvelles" : "News filters"}
        >
          {[{ id: "all", label: { fr: "Toutes", en: "All" } }, ...availableCategories].map(
            (category) => (
              <button
                key={category.id}
                type="button"
                aria-pressed={cat === category.id}
                onClick={() => setCat(category.id)}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors",
                  cat === category.id
                    ? "border-sport bg-sport text-sport-foreground"
                    : "border-input bg-background hover:bg-secondary",
                )}
              >
                {l(category.label)}
              </button>
            ),
          )}
        </div>

        {list.length === 0 && (
          <p className="rounded-lg border border-border bg-ice p-6 text-muted-foreground">
            {t("common.noResults")}
          </p>
        )}

        {featured && (
          <section className="grid gap-6 lg:grid-cols-[1.35fr_0.95fr] lg:items-stretch">
            <Link
              to="/nouvelles/$slug"
              params={{ slug: featured.slug }}
              className="card-elevated group overflow-hidden"
            >
              <PlaceholderImage
                src={img(featured.image)}
                alt={l(featured.title)}
                aspect="aspect-[16/9]"
              />
              <div className="p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-sport px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-sport-foreground">
                    {lang === "fr" ? "À la une" : "Featured"}
                  </span>
                  <span className="eyebrow text-sport">
                    {newsDateLabel(featured, lang)}
                  </span>
                </div>
                <h2 className="mt-4 font-display text-3xl font-extrabold uppercase leading-none text-navy group-hover:text-sport md:text-5xl">
                  {l(featured.title)}
                </h2>
                <p className="mt-4 max-w-3xl text-base text-muted-foreground">
                  {l(featured.excerpt)}
                </p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-sport">
                  {t("common.readMore")}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>

            <div className="grid content-start gap-5">
              {remaining.slice(0, 2).map((article) => (
                <Link
                  key={article.slug}
                  to="/nouvelles/$slug"
                  params={{ slug: article.slug }}
                  className="card-elevated group grid overflow-hidden sm:grid-cols-[0.8fr_1.2fr]"
                >
                  <PlaceholderImage
                    src={img(article.image)}
                    alt={l(article.title)}
                    aspect="aspect-[4/3] sm:aspect-auto sm:min-h-full"
                  />
                  <div className="p-5">
                    <p className="eyebrow text-sport">
                      {newsDateLabel(article, lang)}
                    </p>
                    <h2 className="heading-card mt-2 group-hover:text-sport">
                      {l(article.title)}
                    </h2>
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                      {l(article.excerpt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {remaining.length > 2 && (
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {remaining.slice(2).map((article) => (
              <Link
                key={article.slug}
                to="/nouvelles/$slug"
                params={{ slug: article.slug }}
                className="card-elevated group overflow-hidden"
              >
                <PlaceholderImage src={img(article.image)} alt={l(article.title)} />
                <div className="p-5">
                  <p className="eyebrow text-sport">
                    {newsDateLabel(article, lang)}
                  </p>
                  <h2 className="heading-card mt-2 group-hover:text-sport">
                    {l(article.title)}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {l(article.excerpt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
