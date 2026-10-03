import { canonicalLink } from "@/lib/seo";
import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { NEWS, NEWS_CATEGORIES, newsDateLabel } from "@/data/news";
import { OFFICIAL_MEDIA } from "@/data/official-media";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { HouseSponsorSlot } from "@/components/house-sponsor-slot";

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

      <div className="container-site py-8 md:py-11">
        <HouseSponsorSlot placement="newsroom" compact className="mb-7" />
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

        <div className="mt-7 grid h-44 grid-cols-3 gap-2 overflow-hidden sm:h-56 md:h-64">
          {[OFFICIAL_MEDIA.tournamentM11Secondary, OFFICIAL_MEDIA.tournamentM11Tertiary, OFFICIAL_MEDIA.volunteerArchive].map((media) => (
            <a
              key={media.url}
              href={media.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="interactive-surface group relative overflow-hidden bg-navy"
            >
              <img
                src={media.url}
                alt={lang === "fr" ? media.alt.fr : media.alt.en}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.035]"
              />
              <div className="absolute inset-0 bg-navy/10 transition-colors group-hover:bg-transparent" />
            </a>
          ))}
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
                "premium-control shrink-0 border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em]",
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
          <section className="interactive-surface mt-8 grid overflow-hidden border border-navy/12 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="group relative min-h-[300px] overflow-hidden bg-navy lg:min-h-[460px]">
              <img
                src={OFFICIAL_MEDIA.tournamentM11Primary.url}
                alt={lang === "fr" ? OFFICIAL_MEDIA.tournamentM11Primary.alt.fr : OFFICIAL_MEDIA.tournamentM11Primary.alt.en}
                loading="eager"
                decoding="async"
                className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,16,43,0.08),rgba(7,16,43,0.56))]" />
              <span className="absolute bottom-5 left-5 bg-navy/80 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur md:bottom-7 md:left-7">
                {lang === "fr" ? "Photo d’archive officielle AHMV" : "Official AHMV archive photo"}
              </span>
            </div>
            <Link
              to="/nouvelles/$slug"
              params={{ slug: featured.slug }}
              className="group flex flex-col justify-between bg-background p-6 md:p-8 lg:p-10"
            >
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="bg-sport px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-sport-foreground">
                    {lang === "fr" ? "À la une" : "Featured"}
                  </span>
                  <span className="eyebrow text-muted-foreground">{newsDateLabel(featured, lang)}</span>
                </div>
                <h2 className="mt-6 max-w-3xl font-display text-[clamp(2.25rem,4.6vw,4.6rem)] font-extrabold uppercase leading-[0.86] tracking-[-0.03em] text-navy transition-colors group-hover:text-sport">
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
                className="interactive-surface group grid gap-4 border-b border-navy/12 px-2 py-6 md:grid-cols-[5rem_10rem_minmax(0,1fr)_auto] md:items-center md:gap-6 md:px-3"
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
