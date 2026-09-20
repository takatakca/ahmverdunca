import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { DemoNotice } from "@/components/demo-notice";
import { TEAMS } from "@/data/teams";
import { ARENAS } from "@/data/arenas";
import { NEWS } from "@/data/news";
import { FAQ } from "@/data/faq";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/recherche")({
  head: () => ({
    meta: [
      { title: "Recherche — AHM Verdun" },
      { name: "description", content: "Rechercher une équipe, un aréna, une nouvelle ou une question fréquente sur le site de l'AHM Verdun." },
      { property: "og:title", content: "Recherche — AHM Verdun" },
      { property: "og:description", content: "Trouvez une équipe, un aréna, une nouvelle ou une réponse." },
    ],
  }),
  component: SearchPage,
});

type Hit = { key: string; label: string; kind: string; to: string; slug?: string };

function SearchPage() {
  const { t, l } = useI18n();
  const [q, setQ] = useState("");

  const hits = useMemo<Hit[]>(() => {
    const needle = q.trim().toLowerCase();
    if (needle.length < 2) return [];
    const out: Hit[] = [];
    TEAMS.forEach((x) => { if (`${l(x.name)} ${x.code}`.toLowerCase().includes(needle)) out.push({ key: `t-${x.slug}`, label: l(x.name), kind: t("nav.teams"), to: "/equipes/$slug", slug: x.slug }); });
    ARENAS.forEach((x) => { if (`${x.name} ${l(x.borough)}`.toLowerCase().includes(needle)) out.push({ key: `a-${x.slug}`, label: x.name, kind: t("nav.arenas"), to: "/arenas/$slug", slug: x.slug }); });
    NEWS.forEach((x) => { if (`${l(x.title)} ${l(x.excerpt)}`.toLowerCase().includes(needle)) out.push({ key: `n-${x.slug}`, label: l(x.title), kind: t("nav.news"), to: "/nouvelles/$slug", slug: x.slug }); });
    FAQ.forEach((x) => { if (`${l(x.question)} ${l(x.answer)}`.toLowerCase().includes(needle)) out.push({ key: `f-${x.id}`, label: l(x.question), kind: t("nav.faq"), to: "/faq" }); });
    return out;
  }, [q, l, t]);

  return (
    <>
      <PageHeader eyebrow={t("common.demo")} title={t("search.title")} description={t("search.hint")} />
      <div className="container-site py-8 md:py-12">
        <input
          autoFocus
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("search.placeholder")}
          aria-label={t("common.search")}
          className="h-12 w-full rounded-md border border-input bg-background px-4 text-base"
        />
        <DemoNotice kind="info" className="mt-4">
          Recherche locale sur le contenu de la maquette. Une recherche complète (documents, horaires officiels) viendra avec les données réelles.
        </DemoNotice>

        <div className="mt-8 space-y-3">
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
