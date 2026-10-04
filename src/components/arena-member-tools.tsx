import {
  Bell,
  LockKeyhole,
  MessageCircle,
  Navigation,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import type { Arena } from "@/data/arenas";
import { PARENT_PREMIUM, parentPremiumContextUrl } from "@/lib/parent-premium";

export function ArenaMemberTools({ arena, lang }: { arena: Arena; lang: "fr" | "en" }) {
  if (!PARENT_PREMIUM.visible) return null;

  const signupUrl = parentPremiumContextUrl("ahmv-arena", { arena: arena.slug });
  const launchReady = Boolean(signupUrl) && PARENT_PREMIUM.visible && PARENT_PREMIUM.launchEnabled;

  const price = PARENT_PREMIUM.weeklyPriceCad.toLocaleString(lang === "fr" ? "fr-CA" : "en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
  });

  const features = [
    {
      icon: Navigation,
      title: lang === "fr" ? "Conseils d’accès" : "Access tips",
      body: lang === "fr"
        ? "Entrée à privilégier, porte arrière, débarcadère, stationnement et conseils de jour de match pourront être partagés par les parents."
        : "Preferred entrance, back door, drop-off, parking and game-day access tips can be shared by parents.",
    },
    {
      icon: MessageCircle,
      title: lang === "fr" ? "Commentaires de parents" : "Parent comments",
      body: lang === "fr"
        ? "Les membres pourront ajouter des notes pratiques modérées sans publier de renseignements personnels sur des enfants."
        : "Members can add moderated practical notes without publishing personal information about children.",
    },
    {
      icon: Star,
      title: lang === "fr" ? "Avis sur l’expérience" : "Experience reviews",
      body: lang === "fr"
        ? "Une évaluation membre pourra couvrir l’accès, les vestiaires, le stationnement et l’expérience générale de l’installation."
        : "A member rating can cover access, dressing rooms, parking and the overall facility experience.",
    },
    {
      icon: Bell,
      title: lang === "fr" ? "Suivi de l’aréna" : "Arena follow-up",
      body: lang === "fr"
        ? "La surface est prête pour des alertes et infolettres liées à cette installation lorsque TAKATAK activera le service."
        : "This surface is ready for facility alerts and newsletters once TAKATAK enables the service.",
    },
  ];

  return (
    <section className="overflow-hidden border border-sport/25 bg-navy-deep text-white" aria-labelledby="arena-member-tools-title">
      <div className="grid lg:grid-cols-[0.76fr_1.24fr]">
        <div className="competition-panel p-6 text-navy-foreground md:p-8">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-sport-foreground" aria-hidden />
            <p className="eyebrow text-sport-foreground">
              {lang === "fr" ? "AHMV Member · aperçu" : "AHMV Member · preview"}
            </p>
          </div>
          <h2 id="arena-member-tools-title" className="mt-3 font-display text-4xl font-extrabold uppercase leading-[0.9]">
            {lang === "fr" ? "La fiche que les parents veulent vraiment." : "The rink page parents actually need."}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-navy-foreground/72">
            {lang === "fr"
              ? "Les données officielles restent publiques. Les conseils communautaires, avis et outils de suivi de " + arena.name + " seront réservés aux membres authentifiés."
              : "Official facility data stays public. Community tips, reviews and follow-up tools for " + arena.name + " will be reserved for authenticated members."}
          </p>

          <div className="mt-6 border-y border-white/12 py-5">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/48">
              {lang === "fr" ? "Forfait membre prévu" : "Planned member plan"}
            </p>
            <p className="mt-1 font-display text-3xl font-extrabold uppercase text-white">
              {price}
              <span className="ml-2 text-xs text-white/50">{lang === "fr" ? "/ semaine" : "/ week"}</span>
            </p>
          </div>

          {launchReady && signupUrl ? (
            <a
              href={signupUrl}
              className="premium-control mt-6 flex min-h-12 items-center justify-between bg-sport px-4 text-[10px] font-bold uppercase tracking-[0.12em] text-sport-foreground"
            >
              <span>{lang === "fr" ? "Devenir membre avec TAKATAK" : "Become a member with TAKATAK"}</span>
              <Users className="size-4" />
            </a>
          ) : (
            <div className="mt-6 border border-white/12 bg-white/[0.035] p-4">
              <div className="flex items-center gap-2">
                <LockKeyhole className="size-4 text-sport-foreground" />
                <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-white/72">
                  {lang === "fr" ? "Verrouillé jusqu’à l’activation TAKATAK" : "Locked until TAKATAK activation"}
                </p>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-white/48">
                {lang === "fr"
                  ? "Le site public montre la valeur du service, mais n’accepte pas encore d’avis ni d’inscription premium sans entitlement vérifié."
                  : "The public site shows the value of the service but does not yet accept reviews or premium signups without a verified entitlement."}
              </p>
            </div>
          )}
        </div>

        <div className="grid gap-px bg-white/10 sm:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title} className="bg-competition p-6">
                <Icon className="size-5 text-sport-foreground" aria-hidden />
                <h3 className="mt-4 font-display text-2xl font-extrabold uppercase leading-[0.9]">{feature.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/54">{feature.body}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
