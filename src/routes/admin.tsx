import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, FileText, Image, Megaphone, Users } from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/page-header";
import { DemoNotice } from "@/components/demo-notice";
import { SCHEDULE, SCHEDULE_META } from "@/data/schedule";
import { NEWS } from "@/data/news";
import { ALBUMS } from "@/data/gallery";
import { ALERTS } from "@/data/alerts";
import { TEAMS } from "@/data/teams";
import { formatDate, useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Administration (prototype) — AHM Verdun" },
      { name: "description", content: "Aperçu du futur panneau de gestion : horaires, nouvelles, albums et avis. Prototype sans sécurité ni enregistrement." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Administration (prototype) — AHM Verdun" },
      { property: "og:description", content: "Maquette du panneau de gestion pour les bénévoles." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { lang } = useI18n();
  const cards = [
    { icon: CalendarDays, title: "Horaires", count: SCHEDULE.length, note: `Version ${SCHEDULE_META.version}`, to: "/horaires" as const },
    { icon: Megaphone, title: "Avis importants", count: ALERTS.length, note: "Publication et archivage", to: "/" as const },
    { icon: FileText, title: "Nouvelles", count: NEWS.length, note: "Rédaction et catégories", to: "/nouvelles" as const },
    { icon: Image, title: "Albums", count: ALBUMS.length, note: "Photos en attente de consentement", to: "/galerie" as const },
    { icon: Users, title: "Équipes", count: TEAMS.length, note: "Catégories de la saison", to: "/equipes" as const },
  ];

  return (
    <>
      <PageHeader eyebrow="Prototype" title="Administration" description="Aperçu visuel du futur panneau de gestion destiné aux bénévoles. Rien n'est enregistré et aucune sécurité n'est simulée." />
      <div className="container-site space-y-10 py-8 md:py-12">
        <DemoNotice kind="connect">
          Prototype uniquement : pas de connexion, pas de rôles, pas de sauvegarde. La gestion réelle (import d'horaires, publication, rôles) fait partie d'une phase suivante à approuver.
        </DemoNotice>

        <section>
          <SectionHeading title="Contenus" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((c) => (
              <Link key={c.title} to={c.to} className="card-elevated group p-5">
                <c.icon className="size-6 text-sport" aria-hidden />
                <p className="heading-card mt-3 group-hover:text-sport">{c.title}</p>
                <p className="mt-1 font-display text-3xl font-extrabold text-navy">{c.count}</p>
                <p className="mt-1 text-sm text-muted-foreground">{c.note}</p>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <SectionHeading title="Journal (démonstration)" />
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Horaires — dernière modification : {formatDate(SCHEDULE_META.lastModified, lang)}</li>
            <li>Horaires — publication : {formatDate(SCHEDULE_META.publishedAt, lang)}</li>
            <li>Avis actifs : {ALERTS.filter((a) => !a.archived).length}</li>
          </ul>
        </section>
      </div>
    </>
  );
}
