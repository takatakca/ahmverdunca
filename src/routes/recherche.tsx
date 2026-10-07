import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, MapPin, PhoneCall, Search, Trophy, Users } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { VoiceSearchButton } from "@/components/voice-search-button";
import { TEAMS } from "@/data/teams";
import { PUBLIC_TEAM_DIRECTORY, officialTeamResultsUrl, publicTeamHubUrl } from "@/data/team-directory";
import { ARENAS } from "@/data/arenas";
import { NEWS, newsDateLabel } from "@/data/news";
import { FAQ } from "@/data/faq";
import { ALBUMS } from "@/data/gallery";
import { RESOURCES } from "@/data/resources";
import { COACH_RESOURCES } from "@/data/coaches";
import { SPONSORS } from "@/data/sponsors";
import { OFFICIAL_WEEK_ACTIVITIES, OFFICIAL_WEEK_META } from "@/data/official-week";
import { formatShortDate, useI18n } from "@/lib/i18n";
import { montrealDateKey } from "@/lib/montreal-date";
import { useAhmvPhoneStatus } from "@/lib/use-ahmv-phone-status";
import { OFFICIAL_MEDIA } from "@/data/official-media";
import { usePreferredTeam } from "@/lib/team-preference";

export const Route = createFileRoute("/recherche")({
  head: () => ({
    meta: [
      { title: "Recherche — AHM Verdun" },
      { name: "robots", content: "noindex, follow" },
      {
        name: "description",
        content:
          "Rechercher une équipe, un horaire, un aréna, une nouvelle, une ressource, un album ou une question fréquente sur le site de l'AHM Verdun.",
      },
      { property: "og:title", content: "Recherche — AHM Verdun" },
      { property: "og:description", content: "Trouvez rapidement l'information AHM Verdun." },
    ],
  }),
  component: SearchPage,
});

type Hit = {
  key: string;
  label: string;
  kind: string;
  detail?: string;
  to?: string;
  slug?: string;
  href?: string;
  external?: boolean;
};

