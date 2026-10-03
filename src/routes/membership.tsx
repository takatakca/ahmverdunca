import { canonicalLink } from "@/lib/seo";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, CalendarDays, Check, ShieldCheck, Sparkles, Trophy, Users } from "lucide-react";
import { HouseSponsorSlot } from "@/components/house-sponsor-slot";
import { PARENT_PREMIUM } from "@/lib/parent-premium";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/membership" as any)({
  head: () => ({
    links: canonicalLink("/membership"),
    meta: [
      { title: "AHMV Member — aperçu | AHM Verdun" },
      { name: "description", content: "Aperçu de la future expérience AHMV Member pour les familles." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: MembershipDemoPage,
});

function MembershipDemoPage() {
  const { lang } = useI18n();
  const price = PARENT_PREMIUM.weeklyPriceCad.toLocaleString(lang === "fr" ? "fr-CA" : "en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
  });

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
              <span className="bg-sport px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.16em] text-sport-foreground">DEMO</span>
              <span className="border border-white/16 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-white/60">
                {lang === "fr" ? "Devanture prête à activer" : "Switch-on-ready storefront"}
              </span>
            </div>
            <p className="eyebrow mt-7 text-sport-foreground">AHMV Member</p>
            <h1 className="mt-3 max-w-[10ch] font-display text-[clamp(4rem,9vw,8rem)] font-extrabold uppercase leading-[0.8] tracking-[-0.05em]">
              {lang === "fr" ? "Plus simple pour les parents." : "Simpler for parents."}
            </h1>
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-white/65 md:text-base">
              {lang === "fr"
                ? "Le produit est présenté ici uniquement en démonstration. Aucune facturation et aucune création d’abonnement ne sont déclenchées depuis cette page."
                : "The product is shown here as a front-end demo only. No billing or subscription creation is triggered from this page."}
            </p>
          </div>

          <div className="border border-white/14 bg-white/[0.04] p-6 md:p-8">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/42">
              {lang === "fr" ? "Tarif de lancement prévu" : "Planned launch price"}
            </p>
            <p className="mt-3 font-display text-6xl font-extrabold uppercase leading-none text-white">
              {price}
              <span className="ml-2 text-sm font-bold text-white/50">{lang === "fr" ? "/ semaine" : "/ week"}</span>
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
                {lang === "fr" ? "Activation à brancher" : "Activation to connect"}
              </span>
              <span className="text-[8px] font-bold uppercase tracking-[0.16em] text-white/40">SWITCH ON</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container-site space-y-10 py-9 md:py-14">
        <section className="grid gap-px overflow-hidden border border-navy/10 bg-navy/10 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map(({ Icon, fr, en }) => (
            <article key={fr} className="bg-background p-5 md:p-6">
              <Icon className="size-5 text-sport" />
              <h2 className="mt-5 font-display text-2xl font-extrabold uppercase leading-[0.9] text-navy">{lang === "fr" ? fr : en}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {lang === "fr"
                  ? "La devanture est déjà dessinée. Le service réel pourra remplacer l’état démo lorsque la connexion autorisée sera prête."
                  : "The storefront is already designed. The live service can replace demo mode when the authorized connection is ready."}
              </p>
            </article>
          ))}
        </section>

        <section className="grid overflow-hidden border border-navy/12 lg:grid-cols-2">
          <div className="bg-background p-6 md:p-8">
            <p className="eyebrow text-sport">{lang === "fr" ? "Visiteur" : "Visitor"}</p>
            <h2 className="mt-2 font-display text-4xl font-extrabold uppercase leading-[0.88] text-navy">
              {lang === "fr" ? "Commandites visibles" : "Sponsors visible"}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
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
                ? "Lorsque le membership réel sera activé, les emplacements publicitaires pourront disparaître pour le membre vérifié."
                : "When real membership is activated, ad placements can disappear for the verified member."}
            </p>
            <div className="mt-7 space-y-3">
              {[
                lang === "fr" ? "Aucun achat aujourd’hui" : "No purchase today",
                lang === "fr" ? "Aucune carte demandée" : "No card requested",
                lang === "fr" ? "Démo visuelle seulement" : "Visual demo only",
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
