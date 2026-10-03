import { canonicalLink } from "@/lib/seo";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/page-header";
import { getArticle, NEWS, NEWS_CATEGORIES, newsDateLabel } from "@/data/news";
import { OFFICIAL_MEDIA } from "@/data/official-media";
import { getTeam } from "@/data/teams";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/share-button";
import { HouseSponsorSlot } from "@/components/house-sponsor-slot";

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
        eyebrow={`${category ? l(category.label) : ""} · ${newsDateLabel(a, lang)}`}
        title={l(a.title)}
        description={l(a.excerpt)}
      />
      <div className="container-site py-8 md:py-12">
        <Link to="/nouvelles" className="inline-flex items-center gap-1.5 text-sm font-semibold text-sport hover:underline">
          <ArrowLeft className="size-4" /> {t("common.back")}
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <article>
            <div className="group relative aspect-[16/8] overflow-hidden bg-navy">
              <img
                src={OFFICIAL_MEDIA.tournamentM11Tertiary.url}
                alt={lang === "fr" ? OFFICIAL_MEDIA.tournamentM11Tertiary.alt.fr : OFFICIAL_MEDIA.tournamentM11Tertiary.alt.en}
                loading="eager"
                decoding="async"
                className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,16,43,0.05),rgba(7,16,43,0.64))]" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-white md:p-7">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/70">
                    {lang === "fr" ? "Photo d’archive officielle AHMV" : "Official AHMV archive photo"}
                  </p>
                  <p className="mt-1 font-display text-2xl font-extrabold uppercase leading-none">
                    {category ? l(category.label) : "AHMV"}
                  </p>
                </div>
                <span className="font-display text-5xl font-extrabold text-white/18">
                  {String(a.legacyId ?? "01").padStart(2, "0")}
                </span>
              </div>
            </div>
            <div className="mt-0 grid gap-px border-x border-b border-navy/12 bg-navy/12 sm:grid-cols-3">
              <div className="bg-background p-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{lang === "fr" ? "Publication" : "Published"}</p>
                <p className="mt-1 font-display text-xl font-bold uppercase text-navy">{newsDateLabel(a, lang)}</p>
              </div>
              <div className="bg-background p-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{t("article.author")}</p>
                <p className="mt-1 font-display text-xl font-bold uppercase text-navy">{a.author}</p>
              </div>
              <div className="bg-background p-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{lang === "fr" ? "Saison" : "Season"}</p>
                <p className="mt-1 font-display text-xl font-bold uppercase text-navy">{a.season}</p>
              </div>
            </div>
            {lang === "en" && !a.body.en && (
              <div className="mt-4 rounded-lg border border-border bg-ice px-4 py-3 text-sm text-muted-foreground">
                {t("article.noEnglish")}
              </div>
            )}
            <div className="mt-8 border-t-2 border-navy pt-7">
              <p className="eyebrow text-sport">{lang === "fr" ? "Le communiqué" : "The update"}</p>
              <div className="mt-5 space-y-5 text-base leading-[1.78] text-foreground/90 md:text-lg">
                {body.map((p, i) => (
                  <p key={i} className={i === 0 ? "text-lg font-medium leading-[1.7] text-navy md:text-xl" : undefined}>{p}</p>
                ))}
              </div>
            </div>
            {a.links && a.links.length > 0 && (
              <div className="mt-7 border-y border-border py-5">
                <p className="eyebrow text-sport">{lang === "fr" ? "Liens officiels associés" : "Related official links"}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {a.links.map((link) => (
                    <Button key={link.url} asChild variant="outline" size="sm">
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        {l(link.label)} <ExternalLink className="size-4" />
                      </a>
                    </Button>
                  ))}
                </div>
              </div>
            )}
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

          <aside className="space-y-8 lg:border-l lg:border-navy/12 lg:pl-8">
            <HouseSponsorSlot placement={`story-${a.slug}`} count={1} compact />
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
                    <p className="eyebrow text-sport">{newsDateLabel(r, lang)}</p>
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