const STATIC_PAGES = [
  {
    key: "registration",
    fr: "Inscriptions hockey",
    en: "Hockey registration",
    keywords: "inscription inscrire enfant spordle paiement registration register",
    to: "/inscriptions",
  },
  {
    key: "schedule",
    fr: "Horaires de la semaine",
    en: "Weekly schedules",
    keywords: "horaire calendrier pratique match partie schedule calendar game practice",
    to: "/horaires",
  },
  {
    key: "tournaments",
    fr: "Tournois AHM Verdun",
    en: "AHM Verdun tournaments",
    keywords: "tournoi m11 festival tournament",
    to: "/tournois",
  },
  {
    key: "partners",
    fr: "Partenaires et commanditaires",
    en: "Partners and sponsors",
    keywords: "commanditaire sponsor partenaire publicité visibilité partner",
    to: "/partenaires",
  },
  {
    key: "coaches",
    fr: "Zone entraîneurs",
    en: "Coaches zone",
    keywords: "entraineur entraîneur coach formation soigneur respect sport",
    to: "/entraineurs",
  },
  {
    key: "resources",
    fr: "Ressources hockey et aide financière",
    en: "Hockey resources and financial assistance",
    keywords: "ressource aide financière financement kidsport bon départ hockey canada quebec",
    to: "/ressources",
  },
  {
    key: "gallery",
    fr: "Photos et vidéos",
    en: "Photos and videos",
    keywords: "photo video galerie album gallery media",
    to: "/galerie",
  },
  {
    key: "wllv",
    fr: "WLLV AA/BB Chacals",
    en: "WLLV AA/BB Chacals",
    keywords: "wllv chacals aa bb double lettre",
    to: "/wllv",
  },
  {
    key: "contact",
    fr: "Contact AHM Verdun",
    en: "Contact AHM Verdun",
    keywords: "contact téléphone telephone courriel email aide question",
    to: "/contact",
  },
  {
    key: "faq",
    fr: "Questions fréquentes",
    en: "Frequently asked questions",
    keywords: "faq questions aide help",
    to: "/faq",
  },
  {
    key: "arenas",
    fr: "Arénas et itinéraires",
    en: "Arenas and directions",
    keywords: "arena aréna glace adresse maps itinéraire direction",
    to: "/arenas",
  },
] as const;

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function SearchPage() {
  const { t, l, lang } = useI18n();
  const publicLaunch = import.meta.env["VITE_PUBLIC_INDEXING"] === "true";
  const { phonePublic, phoneDisplay, phoneE164 } = useAhmvPhoneStatus();
  const { selectedTeams } = usePreferredTeam();
  const primaryTeam = selectedTeams[0];
  const showPhone = phonePublic;
  const [q, setQ] = useState("");
  const today = montrealDateKey();
  const officialWeekActive =
    today >= OFFICIAL_WEEK_META.start && today <= OFFICIAL_WEEK_META.end;

  const hits = useMemo<Hit[]>(() => {
    const needle = normalize(q.trim());
    if (needle.length < 2) return [];

    const out: Hit[] = [];

    TEAMS.forEach((item) => {
      const haystack = normalize(
        `${l(item.name)} ${item.code} ${l(item.ages)} ${l(item.description)} équipe team horaire schedule`,
      );
      if (haystack.includes(needle)) {
        out.push({
          key: `team-${item.slug}`,
          label: l(item.name),
          kind: t("nav.teams"),
          detail: l(item.ages),
          to: "/equipes/$slug",
          slug: item.slug,
        });
      }
    });

    PUBLIC_TEAM_DIRECTORY.forEach((item) => {
      const haystack = normalize(
        `${item.name} ${item.level} ${item.categorySlug} ${item.legacyScheduleTeamId} ${item.legacyScheduleTeamId.slice(-4)} leafs bulldogs coyotes broncos ducks flames jets oilers dynamos louves équipe team resultat résultat classement horaire schedule standings`,
      );
      if (haystack.includes(needle)) {
        out.push({
          key: `public-team-${item.legacyScheduleTeamId}`,
          label: item.name,
          kind: lang === "fr" ? "Équipe publiée" : "Published team",
          detail: `${item.level} · ${lang === "fr" ? "horaire et classement" : "schedule and standings"}`,
          href: publicTeamHubUrl(item),
        });
      }
    });

    ARENAS.forEach((item) => {
      const haystack = normalize(
        `${item.name} ${l(item.borough)} ${item.address} aréna arena adresse direction itinéraire maps`,
      );
      if (haystack.includes(needle)) {
        out.push({
          key: `arena-${item.slug}`,
          label: item.name,
          kind: t("nav.arenas"),
          detail: item.address,
          to: "/arenas/$slug",
          slug: item.slug,
        });
      }
    });

    if (officialWeekActive) {
      OFFICIAL_WEEK_ACTIVITIES.filter((item) =>
        normalize(`${item.group} ${item.activity} ${item.venue} ${item.date} ${item.start}`).includes(needle),
      )
        .slice(0, 8)
        .forEach((item) => {
          out.push({
            key: `schedule-${item.id}`,
            label: `${item.group} · ${item.start}`,
            kind: lang === "fr" ? "Horaire officiel" : "Official schedule",
            detail: `${item.activity} · ${item.venue} · ${formatShortDate(item.date, lang)}`,
            href: `/horaires?q=${encodeURIComponent(item.group)}`,
          });
        });
    }

    NEWS.forEach((item) => {
      if (normalize(`${l(item.title)} ${l(item.excerpt)} nouvelles news`).includes(needle)) {
        out.push({
          key: `news-${item.slug}`,
          label: l(item.title),
          kind: t("nav.news"),
          detail: newsDateLabel(item, lang),
          to: "/nouvelles/$slug",
          slug: item.slug,
        });
      }
    });

    FAQ.filter((item) => !publicLaunch || item.validated).forEach((item) => {
      if (normalize(`${l(item.question)} ${l(item.answer)} faq question aide help`).includes(needle)) {
        out.push({
          key: `faq-${item.id}`,
          label: l(item.question),
          kind: t("nav.faq"),
          detail: l(item.answer),
          href: `/faq?item=${encodeURIComponent(item.id)}#${encodeURIComponent(item.id)}`,
        });
      }
    });

    ALBUMS.forEach((item) => {
      if (normalize(`${l(item.title)} ${l(item.description)} ${l(item.eventType)} album photo video`).includes(needle)) {
        out.push({
          key: `album-${item.slug}`,
          label: l(item.title),
          kind: t("nav.gallery"),
          detail: `${item.season} · ${l(item.eventType)}`,
          to: "/galerie/$slug",
          slug: item.slug,
        });
      }
    });

    RESOURCES.forEach((item) => {
      if (normalize(`${item.name} ${l(item.description)} ${item.note ? l(item.note) : ""}`).includes(needle)) {
        out.push({
          key: `resource-${item.id}`,
          label: item.name,
          kind: t("nav.resources"),
          detail: l(item.description),
          ...(item.urlVerified
            ? { href: item.url, external: true }
            : { to: "/ressources" }),
        });
      }
    });

    COACH_RESOURCES.forEach((item) => {
      if (normalize(`${l(item.title)} ${l(item.description)} entraineur coach formation soigneur`).includes(needle)) {
        out.push({
          key: `coach-${item.id}`,
          label: l(item.title),
          kind: t("nav.coaches"),
          detail: l(item.description),
          href: item.url,
          external: true,
        });
      }
    });

    SPONSORS.forEach((item) => {
      if (normalize(`${item.name} commanditaire sponsor partenaire partner`).includes(needle)) {
        out.push({
          key: `sponsor-${item.name}`,
          label: item.name,
          kind: t("nav.partners"),
          ...(item.website && item.websiteVerified
            ? { href: item.website, external: true }
            : { to: "/partenaires" }),
        });
      }
    });

    STATIC_PAGES.forEach((page) => {
      const label = lang === "fr" ? page.fr : page.en;
      if (normalize(`${page.fr} ${page.en} ${page.keywords}`).includes(needle)) {
        out.push({
          key: `page-${page.key}`,
          label,
          kind: lang === "fr" ? "Page" : "Page",
          to: page.to,
        });
      }
    });

    const seen = new Set<string>();
    return out.filter((item) => {
      const key = normalize(`${item.kind}|${item.label}|${item.href ?? item.to ?? ""}`);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 24);
  }, [q, l, t, lang, officialWeekActive, publicLaunch]);

  return (
    <>
      <PageHeader
        eyebrow={lang === "fr" ? "Trouver en quelques secondes" : "Find it in seconds"}
        title={t("search.title")}
        description={
          lang === "fr"
            ? "Une seule recherche pour les équipes, horaires, arénas, nouvelles, ressources, albums, partenaires et questions fréquentes."
            : "One search across teams, schedules, arenas, news, resources, albums, partners and frequently asked questions."
        }
      />

      <div className="container-site py-8 md:py-12">
        <section className="mb-7 grid overflow-hidden border border-navy/12 bg-competition text-white lg:grid-cols-[0.86fr_1.14fr]">
          <div className="relative min-h-[220px] overflow-hidden sm:min-h-[280px]">
            <img
              src={OFFICIAL_MEDIA.practicePlayers.url}
              alt={lang === "fr" ? OFFICIAL_MEDIA.practicePlayers.alt.fr : OFFICIAL_MEDIA.practicePlayers.alt.en}
              loading="eager"
              decoding="async"
              className="absolute inset-0 size-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,16,43,0.08),rgba(7,16,43,0.9))]" />
            <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
              <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Trouver rapidement" : "Find it fast"}</p>
              <p className="mt-2 font-display text-3xl font-extrabold uppercase leading-[0.88] sm:text-4xl">
                {lang === "fr" ? "Une question. Un raccourci." : "One question. One shortcut."}
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center p-5 md:p-7">
            {primaryTeam ? (
              <>
                <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-sport-foreground">
                  {lang === "fr" ? "Mon équipe en premier" : "My team first"}
                </p>
                <p className="mt-2 font-display text-3xl font-extrabold uppercase leading-[0.9]">{primaryTeam.name}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/42">{primaryTeam.level}</p>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <a href={publicTeamHubUrl(primaryTeam)} className="premium-control flex min-h-11 items-center justify-center gap-2 bg-sport px-3 text-[9px] font-bold uppercase tracking-[0.1em] text-sport-foreground">
                    <Users className="size-3.5" /> {lang === "fr" ? "Équipe" : "Team"}
                  </a>
                  <a href={officialTeamResultsUrl(primaryTeam)} target="_blank" rel="noopener noreferrer" className="premium-control flex min-h-11 items-center justify-center gap-2 border border-white/14 px-3 text-[9px] font-bold uppercase tracking-[0.1em] text-white">
                    <Trophy className="size-3.5 text-sport-foreground" /> {lang === "fr" ? "Résultats" : "Results"}
                  </a>
                </div>
              </>
            ) : (
              <>
                <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-sport-foreground">
                  {lang === "fr" ? "Personnalisez la recherche" : "Personalize search"}
                </p>
                <p className="mt-2 font-display text-3xl font-extrabold uppercase leading-[0.9]">
                  {lang === "fr" ? "Enregistrez une équipe." : "Save a team."}
                </p>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/58">
                  {lang === "fr"
                    ? "Vos équipes enregistrées passent ensuite en priorité dans le menu et la recherche."
                    : "Your saved teams are then prioritized in the menu and search."}
                </p>
                <Link to="/equipes" className="premium-control mt-5 inline-flex min-h-11 w-fit items-center gap-2 bg-sport px-4 text-[9px] font-bold uppercase tracking-[0.1em] text-sport-foreground">
                  <Users className="size-4" /> {lang === "fr" ? "Choisir mon équipe" : "Choose my team"}
                </Link>
              </>
            )}
          </div>
        </section>

        <div className="mb-5 grid grid-cols-3 gap-2">
          <Link to="/horaires" className="premium-control flex min-h-16 flex-col justify-between border border-white/12 bg-competition p-3 text-white hover:bg-white/[0.04]">
            <CalendarDays className="size-4 text-sport-foreground" />
            <span className="font-display text-base font-extrabold uppercase leading-none">{lang === "fr" ? "Horaires" : "Schedules"}</span>
          </Link>
          <Link to="/arenas" className="premium-control flex min-h-16 flex-col justify-between border border-white/12 bg-competition p-3 text-white hover:bg-white/[0.04]">
            <MapPin className="size-4 text-sport-foreground" />
            <span className="font-display text-base font-extrabold uppercase leading-none">{lang === "fr" ? "Arénas" : "Arenas"}</span>
          </Link>
          <Link to="/inscriptions" className="premium-control flex min-h-16 flex-col justify-between border border-white/12 bg-competition p-3 text-white hover:bg-white/[0.04]">
            <ArrowRight className="size-4 text-sport-foreground" />
            <span className="font-display text-base font-extrabold uppercase leading-none">{lang === "fr" ? "Inscription" : "Register"}</span>
          </Link>
        </div>

        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-white/38"
            aria-hidden
          />
          <input
            data-site-search
            type="search"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder={
              lang === "fr"
                ? "Ex. Leafs, Louves, M11, Denis Savard, Spordle…"
                : "Ex. Leafs, Louves, U11, Denis Savard, Spordle…"
            }
            aria-label={t("common.search")}
            className="h-14 w-full border border-white/14 bg-navy-deep pl-12 pr-4 text-base text-white placeholder:text-white/34 outline-none transition-colors focus:border-sport"
          />
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <div className="border border-white/12 bg-competition px-4 py-3 text-white">
            <p className="text-sm text-white/52">
              {q.trim().length >= 2
                ? lang === "fr"
                  ? `${hits.length} résultat${hits.length > 1 ? "s" : ""} trouvé${hits.length > 1 ? "s" : ""}`
                  : `${hits.length} result${hits.length === 1 ? "" : "s"} found`
                : lang === "fr"
                  ? "Tapez au moins deux caractères. La recherche reste locale au site."
                  : "Type at least two characters. Search stays local to the site."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <VoiceSearchButton onTranscript={setQ} />
            {showPhone && (
              <Button asChild variant="outline">
                <a href={`tel:${phoneE164}`}>
                  <PhoneCall className="size-4" />
                  {phoneDisplay}
                </a>
              </Button>
            )}
          </div>
        </div>

        {!q.trim() && (
          <div className="mt-8">
            <p className="eyebrow text-sport">
              {lang === "fr" ? "Accès populaires" : "Popular shortcuts"}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {STATIC_PAGES.slice(0, 7).map((page) => (
                <Link
                  key={page.key}
                  to={page.to}
                  className="premium-control border border-white/12 bg-navy-deep px-4 py-2 text-sm font-semibold text-white/72 hover:border-sport/50 hover:text-white"
                >
                  {lang === "fr" ? page.fr : page.en}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 grid gap-3" aria-live="polite">
          {q.trim().length >= 2 && hits.length === 0 && (
            <div className="border border-white/12 bg-navy-deep p-6 text-white">
              <p className="heading-card text-white">
                {lang === "fr" ? "Aucun résultat trouvé" : "No results found"}
              </p>
              <p className="mt-2 text-sm text-white/52">
                {lang === "fr"
                  ? "Essayez une catégorie comme M11, un aréna, Spordle, entraîneur ou aide financière."
                  : "Try a category such as U11, an arena, Spordle, coach or financial assistance."}
              </p>
            </div>
          )}

          {hits.map((hit) => {
            const card = (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="eyebrow text-sport-foreground">{hit.kind}</p>
                    <p className="heading-card mt-1.5 text-white">{hit.label}</p>
                    {hit.detail && (
                      <p className="mt-2 line-clamp-2 text-sm text-white/52">{hit.detail}</p>
                    )}
                  </div>
                  {hit.kind === (lang === "fr" ? "Horaire officiel" : "Official schedule") ? (
                    <CalendarDays className="mt-1 size-5 shrink-0 text-sport-foreground" aria-hidden />
                  ) : (
                    <ArrowRight className="mt-1 size-5 shrink-0 text-sport-foreground" aria-hidden />
                  )}
                </div>
              </>
            );

            if (hit.href) {
              return (
                <a
                  key={hit.key}
                  href={hit.href}
                  target={hit.external ? "_blank" : undefined}
                  rel={hit.external ? "noopener noreferrer" : undefined}
                  className="interactive-surface block border border-white/12 bg-competition p-5 text-white transition-transform hover:-translate-y-0.5 hover:border-sport/50"
                >
                  {card}
                </a>
              );
            }

            if (hit.slug && hit.to) {
              return (
                <Link
                  key={hit.key}
                  to={hit.to}
                  params={{ slug: hit.slug }}
                  className="interactive-surface block border border-white/12 bg-competition p-5 text-white transition-transform hover:-translate-y-0.5 hover:border-sport/50"
                >
                  {card}
                </Link>
              );
            }

            return (
              <Link
                key={hit.key}
                to={hit.to ?? "/"}
                className="interactive-surface block border border-white/12 bg-competition p-5 text-white transition-transform hover:-translate-y-0.5 hover:border-sport/50"
              >
                {card}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
