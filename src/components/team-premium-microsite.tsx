import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  Camera,
  ClipboardList,
  FileText,
  HandHeart,
  Heart,
  LockKeyhole,
  Mail,
  MapPinned,
  MessageCircle,
  ShieldCheck,
  Trophy,
  Users,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import type { TeamMicrositeDefinition, MicrositeModuleKey } from "@/data/team-microsites";
import { getPublicMicrositeModules } from "@/data/team-microsites";
import { TeamIceBagChecklist } from "@/components/team-ice-bag-checklist";
import { TeamPageShare } from "@/components/team-page-share";
import { teamVisualForCategory } from "@/data/team-visuals";
import { SITE } from "@/lib/site";

type Lang = "fr" | "en";

const ICONS = {
  schedule: CalendarDays,
  gallery: Camera,
  documents: FileText,
  messages: MessageCircle,
  roster: Users,
  polls: ClipboardList,
  challenges: Trophy,
  fundraising: HandHeart,
  budget: Wallet,
} satisfies Record<MicrositeModuleKey, typeof CalendarDays>;

function identity(site: TeamMicrositeDefinition, lang: Lang) {
  return site.name[lang];
}

/**
 * Cloneable premium microsite layout for exact team identities.
 * Public content only: it never fetches or fakes TeamLinkt private data.
 */
