import { canonicalLink } from "@/lib/seo";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Bell, CalendarDays, Check, ShieldCheck, Sparkles, Trophy, Users } from "lucide-react";
import { HouseSponsorSlot } from "@/components/house-sponsor-slot";
import { DemoMemberSwitch } from "@/components/demo-member-switch";
import { PARENT_PREMIUM } from "@/lib/parent-premium";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/membership")({
  beforeLoad: () => {
    if (!PARENT_PREMIUM.visible) throw notFound();
  },
  head: () => ({
    links: canonicalLink("/membership"),
    meta: [
      { title: "AHMV Member — aperçu | AHM Verdun" },
      { name: "description", content: "Aperçu de la future expérience AHMV Member pour les familles." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: MembershipPreviewPage,
});

function MembershipPreviewPage() {
  const { lang } = useI18n();
  const benefits = [
    { Icon: ShieldCheck, fr: "Navigation sans publicité", en: "Ad-free browsing" },
    { Icon: Bell, fr: "Rappels et changements importants", en: "Reminders and important changes" },
    { Icon: CalendarDays, fr: "Calendrier équipe simplifié", en: "Simplified team calendar" },
    { Icon: Users, fr: "Services privés d’équipe", en: "Private team services" },
    { Icon: Trophy, fr: "Accès rapide aux parties et résultats", en: "Quick game and result access" },
    { Icon: Sparkles, fr: "Assistant AHMV enrichi", en: "Enhanced AHMV assistant" },
  ] as const;

  return (
    <>
      <section className="overflow-hidden bg-competition text-white">
        <div className="container-site grid gap-8 py-12 md:grid-cols-[1.05fr_0.95fr] md:py-16">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="bg-sport px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.16em] text-sport-foreground">{lang === "fr" ? "APERÇU" : "PREVIEW"}</span>
              <span className="border border-white/16 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-white/60">
                {lang === "fr" ? "Aperçu interactif" : "Interactive preview"}
              </span>
            </div>
            <p className="eyebrow mt-7 text-sport-foreground">AHMV Member</p>
            <h1 className="mt-3 max-w-[10ch] font-display text-[clamp(4rem,9vw,8rem)] font-extrabold uppercase leading-[0.8] tracking-[-0.05em]">
              {lang === "fr" ? "Plus simple pour les parents." : "Simpler for parents."}
            </h1>
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-white/65 md:text-base">
              {lang === "fr"
                ? "Cet aperçu permet de comparer l’expérience visiteur et l’expérience membre. Aucune facturation et aucune création d’abonnement ne sont déclenchées depuis cette page."
                : "This preview lets you compare the visitor and member experiences. No billing or subscription creation is triggered from this page."}
            </p>
          </div>

          <div className="border border-white/14 bg-white/[0.04] p-6 md:p-8">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/42">
              {lang === "fr" ? "Abonnement géré par TAKATAK" : "Subscription managed by TAKATAK"}
            </p>
            <p className="mt-3 max-w-md font-display text-4xl font-extrabold uppercase leading-[0.95] text-white">
              {lang === "fr" ? "Tarification configurée dans le catalogue TAKATAK" : "Pricing configured in the TAKATAK catalog"}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/55">
              {lang === "fr"
                ? "AHMV n’invente ni prix ni cadence de facturation. L’accès réel dépend d’un abonnement et d’un droit ahmv_access actifs dans TAKATAK."
                : "AHMV does not invent pricing or billing cadence. Real access depends on an active TAKATAK subscription and ahmv_access entitlement."}
            </p>

            <div className="mt-6 space-y-3">
              {benefits.slice(0, 4).map(({ Icon, fr, en }) => (
                <div key={fr} className="flex items-center gap-3 border-b border-white/10 pb-3">
                  <span className="flex size-8 shrink-0 items-center justify-center border border-sport/25 bg-sport/10">
                    <Icon className="size-4 text-sport-foreground" />
                  </span>
                  <span className="text-sm font-semibold text-white/78">{lang === "fr" ? fr : en}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex min-h-12 items-center justify-between border border-sport/35 bg-sport/10 px-4">
              <span className="font-display text-sm font-extrabold uppercase tracking-[0.1em] text-sport-foreground">
                {lang === "fr" ? "Aucune activation publique" : "No public activation"}
              </span>
              <span className="text-[8px] font-bold uppercase tracking-[0.16em] text-white/40">SWITCH ON</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container-site space-y-10 py-9 md:py-14">
        <DemoMemberSwitch />
        <section className="grid gap-px overflow-hidden border border-navy/10 bg-navy/10 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map(({ Icon, fr, en }) => (
            <article key={fr} className="bg-competition p-5 text-white md:p-6">
              <Icon className="size-5 text-sport-foreground" />
              <h2 className="mt-5 font-display text-2xl font-extrabold uppercase leading-[0.9] text-white">{lang === "fr" ? fr : en}</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/55">
                {lang === "fr"
                  ? "Cette fonction est illustrée ici sans créer de compte, d’abonnement ni de droit membre réel."
                  : "This capability is illustrated here without creating an account, subscription or real member entitlement."}
              </p>
            </article>
          ))}
        </section>

        <section className="grid overflow-hidden border border-navy/12 lg:grid-cols-2">
          <div className="bg-navy-deep p-6 text-white md:p-8">
            <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Visiteur" : "Visitor"}</p>
            <h2 className="mt-2 font-display text-4xl font-extrabold uppercase leading-[0.88] text-white">
              {lang === "fr" ? "Commandites visibles" : "Sponsors visible"}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/55">
              {lang === "fr"
                ? "Les espaces promotionnels maison ou AdSense restent visibles dans l’expérience publique."
                : "House promotion or AdSense placements remain visible in the public experience."}
            </p>
            <div className="mt-6">
              <HouseSponsorSlot placement="membership-free-preview" compact />
            </div>
          </div>

          <div className="competition-panel p-6 text-white md:p-8">
            <p className="eyebrow text-sport-foreground">AHMV Member</p>
            <h2 className="mt-2 font-display text-4xl font-extrabold uppercase leading-[0.88]">
              {lang === "fr" ? "Sans publicité" : "Ad-free"}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/62">
              {lang === "fr"
                ? "L’aperçu membre masque les espaces promotionnels localement afin de montrer l’expérience sans publicité; aucun statut membre réel n’est créé."
                : "The member preview hides promotional placements locally to show the ad-free experience; no real member status is created."}
            </p>
            <div className="mt-7 space-y-3">
              {[
                lang === "fr" ? "Aucun achat aujourd’hui" : "No purchase today",
                lang === "fr" ? "Aucune carte demandée" : "No card requested",
                lang === "fr" ? "Aperçu local seulement" : "Local preview only",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 border-b border-white/10 pb-3 text-sm text-white/72">
                  <Check className="size-4 text-sport-foreground" /> {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="flex justify-center">
          <Link to="/equipes" className="premium-control inline-flex min-h-12 items-center gap-2 bg-navy px-5 font-display text-xs font-extrabold uppercase tracking-[0.12em] text-white">
            {lang === "fr" ? "Voir les mini-sites d’équipes" : "See team mini-sites"}
          </Link>
        </div>
      </div>
    </>
  );
}
