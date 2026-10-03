import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, PhoneCall, Search } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { VoiceSearchButton } from "@/components/voice-search-button";
import { TEAMS } from "@/data/teams";
import { PUBLIC_TEAM_DIRECTORY, publicTeamHubUrl } from "@/data/team-directory";
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
    fr: "Inscriptions 2026–2027 Spordle",
    en: "2026–2027 registration Spordle",
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
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
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
            className="h-14 w-full border border-navy/15 bg-background pl-12 pr-4 text-base outline-none transition-colors focus:border-sport"
          />
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <div className="border border-navy/12 bg-ice px-4 py-3">
            <p className="text-sm text-muted-foreground">
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
                  className="premium-control border border-navy/12 bg-background px-4 py-2 text-sm font-semibold hover:border-sport/40 hover:bg-ice"
                >
                  {lang === "fr" ? page.fr : page.en}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 grid gap-3" aria-live="polite">
          {q.trim().length >= 2 && hits.length === 0 && (
            <div className="border border-navy/12 bg-ice p-6">
              <p className="heading-card">
                {lang === "fr" ? "Aucun résultat trouvé" : "No results found"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
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
                    <p className="eyebrow text-sport">{hit.kind}</p>
                    <p className="heading-card mt-1.5">{hit.label}</p>
                    {hit.detail && (
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{hit.detail}</p>
                    )}
                  </div>
                  {hit.kind === (lang === "fr" ? "Horaire officiel" : "Official schedule") ? (
                    <CalendarDays className="mt-1 size-5 shrink-0 text-sport" aria-hidden />
                  ) : (
                    <ArrowRight className="mt-1 size-5 shrink-0 text-sport" aria-hidden />
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
                  className="card-elevated block p-5 transition-transform hover:-translate-y-0.5"
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
                  className="card-elevated block p-5 transition-transform hover:-translate-y-0.5"
                >
                  {card}
                </Link>
              );
            }

            return (
              <Link
                key={hit.key}
                to={hit.to ?? "/"}
                className="card-elevated block p-5 transition-transform hover:-translate-y-0.5"
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
