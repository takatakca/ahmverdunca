import { canonicalLink } from "@/lib/seo";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/page-header";
import { PlaceholderImage } from "@/components/placeholder-image";
import { getArticle, NEWS, NEWS_CATEGORIES } from "@/data/news";
import { getTeam } from "@/data/teams";
import { formatDate, formatShortDate, useI18n } from "@/lib/i18n";
import { img } from "@/lib/images";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/share-button";

export const Route = createFileRoute("/nouvelles/$slug")({
  loader: ({ params }) => {
    const article = getArticle(params.slug);
    if (!article) throw notFound();
    return { slug: article.slug };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Nouvelle introuvable — AHM Verdun" }, { name: "robots", content: "noindex" }] };
    const a = getArticle(loaderData.slug)!;
    const title = `${a.title.fr} — AHM Verdun`;
    return {
      links: canonicalLink(`/nouvelles/${loaderData.slug}`),
      meta: [
        { title },
        { name: "description", content: a.excerpt.fr },
        { property: "og:title", content: title },
        { property: "og:description", content: a.excerpt.fr },
      ],
    };
  },
  component: ArticlePage,
});

function ArticlePage() {
  const { slug } = Route.useLoaderData();
  const { t, l, lang } = useI18n();
  const a = getArticle(slug)!;
  const publicLaunch = import.meta.env["VITE_PUBLIC_INDEXING"] === "true";
  const category = NEWS_CATEGORIES.find((c) => c.id === a.category);
  const body = lang === "en" && a.body.en ? a.body.en : a.body.fr;
  const related = NEWS.filter((n) => n.slug !== a.slug).slice(0, 2);
  const teams = a.teamSlugs.map(getTeam).filter(Boolean);

  return (
    <>
      <PageHeader
        eyebrow={`${category ? l(category.label) : ""} · ${formatDate(a.date, lang)}`}
        title={l(a.title)}
        description={l(a.excerpt)}
      />
      <div className="container-site py-8 md:py-12">
        <Link to="/nouvelles" className="inline-flex items-center gap-1.5 text-sm font-semibold text-sport hover:underline">
          <ArrowLeft className="size-4" /> {t("common.back")}
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <article>
            <PlaceholderImage src={img(a.image)} alt={l(a.title)} className="rounded-xl" />
            <p className="mt-4 text-sm text-muted-foreground">{t("article.author")} {a.author}</p>
            {lang === "en" && !a.body.en && (
              <div className="mt-4 rounded-lg border border-border bg-ice px-4 py-3 text-sm text-muted-foreground">
                {t("article.noEnglish")}
              </div>
            )}
            <div className="mt-5 space-y-4 text-base leading-relaxed text-foreground/90">
              {body.map((p, i) => <p key={i}>{p}</p>)}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <ShareButton title={l(a.title)} text={l(a.excerpt)} />
              {a.sourceUrl && !publicLaunch && (
                <Button asChild variant="outline" size="sm">
                  <a href={a.sourceUrl} target="_blank" rel="noopener noreferrer">
                    {lang === "fr" ? "Voir l'article original AHMV" : "View original AHMV article"}
                    <ExternalLink className="size-4" />
                  </a>
                </Button>
              )}
            </div>
            {a.contentPending && (
              <div className="mt-6 rounded-lg border border-border bg-ice px-4 py-3 text-sm text-muted-foreground">
                {t("common.toValidate")}
              </div>
            )}
          </article>

          <aside className="space-y-8">
            {teams.length > 0 && (
              <div>
                <p className="eyebrow mb-3 text-sport">{t("article.teams")}</p>
                <div className="flex flex-wrap gap-2">
                  {teams.map((tm) => (
                    <Link key={tm!.slug} to="/equipes/$slug" params={{ slug: tm!.slug }} className="rounded-full border border-input px-3 py-1.5 text-sm hover:bg-secondary">
                      {l(tm!.name)}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            <div>
              <SectionHeading title={t("article.related")} className="mb-4" />
              <div className="space-y-4">
                {related.map((r) => (
                  <Link key={r.slug} to="/nouvelles/$slug" params={{ slug: r.slug }} className="card-elevated block p-4 hover:text-sport">
                    <p className="eyebrow text-sport">{formatShortDate(r.date, lang)}</p>
                    <p className="heading-card mt-1.5">{l(r.title)}</p>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
