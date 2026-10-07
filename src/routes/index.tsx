import { canonicalLink } from "@/lib/seo";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  Archive,
  ArrowRight,
  BookOpen,
  CalendarDays,
  ExternalLink,
  Facebook,
  Instagram,
  MapPin,
  Trophy,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SportArtwork } from "@/components/sport-artwork";
import { ALERTS } from "@/data/alerts";
import { CURRENT_TEAMS } from "@/data/teams";
import { NEWS, newsDateLabel } from "@/data/news";
import { ALBUMS } from "@/data/gallery";
import { OFFICIAL_MEDIA } from "@/data/official-media";
import { uploadedAhmvMediaById } from "@/data/uploaded-media";
import { newsVisualForCategory } from "@/data/news-visuals";
import { teamVisualForCategory } from "@/data/team-visuals";
import { ARENAS } from "@/data/arenas";
import { HOCKEY_HERITAGE } from "@/data/heritage";
import { EXTERNAL_LINKS, SITE, mapsDirectionsUrl } from "@/lib/site";
import { formatDate, formatShortDate, useI18n } from "@/lib/i18n";
import { OfficialWeekPreview } from "@/components/official-week-preview";
import { AhmvRealHockeyWall } from "@/components/home/ahmv-real-hockey-wall";
import { AhmvCommunityFeed } from "@/components/home/ahmv-community-feed";
import { HomeParentCommand } from "@/components/home/home-parent-command";
import { HomeCreativeRail } from "@/components/home/home-creative-rail";
import { AHMV_LOGO_URL, LogoSlot } from "@/components/layout/logo-slot";
import { AdSenseSlot } from "@/components/adsense-slot";
import { HouseSponsorSlot } from "@/components/house-sponsor-slot";
import { usePreferredTeam } from "@/lib/team-preference";
import { publicTeamHubUrl } from "@/data/team-directory";
import { getActiveAlerts } from "@/lib/active-alerts";
import { useMontrealDate } from "@/lib/use-montreal-date";
import { cn } from "@/lib/utils";
import { OfficialSponsorShowcase } from "@/components/official-sponsor-showcase";
import { RevenueActionPanel } from "@/components/revenue-action-panel";
import { ContentContributionButton } from "@/components/content-contribution-button";
import { FittedImage } from "@/components/media/fitted-image";

/** Top-right correction pen for a home news card, kept outside the card link. */
function HomeNewsPen({ article, lang }: { article: (typeof NEWS)[number]; lang: "fr" | "en" }) {
  return (
    <ContentContributionButton
      resourceType="news"
      resourceKey={`news:${article.slug}`}
      title={article.title[lang]}
      snapshot={{
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        date: article.date ?? null,
        sourceUrl: article.sourceUrl ?? null,
      }}
      fields={[
        { key: "title", label: { fr: "Titre", en: "Title" }, kind: "text", current: article.title[lang] },
        { key: "text", label: { fr: "Texte / résumé", en: "Text / summary" }, kind: "textarea", current: article.excerpt[lang] },
        { key: "imageUrl", label: { fr: "Image", en: "Image" }, kind: "image-url" },
        { key: "url", label: { fr: "Lien source", en: "Source link" }, kind: "url", current: article.sourceUrl },
        { key: "publishedAt", label: { fr: "Date publiée", en: "Published date" }, kind: "date", current: article.date },
      ]}
      className="absolute right-3 top-3 z-20"
    />
  );
}

const HOME_HERO_MEDIA = uploadedAhmvMediaById(1)!;
const HOME_TOURNAMENT_MEDIA = uploadedAhmvMediaById(26)!;

/** The post's own image when it has one (shown whole), otherwise the category visual. */
function homeNewsMedia(article: (typeof NEWS)[number]) {
  if (article.image) return { url: article.image, alt: article.title, own: true };
  const visual = newsVisualForCategory(article.category) ?? HOME_HERO_MEDIA;
  return { url: visual.url, alt: visual.alt, own: false };
}

