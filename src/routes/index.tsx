import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, CalendarDays, ExternalLink, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoNotice } from "@/components/demo-notice";
import { PlaceholderImage } from "@/components/placeholder-image";
import { SectionHeading } from "@/components/page-header";
import { EventCard } from "@/components/event-list";
import { ALERTS } from "@/data/alerts";
import { TEAMS } from "@/data/teams";
import { NEWS } from "@/data/news";
import { ALBUMS } from "@/data/gallery";
import { SCHEDULE, DEMO_TODAY } from "@/data/schedule";
import { EXTERNAL_LINKS, SITE } from "@/lib/site";
import { formatDate, formatShortDate, useI18n } from "@/lib/i18n";
import { img } from "@/lib/images";
import heroHockey from "@/assets/hero-hockey.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AHM Verdun — Le hockey commence ici | Saison 2026–2027" },
      { name: "description", content: "Horaires, équipes, inscriptions et nouvelles de l'Association du hockey mineur de Verdun. Maquette de préproduction." },
      { property: "og:title", content: "AHM Verdun — Le hockey commence ici" },
      { property: "og:description", content: "Horaires, équipes, inscriptions et nouvelles de l'Association du hockey mineur de Verdun." },
    ],
  }),
  component: Home,
});

function Home() {
  const { t, l, lang } = useI18n();
  const alerts = ALERTS.filter((a) => !a.archived);
  const upcoming = SCHEDULE.filter((e) => e.date >= DEMO_TODAY).slice(0, 5);
  const news = NEWS.slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="relative isolate">
        <img src={heroHockey} alt="" width={1600} height={912} className="absolute inset-0 size-full object-cover" />
        <div className="hero-gradient absolute inset-0" aria-hidden />
        <div className="container-site relative flex min-h-[78vh] flex-col justify-end py-14 text-navy-foreground md:min-h-[82vh] md:py-20">
          <p className="eyebrow mb-4 flex items-center gap-2 text-navy-foreground/80">
            <span className="inline-block h-px w-8 bg-sport" />
            {t("common.season")} {SITE.season}
          </p>
          <h1 className="heading-hero max-w-4xl">{t("home.heroTitle")}</h1>
          <p className="mt-5 max-w-xl text-lg text-navy-foreground/85">{t("home.heroSub")} — {SITE.city}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="sport" size="lg">
              <Link to="/horaires"><CalendarDays className="size-5" /> {t("home.ctaSchedule")}</Link>
            </Button>
            <Button asChild variant="outline-light" size="lg">
              <a href={EXTERNAL_LINKS.spordleRegister} target="_blank" rel="noopener noreferrer">
                {t("home.ctaRegister")} <ExternalLink className="size-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Find my team */}
      <section className="border-b border-border bg-ice">
        <div className="container-site py-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="eyebrow text-sport">{t("home.findTeamHint")}</p>
              <h2 className="heading-card mt-1 flex items-center gap-2"><Users className="size-5 text-sport" /> {t("home.findTeam")}</h2>
            </div>
            <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {TEAMS.map((team) => (
                <Link
                  key={team.slug}
                  to="/equipes/$slug"
                  params={{ slug: team.slug }}
                  className="tap-target inline-flex shrink-0 items-center justify-center rounded-md border border-navy/15 bg-card px-4 font-display text-base font-bold uppercase shadow-card transition-colors hover:bg-navy hover:text-navy-foreground"
                >
                  {team.code}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Alerts */}
      {alerts.length > 0 && (
        <section className="container-site py-10 md:py-14">
          <SectionHeading eyebrow={t("common.demo")} title={t("home.alerts")} />
          <div className="space-y-3">
            {alerts.map((a) => (
              <div key={a.id} className="card-elevated border-l-4 border-l-sport p-5">
                <p className="flex items-center gap-2 font-display text-lg font-bold uppercase text-sport">
                  <AlertTriangle className="size-5" aria-hidden /> {l(a.title)}
                </p>
                <p className="mt-1.5 text-sm text-foreground/90">{l(a.message)}</p>
                <p className="mt-2 text-xs text-muted-foreground">{t("common.published")} {formatDate(a.publishedAt, lang)}</p>
                {a.linkTo && (
                  <Link to="/nouvelles/$slug" params={{ slug: a.linkTo.split("/").pop()! }} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-sport hover:underline">
                    {t("common.readMore")} <ArrowRight className="size-4" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Teams */}
      <section className="bg-ice py-12 md:py-16">
        <div className="container-site">
          <SectionHeading
            eyebrow={t("home.myTeamsSub")}
            title={t("home.myTeams")}
            action={<Button asChild variant="outline" size="sm"><Link to="/equipes">{t("common.seeAll")}</Link></Button>}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TEAMS.slice(0, 6).map((team) => (
              <Link key={team.slug} to="/equipes/$slug" params={{ slug: team.slug }} className="card-elevated group p-5">
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-3xl font-extrabold uppercase text-navy">{team.code}</span>
                  <span className="text-xs text-muted-foreground">{l(team.ages)}</span>
                </div>
                <h3 className="heading-card mt-2 group-hover:text-sport">{l(team.name)}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{l(team.description)}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming */}
      <section className="container-site py-12 md:py-16">
        <SectionHeading
          eyebrow={t("common.demoData")}
          title={t("home.upcoming")}
          action={<Button asChild variant="outline" size="sm"><Link to="/horaires">{t("common.seeAll")}</Link></Button>}
        />
        <DemoNotice className="mb-5">{t("home.upcomingNote")}</DemoNotice>
        <div className="space-y-3">
          {upcoming.map((e) => <EventCard key={e.id} event={e} />)}
        </div>
      </section>

      {/* News */}
      <section className="bg-ice py-12 md:py-16">
        <div className="container-site">
          <SectionHeading
            title={t("home.news")}
            action={<Button asChild variant="outline" size="sm"><Link to="/nouvelles">{t("common.seeAll")}</Link></Button>}
          />
          <div className="grid gap-5 md:grid-cols-3">
            {news.map((a) => (
              <Link key={a.slug} to="/nouvelles/$slug" params={{ slug: a.slug }} className="card-elevated group overflow-hidden">
                <PlaceholderImage src={img(a.image)} alt={l(a.title)} />
                <div className="p-5">
                  <p className="eyebrow text-sport">{formatShortDate(a.date, lang)}</p>
                  <h3 className="heading-card mt-2 group-hover:text-sport">{l(a.title)}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{l(a.excerpt)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="container-site py-12 md:py-16">
        <SectionHeading
          title={t("home.gallery")}
          action={<Button asChild variant="outline" size="sm"><Link to="/galerie">{t("common.seeAll")}</Link></Button>}
        />
        <div className="grid gap-5 sm:grid-cols-3">
          {ALBUMS.map((al) => (
            <Link key={al.slug} to="/galerie/$slug" params={{ slug: al.slug }} className="card-elevated group overflow-hidden">
              <PlaceholderImage src={img(al.cover)} alt={l(al.title)} aspect="aspect-[4/3]" />
              <div className="p-4">
                <h3 className="heading-card group-hover:text-sport">{l(al.title)}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{formatShortDate(al.date, lang)} · {l(al.eventType)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Sponsors */}
      <section className="navy-texture py-12 text-navy-foreground md:py-16">
        <div className="container-site">
          <p className="eyebrow text-sport-foreground/80">{t("common.toValidate")}</p>
          <h2 className="heading-section mt-2">{t("home.sponsors")}</h2>
          <p className="mt-3 max-w-2xl text-sm text-navy-foreground/75">{t("home.sponsorsNote")}</p>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex h-24 items-center justify-center rounded-lg border border-dashed border-navy-foreground/25 text-center text-[11px] uppercase tracking-wider text-navy-foreground/50">
                {t("home.sponsorSlot")}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
