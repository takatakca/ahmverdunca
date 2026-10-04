import { Link } from "@tanstack/react-router";
import {
  ChevronDown,
  ExternalLink,
  Facebook,
  Instagram,
  ListFilter,
  Music2,
  RotateCcw,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { NEWS, NEWS_CATEGORIES, newsDateLabel } from "@/data/news";
import { CURRENT_TEAMS } from "@/data/teams";
import { newsVisualForCategory } from "@/data/news-visuals";
import { useI18n } from "@/lib/i18n";
import { usePreferredTeam } from "@/lib/team-preference";
import { cn } from "@/lib/utils";

const FEED_URL =
  import.meta.env["VITE_TAKATAK_PUBLIC_API_ORIGIN"]?.trim()
    ? `${import.meta.env["VITE_TAKATAK_PUBLIC_API_ORIGIN"].replace(/\/$/, "")}/api/public/ahmv/community-feed`
    : "https://takatak.ca/api/public/ahmv/community-feed";

const FILTER_KEY = "ahmv-news-filter-v1";

type Network = "website" | "facebook" | "instagram" | "tiktok" | "youtube";
type FeedKind = "official" | "community";
type TimeRange = "hour" | "day" | "week" | "month" | "all";
type SortMode = "newest" | "oldest";

type LiveFeedItem = {
  id: string;
  source: FeedKind;
  network?: Network;
  association?: string;
  contentType: string;
  publishedAt: string;
  text: string | null;
  url: string | null;
  imageUrl: string | null;
  teamSlugs?: string[];
};

type LiveFeedResponse = {
  ok?: boolean;
  connected?: boolean;
  items?: LiveFeedItem[];
};

type NewsFeedItem = {
  id: string;
  kind: FeedKind;
  network: Network;
  association: string;
  publishedAt: string | null;
  dateLabel: string;
  title: string;
  text: string;
  url: string | null;
  imageUrl: string | null;
  internalSlug: string | null;
  teamSlugs: string[];
  searchable: string;
};

type SavedFilters = {
  team: string;
  association: string;
  network: "all" | Network;
  kind: "all" | FeedKind;
  timeRange: TimeRange;
  sort: SortMode;
  query: string;
};

const DEFAULT_FILTERS: SavedFilters = {
  team: "all",
  association: "all",
  network: "all",
  kind: "all",
  timeRange: "all",
  sort: "newest",
  query: "",
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function inferTeamSlugs(text: string): string[] {
  const haystack = ` ${normalize(text)} `;
  return CURRENT_TEAMS.filter((team) => {
    const code = normalize(team.code);
    const slug = normalize(team.slug);
    const fr = normalize(team.name.fr);
    const en = normalize(team.name.en);
    return [code, slug, fr, en]
      .filter(Boolean)
      .some((term) => haystack.includes(` ${term} `));
  }).map((team) => team.slug);
}

function classifyNetwork(url: string | null | undefined): Network {
  const value = (url ?? "").toLowerCase();
  if (value.includes("facebook.com")) return "facebook";
  if (value.includes("instagram.com")) return "instagram";
  if (value.includes("tiktok.com")) return "tiktok";
  if (value.includes("youtube.com") || value.includes("youtu.be")) return "youtube";
  return "website";
}

function sourceLabel(network: Network, lang: "fr" | "en") {
  if (network === "facebook") return "Facebook";
  if (network === "instagram") return "Instagram";
  if (network === "tiktok") return "TikTok";
  if (network === "youtube") return "YouTube";
  return lang === "fr" ? "Site AHMV" : "AHMV website";
}

function sourceIcon(network: Network) {
  if (network === "facebook") return Facebook;
  if (network === "instagram") return Instagram;
  if (network === "tiktok") return Music2;
  return ShieldCheck;
}

function readSavedFilters(): SavedFilters {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(FILTER_KEY) ?? "{}") as Partial<SavedFilters>;
    return {
      team: typeof parsed.team === "string" ? parsed.team : DEFAULT_FILTERS.team,
      association:
        typeof parsed.association === "string"
          ? parsed.association
          : DEFAULT_FILTERS.association,
      network:
        parsed.network === "website" ||
        parsed.network === "facebook" ||
        parsed.network === "instagram" ||
        parsed.network === "tiktok" ||
        parsed.network === "youtube" ||
        parsed.network === "all"
          ? parsed.network
          : DEFAULT_FILTERS.network,
      kind:
        parsed.kind === "official" || parsed.kind === "community" || parsed.kind === "all"
          ? parsed.kind
          : DEFAULT_FILTERS.kind,
      timeRange:
        parsed.timeRange === "hour" ||
        parsed.timeRange === "day" ||
        parsed.timeRange === "week" ||
        parsed.timeRange === "month" ||
        parsed.timeRange === "all"
          ? parsed.timeRange
          : DEFAULT_FILTERS.timeRange,
      sort: parsed.sort === "oldest" ? "oldest" : "newest",
      query: typeof parsed.query === "string" ? parsed.query.slice(0, 100) : "",
    };
  } catch {
    return DEFAULT_FILTERS;
  }
}

