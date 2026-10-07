import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  Car,
  CheckCircle2,
  ChevronRight,
  FileText,
  HandHeart,
  Home,
  Image,
  LogOut,
  MessageCircle,
  Route as RouteIcon,
  Settings2,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/experience")({
  head: () => ({
    meta: [
      { title: "AHMV — Espace famille" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Expérience privée AHMV pour les familles." },
    ],
  }),
  component: AhmvExperiencePage,
});

type Autopilot = {
  autoCalendar: boolean;
  remindRsvp: boolean;
  alertScheduleChanges: boolean;
  recalculateDeparture: boolean;
  notifyOtherCaregiver: boolean;
  remindDocuments: boolean;
  groupChildrenActivities: boolean;
};

type Child = {
  id: string;
  displayName: string;
  teams: Array<{ id: string; label: string | null }>;
};

type BootstrapPayload = {
  ok: true;
  session: {
    displayName: string | null;
    planCode: string | null;
    expiresAt: string;
  };
  hub: {
    family: {
      id: string;
      displayName: string | null;
      onboardingCompleted: boolean;
    };
    children: Child[];
    autopilot: Autopilot;
  };
};

const navigation = [
  ["Accueil", Home],
  ["Ma famille", Users],
  ["Calendrier", CalendarDays],
  ["Équipes", ShieldCheck],
  ["Présences", CheckCircle2],
  ["Transport", Car],
  ["Messages", MessageCircle],
  ["Documents", FileText],
  ["Photos", Image],
  ["Bénévolat", HandHeart],
  ["Paiements", WalletCards],
  ["Alertes", Bell],
  ["Support", AlertTriangle],
  ["Profil", UserRound],
] as const;

const quickActions = [
  ["Itinéraire", RouteIcon, "Transport"],
  ["Présence", CheckCircle2, "Présences"],
  ["Transport", Car, "Transport"],
  ["Calendrier", CalendarDays, "Calendrier"],
] as const;

const autopilotLabels: Array<[keyof Autopilot, string, string]> = [
  ["autoCalendar", "Ajouter automatiquement mes matchs au calendrier", "Synchronise les activités liées à votre famille."],
  ["remindRsvp", "Me rappeler les RSVP non complétés", "Évite les présences oubliées avant une activité."],
  ["alertScheduleChanges", "Me prévenir si l’heure ou l’aréna change", "Les changements officiels deviennent prioritaires."],
  ["recalculateDeparture", "Recalculer mon départ automatiquement", "Ajuste le départ lorsqu’un horaire ou trajet change."],
  ["notifyOtherCaregiver", "Prévenir mon autre gardien si je ne peux pas conduire", "Disponible lorsque plusieurs gardiens sont reliés."],
  ["remindDocuments", "Me rappeler les documents nécessaires", "Centralise les rappels administratifs utiles."],
  ["groupChildrenActivities", "Regrouper les activités de mes enfants", "Une seule vue familiale pour plusieurs enfants."],
];

