import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, CalendarDays, ExternalLink, Facebook, Instagram, MapPin, Radio, Trophy, Users } from "lucide-react";
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
import { cn } from "@/lib/utils";
import heroHockey from "@/assets/hero-hockey.jpg";
import { ScheduleFinder } from "@/components/schedule-finder";
import { usePreferredTeam } from "@/lib/team-preference";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AHM Verdun — Le hockey commence ici | Saison 2026–2027" },
      { name: "description", content: "Horaires, équipes, inscriptions et nouvelles de l'Association du hockey mineur de Verdun. Maquette de préproduction." },
      { property: "og:title", content: "AHM Verdun — Le hockey commence ici" },
      { property: "og:description", content: "Horaires, équipes, inscriptions et nouvelles de l'Association du hockey mineur de Verdun." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const { t, l, lang } = useI18n();
  const { preferredTeam } = usePreferredTeam();
  const alerts = ALERTS.filter((a) => !a.archived);
  const upcoming = SCHEDULE.filter((e) => e.date >= DEMO_TODAY && (!preferredTeam || e.teamSlug === preferredTeam)).slice(0, 4);
  const news = NEWS.slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="relative isolate">
        <img
          src={heroHockey}
          alt=""
          width={1600}
          height={912}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          className="absolute inset-0 size-full object-cover"
        />
        <div className="hero-gradient absolute inset-0" aria-hidden />
         <div className="container-site relative flex min-h-[58vh] flex-col justify-end py-10 text-navy-foreground md:min-h-[70vh] md:py-16">
          <p className="eyebrow mb-4 flex items-center gap-2 text-navy-foreground/80">
            <span className="inline-block h-px w-8 bg-sport" />
            {t("common.season")} {SITE.season}
          </p>
          <p className="font-display text-2xl font-bold uppercase md:text-3xl">AHM Verdun</p>
          <h1 className="heading-hero mt-2 max-w-4xl">{t("home.heroTitle")}</h1>
          <p className="mt-5 max-w-xl text-lg text-navy-foreground/85">{lang === "fr" ? "Développement • Compétition • Communauté" : "Development • Competition • Community"}</p>
          <p className="mt-2 text-sm text-navy-foreground/65">{t("home.heroSub")} — {SITE.city}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="sport" size="lg">
              <Link to="/horaires"><CalendarDays className="size-5" /> {t("home.ctaSchedule")}</Link>
            </Button>
            <Button asChild variant="outline-light" size="lg">
              <Link to="/inscriptions">
                {t("home.ctaRegister")} <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

       <ScheduleFinder />

      {/* Alerts */}
      {alerts.length > 0 && (
        <section className="container-site py-7 md:py-9">
          <p className="eyebrow mb-3 text-sport">{t("home.alerts")}</p>
          <div className="space-y-3">
            {alerts.map((a) => (
              <div key={a.id} className="flex flex-col gap-4 border-l-4 border-l-sport bg-status-cancelled-soft p-5 md:flex-row md:items-center md:justify-between">
                <div>
                <p className="flex items-center gap-2 font-display text-lg font-bold uppercase text-sport">
                  <AlertTriangle className="size-5" aria-hidden /> {l(a.title)}
                </p>
                <p className="mt-1.5 text-sm text-foreground/90">{l(a.message)}</p>
                <p className="mt-2 text-xs text-muted-foreground">{t("common.published")} {formatDate(a.publishedAt, lang)}</p>
                </div>
                {a.linkTo && a.linkTo.split("/").pop() && (
                  <Link to="/nouvelles/$slug" params={{ slug: a.linkTo.split("/").pop() ?? "" }} className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-sport hover:underline">
                    {t("common.readMore")} <ArrowRight className="size-4" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* This week */}
      <section className="competition-panel py-12 text-navy-foreground md:py-16">
        <div className="container-site">
          <SectionHeading
            eyebrow={t("common.demoData")}
            title={t("home.weekTitle")}
            description={t("home.weekHint")}
            action={<Button asChild variant="outline-light" size="sm"><Link to="/horaires">{t("common.seeAll")}</Link></Button>}
          />
          <DemoNotice className="mb-5">{t("home.upcomingNote")}</DemoNotice>
           {preferredTeam && <p className="mb-4 text-sm text-navy-foreground/80">{lang === "fr" ? "Mon équipe" : "My team"} · {l(TEAMS.find((team) => team.slug === preferredTeam)?.name)}</p>}
          <div className="space-y-3 text-foreground">
             {upcoming.length ? upcoming.map((e) => <EventCard key={e.id} event={e} />) : <p className="py-5 text-sm text-navy-foreground/80">{t("schedule.noEventsWeek")}</p>}
          </div>
        </div>
      </section>

      {/* Team universe */}
      <section className="rink-lines bg-ice py-12 md:py-16">
        <div className="container-site">
        <SectionHeading
          eyebrow={t("home.teamUniverseHint")}
          title={t("home.teamUniverse")}
          action={<Button asChild variant="outline" size="sm"><Link to="/equipes">{t("common.seeAll")}</Link></Button>}
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {TEAMS.map((team, index) => (
            <Link
              key={team.slug}
              to="/equipes/$slug"
              params={{ slug: team.slug }}
              className={cn(
                "group relative min-h-44 overflow-hidden rounded-lg border bg-card p-5 shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover",
                preferredTeam === team.slug
                  ? "border-sport ring-2 ring-sport/20"
                  : "border-navy/10",
              )}
            >
              <span className="absolute right-2 top-0 font-display text-7xl font-extrabold text-navy/5">
                {String(index + 1).padStart(2, "0")}
              </span>
              {preferredTeam === team.slug && (
                <span className="absolute left-4 top-4 rounded-full bg-sport px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-sport-foreground">
                  {lang === "fr" ? "Mon équipe" : "My team"}
                </span>
              )}
              <Users
                className={cn(
                  "size-5 text-sport",
                  preferredTeam === team.slug && "mt-8",
                )}
                aria-hidden
              />
              <span className="mt-7 block font-display text-4xl font-extrabold uppercase text-navy">
                {team.code}
              </span>
              <span className="mt-1 block text-xs font-semibold text-muted-foreground">
                {l(team.ages)}
              </span>
              <ArrowRight className="absolute bottom-4 right-4 size-5 text-sport transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
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

      {/* Tournament preview */}
      <section className="border-y border-border bg-background py-12 md:py-16">
        <div className="container-site grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="eyebrow text-sport">{t("home.socialPreview")}</p>
            <h2 className="heading-section mt-2">{t("home.tournaments")}</h2>
            <p className="mt-4 max-w-lg text-muted-foreground">{t("home.tournamentsNote")}</p>
            <Button asChild variant="outline" className="mt-6"><Link to="/nouvelles"><Trophy className="size-4" /> {t("common.seeAll")}</Link></Button>
          </div>
          <div className="competition-panel flex min-h-64 flex-col justify-end rounded-lg p-6 text-navy-foreground md:p-8">
            <Trophy className="mb-auto size-8 text-sport-foreground" />
            <p className="eyebrow text-navy-foreground/60">{t("common.demo")}</p>
            <p className="mt-2 font-display text-3xl font-bold uppercase">{lang === "fr" ? "Centre des tournois AHMV" : "AHMV tournament centre"}</p>
            <p className="mt-2 text-sm text-navy-foreground/65">{lang === "fr" ? "Calendrier, inscriptions, résultats et visibilité des partenaires réunis dans un même espace." : "Schedules, registration, results and partner visibility in one place."}</p>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="container-site py-12 md:py-16">
        <SectionHeading
          eyebrow={t("common.demo")}
          title={t("home.moments")}
          action={<Button asChild variant="outline" size="sm"><Link to="/galerie">{t("common.seeAll")}</Link></Button>}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          {ALBUMS.map((al) => (
            <Link key={al.slug} to="/galerie/$slug" params={{ slug: al.slug }} className="group relative overflow-hidden rounded-lg first:sm:col-span-2 first:sm:row-span-2">
              <PlaceholderImage src={img(al.cover)} alt={l(al.title)} aspect="aspect-[4/3]" />
              <div className="absolute inset-x-0 bottom-0 bg-navy-deep/90 p-4 text-navy-foreground">
                <h3 className="heading-card">{l(al.title)}</h3>
                <p className="mt-1 text-xs text-navy-foreground/65">{formatShortDate(al.date, lang)} · {l(al.eventType)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Future social layer */}
      <section className="bg-ice py-12 md:py-16">
        <div className="container-site">
          <SectionHeading eyebrow={t("home.socialPreview")} title={t("home.social")} description={t("home.socialNote")} />
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: "Instagram", Icon: Instagram },
              { label: "Facebook", Icon: Facebook },
              { label: "Google", Icon: MapPin },
            ].map(({ label, Icon }) => (
              <div key={label} className="border-t-4 border-t-sport bg-card p-6 shadow-card">
                <div className="flex items-center justify-between">
                  <Icon className="size-6 text-navy" aria-hidden />
                  <Radio className="size-4 text-muted-foreground" aria-hidden />
                </div>
                <h3 className="heading-card mt-8">{label}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t("home.socialPreview")}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WLLV bridge */}
      <section className="competition-panel py-12 text-navy-foreground md:py-16">
        <div className="container-site flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow text-sport-foreground">{t("home.nextStep")}</p>
            <h2 className="heading-section mt-2">{t("home.wllvTitle")}</h2>
            <p className="mt-3 max-w-2xl text-navy-foreground/70">{t("home.wllvNote")}</p>
          </div>
          <Button asChild variant="outline-light" size="lg">
            <a href={EXTERNAL_LINKS.wllv} target="_blank" rel="noopener noreferrer">{t("home.discoverWllv")} <ExternalLink className="size-4" /></a>
          </Button>
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
