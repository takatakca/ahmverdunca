import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Mic, PhoneCall, Search } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { DemoNotice } from "@/components/demo-notice";
import { Button } from "@/components/ui/button";
import { TEAMS } from "@/data/teams";
import { ARENAS } from "@/data/arenas";
import { NEWS } from "@/data/news";
import { FAQ } from "@/data/faq";
import { SITE } from "@/lib/site";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/recherche")({
  head: () => ({
    meta: [
      { title: "Recherche — AHM Verdun" },
      {
        name: "description",
        content:
          "Rechercher une équipe, un aréna, une nouvelle, une inscription, une ressource ou une question fréquente sur le site de l'AHM Verdun.",
      },
      { property: "og:title", content: "Recherche — AHM Verdun" },
      { property: "og:description", content: "Trouvez rapidement l'information AHM Verdun." },
    ],
  }),
  component: SearchPage,
});

type Hit = { key: string; label: string; kind: string; to: string; slug?: string };

const STATIC_PAGES = [
  { key: "registration", fr: "Inscriptions 2026–2027 Spordle", en: "2026–2027 registration Spordle", to: "/inscriptions" },
  { key: "schedule", fr: "Horaires de la semaine", en: "Weekly schedules", to: "/horaires" },
  { key: "partners", fr: "Partenaires et commanditaires", en: "Partners and sponsors", to: "/partenaires" },
  { key: "coaches", fr: "Zone entraîneurs", en: "Coaches zone", to: "/entraineurs" },
  { key: "resources", fr: "Ressources hockey et aide financière", en: "Hockey resources and financial assistance", to: "/ressources" },
  { key: "gallery", fr: "Photos et vidéos", en: "Photos and videos", to: "/galerie" },
  { key: "wllv", fr: "WLLV AA/BB Chacals", en: "WLLV AA/BB Chacals", to: "/wllv" },
  { key: "contact", fr: "Contact AHM Verdun", en: "Contact AHM Verdun", to: "/contact" },
] as const;

function SearchPage() {
  const { t, l, lang } = useI18n();
  const [q, setQ] = useState("");

  const hits = useMemo<Hit[]>(() => {
    const needle = q.trim().toLowerCase();
    if (needle.length < 2) return [];
    const out: Hit[] = [];

    TEAMS.forEach((x) => {
      if (`${l(x.name)} ${x.code} équipe team horaire schedule`.toLowerCase().includes(needle)) {
        out.push({ key: `t-${x.slug}`, label: l(x.name), kind: t("nav.teams"), to: "/equipes/$slug", slug: x.slug });
      }
    });

    ARENAS.forEach((x) => {
      if (`${x.name} ${l(x.borough)} aréna arena adresse direction itinéraire`.toLowerCase().includes(needle)) {
        out.push({ key: `a-${x.slug}`, label: x.name, kind: t("nav.arenas"), to: "/arenas/$slug", slug: x.slug });
      }
    });

    NEWS.forEach((x) => {
      if (`${l(x.title)} ${l(x.excerpt)} nouvelles news`.toLowerCase().includes(needle)) {
        out.push({ key: `n-${x.slug}`, label: l(x.title), kind: t("nav.news"), to: "/nouvelles/$slug", slug: x.slug });
      }
    });

    FAQ.forEach((x) => {
      if (`${l(x.question)} ${l(x.answer)} faq question aide help`.toLowerCase().includes(needle)) {
        out.push({ key: `f-${x.id}`, label: l(x.question), kind: t("nav.faq"), to: "/faq" });
      }
    });

    STATIC_PAGES.forEach((page) => {
      const label = lang === "fr" ? page.fr : page.en;
      if (`${page.fr} ${page.en}`.toLowerCase().includes(needle)) {
        out.push({ key: `p-${page.key}`, label, kind: lang === "fr" ? "Page" : "Page", to: page.to });
      }
    });

    return out;
  }, [q, l, t, lang]);

  return (
    <>
      <PageHeader
        eyebrow={lang === "fr" ? "Trouver en quelques secondes" : "Find it in seconds"}
        title={t("search.title")}
        description={t("search.hint")}
      />
      <div className="container-site py-8 md:py-12">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            autoFocus
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("search.placeholder")}
            aria-label={t("common.search")}
            className="h-14 w-full rounded-lg border border-input bg-background pl-12 pr-4 text-base shadow-sm"
          />
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <DemoNotice kind="info">
            {lang === "fr"
              ? "Recherche instantanée sur les équipes, arénas, nouvelles, FAQ et pages principales."
              : "Instant search across teams, arenas, news, FAQ and key pages."}
          </DemoNotice>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" disabled title={lang === "fr" ? "Intégration à venir" : "Coming integration"}>
              <Mic className="size-4" />
              {lang === "fr" ? "Recherche vocale bientôt" : "Voice search soon"}
            </Button>
            <Button asChild variant="outline">
              <a href={`tel:${SITE.phoneE164}`}>
                <PhoneCall className="size-4" />
                {SITE.phoneDisplay}
              </a>
            </Button>
          </div>
        </div>

        {!q.trim() && (
          <div className="mt-8">
            <p className="eyebrow text-sport">{lang === "fr" ? "Accès populaires" : "Popular shortcuts"}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {STATIC_PAGES.slice(0, 6).map((page) => (
                <Link
                  key={page.key}
                  to={page.to}
                  className="rounded-full border border-input bg-background px-4 py-2 text-sm font-semibold hover:border-sport/40 hover:bg-ice"
                >
                  {lang === "fr" ? page.fr : page.en}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 space-y-3" aria-live="polite">
          {q.trim().length >= 2 && hits.length === 0 && <p className="text-muted-foreground">{t("common.noResults")}</p>}
          {hits.map((h) =>
            h.slug ? (
              <Link key={h.key} to={h.to} params={{ slug: h.slug }} className="card-elevated block p-4 hover:text-sport">
                <p className="eyebrow text-sport">{h.kind}</p>
                <p className="heading-card mt-1">{h.label}</p>
              </Link>
            ) : (
              <Link key={h.key} to={h.to} className="card-elevated block p-4 hover:text-sport">
                <p className="eyebrow text-sport">{h.kind}</p>
                <p className="heading-card mt-1">{h.label}</p>
              </Link>
            ),
          )}
        </div>
      </div>
    </>
  );
}
