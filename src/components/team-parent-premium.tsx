import {
  ArrowRight,
  Bell,
  CalendarDays,
  Car,
  MapPin,
  MessageCircle,
  Navigation,
  ShieldCheck,
  Users,
  Video,
} from "lucide-react";
import { PARENT_PREMIUM, parentPremiumSignupUrl } from "@/lib/parent-premium";

type TeamRef = {
  legacyScheduleTeamId: string;
  name: string;
  level: string;
};

type Props = {
  team: TeamRef;
  lang: "fr" | "en";
};

const CAPABILITIES = [
  {
    icon: CalendarDays,
    fr: "Calendrier automatique",
    en: "Automatic calendar",
    frBody: "Les matchs et changements pourront se synchroniser avec le calendrier du parent après consentement.",
    enBody: "Games and changes can sync to the parent's calendar after consent.",
  },
  {
    icon: Bell,
    fr: "Rappels SMS",
    en: "SMS reminders",
    frBody: "Rappel avant la partie, changement d'heure, annulation ou information importante.",
    enBody: "Reminders before games plus time changes, cancellations and important updates.",
  },
  {
    icon: Navigation,
    fr: "Départ intelligent",
    en: "Smart departure",
    frBody: "Une alerte pourra proposer l'heure de départ selon l'aréna et le trafic réel.",
    enBody: "An alert can suggest when to leave based on the arena and live traffic.",
  },
  {
    icon: Users,
    fr: "Famille synchronisée",
    en: "Family sync",
    frBody: "Papa, maman ou autre responsable pourront partager la même vue de l'équipe et des rappels.",
    enBody: "Parents and caregivers can share the same team view and reminders.",
  },
] as const;

const ROADMAP = [
  { icon: MessageCircle, fr: "Chat entre parents", en: "Parent chat" },
  { icon: Car, fr: "Covoiturage", en: "Ride sharing" },
  { icon: MapPin, fr: "Suivi temporaire", en: "Temporary tracking" },
  { icon: Video, fr: "Appels vidéo", en: "Video calls" },
] as const;

export function TeamParentPremium({ team, lang }: Props) {
  if (!PARENT_PREMIUM.visible) return null;

  const signupUrl = parentPremiumSignupUrl(team.legacyScheduleTeamId);
  const price = PARENT_PREMIUM.weeklyPriceCad.toLocaleString(lang === "fr" ? "fr-CA" : "en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
  });

  return (
    <section
      id="parent-premium"
      aria-labelledby="parent-premium-title"
      className="overflow-hidden border border-navy/12 bg-background"
    >
      <div className="grid lg:grid-cols-[0.78fr_1.22fr]">
        <div className="competition-panel p-6 text-navy-foreground md:p-8">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-sport-foreground" aria-hidden />
            <p className="eyebrow text-sport-foreground">
              {lang === "fr" ? "AHMV · Assistant parent" : "AHMV · Parent assistant"}
            </p>
          </div>
          <h2
            id="parent-premium-title"
            className="mt-3 font-display text-4xl font-extrabold uppercase leading-[0.9] md:text-5xl"
          >
            {lang === "fr" ? "Moins gérer. Plus profiter." : "Less managing. More hockey."}
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-navy-foreground/75 md:text-base">
            {lang === "fr"
              ? `Une mini-application liée à ${team.name} pour enlever des tâches aux parents : calendrier, rappels, départ vers l'aréna et coordination familiale.`
              : `A mini-app connected to ${team.name} that removes parent busywork: calendar, reminders, arena departure and family coordination.`}
          </p>

          <div className="mt-7 border-y border-white/12 py-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/48">
              {lang === "fr" ? "Forfait de lancement prévu" : "Planned launch plan"}
            </p>
            <p className="mt-1 font-display text-4xl font-extrabold uppercase text-white">
              {price}
              <span className="ml-2 text-sm font-bold tracking-normal text-white/55">
                {lang === "fr" ? "/ semaine" : "/ week"}
              </span>
            </p>
            <p className="mt-2 text-xs leading-relaxed text-white/55">
              {lang === "fr"
                ? "Paiement, abonnement et crédits de remerciement seront gérés dans TAKATAK Dashboard."
                : "Payments, subscriptions and thank-you credits will be managed in TAKATAK Dashboard."}
            </p>
          </div>

          {signupUrl ? (
            <a
              href={signupUrl}
              className="premium-control mt-6 flex min-h-12 items-center justify-between bg-sport px-4 font-display text-sm font-bold uppercase tracking-[0.1em] text-sport-foreground"
            >
              {lang === "fr" ? "Continuer avec TAKATAK Auth" : "Continue with TAKATAK Auth"}
              <ArrowRight className="size-4" />
            </a>
          ) : (
            <div className="mt-6 border border-white/14 bg-white/[0.04] px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/72">
                {lang === "fr" ? "Connexion bientôt activée" : "Connection coming soon"}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-white/48">
                {lang === "fr"
                  ? "Le lancement restera fermé tant que TAKATAK Auth et la facturation ne sont pas branchés et testés."
                  : "Launch remains closed until TAKATAK Auth and billing are connected and tested."}
              </p>
            </div>
          )}
        </div>

        <div className="p-6 md:p-8">
          <p className="eyebrow text-sport">{lang === "fr" ? "Gagner du temps maintenant" : "Save time now"}</p>
          <div className="mt-5 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2">
            {CAPABILITIES.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.fr} className="bg-background p-5">
                  <Icon className="size-5 text-sport" aria-hidden />
                  <h3 className="mt-4 font-display text-xl font-extrabold uppercase text-navy">
                    {lang === "fr" ? item.fr : item.en}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {lang === "fr" ? item.frBody : item.enBody}
                  </p>
                </article>
              );
            })}
          </div>

          <div className="mt-7">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              {lang === "fr" ? "La suite prévue" : "Planned next"}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {ROADMAP.map((item) => {
                const Icon = item.icon;
                return (
                  <span
                    key={item.fr}
                    className="inline-flex min-h-9 items-center gap-2 border border-navy/12 bg-ice px-3 text-[10px] font-bold uppercase tracking-[0.1em] text-navy"
                  >
                    <Icon className="size-3.5 text-sport" aria-hidden />
                    {lang === "fr" ? item.fr : item.en}
                  </span>
                );
              })}
            </div>
          </div>

          <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
            {lang === "fr"
              ? "Aucune donnée médicale, aucun dossier de joueur et aucun jeton Google ne doit être stocké dans le navigateur AHMV. Les autorisations et services premium passent par TAKATAK Auth et TAKATAK Dashboard."
              : "No medical data, player record or Google token should be stored in the AHMV browser. Premium authorization and services flow through TAKATAK Auth and TAKATAK Dashboard."}
          </p>
        </div>
      </div>
    </section>
  );
}
