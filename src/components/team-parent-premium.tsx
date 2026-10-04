import {
  ArrowRight,
  Bell,
  CalendarDays,
  Car,
  MapPin,
  MessageCircle,
  Navigation,
  ShieldCheck,
  Sparkles,
  Trophy,
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
    icon: ShieldCheck,
    fr: "Expérience sans publicité",
    en: "Ad-free experience",
    frBody: "L'entitlement TAKATAK ad_free permettra de retirer AdSense des surfaces membre lorsque la session premium est vérifiée.",
    enBody: "The TAKATAK ad_free entitlement can remove AdSense from member surfaces once the premium session is verified.",
  },
  {
    icon: Sparkles,
    fr: "Assistant AHMV premium",
    en: "Premium AHMV assistant",
    frBody: "L'assistant complet pourra guider le parent vers son équipe, ses horaires, ses liens et ses services après vérification membre.",
    enBody: "The full assistant can guide parents to their team, schedules, links and services after membership verification.",
  },
  {
    icon: Bell,
    fr: "Rappels de matchs",
    en: "Game reminders",
    frBody: "Rappels et changements significatifs pourront être livrés selon les préférences de communication du parent.",
    enBody: "Reminders and meaningful changes can be delivered according to the parent's communication preferences.",
  },
  {
    icon: CalendarDays,
    fr: "Calendrier automatique",
    en: "Automatic calendar",
    frBody: "Les événements officiels des équipes choisies pourront se synchroniser au calendrier avec consentement explicite.",
    enBody: "Official events for selected teams can sync to a calendar with explicit consent.",
  },
  {
    icon: Users,
    fr: "Communauté d'équipe",
    en: "Team community",
    frBody: "Un espace privé et modéré pourra rassembler les parents autorisés d'une même équipe sans exposer de données sur le site public.",
    enBody: "A private moderated space can connect authorized parents from the same team without exposing data on the public site.",
  },
  {
    icon: MessageCircle,
    fr: "Communication parent-parent",
    en: "Parent-to-parent messaging",
    frBody: "Les échanges privés passeront par l'identité TAKATAK et les permissions d'équipe plutôt que d'afficher les coordonnées des parents publiquement.",
    enBody: "Private conversations will use TAKATAK identity and team permissions instead of exposing parent contact details publicly.",
  },
  {
    icon: Car,
    fr: "Covoiturage parent-parent",
    en: "Parent rideshare",
    frBody: "Le forfait réserve l'accès au module de covoiturage volontaire lorsqu'il sera activé, avec participation explicite et portée limitée à l'équipe.",
    enBody: "The plan reserves access to the opt-in parent rideshare module when launched, scoped to the team.",
  },
] as const;

const ROADMAP = [
  { icon: Navigation, fr: "Départ intelligent / trafic", en: "Smart departure / traffic" },
  { icon: Trophy, fr: "Voyages et tournois", en: "Travel and tournaments" },
  { icon: MapPin, fr: "Coordination familiale en direct", en: "Live family coordination" },
  { icon: Video, fr: "Appels vidéo", en: "Video calls" },
] as const;

export function TeamParentPremium({ team, lang }: Props) {
  if (!PARENT_PREMIUM.visible) return null;

  const demoMode = !PARENT_PREMIUM.launchEnabled;

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
      className="overflow-hidden border border-white/12 bg-navy-deep text-white"
    >
      <div className="grid lg:grid-cols-[0.78fr_1.22fr]">
        <div className="competition-panel p-6 text-navy-foreground md:p-8">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-sport-foreground" aria-hidden />
            <p className="eyebrow text-sport-foreground">
              {lang === "fr" ? "AHMV · Assistant parent" : "AHMV · Parent assistant"}
              {demoMode ? (lang === "fr" ? " · APERÇU" : " · PREVIEW") : ""}
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
              ? `Une expérience membre liée à ${team.name} : sans pub, assistant premium, rappels, calendrier, communauté, messagerie et futur covoiturage parent-parent.`
              : `A member experience connected to ${team.name}: ad-free, premium assistant, reminders, calendar, community, messaging and future parent rideshare.`}
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

          {signupUrl && !demoMode ? (
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
                {lang === "fr" ? "Aperçu du forfait membre" : "Membership plan preview"}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-white/48">
                {lang === "fr"
                  ? "Aucune inscription ni facturation n’est déclenchée depuis cet aperçu public."
                  : "No signup or billing is triggered from this public preview."}
              </p>
            </div>
          )}
        </div>

        <div className="bg-navy-deep p-6 md:p-8">
          <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Droits du forfait AHMV Member" : "AHMV Member entitlements"}</p>
          <div className="mt-5 grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2">
            {CAPABILITIES.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.fr} className="bg-competition p-5 text-white">
                  <Icon className="size-5 text-sport-foreground" aria-hidden />
                  <h3 className="mt-4 font-display text-xl font-extrabold uppercase text-white">
                    {lang === "fr" ? item.fr : item.en}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/52">
                    {lang === "fr" ? item.frBody : item.enBody}
                  </p>
                </article>
              );
            })}
          </div>

          <div className="mt-7">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/42">
              {lang === "fr" ? "Prochaine phase · non vendue aujourd'hui" : "Next phase · not sold today"}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {ROADMAP.map((item) => {
                const Icon = item.icon;
                return (
                  <span
                    key={item.fr}
                    className="inline-flex min-h-9 items-center gap-2 border border-white/12 bg-white/[0.04] px-3 text-[10px] font-bold uppercase tracking-[0.1em] text-white/70"
                  >
                    <Icon className="size-3.5 text-sport-foreground" aria-hidden />
                    {lang === "fr" ? item.fr : item.en}
                  </span>
                );
              })}
            </div>
          </div>

          <p className="mt-6 text-xs leading-relaxed text-white/45">
            {lang === "fr"
              ? "Aucune donnée médicale, aucun dossier de joueur et aucun jeton Google ne doit être stocké dans le navigateur AHMV. Les autorisations et services premium passent par TAKATAK Auth et TAKATAK Dashboard."
              : "No medical data, player record or Google token should be stored in the AHMV browser. Premium authorization and services flow through TAKATAK Auth and TAKATAK Dashboard."}
          </p>
        </div>
      </div>
    </section>
  );
}
