import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
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
  Sparkles,
  Trophy,
  Users,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import type { TeamMicrositeDefinition, MicrositeModuleKey } from "@/data/team-microsites";
import { getPublicMicrositeModules } from "@/data/team-microsites";
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
  const media = teamVisualForCategory(site.categorySlug);
  const isFr = lang === "fr";

  return (
    <main className="min-h-screen bg-[#080d22] pb-16 text-white">
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

          <div className="relative grid gap-8 px-5 py-9 sm:px-9 md:grid-cols-[minmax(0,1fr)_minmax(250px,0.44fr)] md:items-center md:gap-10 md:py-14 lg:px-14">
            <div>
              <div className="mb-6 flex items-center gap-4">
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
              <p className="mt-6 max-w-[36rem] text-sm leading-7 text-white/76 sm:text-base">
                {isFr
                  ? "Un seul endroit pour retrouver les informations de l’équipe, préparer les journées sur la glace et rester connectés. Simple pour les parents. Clair pour les responsables."
                  : "One place for team information, game-day planning and staying connected. Simple for families. Clear for team managers."}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
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
              <p className="mt-4 max-w-lg text-xs leading-5 text-white/55">
                {isFr
                  ? "L’horaire mène à la catégorie hockey féminin. Les événements exacts M12B seront associés seulement après confirmation."
                  : "The schedule opens the girls hockey category. Exact U12B events appear only after confirmation."}
              </p>
            </div>

            <aside className="rounded-[1.6rem] border border-white/20 bg-[#0e1430]/90 p-5 shadow-[0_24px_70px_-45px_rgba(0,0,0,0.8)] backdrop-blur-lg sm:p-6" aria-label={isFr ? "État des informations de l’équipe" : "Team information status"}>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#83f2e8]">
                {isFr ? "Le point de départ" : "Start here"}
              </p>
              <h2 className="mt-3 font-display text-3xl font-extrabold uppercase leading-[0.9]">
                {isFr ? "Tout au même endroit." : "Everything together."}
              </h2>
              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3 rounded-xl bg-white/[0.055] p-3">
                  <CalendarDays className="mt-0.5 size-5 shrink-0 text-[#6fe1d9]" aria-hidden="true" />
                  <div><p className="text-sm font-semibold">{isFr ? "Horaires" : "Schedules"}</p><p className="mt-1 text-xs leading-5 text-white/62">{isFr ? "Source AHMV accessible" : "AHMV source available"}</p></div>
                </div>
                <div className="flex items-start gap-3 rounded-xl bg-white/[0.055] p-3">
                  <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#6fe1d9]" aria-hidden="true" />
                  <div><p className="text-sm font-semibold">{isFr ? "Données protégées" : "Private data protected"}</p><p className="mt-1 text-xs leading-5 text-white/62">{isFr ? "Aucun effectif ni clavardage public" : "No public roster or group chat"}</p></div>
                </div>
                <div className="flex items-start gap-3 rounded-xl bg-white/[0.055] p-3">
                  <Sparkles className="mt-0.5 size-5 shrink-0 text-[#6fe1d9]" aria-hidden="true" />
                  <div><p className="text-sm font-semibold">{isFr ? "Connexions à venir" : "Coming connections"}</p><p className="mt-1 text-xs leading-5 text-white/62">{isFr ? "TeamLinkt, après autorisation" : "TeamLinkt, pending approval"}</p></div>
                </div>
              </div>
            </aside>
          </div>
        </header>

        <section id="outils-equipe" aria-labelledby="outils-equipe-titre" className="scroll-mt-24 py-12 md:py-16">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#7de7de]">
                {isFr ? "Espace Louves" : "Louves Hub"}
              </p>
              <h2 id="outils-equipe-titre" className="mt-3 max-w-[18ch] font-display text-4xl font-extrabold uppercase leading-[0.94] sm:text-5xl">
                {isFr ? "Les outils de l’équipe." : "Everything your team needs."}
              </h2>
            </div>
            <p className="max-w-[27rem] text-sm leading-6 text-white/64">
              {isFr
                ? "Les sections publiques fonctionnent dès maintenant. Les outils de gestion privée seront connectés progressivement, avec accès vérifiés."
                : "Public sections are available now. Private team tools will be connected progressively with verified access."}
            </p>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((module, index) => {
              const Icon = ICONS[module.key];
              const available = Boolean(module.href);
              const body = (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div className={"flex size-12 items-center justify-center rounded-2xl " + (available ? "bg-[#2cbebb]/15 text-[#80f5ec]" : "bg-white/[0.06] text-white/65")}>
                      <Icon className="size-6" aria-hidden="true" />
                    </div>
                    {available ? (
                      <ArrowUpRight className="size-5 text-[#83f2e8] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                    ) : module.access === "private-provider" ? (
                      <LockKeyhole className="size-4 text-white/50" aria-hidden="true" />
                    ) : <span className="font-display text-xs text-white/35">{String(index + 1).padStart(2, "0")}</span>}
                  </div>
                  <h3 className="mt-6 font-display text-2xl font-bold uppercase leading-none">{module.title[lang]}</h3>
                  <p className="mt-3 min-h-[3.5rem] text-sm leading-6 text-white/60">{module.description[lang]}</p>
                  <span className={"mt-5 inline-flex self-start rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] " + (available ? "border-[#43cfbf]/40 bg-[#43cfbf]/10 text-[#8bf3e8]" : "border-white/15 bg-white/[0.04] text-white/60")}>
                    {available
                      ? (isFr ? "Ouvrir" : "Open")
                      : module.access === "private-provider"
                        ? (isFr ? "Espace privé" : "Private area")
                        : (isFr ? "À activer" : "Coming soon")}
                  </span>
                </>
              );
              const className = "group flex min-h-[245px] flex-col rounded-[1.5rem] border border-white/15 bg-[#111936] p-5 text-white transition-[border-color,background-color,transform] duration-200 sm:p-6 " +
                (available ? "hover:-translate-y-1 hover:border-[#50d8d0]/65 hover:bg-[#152242] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#83f2e8]" : "");
              return module.href
                ? <a key={module.key} className={className} href={module.href}>{body}</a>
                : <article key={module.key} className={className}>{body}</article>;
            })}
          </div>
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
    </main>
  );
}