function AhmvExperiencePage() {
  const [data, setData] = useState<BootstrapPayload | null>(null);
  const [error, setError] = useState("");
  const [section, setSection] = useState("Accueil");
  const [saving, setSaving] = useState<keyof Autopilot | null>(null);
  const [childName, setChildName] = useState("");
  const [addingChild, setAddingChild] = useState(false);

  async function load() {
    setError("");
    try {
      const response = await fetch("/api/ahmv/experience/bootstrap", {
        credentials: "same-origin",
        cache: "no-store",
      });
      if (response.status === 401) {
        window.location.assign("/api/ahmv/experience/login");
        return;
      }
      if (!response.ok) throw new Error("bootstrap");
      setData((await response.json()) as BootstrapPayload);
    } catch {
      setError("L’espace famille ne peut pas être chargé pour le moment.");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const firstName = useMemo(() => {
    const value = data?.session.displayName?.trim();
    return value ? (value.split(/\s+/)[0] ?? null) : null;
  }, [data?.session.displayName]);

  async function toggleAutopilot(key: keyof Autopilot) {
    if (!data || saving) return;
    const next = !data.hub.autopilot[key];
    setSaving(key);
    setData({
      ...data,
      hub: {
        ...data.hub,
        autopilot: { ...data.hub.autopilot, [key]: next },
      },
    });

    try {
      const response = await fetch("/api/ahmv/experience/autopilot", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ [key]: next }),
      });
      if (!response.ok) throw new Error("save");
    } catch {
      setData({
        ...data,
        hub: {
          ...data.hub,
          autopilot: { ...data.hub.autopilot, [key]: !next },
        },
      });
      setError("Le réglage Auto-Pilot n’a pas pu être enregistré.");
    } finally {
      setSaving(null);
    }
  }

  async function addChild(event: FormEvent) {
    event.preventDefault();
    const displayName = childName.trim();
    if (!data || displayName.length < 2 || addingChild) return;
    setAddingChild(true);
    setError("");

    try {
      const response = await fetch("/api/ahmv/experience/children", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ displayName }),
      });
      if (!response.ok) throw new Error("child");
      const payload = (await response.json()) as { ok: true; child: Child };
      setData({
        ...data,
        hub: {
          ...data.hub,
          children: [...data.hub.children, payload.child],
        },
      });
      setChildName("");
    } catch {
      setError("L’enfant n’a pas pu être ajouté.");
    } finally {
      setAddingChild(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f3f6fb] text-[#121a2c]">
      <header className="sticky top-0 z-40 border-b border-[#dbe2ef] bg-white/95 backdrop-blur lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <button className="flex items-center gap-3" onClick={() => setSection("Accueil")}>
            <img src="/favicon.png" alt="" className="size-9 rounded-lg" />
            <span>
              <span className="block font-display text-lg font-extrabold uppercase leading-none">AHMV</span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Espace famille</span>
            </span>
          </button>
          <form method="post" action="/api/ahmv/experience/logout">
            <button className="flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white" aria-label="Déconnexion">
              <LogOut className="size-4" />
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-[270px] shrink-0 border-r border-[#dbe2ef] bg-[#0f1930] text-white lg:flex lg:flex-col">
          <button className="flex items-center gap-3 border-b border-white/10 px-6 py-6 text-left" onClick={() => setSection("Accueil")}>
            <img src="/favicon.png" alt="" className="size-11 rounded-xl ring-1 ring-white/15" />
            <span>
              <span className="block font-display text-2xl font-extrabold uppercase leading-none">AHMV</span>
              <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">Expérience famille</span>
            </span>
          </button>

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            {navigation.map(([label, Icon]) => {
              const active = section === label;
              return (
                <button
                  key={label}
                  onClick={() => setSection(label)}
                  className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                    active ? "bg-white text-[#0f1930]" : "text-white/68 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  <Icon className="size-4" />
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>

          <div className="border-t border-white/10 p-4">
            <div className="rounded-xl bg-white/6 p-3">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-white/40">Propulsé par</p>
              <p className="mt-1 text-sm font-extrabold">GROUPE TAKATAK</p>
            </div>
            <form method="post" action="/api/ahmv/experience/logout" className="mt-2">
              <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/65 hover:bg-white/8 hover:text-white">
                <LogOut className="size-4" />
                Déconnexion
              </button>
            </form>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 pb-24 pt-5 sm:px-6 lg:px-10 lg:pb-10 lg:pt-8">
          {error ? (
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
              <AlertTriangle className="size-4 shrink-0" />
              {error}
            </div>
          ) : null}

          {!data ? (
            <LoadingState hasError={Boolean(error)} onRetry={() => void load()} />
          ) : section === "Accueil" ? (
            <HomeSection
              data={data}
              firstName={firstName}
              saving={saving}
              setSection={setSection}
              toggleAutopilot={toggleAutopilot}
            />
          ) : section === "Ma famille" ? (
            <FamilySection
              children={data.hub.children}
              childName={childName}
              addingChild={addingChild}
              setChildName={setChildName}
              addChild={addChild}
            />
          ) : (
            <ModuleSection section={section} children={data.hub.children} />
          )}
        </main>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white px-2 py-2 lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-4">
          {quickActions.map(([label, Icon, target]) => (
            <button
              key={label}
              onClick={() => setSection(target)}
              className="flex flex-col items-center justify-center gap-1 rounded-lg px-1 py-1.5 text-[10px] font-bold text-slate-600"
            >
              <Icon className="size-5 text-[#1d4f91]" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function LoadingState({ hasError, onRetry }: { hasError: boolean; onRetry: () => void }) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="max-w-sm text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#0f1930] text-white">
          <ShieldCheck className="size-7" />
        </div>
        <h1 className="mt-5 font-display text-3xl font-extrabold uppercase">
          {hasError ? "Connexion impossible" : "Préparation de votre hockey"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {hasError
            ? "Votre accès est protégé. Réessayez ou reconnectez-vous par GROUPE TAKATAK."
            : "Chargement de votre famille, de vos préférences et de vos services AHMV."}
        </p>
        {hasError ? (
          <button onClick={onRetry} className="mt-5 rounded-xl bg-[#1d4f91] px-5 py-3 text-sm font-bold text-white">
            Réessayer
          </button>
        ) : null}
      </div>
    </div>
  );
}

function HomeSection({
  data,
  firstName,
  saving,
  setSection,
  toggleAutopilot,
}: {
  data: BootstrapPayload;
  firstName: string | null;
  saving: keyof Autopilot | null;
  setSection: (value: string) => void;
  toggleAutopilot: (key: keyof Autopilot) => Promise<void>;
}) {
  const hasFamilySetup = data.hub.children.length > 0;
  const hasTeamLink = data.hub.children.some((child) => child.teams.length > 0);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#1d4f91]">AHMV • Espace famille</p>
          <h1 className="mt-2 font-display text-[clamp(2.6rem,6vw,5rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.035em]">
            Bonjour{firstName ? ` ${firstName}` : ""}.
          </h1>
          <p className="mt-2 text-lg font-semibold text-slate-500">Voici votre journée hockey.</p>
        </div>
        <div className="w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-emerald-800">
          Accès AHMV actif
        </div>
      </div>

      <section className="mt-7 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.45fr_0.55fr]">
          <div className="p-6 sm:p-8">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Aujourd’hui</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold uppercase">
              {!hasFamilySetup
                ? "Configurons votre famille."
                : !hasTeamLink
                  ? "Votre famille est prête."
                  : "Synchronisation des activités officielles."}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              {!hasFamilySetup
                ? "Ajoutez votre enfant pour commencer à organiser votre espace familial."
                : !hasTeamLink
                  ? "Reliez ensuite les équipes officielles de vos enfants. Les prochains matchs et pratiques apparaîtront seulement à partir de sources vérifiées."
                  : "Les équipes sont reliées. Les prochains événements apparaîtront ici lorsque la source officielle les aura synchronisés."}
            </p>
            <button
              onClick={() => setSection("Ma famille")}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0f1930] px-4 py-3 text-sm font-bold text-white"
            >
              {hasFamilySetup ? "Ouvrir Ma famille" : "Ajouter mon enfant"}
              <ChevronRight className="size-4" />
            </button>
          </div>
          <div className="border-t border-slate-100 bg-[#f8fafc] p-6 lg:border-l lg:border-t-0">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">État famille</p>
            <div className="mt-4 space-y-3">
              <StatusRow label="Enfants" value={String(data.hub.children.length)} ok={hasFamilySetup} />
              <StatusRow
                label="Équipes reliées"
                value={String(data.hub.children.reduce((sum, child) => sum + child.teams.length, 0))}
                ok={hasTeamLink}
              />
              <StatusRow label="Auto-Pilot" value="Disponible" ok />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {quickActions.map(([label, Icon, target]) => (
          <button
            key={label}
            onClick={() => setSection(target)}
            className="group rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#1d4f91]/30 hover:shadow-md"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#eaf1fb] text-[#1d4f91]">
              <Icon className="size-5" />
            </span>
            <span className="mt-4 block font-display text-xl font-extrabold uppercase">{label}</span>
            <span className="mt-1 flex items-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-[#1d4f91]">
              Ouvrir <ChevronRight className="size-3" />
            </span>
          </button>
        ))}
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#1d4f91]">
              <Sparkles className="size-4" />
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em]">Auto-Pilot AHMV</p>
            </div>
            <h2 className="mt-2 font-display text-3xl font-extrabold uppercase">AHMV travaille pour vous.</h2>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          {autopilotLabels.map(([key, label, description]) => {
            const active = data.hub.autopilot[key];
            return (
              <button
                key={key}
                disabled={saving !== null}
                onClick={() => void toggleAutopilot(key)}
                className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm disabled:opacity-70"
              >
                <span>
                  <span className="block text-sm font-bold text-slate-800">{label}</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">{description}</span>
                </span>
                <span
                  aria-hidden="true"
                  className={`mt-0.5 flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition ${
                    active ? "justify-end bg-[#1d4f91]" : "justify-start bg-slate-200"
                  }`}
                >
                  <span className="size-5 rounded-full bg-white shadow-sm" />
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function StatusRow({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3 text-sm last:border-0 last:pb-0">
      <span className="font-semibold text-slate-500">{label}</span>
      <span className={`font-bold ${ok ? "text-emerald-700" : "text-slate-700"}`}>{value}</span>
    </div>
  );
}

function FamilySection({
  children,
  childName,
  addingChild,
  setChildName,
  addChild,
}: {
  children: Child[];
  childName: string;
  addingChild: boolean;
  setChildName: (value: string) => void;
  addChild: (event: FormEvent) => Promise<void>;
}) {
  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#1d4f91]">Family Hub</p>
      <h1 className="mt-2 font-display text-5xl font-extrabold uppercase">Ma famille</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
        Les données familiales restent dans AHMV. L’identité, l’abonnement et l’autorisation d’accès restent sous GROUPE TAKATAK.
      </p>

      <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-2xl font-extrabold uppercase">Enfants</h2>
          {children.length === 0 ? (
            <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Aucun enfant ajouté pour le moment.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {children.map((child) => (
                <div key={child.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-full bg-[#eaf1fb] font-display text-lg font-extrabold text-[#1d4f91]">
                      {child.displayName.slice(0, 1).toUpperCase()}
                    </span>
                    <div>
                      <p className="font-bold">{child.displayName}</p>
                      <p className="text-xs text-slate-500">
                        {child.teams.length === 0
                          ? "Aucune équipe reliée"
                          : child.teams.map((team) => team.label ?? team.id).join(" • ")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-2xl font-extrabold uppercase">Ajouter un enfant</h2>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            On demande seulement l’information nécessaire à l’expérience familiale. Les données médicales ou confidentielles ne sont pas requises ici.
          </p>
          <form className="mt-5" onSubmit={(event) => void addChild(event)}>
            <label className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500" htmlFor="child-name">
              Prénom / nom d’affichage
            </label>
            <input
              id="child-name"
              value={childName}
              onChange={(event) => setChildName(event.target.value)}
              minLength={2}
              maxLength={80}
              required
              autoComplete="off"
              className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[#1d4f91] focus:ring-2 focus:ring-[#1d4f91]/10"
              placeholder="Ex. Matthys"
            />
            <button
              disabled={addingChild || childName.trim().length < 2}
              className="mt-3 w-full rounded-xl bg-[#1d4f91] px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {addingChild ? "Ajout…" : "Ajouter à ma famille"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

function ModuleSection({ section, children }: { section: string; children: Child[] }) {
  const messages: Record<string, string> = {
    Calendrier: "Les activités officielles liées aux équipes de vos enfants apparaîtront ici.",
    Équipes: "Reliez chaque enfant à son équipe officielle pour personnaliser l’expérience.",
    Présences: "Les RSVP familiaux seront centralisés ici pour les activités officielles synchronisées.",
    Transport: "Départs, covoiturage et coordination des gardiens seront regroupés dans cette vue.",
    Messages: "Les communications utiles à votre famille seront affichées ici.",
    Documents: "Les documents autorisés et rappels administratifs seront regroupés ici.",
    Photos: "Les albums et photos autorisés pour votre famille seront accessibles ici.",
    Bénévolat: "Les besoins et disponibilités de bénévolat seront regroupés ici.",
    Paiements: "Les informations de paiement restent sous l’autorité de facturation GROUPE TAKATAK.",
    Alertes: "Les changements prioritaires d’horaire, d’aréna et les rappels seront regroupés ici.",
    Support: "Le support AHMV sera accessible sans mélanger les outils administratifs TAKATAK.",
    Profil: "Vos préférences AHMV et votre expérience familiale seront configurables ici.",
  };

  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#1d4f91]">AHMV</p>
      <h1 className="mt-2 font-display text-5xl font-extrabold uppercase">{section}</h1>
      <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-[#eaf1fb] text-[#1d4f91]">
          <Settings2 className="size-6" />
        </div>
        <h2 className="mt-5 font-display text-2xl font-extrabold uppercase">
          {children.length === 0 ? "Commencez par Ma famille" : "Votre espace est prêt à être relié"}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          {messages[section] ?? "Ce module fait partie de votre expérience AHMV."}
        </p>
        <p className="mt-4 text-xs font-semibold text-slate-400">
          Les données réelles apparaissent seulement lorsqu’une source officielle ou une action familiale vérifiée les fournit.
        </p>
      </div>
    </div>
  );
}
