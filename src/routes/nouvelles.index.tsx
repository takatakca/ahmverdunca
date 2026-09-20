import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { PlaceholderImage } from "@/components/placeholder-image";
import { DemoNotice } from "@/components/demo-notice";
import { NEWS, NEWS_CATEGORIES } from "@/data/news";
import { formatShortDate, useI18n } from "@/lib/i18n";
import { img } from "@/lib/images";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/nouvelles/")({
  head: () => ({
    meta: [
      { title: "Nouvelles et communiqués — AHM Verdun" },
      { name: "description", content: "Nouvelles, communiqués et annonces de l'Association du hockey mineur de Verdun, classés par catégorie." },
      { property: "og:title", content: "Nouvelles et communiqués — AHM Verdun" },
      { property: "og:description", content: "Les annonces de l'association, par catégorie et par saison." },
    ],
  }),
  component: NewsPage,
});

function NewsPage() {
  const { t, l, lang } = useI18n();
  const [cat, setCat] = useState("all");
  const list = cat === "all" ? NEWS : NEWS.filter((n) => n.category === cat);

  return (
    <>
      <PageHeader eyebrow={t("common.season")} title={t("home.news")} description={t("search.hint")} />
      <div className="container-site py-8 md:py-12">
        <DemoNotice className="mb-6">{t("common.demoData")} — {t("common.toValidate")}</DemoNotice>

        <div className="scrollbar-none -mx-1 mb-6 flex gap-2 overflow-x-auto px-1 pb-1">
          {[{ id: "all", label: { fr: "Toutes", en: "All" } }, ...NEWS_CATEGORIES].map((c) => (
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

        {list.length === 0 && <p className="text-muted-foreground">{t("common.noResults")}</p>}
        <div className="grid gap-6 md:grid-cols-3">
          {list.map((a) => (
            <Link key={a.slug} to="/nouvelles/$slug" params={{ slug: a.slug }} className="card-elevated group overflow-hidden">
              <PlaceholderImage src={img(a.image)} alt={l(a.title)} />
              <div className="p-5">
                <p className="eyebrow text-sport">{formatShortDate(a.date, lang)}</p>
                <h2 className="heading-card mt-2 group-hover:text-sport">{l(a.title)}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{l(a.excerpt)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