export function PremiumTeamMicrosite({ site, lang }: {
  site: TeamMicrositeDefinition;
  lang: Lang;
}) {
  const [crestFailed, setCrestFailed] = useState(false);
  const accent = site.accent === "louves";
  const modules = getPublicMicrositeModules(site);
  const publicModules = modules.filter((module) => Boolean(module.href));
  const pendingModules = modules.filter((module) => !module.href);
  const media = teamVisualForCategory(site.categorySlug);
  const isFr = lang === "fr";

  return (
    <section data-ahmv-team-microsite={site.slug} className="min-h-screen bg-[#080d22] pb-16 text-white">
      <div className="container-site">
        <nav aria-label={isFr ? "Fil d’Ariane" : "Breadcrumbs"} className="flex flex-wrap items-center gap-2 py-5 text-xs text-white/60">
          <a href="/equipes" className="inline-flex min-h-11 items-center gap-2 underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#28c2c2]">
            <ArrowLeft aria-hidden="true" className="size-4" />
            {isFr ? "Toutes les équipes" : "All teams"}
          </a>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="font-semibold text-white">{identity(site, lang)}</span>
        </nav>

        <header className="relative isolate overflow-hidden rounded-[1.75rem] border border-white/15 bg-[#10152e] shadow-[0_40px_100px_-60px_rgba(0,0,0,0.9)] md:rounded-[2.5rem]">
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            {media && <img src={media.url} alt="" loading="eager" decoding="async" className="size-full object-cover opacity-30" />}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,13,34,0.95)_3%,rgba(8,13,34,0.73)_61%,rgba(8,13,34,0.45))]" />
            {accent && <div className="absolute -right-24 -top-32 size-[28rem] rounded-full bg-[#19b6b5]/15 blur-3xl" />}
            {accent && <div className="absolute -bottom-44 right-20 size-80 rounded-full bg-[#7d56bb]/20 blur-3xl" />}
          </div>

          <div className="relative grid gap-6 px-5 py-7 sm:px-9 sm:py-9 md:grid-cols-[minmax(0,1fr)_minmax(240px,0.42fr)] md:items-center md:gap-10 md:py-12 lg:px-14">
            <div>
              <div className="mb-4 flex items-center gap-4">
                <div className="relative grid size-24 shrink-0 place-items-center overflow-hidden rounded-full border-[3px] border-[#26bebd]/60 bg-[#dcdce1] text-[#271448] shadow-[0_0_34px_-8px_rgba(38,190,189,0.6)] sm:size-28">
                  <span className="font-display text-xl font-extrabold" aria-hidden="true">{site.level}</span>
                  {site.logoUrl && !crestFailed && (
                    <img src={site.logoUrl} alt={isFr ? "Emblème fourni des Louves M12B" : "Supplied Louves U12B crest"} onError={() => setCrestFailed(true)} className="absolute inset-0 size-full object-cover" loading="eager" decoding="async" />
                  )}
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#75ece6]">
                    {isFr ? "Hockey féminin · Verdun" : "Girls hockey · Verdun"}
                  </p>
                  <p className="mt-1 text-xs font-semibold tracking-[0.08em] text-white/55">AHMV · 2026–2027</p>
                </div>
              </div>

              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#83f2e8]">
                {isFr ? "Votre équipe, votre espace" : "Your team, your space"}
              </p>
              <h1 className="mt-3 max-w-[11ch] font-display text-[clamp(3.6rem,8vw,7.3rem)] font-black uppercase leading-[0.84] tracking-[-0.055em]">
                {identity(site, lang)}
              </h1>
              <p className="mt-4 max-w-[36rem] text-sm leading-6 text-white/80 sm:text-base sm:leading-7">
                {isFr
                  ? "Un seul endroit pour retrouver les informations de l’équipe, préparer les journées sur la glace et rester connectés. Simple pour les parents. Clair pour les responsables."
                  : "One place for team information, game-day planning and staying connected. Simple for families. Clear for team managers."}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a href="/horaires?team=feminin" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#51e1d4] px-5 text-xs font-extrabold uppercase tracking-[0.08em] text-[#06152b] transition-transform hover:-translate-y-0.5 hover:bg-[#83f2e8] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#83f2e8]">
                  <CalendarDays className="size-4" aria-hidden="true" />
                  {isFr ? "Horaire AHMV" : "AHMV schedule"}
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </a>
                <a href="#outils-equipe" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/35 bg-white/10 px-5 text-xs font-extrabold uppercase tracking-[0.08em] text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                  {isFr ? "Explorer l’espace" : "Explore the hub"}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </a>
              </div>
              <p className="mt-3 max-w-lg text-[11px] leading-5 text-white/65">
                {isFr
                  ? "L’horaire mène à la catégorie hockey féminin. Les événements exacts M12B seront associés seulement après confirmation."
                  : "The schedule opens the girls hockey category. Exact U12B events appear only after confirmation."}
              </p>
              <TeamPageShare teamSlug={site.slug} teamName={identity(site, lang)} lang={lang} />
            </div>

            <aside className="hidden rounded-[1.5rem] border border-white/20 bg-[#0e1430]/90 p-4 shadow-[0_24px_70px_-45px_rgba(0,0,0,0.8)] backdrop-blur-lg md:block md:p-6" aria-label={isFr ? "État des informations de l’équipe" : "Team information status"}>
              <div className="flex items-center gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#37d1c5]/15 text-[#83f2e8]">
                  <ShieldCheck aria-hidden="true" className="size-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#83f2e8]">{isFr ? "Informations vérifiées" : "Verified information"}</p>
                  <h2 className="mt-1 font-display text-xl font-extrabold uppercase leading-none">{isFr ? "L’essentiel, sans détour." : "Just what matters."}</h2>
                </div>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 md:grid-cols-1">
                <p className="flex items-start gap-2 rounded-xl bg-white/[0.055] px-3 py-2.5 text-xs leading-5 text-white/78">
                  <CalendarDays aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#83f2e8]" />
                  {isFr ? "Calendrier AHMV accessible" : "AHMV calendar available"}
                </p>
                <p className="flex items-start gap-2 rounded-xl bg-white/[0.055] px-3 py-2.5 text-xs leading-5 text-white/78">
                  <LockKeyhole aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#83f2e8]" />
                  {isFr ? "Messages et membres : accès privé TeamLinkt" : "Messages and members: private TeamLinkt access"}
                </p>
              </div>
              <p className="mt-3 text-[11px] leading-5 text-white/64">
                {isFr ? "Les activités M12B précises seront publiées après confirmation." : "Exact U12B activities will appear once confirmed."}
              </p>
            </aside>
          </div>
        </header>

        <section id="outils-equipe" aria-labelledby="outils-equipe-titre" className="scroll-mt-24 py-9 md:py-14">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#7de7de]">
                {isFr ? "Votre accès rapide" : "Your quick access"}
              </p>
              <h2 id="outils-equipe-titre" className="mt-2 max-w-[18ch] font-display text-3xl font-extrabold uppercase leading-[0.98] sm:text-4xl md:text-5xl">
                {isFr ? "Prêt pour la glace." : "Ready for the ice."}
              </h2>
            </div>
            <p className="max-w-[29rem] text-sm leading-6 text-white/72">
              {isFr
                ? "Deux accès directs pour les familles. Le reste de l’espace grandira avec les informations approuvées."
                : "Two direct links for families. The rest of this space will grow as information is approved."}
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {publicModules.map((module) => {
              const Icon = ICONS[module.key];
              return (
                <a
                  key={module.key}
                  href={module.href}
                  className="group relative flex min-h-[190px] flex-col justify-between overflow-hidden rounded-[1.5rem] border border-[#5fe1d7]/25 bg-[linear-gradient(145deg,#152b49,#101833)] p-5 text-white shadow-[0_18px_48px_-36px_rgba(0,0,0,0.9)] transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-1 hover:border-[#70f1e5]/75 hover:shadow-[0_28px_58px_-37px_rgba(33,180,185,0.3)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#83f2e8] motion-reduce:transform-none motion-reduce:transition-none sm:min-h-[225px] sm:p-7"
                >
                  <div className="pointer-events-none absolute -right-12 -top-14 size-44 rounded-full bg-[#38cbbf]/10 blur-3xl" aria-hidden="true" />
                  <div className="relative flex items-center justify-between">
                    <span className="grid size-12 place-items-center rounded-2xl bg-[#2cbebb]/15 text-[#80f5ec]"><Icon className="size-6" aria-hidden="true" /></span>
                    <ArrowUpRight className="size-5 text-[#83f2e8] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
                  </div>
                  <div className="relative mt-6">
                    <h3 className="font-display text-[clamp(1.4rem,3vw,2rem)] font-extrabold uppercase leading-none">{module.title[lang]}</h3>
                    <p className="mt-2 max-w-md text-xs leading-5 text-white/72 sm:text-sm sm:leading-6">{module.description[lang]}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#8bf3e8]">
                      {isFr ? "Ouvrir la section" : "Open section"} <ArrowRight className="size-3.5" aria-hidden="true" />
                    </span>
                  </div>
                </a>
              );
            })}
          </div>

          <TeamIceBagChecklist teamSlug={site.slug} lang={lang} />

          <details className="group mt-5 overflow-hidden rounded-[1.5rem] border border-white/15 bg-[#111936]">
            <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-left marker:hidden hover:bg-white/[0.05] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#83f2e8] [&::-webkit-details-marker]:hidden sm:px-6">
              <span>
                <span className="block font-display text-base font-extrabold uppercase text-white sm:text-lg">
                  {isFr ? "Tous les services de l’équipe" : "All team services"}
                </span>
                <span className="mt-1 block text-xs leading-5 text-white/64">
                  {isFr ? "Documents, messages, membres, sondages et plus · Accès privés ou à venir" : "Documents, messages, members, polls and more · Private or coming soon"}
                </span>
              </span>
              <ChevronDown aria-hidden="true" className="size-5 shrink-0 text-[#8bf3e8] transition-transform group-open:rotate-180 motion-reduce:transition-none" />
            </summary>
            <div className="grid gap-2 border-t border-white/10 p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-3">
              {pendingModules.map((module) => {
                const Icon = ICONS[module.key];
                const isPrivate = module.access === "private-provider";
                return (
                  <article key={module.key} className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
                    <div className="flex items-center gap-3">
                      <Icon aria-hidden="true" className="size-5 shrink-0 text-[#89eae4]" />
                      <h3 className="font-display text-sm font-bold uppercase tracking-[0.04em] text-white">{module.title[lang]}</h3>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-white/66">{module.description[lang]}</p>
                    <p className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-white/66">
                      {isPrivate && <LockKeyhole aria-hidden="true" className="size-3.5" />}
                      {isPrivate ? (isFr ? "Accès privé" : "Private access") : (isFr ? "En préparation" : "In preparation")}
                    </p>
                  </article>
                );
              })}
            </div>
          </details>
        </section>

        <section aria-label={isFr ? "TeamLinkt et accès confidentiel" : "TeamLinkt and private access"} className="grid overflow-hidden rounded-[1.75rem] border border-[#9962db]/30 bg-[linear-gradient(110deg,#1b163c,#0e2138)] md:grid-cols-[1.15fr_0.85fr] md:rounded-[2rem]">
          <div className="p-6 sm:p-9">
            <div className="flex items-center gap-2 text-[#dab9ff]"><LockKeyhole className="size-5" aria-hidden="true" /><span className="text-[10px] font-bold uppercase tracking-[0.2em]">TeamLinkt</span></div>
            <h2 className="mt-4 font-display text-3xl font-extrabold uppercase leading-[0.95] sm:text-4xl">
              {isFr ? "La vie privée reste privée." : "Your team stays private."}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">
              {isFr
                ? "Messages, présences, effectif et sondages demeurent dans TeamLinkt. Leur intégration nécessite les permissions du responsable et une solution officielle sécurisée."
                : "Messages, attendance, rosters and polls remain in TeamLinkt. Connecting them requires team manager approval and an official secure integration."}
            </p>
          </div>
          <div className="flex flex-col justify-center gap-4 border-t border-white/10 bg-white/[0.035] p-6 sm:p-9 md:border-l md:border-t-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/58">
              {isFr ? "Pour enrichir ce microsite" : "Help us build this team hub"}
            </p>
            <a href={`mailto:${SITE.girlsHockeyEmail}?subject=${encodeURIComponent("AHMV — Louves M12B — Microsite")}`} className="inline-flex min-h-12 items-center justify-between gap-3 rounded-xl bg-white px-5 text-xs font-bold uppercase tracking-wide text-[#171331] transition-colors hover:bg-[#d4f9f5] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#83f2e8]">
              <span className="inline-flex items-center gap-2"><Mail className="size-4" aria-hidden="true" />{isFr ? "Communiquer avec le programme" : "Contact the girls hockey program"}</span>
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
            <p className="text-xs leading-5 text-white/55">
              {isFr ? "Proposez des informations officielles pour vérification avant publication." : "Submit approved team information for review before publication."}
            </p>
          </div>
        </section>

        <footer className="flex flex-col justify-between gap-4 pt-10 text-xs text-white/50 sm:flex-row sm:items-center">
          <span className="inline-flex items-center gap-2"><Heart className="size-4 text-[#80f5ec]" aria-hidden="true" />{isFr ? "Louves M12B · Microsite de l’équipe" : "Louves U12B · Team microsite"}</span>
          <a href="/arenas" className="inline-flex min-h-11 items-center gap-2 font-semibold text-white/70 underline-offset-4 hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#83f2e8]">
            <MapPinned className="size-4" aria-hidden="true" />{isFr ? "Arénas et itinéraires" : "Arenas and directions"}<ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </footer>
      </div>
    </section>
  );
}
