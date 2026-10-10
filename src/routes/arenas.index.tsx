import { canonicalLink } from "@/lib/seo";
import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, ExternalLink, MapPin, Search } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ARENAS, ARENA_ZONES } from "@/data/arenas";
import { OFFICIAL_MEDIA } from "@/data/official-media";
import { mapsDirectionsUrl } from "@/lib/site";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/arenas/")({
  head: () => ({
    links: canonicalLink("/arenas"),
    meta: [
      { title: "Arénas et itinéraires — AHM Verdun" },
      {
        name: "description",
        content:
          "Arénas utilisés par les familles de l'AHM Verdun, avec adresses vérifiées, itinéraires et liens officiels.",
      },
      { property: "og:title", content: "Arénas et itinéraires — AHM Verdun" },
      {
        property: "og:description",
        content: "Trouvez rapidement l'aréna, son adresse et l'itinéraire.",
      },
    ],
  }),
  component: ArenasPage,
});

function providerDirections(address: string) {
  const target = encodeURIComponent(address);
  return {
    google: mapsDirectionsUrl(address),
    waze: `https://www.waze.com/ul?q=${target}&navigate=yes`,
    apple: `https://maps.apple.com/?daddr=${target}`,
  };
}

function ArenasPage() {
  const { t, l, lang } = useI18n();
  const [zone, setZone] = useState("all");
  const [query, setQuery] = useState("");
  const featuredArena = ARENAS.find((arena) => arena.slug === "auditorium-de-verdun") ?? ARENAS[0];
  const normalizedQuery = query.trim().toLocaleLowerCase(lang === "fr" ? "fr-CA" : "en-CA");
  const list = ARENAS.filter((arena) => {
    const zoneMatches = zone === "all" || arena.zone === zone;
    const searchMatches = !normalizedQuery || `${arena.name} ${arena.address} ${l(arena.borough)}`
      .toLocaleLowerCase(lang === "fr" ? "fr-CA" : "en-CA")
      .includes(normalizedQuery);
    return zoneMatches && searchMatches;
  });

  return (
    <div className="bg-navy-deep text-white">
      <PageHeader
        eyebrow={lang === "fr" ? "Adresses vérifiées" : "Verified addresses"}
        title={t("nav.arenas")}
        description={
          lang === "fr"
            ? "Adresses, itinéraires et informations pratiques pour les arénas utilisés par les familles AHMV."
            : "Addresses, directions and practical information for arenas used by AHMV families."
        }
      />

      <div className="container-site py-8 md:py-12">
        <section className="mb-8 grid overflow-hidden border border-navy/12 bg-navy text-white lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative min-h-[300px] overflow-hidden sm:min-h-[360px]">
            <img
              src={OFFICIAL_MEDIA.tournamentM11Tertiary.url}
              alt={lang === "fr" ? OFFICIAL_MEDIA.tournamentM11Tertiary.alt.fr : OFFICIAL_MEDIA.tournamentM11Tertiary.alt.en}
              loading="eager"
              decoding="async"
              className="absolute inset-0 size-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,16,43,0.08),rgba(7,16,43,0.82))]" />
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
              <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Avant de partir pour la glace" : "Before heading to the rink"}</p>
              <h2 className="mt-2 max-w-2xl font-display text-4xl font-extrabold uppercase leading-[0.88] tracking-[-0.03em] sm:text-5xl">
                {lang === "fr" ? "Adresse. Itinéraire. Horaire." : "Address. Directions. Schedule."}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/72">
                {lang === "fr"
                  ? "Retrouvez rapidement l’adresse et le trajet avant de partir pour la glace."
                  : "Quickly find the address and route before heading to the rink."}
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-between border-t border-white/12 p-6 lg:border-l lg:border-t-0 md:p-8">
            <div>
              <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Répertoire glace" : "Rink directory"}</p>
              <p className="mt-4 font-display text-6xl font-extrabold tracking-[-0.05em]">{String(ARENAS.length).padStart(2, "0")}</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.17em] text-white/48">
                {lang === "fr" ? "installations répertoriées" : "listed facilities"}
              </p>
            </div>
            {featuredArena && (
              <div className="mt-7 border border-white/12 bg-white/[0.035] p-4">
                <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-sport-foreground">
                  {lang === "fr" ? "Départ rapide · Verdun" : "Quick start · Verdun"}
                </p>
                <p className="mt-2 font-display text-2xl font-extrabold uppercase leading-[0.9]">{featuredArena.name}</p>
                <p className="mt-2 text-xs leading-relaxed text-white/52">{featuredArena.address}</p>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <a href={providerDirections(featuredArena.address).google} target="_blank" rel="noopener noreferrer" className="premium-control flex min-h-10 items-center justify-center border border-white/14 px-2 text-[8px] font-bold uppercase tracking-[0.08em] text-white">Google</a>
                  <a href={providerDirections(featuredArena.address).waze} target="_blank" rel="noopener noreferrer" className="premium-control flex min-h-10 items-center justify-center border border-white/14 px-2 text-[8px] font-bold uppercase tracking-[0.08em] text-white">Waze</a>
                  <a href={providerDirections(featuredArena.address).apple} target="_blank" rel="noopener noreferrer" className="premium-control flex min-h-10 items-center justify-center border border-white/14 px-2 text-[8px] font-bold uppercase tracking-[0.08em] text-white">Apple</a>
                </div>
              </div>
            )}
          </div>
        </section>
        <label className="mb-4 flex min-h-12 items-center gap-3 border border-white/12 bg-navy-deep px-4 text-white focus-within:border-sport">
          <Search className="size-4 shrink-0 text-sport-foreground" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={lang === "fr" ? "Rechercher un aréna, une ville ou une adresse…" : "Search arena, city or address…"}
            aria-label={lang === "fr" ? "Rechercher un aréna" : "Search arenas"}
            className="min-w-0 flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-white/34"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} className="text-[8px] font-bold uppercase tracking-[0.12em] text-sport-foreground">
              {lang === "fr" ? "Effacer" : "Clear"}
            </button>
          )}
        </label>

        <div className="scrollbar-none -mx-1 mb-6 flex gap-2 overflow-x-auto px-1 pb-1">
          {[{ id: "all", label: { fr: "Tous", en: "All" } }, ...ARENA_ZONES].map((zoneItem) => (
            <button
              key={zoneItem.id}
              type="button"
              aria-pressed={zone === zoneItem.id}
              onClick={() => setZone(zoneItem.id)}
              className={cn(
                "premium-control shrink-0 border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em]",
                zone === zoneItem.id
                  ? "border-sport bg-sport text-sport-foreground"
                  : "border-white/12 bg-navy-deep text-white/62 hover:border-sport hover:text-white",
              )}
            >
              {l(zoneItem.label)}
            </button>
          ))}
        </div>

        {list.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {list.map((arena) => (
              <article
                key={arena.slug}
                className="interactive-surface group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white/14 bg-competition text-white shadow-[0_18px_45px_-36px_rgba(0,0,0,0.7)] transition-[border-color,transform] hover:-translate-y-0.5 hover:border-sport/45"
              >
                <Link
                  to="/arenas/$slug"
                  params={{ slug: arena.slug }}
                  className="relative block aspect-[16/9] overflow-hidden bg-navy"
                  aria-label={lang === "fr" ? `Fiche de l’aréna ${arena.name}` : `Details for ${arena.name}`}
                >
                  {arena.photoUrl ? (
                    <img
                      src={arena.photoUrl}
                      alt={arena.photoAlt?.[lang] ?? arena.name}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.035]"
                    />
                  ) : (
                    <div className="technical-grid absolute inset-0 flex items-center justify-center bg-[linear-gradient(125deg,var(--color-navy),var(--color-competition))]">
                      <span className="flex size-20 items-center justify-center rounded-full border border-sport/35 bg-white/[0.035]">
                        <MapPin className="size-8 text-sport-foreground" />
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/80 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 rounded-full border border-white/20 bg-navy-deep/85 px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur">
                    {l(arena.borough)}
                  </span>
                  {arena.publicStatus?.code === "temporarily_closed" && (
                    <span className="absolute right-3 top-3 rounded-lg bg-status-cancelled-soft px-2 py-1 text-[10px] font-bold text-status-cancelled">
                      {l(arena.publicStatus.label)}
                    </span>
                  )}
                </Link>
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="font-display text-2xl font-extrabold uppercase leading-[0.95] text-white">
                    <Link to="/arenas/$slug" params={{ slug: arena.slug }} className="hover:text-sport-foreground">
                      {arena.name}
                    </Link>
                  </h2>
                  <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-white/70">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-sport-foreground" aria-hidden />
                    {arena.address}
                  </p>
                  {arena.facilities && (
                    <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-white/55">
                      {l(arena.facilities)}
                    </p>
                  )}
                  <div className="mt-auto pt-5">
                    <Link
                      to="/arenas/$slug"
                      params={{ slug: arena.slug }}
                      className="premium-control mb-3 flex min-h-12 items-center justify-between rounded-xl border border-sport/40 bg-sport/10 px-4 text-xs font-bold text-white transition-colors hover:bg-sport/20"
                    >
                      <span>{lang === "fr" ? "Explorer la fiche aréna" : "Explore arena profile"}</span>
                      <ExternalLink className="size-4 text-sport-foreground" />
                    </Link>
                    <div className="grid grid-cols-3 gap-2" aria-label={lang === "fr" ? "Itinéraires" : "Directions"}>
                      <a href={providerDirections(arena.address).google} target="_blank" rel="noopener noreferrer" className="premium-control flex min-h-11 items-center justify-center rounded-lg border border-white/14 bg-navy px-2 text-[10px] font-bold text-white">Google</a>
                      <a href={providerDirections(arena.address).waze} target="_blank" rel="noopener noreferrer" className="premium-control flex min-h-11 items-center justify-center rounded-lg border border-white/14 bg-navy px-2 text-[10px] font-bold text-white">Waze</a>
                      <a href={providerDirections(arena.address).apple} target="_blank" rel="noopener noreferrer" className="premium-control flex min-h-11 items-center justify-center rounded-lg border border-white/14 bg-navy px-2 text-[10px] font-bold text-white">Apple</a>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="border border-white/12 bg-navy-deep p-8 text-center text-white">
            <MapPin className="mx-auto size-6 text-sport" />
            <p className="mt-4 font-display text-3xl font-extrabold uppercase text-white">
              {lang === "fr" ? "Aucun aréna ne correspond" : "No arena matches"}
            </p>
            <button type="button" onClick={() => { setQuery(""); setZone("all"); }} className="mt-4 text-[9px] font-bold uppercase tracking-[0.13em] text-sport">
              {lang === "fr" ? "Réinitialiser la recherche" : "Reset search"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
