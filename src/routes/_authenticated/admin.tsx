import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CalendarDays, FileText, Image, LogOut, MessageSquare, Users } from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/page-header";
import { DemoNotice } from "@/components/demo-notice";
import { Button } from "@/components/ui/button";
import { getAdminOverview, getMyAccess, type AppRole } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Administration — AHM Verdun" },
      {
        name: "description",
        content:
          "Espace de gestion réservé aux bénévoles autorisés de l'AHM Verdun : horaires, nouvelles, albums et messages.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Administration — AHM Verdun" },
      { property: "og:description", content: "Espace de gestion réservé aux bénévoles autorisés." },
    ],
  }),
  component: AdminPage,
});

const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Administrateur principal",
  schedule_manager: "Responsable des horaires",
  comms_manager: "Responsable des communications",
  photo_manager: "Responsable des photos",
  volunteer: "Bénévole (lecture seule)",
};

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchAccess = useServerFn(getMyAccess);
  const fetchOverview = useServerFn(getAdminOverview);

  const access = useQuery({ queryKey: ["admin", "access"], queryFn: () => fetchAccess() });
  const overview = useQuery({ queryKey: ["admin", "overview"], queryFn: () => fetchOverview() });

  const roles = access.data?.roles ?? [];
  const can = (role: AppRole) => roles.includes("admin") || roles.includes(role);

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    await navigate({ to: "/auth", replace: true });
  }

  const counts = overview.data;
  const cards = [
    {
      icon: CalendarDays,
      title: "Horaires",
      count: counts?.activities,
      note: can("schedule_manager") ? "Vous pouvez modifier" : "Lecture seule",
      to: "/horaires" as const,
    },
    {
      icon: Users,
      title: "Équipes et arénas",
      count: (counts?.teams ?? 0) + (counts?.arenas ?? 0),
      note: can("schedule_manager") ? "Vous pouvez modifier" : "Lecture seule",
      to: "/equipes" as const,
    },
    {
      icon: FileText,
      title: "Nouvelles et FAQ",
      count: (counts?.news ?? 0) + (counts?.faq ?? 0),
      note: can("comms_manager") ? "Vous pouvez modifier" : "Lecture seule",
      to: "/nouvelles" as const,
    },
    {
      icon: Image,
      title: "Albums",
      count: counts?.albums,
      note: can("photo_manager") ? "Vous pouvez modifier" : "Lecture seule",
      to: "/galerie" as const,
    },
    {
      icon: MessageSquare,
      title: "Messages reçus",
      count: counts?.contact_messages,
      note: can("comms_manager") ? "Vous pouvez répondre" : "Lecture réservée",
      to: "/contact" as const,
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Association"
        title="Administration"
        description="Espace de gestion réservé aux bénévoles autorisés. Les droits sont vérifiés par le serveur à chaque enregistrement."
      />
      <div className="container-site space-y-10 py-8 md:py-12">
        <section className="card-elevated flex flex-wrap items-start justify-between gap-4 p-5">
          <div>
            <p className="eyebrow">Connecté</p>
            <p className="heading-card mt-1">{access.data?.displayName ?? access.data?.email ?? "…"}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {roles.length === 0
                ? "Aucun rôle attribué pour le moment : vous n'avez aucun droit de modification. Un administrateur principal doit vous attribuer un rôle."
                : roles.map((r) => ROLE_LABELS[r]).join(" · ")}
            </p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="size-4" /> Se déconnecter
          </Button>
        </section>

        <DemoNotice kind="connect" title="Modules de gestion en construction">
          La base de données et les rôles sont maintenant réels. Les écrans de saisie (ajout et
          modification des horaires, importation de fichiers, publication des nouvelles et des
          albums) arrivent aux étapes suivantes du plan approuvé. Les pages publiques affichent
          encore les contenus de démonstration jusqu'à leur branchement.
        </DemoNotice>

        <section>
          <SectionHeading title="Contenus enregistrés dans la base" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((c) => (
              <Link key={c.title} to={c.to} className="card-elevated group p-5">
                <c.icon className="size-6 text-sport" aria-hidden />
                <p className="heading-card mt-3 group-hover:text-sport">{c.title}</p>
                <p className="mt-1 font-display text-3xl font-extrabold text-navy">
                  {overview.isLoading ? "…" : (c.count ?? 0)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{c.note}</p>
              </Link>
            ))}
          </div>
          {overview.isError && (
            <p role="alert" className="mt-3 text-sm text-sport">
              Impossible de lire les contenus pour le moment. Réessayez dans quelques instants.
            </p>
          )}
        </section>

        <section>
          <SectionHeading title="Rôles disponibles" />
          <ul className="space-y-2 text-sm text-muted-foreground">
            {(Object.keys(ROLE_LABELS) as AppRole[]).map((r) => (
              <li key={r}>
                <span className="font-semibold text-navy">{ROLE_LABELS[r]}</span>
                {roles.includes(r) && " — attribué à votre compte"}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