function timeRangeMs(range: TimeRange): number | null {
  if (range === "hour") return 60 * 60 * 1000;
  if (range === "day") return 24 * 60 * 60 * 1000;
  if (range === "week") return 7 * 24 * 60 * 60 * 1000;
  if (range === "month") return 30 * 24 * 60 * 60 * 1000;
  return null;
}

export function NewsCentre() {
  const { lang, l } = useI18n();
  const { selectedTeams } = usePreferredTeam();
  const [liveItems, setLiveItems] = useState<LiveFeedItem[]>([]);
  const [filters, setFilters] = useState<SavedFilters>(DEFAULT_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setFilters(readSavedFilters());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(FILTER_KEY, JSON.stringify(filters));
  }, [filters, hydrated]);

  useEffect(() => {
    const controller = new AbortController();
    void fetch(FEED_URL, {
      headers: { Accept: "application/json" },
      credentials: "omit",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) return null;
        return (await response.json()) as LiveFeedResponse;
      })
      .then((payload) => {
        setLiveItems(Array.isArray(payload?.items) ? payload.items : []);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setLiveItems([]);
      });

    return () => controller.abort();
  }, []);

  const items = useMemo<NewsFeedItem[]>(() => {
    const archiveItems: NewsFeedItem[] = NEWS.map((article) => {
      const title = l(article.title);
      const text = l(article.excerpt);
      const url = article.sourceUrl ?? null;
      return {
        id: `archive:${article.slug}`,
        kind: "official",
        network: classifyNetwork(url),
        association: "AHM Verdun",
        publishedAt: article.date ? `${article.date}T12:00:00-04:00` : null,
        dateLabel: newsDateLabel(article, lang),
        title,
        text,
        url,
        imageUrl: article.image ?? newsVisualForCategory(article.category)?.url ?? null,
        internalSlug: article.slug,
        teamSlugs: article.teamSlugs,
        searchable: normalize(
          ["AHM Verdun", title, text, article.author, article.category, ...article.teamSlugs].join(" "),
        ),
      };
    });

    const socialItems: NewsFeedItem[] = liveItems.map((item) => {
      const text = item.text?.trim() || (lang === "fr" ? "Publication AHMV" : "AHMV post");
      const inferred = inferTeamSlugs(text);
      const teamSlugs = Array.from(new Set([...(item.teamSlugs ?? []), ...inferred]));
      const network = item.network ?? "facebook";
      return {
        id: `live:${item.id}`,
        kind: item.source,
        network,
        association: item.association?.trim() || "AHM Verdun",
        publishedAt: item.publishedAt,
        dateLabel: new Intl.DateTimeFormat(lang === "fr" ? "fr-CA" : "en-CA", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          timeZone: "America/Toronto",
        }).format(new Date(item.publishedAt)),
        title:
          item.source === "community"
            ? lang === "fr"
              ? "Publication de la communauté"
              : "Community post"
            : lang === "fr"
              ? "Publication officielle AHMV"
              : "Official AHMV post",
        text,
        url: item.url,
        imageUrl: item.imageUrl,
        internalSlug: null,
        teamSlugs,
        searchable: normalize([item.association?.trim() || "AHM Verdun", text, network, ...teamSlugs].join(" ")),
      };
    });

    return [...socialItems, ...archiveItems];
  }, [lang, l, liveItems]);

  const visibleItems = useMemo(() => {
    const now = Date.now();
    const maxAge = timeRangeMs(filters.timeRange);
    const query = normalize(filters.query);
    const exactTeam =
      filters.team.startsWith("exact:")
        ? selectedTeams.find(
            (entry) => entry.legacyScheduleTeamId === filters.team.slice("exact:".length),
          )
        : null;

    const result = items.filter((item) => {
      if (filters.association !== "all" && item.association !== filters.association) return false;
      if (filters.network !== "all" && item.network !== filters.network) return false;
      if (filters.kind !== "all" && item.kind !== filters.kind) return false;

      if (filters.team !== "all") {
        if (exactTeam) {
          const exactName = normalize(exactTeam.name);
          const exactLevel = normalize(exactTeam.level);
          const matchesExact =
            item.searchable.includes(exactName) ||
            item.searchable.includes(exactLevel) ||
            item.teamSlugs.includes(exactTeam.categorySlug);
          if (!matchesExact) return false;
        } else if (!item.teamSlugs.includes(filters.team)) {
          return false;
        }
      }

      if (maxAge != null) {
        if (!item.publishedAt) return false;
        const stamp = new Date(item.publishedAt).getTime();
        if (!Number.isFinite(stamp) || now - stamp > maxAge || stamp > now + 5 * 60 * 1000) {
          return false;
        }
      }

      if (query && !item.searchable.includes(query)) return false;
      return true;
    });

    return result.sort((a, b) => {
      const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return filters.sort === "oldest" ? aTime - bTime : bTime - aTime;
    });
  }, [filters, items, selectedTeams]);

  const associations = useMemo(
    () => Array.from(new Set(items.map((item) => item.association))).sort(),
    [items],
  );

  const activeCount = [
    filters.team !== "all",
    filters.association !== "all",
    filters.network !== "all",
    filters.kind !== "all",
    filters.timeRange !== "all",
    filters.sort !== "newest",
    Boolean(filters.query.trim()),
  ].filter(Boolean).length;

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  return (
    <section className="relative overflow-hidden bg-navy-deep py-8 text-white md:py-11">
      <div className="technical-grid pointer-events-none absolute inset-0 opacity-15" aria-hidden />
      <div className="container-site relative">
        <div className="overflow-hidden border border-white/12 bg-competition">
        <div className="bg-competition px-5 py-6 text-white md:px-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow text-sport-foreground">
                {lang === "fr" ? "Centre nouvelles AHMV" : "AHMV News Centre"}
              </p>
              <h2 className="mt-2 font-display text-4xl font-extrabold uppercase leading-[0.88] tracking-[-0.03em] md:text-5xl">
                {lang === "fr" ? "Tout le hockey. Un seul fil." : "All hockey. One feed."}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-white/65">
                {lang === "fr"
                  ? "Les nouvelles officielles, publications Facebook et contenus communautaires sont rassemblés ici. Instagram, TikTok et les autres sources peuvent être ajoutés au même fil sans changer l’expérience."
                  : "Official news, Facebook posts and community content are gathered here. Instagram, TikTok and other sources can join the same feed without changing the experience."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setFilterOpen((value) => !value)}
              className={cn(
                "premium-control inline-flex min-h-12 items-center justify-between gap-4 border px-4 text-xs font-extrabold uppercase tracking-[0.12em]",
                filterOpen || activeCount > 0
                  ? "border-sport bg-sport text-sport-foreground"
                  : "border-white/20 bg-white/[0.04] text-white hover:border-sport",
              )}
              aria-expanded={filterOpen}
            >
              <span className="inline-flex items-center gap-2">
                <ListFilter className="size-5" aria-hidden />
                {lang === "fr" ? "Filtres" : "Filters"}
                {activeCount > 0 ? (
                  <span className="inline-flex size-6 items-center justify-center rounded-full bg-navy text-[10px] text-white">
                    {activeCount}
                  </span>
                ) : null}
              </span>
              <ChevronDown className={cn("size-4 transition-transform", filterOpen && "rotate-180")} />
            </button>
          </div>
        </div>

        {filterOpen ? (
          <div className="border-b border-white/10 bg-navy p-5 md:p-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
              <label className="block">
                <span className="eyebrow text-white/60">{lang === "fr" ? "Association" : "Association"}</span>
                <select
                  value={filters.association}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      association: event.target.value,
                    }))
                  }
                  className="mt-2 h-11 w-full border border-navy/15 bg-background px-3 text-sm font-semibold text-navy outline-none focus:border-sport"
                >
                  <option value="all">{lang === "fr" ? "Toutes les associations" : "All associations"}</option>
                  {associations.map((association) => (
                    <option key={association} value={association}>
                      {association}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="eyebrow text-white/60">{lang === "fr" ? "Équipe" : "Team"}</span>
                <select
                  value={filters.team}
                  onChange={(event) => setFilters((current) => ({ ...current, team: event.target.value }))}
                  className="mt-2 h-11 w-full border border-navy/15 bg-background px-3 text-sm font-semibold text-navy outline-none focus:border-sport"
                >
                  <option value="all">{lang === "fr" ? "Toutes les équipes" : "All teams"}</option>
                  {selectedTeams.length > 0 ? (
                    <optgroup label={lang === "fr" ? "Mes équipes" : "My teams"}>
                      {selectedTeams.map((entry) => (
                        <option key={entry.legacyScheduleTeamId} value={`exact:${entry.legacyScheduleTeamId}`}>
                          {entry.name} · {entry.level}
                        </option>
                      ))}
                    </optgroup>
                  ) : null}
                  <optgroup label={lang === "fr" ? "Catégories" : "Categories"}>
                    {CURRENT_TEAMS.map((team) => (
                      <option key={team.slug} value={team.slug}>
                        {l(team.name)}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </label>

              <label className="block">
                <span className="eyebrow text-white/60">{lang === "fr" ? "Source" : "Source"}</span>
                <select
                  value={filters.network}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      network: event.target.value as SavedFilters["network"],
                    }))
                  }
                  className="mt-2 h-11 w-full border border-navy/15 bg-background px-3 text-sm font-semibold text-navy outline-none focus:border-sport"
                >
                  <option value="all">{lang === "fr" ? "Toutes les sources" : "All sources"}</option>
                  <option value="website">{lang === "fr" ? "Site AHMV" : "AHMV website"}</option>
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="youtube">YouTube</option>
                </select>
              </label>

              <label className="block">
                <span className="eyebrow text-white/60">{lang === "fr" ? "Statut" : "Status"}</span>
                <select
                  value={filters.kind}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      kind: event.target.value as SavedFilters["kind"],
                    }))
                  }
                  className="mt-2 h-11 w-full border border-navy/15 bg-background px-3 text-sm font-semibold text-navy outline-none focus:border-sport"
                >
                  <option value="all">{lang === "fr" ? "Tout" : "All"}</option>
                  <option value="official">{lang === "fr" ? "Officiel" : "Official"}</option>
                  <option value="community">{lang === "fr" ? "Communauté" : "Community"}</option>
                </select>
              </label>

              <label className="block">
                <span className="eyebrow text-white/60">{lang === "fr" ? "Période" : "Period"}</span>
                <select
                  value={filters.timeRange}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      timeRange: event.target.value as TimeRange,
                    }))
                  }
                  className="mt-2 h-11 w-full border border-navy/15 bg-background px-3 text-sm font-semibold text-navy outline-none focus:border-sport"
                >
                  <option value="all">{lang === "fr" ? "Tout le temps" : "All time"}</option>
                  <option value="hour">{lang === "fr" ? "Dernière heure" : "Last hour"}</option>
                  <option value="day">{lang === "fr" ? "Dernières 24 h" : "Last 24 hours"}</option>
                  <option value="week">{lang === "fr" ? "7 derniers jours" : "Last 7 days"}</option>
                  <option value="month">{lang === "fr" ? "30 derniers jours" : "Last 30 days"}</option>
                </select>
              </label>

              <label className="block">
                <span className="eyebrow text-white/60">{lang === "fr" ? "Ordre" : "Order"}</span>
                <select
                  value={filters.sort}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      sort: event.target.value as SortMode,
                    }))
                  }
                  className="mt-2 h-11 w-full border border-navy/15 bg-background px-3 text-sm font-semibold text-navy outline-none focus:border-sport"
                >
                  <option value="newest">{lang === "fr" ? "Plus récent" : "Newest"}</option>
                  <option value="oldest">{lang === "fr" ? "Plus ancien" : "Oldest"}</option>
                </select>
              </label>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={filters.query}
                  onChange={(event) =>
                    setFilters((current) => ({ ...current, query: event.target.value.slice(0, 100) }))
                  }
                  placeholder={lang === "fr" ? "Chercher une équipe, un tournoi, un mot..." : "Search a team, tournament, keyword..."}
                  className="h-11 w-full border border-navy/15 bg-background pl-10 pr-3 text-sm outline-none focus:border-sport"
                />
              </label>
              <button
                type="button"
                onClick={resetFilters}
                className="premium-control inline-flex min-h-11 items-center justify-center gap-2 border border-navy/12 bg-background px-4 text-[10px] font-bold uppercase tracking-[0.12em] text-navy hover:border-sport hover:text-sport"
              >
                <RotateCcw className="size-4" aria-hidden />
                {lang === "fr" ? "Réinitialiser" : "Reset"}
              </button>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 border-b border-white/10 bg-navy-deep px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
          <p className="text-sm font-semibold text-white">
            {visibleItems.length} {lang === "fr" ? "nouvelle(s) affichée(s)" : "news item(s) shown"}
          </p>
          <div className="flex flex-wrap gap-2 text-[9px] font-bold uppercase tracking-[0.12em] text-white/48">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-sport" /> {lang === "fr" ? "Officiel vérifié" : "Verified official"}</span>
            <span className="inline-flex items-center gap-1.5"><Users className="size-3.5 text-sport" /> {lang === "fr" ? "Communauté identifiée" : "Tagged community"}</span>
          </div>
        </div>

        {visibleItems.length > 0 ? (
          <div className="divide-y divide-white/10">
            {visibleItems.map((item) => {
              const Icon = sourceIcon(item.network);
              const inner = (
                <>
                  <div className="relative h-48 overflow-hidden bg-navy-deep sm:h-auto sm:min-h-48">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center">
                        <Icon className="size-10 text-white/30" aria-hidden />
                      </div>
                    )}
                    <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 bg-white px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.12em] text-navy">
                        <Icon className="size-3" aria-hidden />
                        {sourceLabel(item.network, lang)}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.12em]",
                          item.kind === "official"
                            ? "bg-sport text-sport-foreground"
                            : "bg-navy text-white",
                        )}
                      >
                        {item.kind === "official" ? <ShieldCheck className="size-3" /> : <Users className="size-3" />}
                        {item.kind === "official"
                          ? lang === "fr"
                            ? "Officiel"
                            : "Official"
                          : lang === "fr"
                            ? "Communauté"
                            : "Community"}
                      </span>
                    </div>
                  </div>

                  <div className="flex min-w-0 flex-col bg-competition p-5 md:p-6">
                    <p className="eyebrow text-sport">{item.dateLabel}</p>
                    <h3 className="mt-2 font-display text-2xl font-extrabold uppercase leading-[0.92] text-white transition-colors group-hover:text-sport-foreground md:text-3xl">
                      {item.title}
                    </h3>
                    <p className="mt-3 line-clamp-4 max-w-3xl text-sm leading-6 text-white/58">
                      {item.text}
                    </p>
                    {item.teamSlugs.length > 0 ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {item.teamSlugs.map((slug) => {
                          const team = CURRENT_TEAMS.find((candidate) => candidate.slug === slug);
                          return team ? (
                            <span key={slug} className="border border-white/12 bg-white/[0.04] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white/72">
                              {l(team.name)}
                            </span>
                          ) : null;
                        })}
                      </div>
                    ) : null}
                    <span className="mt-auto inline-flex items-center gap-2 pt-5 text-xs font-bold uppercase tracking-[0.12em] text-sport">
                      {item.internalSlug
                        ? lang === "fr"
                          ? "Lire la nouvelle"
                          : "Read news"
                        : lang === "fr"
                          ? "Voir la publication"
                          : "View post"}
                      {item.internalSlug ? null : <ExternalLink className="size-3.5" aria-hidden />}
                    </span>
                  </div>
                </>
              );

              return item.internalSlug ? (
                <Link
                  key={item.id}
                  to="/nouvelles/$slug"
                  params={{ slug: item.internalSlug }}
                  className="group grid bg-competition transition-colors hover:bg-white/[0.03] sm:grid-cols-[16rem_minmax(0,1fr)]"
                >
                  {inner}
                </Link>
              ) : item.url ? (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group grid bg-competition transition-colors hover:bg-white/[0.03] sm:grid-cols-[16rem_minmax(0,1fr)]"
                >
                  {inner}
                </a>
              ) : (
                <article
                  key={item.id}
                  className="group grid bg-competition sm:grid-cols-[16rem_minmax(0,1fr)]"
                >
                  {inner}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="px-5 py-14 text-center md:px-6">
            <p className="font-display text-3xl font-extrabold uppercase text-white">
              {lang === "fr" ? "Aucun résultat avec ces filtres." : "No results for these filters."}
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 inline-flex min-h-11 items-center gap-2 border border-white/18 px-4 text-xs font-bold uppercase tracking-[0.12em] text-white hover:border-sport hover:text-sport-foreground"
            >
              <RotateCcw className="size-4" />
              {lang === "fr" ? "Voir toutes les nouvelles" : "Show all news"}
            </button>
          </div>
        )}
        </div>
      </div>
    </section>
  );
}
