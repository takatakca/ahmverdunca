import { canonicalLink, canonicalUrl } from "@/lib/seo";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, MessageCircle } from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/page-header";
import { getArticle, NEWS, NEWS_CATEGORIES, newsDateLabel } from "@/data/news";
import { OFFICIAL_MEDIA } from "@/data/official-media";
import { uploadedAhmvMediaById } from "@/data/uploaded-media";
import { getTeam } from "@/data/teams";
import { formatShortDate, useI18n } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/share-button";
import { HouseSponsorSlot } from "@/components/house-sponsor-slot";
import { ContentContributionButton } from "@/components/content-contribution-button";
import { FittedImage } from "@/components/media/fitted-image";
import { useContentOverlayRegistry } from "@/lib/community-content";
import { exactFacebookCommentUrl, exactSocialThread } from "@/lib/news-discussion";

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
  const contentRegistry = useContentOverlayRegistry();
  const a = getArticle(slug)!;
  const overlay = contentRegistry.get("news", `news:${slug}`);
  const patch = overlay?.patch ?? {};
  const publicLaunch = import.meta.env["VITE_PUBLIC_INDEXING"] === "true";
  const category = NEWS_CATEGORIES.find((c) => c.id === a.category);
  const baseBody = lang === "en" && a.body.en ? a.body.en : a.body.fr;
  const body = Array.isArray(patch["body"]) && patch["body"].every((item) => typeof item === "string")
    ? patch["body"] as string[]
    : baseBody;
  const displayTitle = typeof patch["title"] === "string" ? patch["title"] : l(a.title);
  const displayExcerpt = typeof patch["text"] === "string" ? patch["text"] : l(a.excerpt);
  const displayAuthor = typeof patch["author"] === "string" ? patch["author"] : a.author;
  const displaySourceUrl = typeof patch["url"] === "string" ? patch["url"] : a.sourceUrl;
  const publishedOverride = typeof patch["publishedAt"] === "string" ? new Date(patch["publishedAt"]) : null;
  const displayDate = publishedOverride && Number.isFinite(publishedOverride.getTime())
    ? new Intl.DateTimeFormat(lang === "fr" ? "fr-CA" : "en-CA", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "America/Toronto",
      }).format(publishedOverride)
    : newsDateLabel(a, lang);
  const articleUrl = canonicalUrl(`/nouvelles/${slug}`);
  const publishedSchemaDate =
    publishedOverride && Number.isFinite(publishedOverride.getTime())
      ? publishedOverride.toISOString()
      : a.date || undefined;
  const newsJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: displayTitle,
    description: displayExcerpt,
    mainEntityOfPage: articleUrl,
    url: articleUrl,
    inLanguage: lang === "fr" ? "fr-CA" : "en-CA",
    ...(publishedSchemaDate ? { datePublished: publishedSchemaDate } : {}),
    publisher: {
      "@type": "SportsOrganization",
      name: SITE.name.fr,
      url: SITE.domain,
    },
  });
  const related = NEWS
    .filter((article) => article.slug !== a.slug)
    .map((article, index) => ({
      article,
      index,
      relevance:
        (article.category === a.category ? 2 : 0) +
        (article.teamSlugs.some((teamSlug) => a.teamSlugs.includes(teamSlug)) ? 1 : 0),
    }))
    .sort((left, right) => right.relevance - left.relevance || left.index - right.index)
    .slice(0, 2)
    .map(({ article }) => article);
  const teams = a.teamSlugs.map(getTeam).filter(Boolean);
  const storyMedia =
    a.slug === "30e-tournoi-atome-m11-verdun-2027"
      ? uploadedAhmvMediaById(26)
      : a.slug === "relance-ahmv-enjeu-couts-glace-2026"
        ? uploadedAhmvMediaById(25)
        : a.category === "feminine"
          ? uploadedAhmvMediaById(16)
          : a.category === "registration"
            ? uploadedAhmvMediaById(39)
            : OFFICIAL_MEDIA.tournamentM11Tertiary;
  // The post's own image (or an approved correction) is shown whole; generic visuals fill the frame.
  const ownImageUrl = typeof patch["imageUrl"] === "string" ? patch["imageUrl"] : a.image;
  const displayImageUrl = ownImageUrl ?? storyMedia!.url;
  const comments = a.comments ?? [];
  // Only a link to the exact post lets people join that thread; the page URL alone does not.
  const discussionThread = exactSocialThread(displaySourceUrl);
  const contributionFields = [
    { key: "title", label: { fr: "Titre", en: "Title" }, kind: "text" as const, current: displayTitle },
    { key: "text", label: { fr: "Résumé", en: "Summary" }, kind: "textarea" as const, current: displayExcerpt },
    { key: "body", label: { fr: "Corps du texte", en: "Article body" }, kind: "json" as const, current: body },
    { key: "imageUrl", label: { fr: "Image principale", en: "Main image" }, kind: "image-url" as const, current: displayImageUrl },
    { key: "url", label: { fr: "Lien source", en: "Source link" }, kind: "url" as const, current: displaySourceUrl },
    { key: "author", label: { fr: "Auteur / source", en: "Author / source" }, kind: "text" as const, current: displayAuthor },
    { key: "publishedAt", label: { fr: "Date publiée", en: "Published date" }, kind: "text" as const, current: typeof patch["publishedAt"] === "string" ? patch["publishedAt"] : a.date },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: newsJsonLd }} />
      <PageHeader
        eyebrow={`${category ? l(category.label) : ""} · ${displayDate}`}
        title={displayTitle}
        description={displayExcerpt}
        actions={
          <ContentContributionButton
            resourceType="news"
            resourceKey={`news:${slug}`}
            title={displayTitle}
            snapshot={{
              title: displayTitle,
              text: displayExcerpt,
              body,
              imageUrl: displayImageUrl,
              url: displaySourceUrl,
              author: displayAuthor,
              publishedAt: typeof patch["publishedAt"] === "string" ? patch["publishedAt"] : a.date,
            }}
            fields={contributionFields}
            appearance="menu"
          />
        }
      />
      <div className="container-site py-8 md:py-12">
        <Link to="/nouvelles" className="inline-flex items-center gap-1.5 text-sm font-semibold text-sport hover:underline">
          <ArrowLeft className="size-4" /> {t("common.back")}
        </Link>

        <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <article className="min-w-0 overflow-hidden border border-white/12 bg-navy-deep text-white">
            <div className="group relative aspect-[16/8] overflow-hidden bg-navy">
              {ownImageUrl ? (
                <FittedImage src={ownImageUrl} alt={displayTitle} loading="eager" />
              ) : (
                <img
                  src={displayImageUrl}
                  alt={lang === "fr" ? storyMedia!.alt.fr : storyMedia!.alt.en}
                  loading="eager"
                  decoding="async"
                  className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
              )}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,16,43,0.05),rgba(7,16,43,0.64))]" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-white md:p-7">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/70">
                    {lang === "fr" ? "Média AHMV associé à la nouvelle" : "AHMV media related to this update"}
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
            <div className="mt-0 grid gap-px border-x border-b border-white/12 bg-white/10 sm:grid-cols-3">
              <div className="bg-competition p-4 text-white">
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/42">{lang === "fr" ? "Publication" : "Published"}</p>
                <p className="mt-1 font-display text-xl font-bold uppercase text-white">{displayDate}</p>
              </div>
              <div className="bg-competition p-4 text-white">
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/42">{t("article.author")}</p>
                <p className="mt-1 font-display text-xl font-bold uppercase text-white">{displayAuthor}</p>
              </div>
              <div className="bg-competition p-4 text-white">
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/42">{lang === "fr" ? "Saison" : "Season"}</p>
                <p className="mt-1 font-display text-xl font-bold uppercase text-white">{a.season}</p>
              </div>
            </div>
            {lang === "en" && !a.body.en && (
              <div className="mt-4 border border-white/12 bg-navy-deep px-4 py-3 text-sm text-white/52">
                {t("article.noEnglish")}
              </div>
            )}
            <div className="border-t-2 border-sport/70 bg-competition px-5 py-7 md:px-7">
              <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Le communiqué" : "The update"}</p>
              <div className="mt-5 space-y-5 text-base leading-[1.78] text-white/72 md:text-lg">
                {body.map((p, i) => (
                  <p key={i} className={i === 0 ? "text-lg font-medium leading-[1.7] text-white md:text-xl" : undefined}>{p}</p>
                ))}
              </div>
            </div>
            {a.links && a.links.length > 0 && (
              <div className="border-y border-white/10 bg-navy-deep px-5 py-5 md:px-7">
                <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Liens officiels associés" : "Related official links"}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {a.links.map((link) => (
                    <Button key={link.url} asChild variant="outline-light" size="sm">
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        {l(link.label)} <ExternalLink className="size-4" />
                      </a>
                    </Button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-2 bg-navy-deep px-5 py-6 md:px-7">
              <ShareButton title={displayTitle} text={displayExcerpt} />
              {displaySourceUrl && !publicLaunch && (
                <Button asChild variant="outline-light" size="sm">
                  <a href={displaySourceUrl} target="_blank" rel="noopener noreferrer">
                    {lang === "fr" ? "Voir l'article original AHMV" : "View original AHMV article"}
                    <ExternalLink className="size-4" />
                  </a>
                </Button>
              )}
            </div>
            <section className="border-t border-white/10 bg-competition px-5 py-7 md:px-7" aria-labelledby="discussion-heading">
              <div className="flex items-center gap-2">
                <MessageCircle className="size-4 text-sport-foreground" aria-hidden />
                <p id="discussion-heading" className="eyebrow text-sport-foreground">
                  Discussion{comments.length > 0 ? ` · ${comments.length}` : ""}
                </p>
              </div>
              {comments.length > 0 && (
                <ul className="mt-5 space-y-3">
                  {comments.map((comment, index) => {
                    const commentSourceUrl = comment.source === "facebook" ? exactFacebookCommentUrl(comment.sourceUrl) : undefined;
                    return (
                    <li key={`${comment.sourceUrl ?? index}`} className="border border-white/10 bg-navy-deep p-4">
                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white/52">
                        <span className="text-white">{comment.author}</span>
                        {comment.date && <><span aria-hidden>·</span><span>{formatShortDate(comment.date, lang)}</span></>}
                        <span className="border border-white/15 px-1.5 py-0.5 text-[8px] text-white/60">
                          {comment.source === "facebook" ? "Facebook" : lang === "fr" ? "Membre AHMV" : "AHMV member"}
                        </span>
                      </div>
                      <p lang={comment.language} className="mt-2 text-sm leading-relaxed text-white/75">{comment.body}</p>
                      {commentSourceUrl && (
                        <a href={commentSourceUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-xs text-sport-foreground hover:underline">
                          {lang === "fr" ? "Voir ce commentaire sur Facebook" : "View this comment on Facebook"}
                          <ExternalLink className="size-3" aria-hidden />
                        </a>
                      )}
                    </li>
                    );
                  })}
                </ul>
              )}
              <div className="mt-5 flex flex-wrap items-center gap-3">
                {discussionThread ? (
                  <Button asChild variant="sport" size="sm">
                    <a href={discussionThread.url} target="_blank" rel="noopener noreferrer">
                      {lang === "fr" ? `Voir et commenter sur ${discussionThread.network}` : `View and comment on ${discussionThread.network}`}
                      <ExternalLink className="size-4" />
                    </a>
                  </Button>
                ) : (
                  <Button asChild variant="outline-light" size="sm">
                    <Link to="/contact">{lang === "fr" ? "Contacter l’AHMV" : "Contact AHMV"}</Link>
                  </Button>
                )}
                <p className="text-xs leading-relaxed text-white/50">
                  {discussionThread
                    ? lang === "fr" ? `Participez à la discussion sur la publication ${discussionThread.network}.` : `Join the discussion on the ${discussionThread.network} post.`
                    : lang === "fr" ? "Pour réagir à cette nouvelle, utilisez les coordonnées officielles de l’AHMV." : "To respond to this update, use AHMV’s official contact details."}
                </p>
              </div>
            </section>
            {a.contentPending && (
              <div className="mt-6 border border-white/12 bg-navy-deep px-4 py-3 text-sm text-white/52">
                {t("common.toValidate")}
              </div>
            )}
          </article>

          <aside className="space-y-8 lg:border-l lg:border-white/12 lg:pl-8">
            <HouseSponsorSlot placement={`story-${a.slug}`} count={1} compact />
            {teams.length > 0 && (
              <div>
                <p className="eyebrow mb-3 text-sport">{t("article.teams")}</p>
                <div className="flex flex-wrap gap-2">
                  {teams.map((tm) => (
                    <Link key={tm!.slug} to="/equipes/$slug" params={{ slug: tm!.slug }} className="rounded-full border border-white/14 bg-navy-deep px-3 py-1.5 text-sm text-white/70 hover:border-sport hover:text-white">
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
                  <Link key={r.slug} to="/nouvelles/$slug" params={{ slug: r.slug }} className="interactive-surface block border border-white/12 bg-competition p-4 text-white hover:border-sport/50">
                    <p className="eyebrow text-sport-foreground">{newsDateLabel(r, lang)}</p>
                    <p className="heading-card mt-1.5 text-white">{l(r.title)}</p>
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