export const Route = createFileRoute("/")({
  head: () => ({
    links: canonicalLink("/"),
    meta: [
      { title: "AHM Verdun — Le hockey commence ici" },
      { name: "description", content: "Horaires, équipes, inscriptions, nouvelles, arénas et ressources de l'Association du hockey mineur de Verdun." },
      { property: "og:title", content: "AHM Verdun — Le hockey commence ici" },
      { property: "og:description", content: "Horaires, équipes, inscriptions et nouvelles de l'Association du hockey mineur de Verdun." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: HOME_HERO_MEDIA.url },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const { t, l, lang } = useI18n();
  const { preferredTeam, selectedTeams } = usePreferredTeam();
  const primarySelectedTeam = selectedTeams[0];
  const today = useMontrealDate();
  const alerts = getActiveAlerts(ALERTS, today);
  const news = NEWS.slice(0, 3);
  const featuredMedia = news[0] ? homeNewsMedia(news[0]) : undefined;
  const featuredArena = ARENAS[0];

  return (
    <div className="flow-root bg-navy-deep text-white">
      {/* Arena opening — verified public AHMV archive media, never synthetic photography */}
      <section className="relative isolate min-h-[52svh] overflow-hidden bg-competition text-navy-foreground sm:min-h-[60svh] md:min-h-[70svh]">
        <img
          src={HOME_HERO_MEDIA.url}
          alt={lang === "fr" ? HOME_HERO_MEDIA.alt.fr : HOME_HERO_MEDIA.alt.en}
          fetchPriority="high"
          decoding="async"
          className="hero-zoom absolute inset-0 size-full object-cover object-center opacity-68"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,16,43,0.97)_0%,rgba(7,16,43,0.78)_42%,rgba(7,16,43,0.28)_100%)]" aria-hidden />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,16,43,0.18)_0%,rgba(7,16,43,0.32)_45%,rgba(7,16,43,0.96)_100%)]" aria-hidden />
        <div className="technical-grid absolute inset-0 opacity-25" aria-hidden />
        <div className="absolute inset-y-0 left-[17%] w-px bg-navy-foreground/8" aria-hidden />
        <div className="absolute inset-y-0 left-1/2 w-[3px] bg-sport/65" aria-hidden />
        <div className="absolute inset-y-0 right-[17%] w-px bg-navy-foreground/8" aria-hidden />
        <div className="absolute left-1/2 top-1/2 size-[min(58vw,44rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-sport/24" aria-hidden />
        <div className="absolute left-1/2 top-1/2 size-[min(24vw,18rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-navy-foreground/10" aria-hidden />
        <div className="giant-watermark pointer-events-none absolute -right-[5vw] top-[18%] select-none" aria-hidden>Verdun</div>
        <img
          src={AHMV_LOGO_URL}
          alt=""
          aria-hidden
          className="pointer-events-none absolute right-[2vw] top-[10%] hidden w-[min(42vw,34rem)] select-none object-contain opacity-[0.085] drop-shadow-[0_24px_70px_rgba(0,0,0,0.34)] lg:block"
        />
        <div className="arena-light opacity-45" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-[linear-gradient(180deg,transparent,var(--color-competition))]" aria-hidden />

        <div className="container-site relative flex min-h-[50svh] flex-col justify-end pb-7 pt-12 sm:min-h-[58svh] md:min-h-[68svh] md:pb-11">
          <div className="max-w-6xl">
            <div className="rise mb-5 flex items-center gap-4">
              <LogoSlot size="lg" className="size-20 sm:size-24 md:size-24" />
              <div className="border-l border-navy-foreground/20 pl-4">
                <p className="font-display text-2xl font-extrabold uppercase tracking-[-0.025em] text-white sm:text-3xl">AHM Verdun</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/52 sm:text-xs">
                  {lang === "fr" ? "Association du hockey mineur de Verdun" : "Verdun Minor Hockey Association"}
                </p>
              </div>
            </div>

            <h1 className="rise mt-2 max-w-[10ch] font-display text-[clamp(3.2rem,10vw,7.2rem)] font-extrabold uppercase leading-[0.8] tracking-[-0.052em] text-navy-foreground [animation-delay:140ms]">
              {t("home.heroTitle")}
            </h1>

            <div className="rise mt-5 flex max-w-3xl flex-wrap items-center gap-x-3 gap-y-2 text-xs font-semibold uppercase tracking-[0.13em] text-navy-foreground/75 [animation-delay:220ms] sm:text-sm md:text-base">
              <span>{lang === "fr" ? "Hockey mineur" : "Minor hockey"}</span>
              <span className="size-1 rounded-full bg-sport" aria-hidden />
              <span>{lang === "fr" ? "Familles" : "Families"}</span>
              <span className="size-1 rounded-full bg-sport" aria-hidden />
              <span>{lang === "fr" ? "Équipes" : "Teams"}</span>
              <span className="size-1 rounded-full bg-sport" aria-hidden />
              <span>{lang === "fr" ? "Communauté" : "Community"}</span>
            </div>

            <div className="rise mt-6 flex flex-col gap-3 sm:flex-row [animation-delay:280ms]">
              <Button asChild variant="sport" size="lg" className="min-h-12 px-6">
                <Link to="/horaires" search={preferredTeam ? { team: preferredTeam } : {}}>
                  <CalendarDays className="size-5" />
                  {preferredTeam
                    ? lang === "fr"
                      ? "Voir mon horaire"
                      : "View my schedule"
                    : t("home.ctaSchedule")}
                </Link>
              </Button>
              <Button asChild variant="outline-light" size="lg" className="min-h-12 px-6">
                {primarySelectedTeam ? (
                  <a href={publicTeamHubUrl(primarySelectedTeam)}>
                    <Users className="size-4" />
                    <span className="max-w-[14rem] truncate">
                      {lang === "fr" ? "Mon équipe" : "My team"} · {primarySelectedTeam.name}
                    </span>
                  </a>
                ) : preferredTeam ? (
                  <Link to="/equipes/$slug" params={{ slug: preferredTeam }}>
                    <Users className="size-4" />
                    {lang === "fr" ? "Ma catégorie" : "My category"}
                  </Link>
                ) : (
                  <Link to="/inscriptions">
                    {t("home.ctaRegister")} <ArrowRight className="size-4" />
                  </Link>
                )}
              </Button>
            </div>
          </div>


        </div>
      </section>

      {/* Current / important strip */}
      <section className="border-b border-white/10 bg-navy text-white">
        <div className="container-site py-3.5 sm:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="shrink-0 bg-sport px-2.5 py-1 font-display text-xs font-bold uppercase tracking-[0.12em] text-sport-foreground">
              {lang === "fr" ? "Cette semaine" : "This week"}
            </span>
            <p className="truncate text-sm font-semibold text-white/82">
              {alerts[0]
                ? l(alerts[0].title)
                : lang === "fr"
                  ? "Horaires, équipes et informations AHMV au même endroit."
                  : "Schedules, teams and AHMV information in one place."}
            </p>
          </div>
        </div>
      </section>

      {/* Alerts */}
      {alerts.length > 0 && (
        <section className="border-y border-status-cancelled/20 bg-status-cancelled-soft">
          <div className="container-site py-5">
            {alerts.map((a) => (
              <div key={a.id} className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <AlertTriangle className="mt-0.5 size-5 shrink-0 text-status-cancelled" aria-hidden />
                  <div>
                    <p className="font-display text-xl font-extrabold uppercase text-status-cancelled">{l(a.title)}</p>
                    <p className="mt-1 text-sm text-foreground/80">{l(a.message)}</p>
                  </div>
                </div>
                {a.linkTo && a.linkTo.split("/").pop() && (
                  <Link
                    to="/nouvelles/$slug"
                    params={{ slug: a.linkTo.split("/").pop() ?? "" }}
                    className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-status-cancelled hover:underline"
                  >
                    {t("common.readMore")} <ArrowRight className="size-4" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>
      )}


      <HomeCreativeRail />

      {/* Local restaurant / business inventory — always visible to free visitors. */}
      <section className="bg-competition py-5 text-white md:py-7">
        <div className="container-site">
          <HouseSponsorSlot placement="home-local-food" count={4} />
        </div>
      </section>

      <OfficialWeekPreview />

      <HomeParentCommand />

      <AhmvRealHockeyWall />

      <AhmvCommunityFeed />

      {/* Team universe */}
      <section className="relative overflow-hidden bg-navy-deep py-10 text-navy-foreground md:py-14">
        <div className="arena-light opacity-40" aria-hidden />
        <div className="container-site relative">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow text-sport-foreground">{t("home.teamUniverseHint")}</p>
              <h2 className="mt-2 font-display text-4xl font-extrabold uppercase leading-[0.9] tracking-[-0.025em] sm:text-5xl md:text-6xl">
                {t("home.teamUniverse")}
              </h2>
            </div>
            <Button asChild variant="outline-light" size="sm">
              <Link to="/equipes">{t("common.seeAll")} <ArrowRight className="size-4" /></Link>
            </Button>
          </div>

          <div className="scrollbar-none mt-7 flex snap-x gap-px overflow-x-auto border-y border-navy-foreground/15">
            {CURRENT_TEAMS.map((team, index) => {
              const media = teamVisualForCategory(team.slug);
              return (
                <Link
                  key={team.slug}
                  to="/equipes/$slug"
                  params={{ slug: team.slug }}
                  className={cn(
                    "interactive-surface group relative min-h-[208px] min-w-[160px] snap-start overflow-hidden border-r border-navy-foreground/15 bg-navy-foreground/[0.025] transition-colors sm:min-w-[188px]",
                    preferredTeam === team.slug && "ring-2 ring-inset ring-sport",
                  )}
                >
                  {media && (
                    <img
                      src={media.url}
                      alt={lang === "fr" ? media.alt.fr : media.alt.en}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 size-full object-cover opacity-72 transition-[transform,opacity] duration-500 group-hover:scale-[1.035] group-hover:opacity-88"
                    />
                  )}
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,16,43,0.12)_0%,rgba(7,16,43,0.52)_52%,rgba(7,16,43,0.98)_100%)]" />
                  <span className="absolute left-3 top-3 border border-white/15 bg-navy-deep/68 px-2 py-1 font-display text-[10px] font-extrabold uppercase tracking-[0.12em] text-white backdrop-blur">
                    {team.code}
                  </span>
                  <span className="absolute right-3 top-3 font-display text-2xl font-extrabold text-white/24">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="absolute inset-x-3 bottom-3">
                    {preferredTeam === team.slug && (
                      <span className="mb-2 inline-block bg-sport px-2 py-1 text-[8px] font-bold uppercase tracking-[0.14em] text-sport-foreground">
                        {lang === "fr" ? "Mon équipe" : "My team"}
                      </span>
                    )}
                    <p className="font-display text-3xl font-extrabold uppercase leading-none text-white sm:text-4xl">{team.code}</p>
                    <p className="mt-1.5 text-xs font-semibold text-white/68">{l(team.ages)}</p>
                    <div className="mt-3 flex items-center justify-between border-t border-white/15 pt-2.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white/65">
                      <span>{team.code === "F" ? l(team.name) : lang === "fr" ? "Photo AHMV · catégorie" : "AHMV photo · category"}</span>
                      <ArrowRight className="size-3.5 text-sport-foreground transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Newsroom */}
      <section className="relative overflow-hidden bg-competition py-8 text-white md:py-10">
        <div className="technical-grid pointer-events-none absolute inset-0 opacity-15" aria-hidden />
        <div className="container-site relative">
          <div className="flex flex-col gap-4 border-b border-white/15 pb-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Salle de presse AHMV" : "AHMV newsroom"}</p>
              <h2 className="mt-2 font-display text-4xl font-extrabold uppercase leading-none text-white sm:text-5xl md:text-6xl">
                {t("home.news")}
              </h2>
            </div>
            <Button asChild variant="outline-light" size="sm">
              <Link to="/nouvelles">{t("common.seeAll")} <ArrowRight className="size-4" /></Link>
            </Button>
          </div>

          {news[0] && (
            <div className="mt-7 grid gap-0 overflow-hidden border border-white/10 lg:grid-cols-[1.65fr_0.85fr]">
              <div className="relative">
              <Link
                to="/nouvelles/$slug"
                params={{ slug: news[0].slug }}
                className="tactile group relative block h-full min-h-[420px] overflow-hidden bg-navy-deep md:min-h-[520px]"
              >
                {featuredMedia?.own ? (
                  <FittedImage
                    src={featuredMedia.url}
                    alt={l(featuredMedia.alt)}
                    imgClassName="transition-transform duration-700 group-hover:scale-[1.02]"
                  />
                ) : (
                  <img
                    src={featuredMedia?.url}
                    alt={featuredMedia ? l(featuredMedia.alt) : ""}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                  />
                )}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,16,43,0.16)_0%,rgba(7,16,43,0.22)_40%,rgba(7,16,43,0.96)_100%)]" />
                <span className="absolute left-5 top-5 border border-white/20 bg-navy/72 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur md:left-7 md:top-7">
                  {featuredMedia?.own
                    ? lang === "fr" ? "Image de la publication" : "Post image"
                    : lang === "fr" ? "Photo d’archive AHMV" : "AHMV archive photo"}
                </span>
                <div className="absolute inset-x-0 bottom-0 p-6 text-navy-foreground md:p-9">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="bg-sport px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-sport-foreground">
                      {lang === "fr" ? "À la une" : "Featured"}
                    </span>
                    <span className="eyebrow text-navy-foreground/65">{newsDateLabel(news[0], lang)}</span>
                  </div>
                  <h3 className="mt-4 max-w-4xl font-display text-3xl font-extrabold uppercase leading-[0.94] sm:text-4xl md:text-5xl">
                    {l(news[0].title)}
                  </h3>
                  <p className="mt-4 max-w-2xl text-sm leading-relaxed text-navy-foreground/70 md:text-base">
                    {l(news[0].excerpt)}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-sport-foreground">
                    {t("common.readMore")} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
              <HomeNewsPen article={news[0]} lang={lang} />
              </div>

              <div className="grid divide-y divide-white/10 bg-navy-deep">
                {news.slice(1).map((article, index) => {
                  const media = homeNewsMedia(article);
                  return (
                    <div key={article.slug} className="relative">
                    <Link
                      to="/nouvelles/$slug"
                      params={{ slug: article.slug }}
                      className="interactive-surface group grid h-full min-h-56 overflow-hidden bg-competition sm:grid-cols-[0.78fr_1.22fr] lg:grid-cols-1 xl:grid-cols-[0.78fr_1.22fr]"
                    >
                      <div className="relative min-h-40 overflow-hidden bg-navy sm:min-h-full lg:min-h-40 xl:min-h-full">
                        {media.own ? (
                          <FittedImage
                            src={media.url}
                            alt={l(media.alt)}
                            imgClassName="transition-transform duration-500 group-hover:scale-[1.035]"
                          />
                        ) : (
                          <img
                            src={media.url}
                            alt={l(media.alt)}
                            loading="lazy"
                            decoding="async"
                            className="absolute inset-0 size-full object-cover opacity-80 transition-[transform,opacity] duration-500 group-hover:scale-[1.035] group-hover:opacity-95"
                          />
                        )}
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_38%,rgba(7,16,43,0.78)_100%)]" />
                        <span className="absolute left-3 top-3 border border-white/15 bg-navy-deep/72 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.14em] text-white/78 backdrop-blur">
                          {lang === "fr" ? "Photo AHMV" : "AHMV photo"}
                        </span>
                      </div>
                      <div className="flex min-w-0 flex-col justify-between p-5 md:p-6">
                        <div className="flex items-start justify-between gap-4">
                          <p className="eyebrow text-sport-foreground">{newsDateLabel(article, lang)}</p>
                          <span className="font-display text-3xl font-extrabold text-white/10">0{index + 2}</span>
                        </div>
                        <div className="mt-5">
                          <h3 className="font-display text-2xl font-extrabold uppercase leading-[0.92] text-white group-hover:text-sport-foreground">
                            {l(article.title)}
                          </h3>
                          <p className="mt-3 line-clamp-3 text-sm text-white/56">{l(article.excerpt)}</p>
                        </div>
                      </div>
                    </Link>
                    <HomeNewsPen article={article} lang={lang} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Tournament bridge */}
      <section className="relative overflow-hidden border-y border-white/10 bg-competition text-white">
        <div className="technical-grid pointer-events-none absolute inset-0 opacity-20" aria-hidden />
        <div className="container-site relative grid gap-px bg-white/10 lg:grid-cols-[0.72fr_1.28fr]">
          <Link
            to="/tournois"
            className="interactive-surface group relative min-h-[260px] overflow-hidden bg-navy lg:min-h-[330px]"
          >
            <img
              src={HOME_TOURNAMENT_MEDIA.url}
              alt={lang === "fr" ? HOME_TOURNAMENT_MEDIA.alt.fr : HOME_TOURNAMENT_MEDIA.alt.en}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-contain transition-transform duration-500 group-hover:scale-[1.018]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_45%,rgba(7,16,43,0.28)_100%)]" />
            <span className="absolute left-4 top-4 border border-white/15 bg-navy-deep/76 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.15em] text-white backdrop-blur">
              {lang === "fr" ? "Affiche AHMV officielle" : "Official AHMV artwork"}
            </span>
          </Link>

          <div className="flex flex-col justify-center bg-competition px-6 py-8 md:px-9 lg:px-12 lg:py-10">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center bg-sport text-sport-foreground">
                <Trophy className="size-5" />
              </span>
              <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Événement officiel" : "Official event"}</p>
            </div>
            <p className="mt-5 max-w-3xl font-display text-4xl font-extrabold uppercase leading-[0.88] tracking-[-0.03em] sm:text-5xl">
              {lang === "fr" ? "30e Tournoi Provincial M11 de Verdun" : "30th Verdun Provincial U11 Tournament"}
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/62">
              {lang === "fr"
                ? "18–31 janvier 2027 · Auditorium de Verdun. Une passerelle claire vers les informations du tournoi, les horaires et les classements."
                : "January 18–31, 2027 · Verdun Auditorium. A clear gateway to tournament information, schedules and standings."}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild variant="sport">
                <Link to="/tournois">{lang === "fr" ? "Voir tous les détails" : "View all details"} <ArrowRight className="size-4" /></Link>
              </Button>
              <Button asChild variant="outline-light">
                <Link to="/equipes/$slug" params={{ slug: "m11" }}>{lang === "fr" ? "Voir M11" : "View U11"}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery / community */}
      <section className="bg-navy-deep py-10 text-navy-foreground md:py-14">
        <div className="container-site">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Communauté · Médias" : "Community · Media"}</p>
              <h2 className="mt-2 font-display text-4xl font-extrabold uppercase leading-[0.9] sm:text-5xl md:text-6xl">
                {t("home.moments")}
              </h2>
            </div>
            <Button asChild variant="outline-light" size="sm">
              <Link to="/galerie">{t("common.seeAll")} <ArrowRight className="size-4" /></Link>
            </Button>
          </div>

          <div className="mt-8 grid auto-rows-[170px] gap-2 sm:grid-cols-2 sm:auto-rows-[220px] lg:grid-cols-4 lg:auto-rows-[230px]">
            {ALBUMS.map((album, index) => (
              <Link
                key={album.slug}
                to="/galerie/$slug"
                params={{ slug: album.slug }}
                className={cn(
                  "interactive-surface group relative overflow-hidden bg-navy",
                  index === 0 && "sm:row-span-2 lg:col-span-2 lg:row-span-2",
                  index === 1 && "lg:col-span-2",
                )}
              >
                {album.coverUrl ? (
                  <img
                    src={album.coverUrl}
                    alt={l(album.title)}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                  />
                ) : (
                  <SportArtwork
                    index={String(index + 1).padStart(2, "0")}
                    kicker={l(album.eventType)}
                    title={l(album.title)}
                    code="ARCH"
                    aspect="absolute inset-0"
                    className="absolute inset-0"
                  />
                )}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_20%,rgba(7,16,43,0.88)_100%)]" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="eyebrow text-sport-foreground">{l(album.eventType)}</p>
                  <h3 className={cn("mt-2 font-display font-extrabold uppercase leading-none", index === 0 ? "text-4xl md:text-5xl" : "text-2xl")}>
                    {l(album.title)}
                  </h3>
                  <p className="mt-2 text-xs text-navy-foreground/55">{formatShortDate(album.date, lang)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Arenas */}
      <section className="relative overflow-hidden bg-navy-deep py-12 text-white md:py-16">
        <div className="arena-light opacity-25" aria-hidden />
        <div className="container-site relative">
          <div className="grid gap-7 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="eyebrow text-sport">{lang === "fr" ? "Où nous jouons" : "Where we play"}</p>
              <h2 className="mt-2 font-display text-5xl font-extrabold uppercase leading-[0.85] tracking-[-0.035em] text-white sm:text-6xl md:text-7xl">
                {lang === "fr" ? "Les arénas" : "Arenas"}
              </h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-white/60">
                {lang === "fr"
                  ? "Adresses vérifiées, itinéraires et installations utilisées autour de Verdun et Montréal."
                  : "Verified addresses, directions and facilities used around Verdun and Montreal."}
              </p>
              <Button asChild variant="outline-light" className="mt-6">
                <Link to="/arenas">{lang === "fr" ? `Voir les ${ARENAS.length} arénas` : `View all ${ARENAS.length} arenas`} <ArrowRight className="size-4" /></Link>
              </Button>
            </div>

            {featuredArena && (
              <div className="overflow-hidden border border-white/12 border-t-4 border-t-sport bg-competition">
                <div className="grid md:grid-cols-[1.15fr_0.85fr]">
                  <div className="p-6 md:p-8">
                    <p className="eyebrow text-sport">{lang === "fr" ? "Aréna principal" : "Featured arena"}</p>
                    <h3 className="mt-3 font-display text-4xl font-extrabold uppercase leading-[0.9] text-white md:text-5xl">
                      {featuredArena.name}
                    </h3>
                    <p className="mt-4 flex items-start gap-2 text-sm text-white/66">
                      <MapPin className="mt-0.5 size-4 shrink-0 text-sport" />
                      {featuredArena.address}
                    </p>
                    {featuredArena.facilities && (
                      <p className="mt-4 text-sm leading-relaxed text-white/58">{l(featuredArena.facilities)}</p>
                    )}
                    <div className="mt-6 flex flex-wrap gap-2">
                      <Button asChild variant="sport">
                        <a href={mapsDirectionsUrl(featuredArena.address)} target="_blank" rel="noopener noreferrer">
                          <MapPin className="size-4" /> {lang === "fr" ? "Itinéraire" : "Directions"}
                        </a>
                      </Button>
                      <Button asChild variant="outline-light">
                        <Link to="/arenas/$slug" params={{ slug: featuredArena.slug }}>
                          {lang === "fr" ? "Fiche aréna" : "Arena details"} <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>

                  <div className="divide-y divide-white/10 border-t border-white/10 md:border-l md:border-t-0">
                    {ARENAS.slice(1, 5).map((arena, index) => (
                      <Link
                        key={arena.slug}
                        to="/arenas/$slug"
                        params={{ slug: arena.slug }}
                        className="group flex min-h-24 items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-white/[0.05]"
                      >
                        <div className="min-w-0">
                          <p className="eyebrow text-white/42">0{index + 2} · {l(arena.borough)}</p>
                          <p className="mt-1 truncate font-display text-xl font-bold uppercase text-white">{arena.name}</p>
                        </div>
                        <ArrowRight className="size-4 shrink-0 text-sport transition-transform group-hover:translate-x-1" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Social strip */}
      <section className="border-y border-white/10 bg-navy-deep text-white">
        <div className="container-site flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="eyebrow text-sport-foreground">{t("home.socialPreview")}</p>
            <p className="mt-1 text-sm text-white/52">{t("home.socialNote")}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline-light" size="sm">
              <a href={EXTERNAL_LINKS.instagram} target="_blank" rel="noopener noreferrer">
                <Instagram className="size-4" /> Instagram <ExternalLink className="size-3" />
              </a>
            </Button>
            <Button asChild variant="outline-light" size="sm">
              <a href={EXTERNAL_LINKS.facebook} target="_blank" rel="noopener noreferrer">
                <Facebook className="size-4" /> Facebook <ExternalLink className="size-3" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* WLLV */}
      <section className="competition-panel relative overflow-hidden py-16 text-navy-foreground md:py-24">
        <div className="pointer-events-none absolute right-[-2vw] top-1/2 -translate-y-1/2 font-display text-[28vw] font-extrabold leading-none text-navy-foreground/[0.035]">
          AA
        </div>
        <div className="container-site relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Parcours compétitif" : "Competitive pathway"}</p>
            <h2 className="mt-3 font-display text-5xl font-extrabold uppercase leading-[0.86] tracking-[-0.03em] sm:text-6xl md:text-7xl">
              WLLV
              <span className="outline-text ml-3">AA / BB</span>
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-navy-foreground/65">{t("home.wllvNote")}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <Button asChild variant="outline-light" size="lg">
              <Link to="/wllv">{lang === "fr" ? "Comprendre le parcours" : "Understand the pathway"} <ArrowRight className="size-4" /></Link>
            </Button>
            <Button asChild variant="sport" size="lg">
              <a href={EXTERNAL_LINKS.wllv} target="_blank" rel="noopener noreferrer">
                {t("home.discoverWllv")} <ExternalLink className="size-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Hockey heritage */}
      <section id="archives-hockey" className="relative scroll-mt-28 overflow-hidden border-y border-white/10 bg-navy-deep py-12 text-white md:py-16">
        <div className="technical-grid pointer-events-none absolute inset-0 opacity-20" aria-hidden />
        <div className="container-site relative">
          <div className="grid gap-px overflow-hidden border border-white/12 bg-white/10 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="bg-competition p-7 text-white md:p-10 lg:p-12">
              <div className="flex items-center gap-3">
                <Archive className="size-7 text-sport-foreground" aria-hidden />
                <p className="eyebrow text-sport-foreground">
                  {lang === "fr" ? "Mémoire du hockey verdunois" : "Verdun hockey heritage"}
                </p>
              </div>
              <h2 className="mt-5 max-w-4xl font-display text-5xl font-extrabold uppercase leading-[0.84] tracking-[-0.04em] sm:text-6xl md:text-7xl">
                {lang === "fr" ? HOCKEY_HERITAGE.title.fr : HOCKEY_HERITAGE.title.en}
              </h2>
              <p className="mt-5 max-w-3xl text-sm leading-relaxed text-white/68 md:text-base">
                {lang === "fr" ? HOCKEY_HERITAGE.summary.fr : HOCKEY_HERITAGE.summary.en}
              </p>

              <div className="mt-8 grid gap-px bg-white/12 sm:grid-cols-2">
                {HOCKEY_HERITAGE.milestones.map((item) => (
                  <article key={item.id} className="bg-competition p-5">
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-sport-foreground/75">
                      {lang === "fr" ? item.timing.fr : item.timing.en}
                    </p>
                    <h3 className="mt-2 font-display text-2xl font-extrabold uppercase leading-[0.9]">
                      {lang === "fr" ? item.title.fr : item.title.en}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/58">
                      {lang === "fr" ? item.description.fr : item.description.en}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-between bg-navy p-7 md:p-10 lg:p-12">
              <div>
                <BookOpen className="size-8 text-sport" aria-hidden />
                <p className="eyebrow mt-6 text-sport">
                  {lang === "fr" ? "Vos archives font partie de l’histoire" : "Your archives are part of the story"}
                </p>
                <p className="mt-3 font-display text-3xl font-extrabold uppercase leading-[0.9] text-white sm:text-4xl">
                  {lang === "fr" ? "Photos. Chandails. Trophées. Souvenirs." : "Photos. Jerseys. Trophies. Memories."}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-white/58">
                  {lang === "fr" ? HOCKEY_HERITAGE.archiveCall.fr : HOCKEY_HERITAGE.archiveCall.en}
                </p>
              </div>

              <div className="mt-8 border-t border-white/12 pt-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
                  {lang === "fr" ? "Archive féminine — septembre 2026" : "Girls hockey archive — September 2026"}
                </p>
                <p className="mt-2 font-display text-2xl font-extrabold uppercase text-white">
                  {lang === "fr" ? "M12A + M12B" : "U12A + U12B"}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-white/58">
                  {lang === "fr"
                    ? "L’appel visait les joueuses et gardiennes nées en 2015, 2016 ou 2017. La date limite du 23 septembre étant passée, l’annonce est conservée comme archive du programme féminin."
                    : "The call targeted players and goaltenders born in 2015, 2016 or 2017. Because the September 23 deadline has passed, the notice is preserved as part of the girls hockey archive."}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <a
                    href="https://www.facebook.com/share/19JZX8MAwx/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="premium-control inline-flex min-h-11 items-center gap-2 border border-white/18 px-4 text-xs font-bold uppercase tracking-[0.12em] text-white hover:border-sport"
                  >
                    Facebook archive <ExternalLink className="size-3.5" />
                  </a>
                  <a
                    href={`mailto:${SITE.girlsHockeyEmail}`}
                    className="premium-control inline-flex min-h-11 items-center gap-2 bg-sport px-4 text-xs font-bold uppercase tracking-[0.12em] text-sport-foreground"
                  >
                    {lang === "fr" ? "Hockey féminin" : "Girls hockey"} <ArrowRight className="size-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AdSenseSlot placement="home-main" className="container-site my-8 md:my-12" />

      {/* Partners */}
      <section className="navy-texture overflow-hidden py-12 text-navy-foreground md:py-16">
        <div className="container-site">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow text-sport-foreground/80">{lang === "fr" ? "Communauté" : "Community"}</p>
              <h2 className="mt-2 font-display text-4xl font-extrabold uppercase leading-none md:text-5xl">
                {t("home.sponsors")}
              </h2>
              <p className="mt-3 max-w-2xl text-sm text-navy-foreground/60">{t("home.sponsorsNote")}</p>
            </div>
            <Button asChild variant="outline-light" size="sm">
              <Link to="/contact">{lang === "fr" ? "Devenir partenaire" : "Become a partner"}</Link>
            </Button>
          </div>

          <div className="mt-8">
            <OfficialSponsorShowcase compact />
          </div>
        </div>
      </section>

      <RevenueActionPanel />

    </div>
  );
}
