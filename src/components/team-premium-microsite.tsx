import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Camera,
  ChevronDown,
  ClipboardList,
  FileText,
  HandHeart,
  LockKeyhole,
  Mail,
  MapPin,
  MessageCircle,
  Newspaper,
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
import { TeamLinktPublicWidget } from "@/components/teamlinkt-public-widget";
import { teamVisualForCategory } from "@/data/team-visuals";
import { publicTeamLinktWidgetFor } from "@/lib/teamlinkt-public-widgets";
import { useI18n } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { OFFICIAL_WEEK_ACTIVITIES } from "@/data/official-week";
import { officialWeekActivityConcernsLouves } from "@/lib/official-schedule-team";
import { formatDate } from "@/lib/i18n";
import { montrealDateKey, montrealTimeKey } from "@/lib/montreal-date";

function displayTime(value: string) {
  const [hour, minute] = value.split(":");
  return minute === "00" ? `${Number(hour)} h` : `${Number(hour)} h ${minute}`;
}

/** Upcoming activities the official weekly PDFs publish for this exact team. */
function TeamOfficialSchedule({ site, lang }: { site: TeamMicrositeDefinition; lang: Lang }) {
  const isFr = lang === "fr";
  const side = site.officialScheduleSide;
  if (!side) return null;
  const today = montrealDateKey();
  const now = montrealTimeKey();
  const upcoming = OFFICIAL_WEEK_ACTIVITIES.filter(
    (activity) =>
      officialWeekActivityConcernsLouves(activity, side) &&
      (activity.date > today || (activity.date === today && activity.end > now)),
  ).slice(0, 8);

  return (
    <section id="horaire-equipe" aria-labelledby="horaire-equipe-titre" className="scroll-mt-24 pt-9 md:pt-14">
      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#7de7de]">
        {isFr ? "Horaire officiel AHMV" : "Official AHMV schedule"}
      </p>
      <h2 id="horaire-equipe-titre" className="mt-2 font-display text-3xl font-extrabold uppercase leading-[0.98] sm:text-4xl">
        {isFr ? "Prochaines activités" : "Coming up"}
      </h2>
      {upcoming.length > 0 ? (
        <ol className="mt-5 grid gap-3 sm:grid-cols-2">
          {upcoming.map((activity) => {
            const game = /^Partie/i.test(activity.activity);
            return (
              <li key={activity.id} className="rounded-2xl border border-white/15 bg-white/[0.06] p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-lg bg-[#51e1d4] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#06152b]">
                    {formatDate(activity.date, lang, { weekday: "short", day: "numeric", month: "short" })}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/60">
                    {game ? (isFr ? "Partie" : "Game") : isFr ? "Pratique" : "Practice"}
                  </span>
                </div>
                <p className="mt-3 font-display text-2xl font-extrabold tabular-nums">
                  {displayTime(activity.start)} – {displayTime(activity.end)}
                </p>
                <p className="mt-1 text-sm font-semibold text-[#83f2e8]">{activity.activity}</p>
                <p className="mt-1 text-xs text-white/70">{activity.group}</p>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-white/70">
                  <MapPinned className="size-3.5 shrink-0 text-[#83f2e8]" aria-hidden="true" />
                  {activity.venue}
                </p>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="mt-5 rounded-2xl border border-white/15 bg-white/[0.06] p-4 text-sm text-white/75">
          {isFr
            ? "Aucune activité M12B publiée pour les prochains jours. Le prochain horaire hebdomadaire AHMV l’indiquera."
            : "No U12B activity published for the coming days. The next AHMV weekly schedule will list it."}
        </p>
      )}
      <a
        href="/horaires?team=feminin"
        className="mt-4 inline-flex min-h-11 items-center gap-2 text-xs font-extrabold uppercase tracking-[0.08em] text-[#83f2e8] hover:underline"
      >
        {isFr ? "Voir tout l’horaire du hockey féminin" : "See the full girls hockey schedule"}
        <ArrowRight className="size-4" aria-hidden="true" />
      </a>
    </section>
  );
}

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

/** No scores, standings or team events are fabricated when official sources are absent. */
export function PremiumTeamMicrosite({ site, lang }: {
  site: TeamMicrositeDefinition;
  lang: Lang;
}) {
  const { setLang } = useI18n();
  const [crestFailed, setCrestFailed] = useState(false);
  const isFr = lang === "fr";
  const teamName = site.name[lang];
  const modules = getPublicMicrositeModules(site);
  const publicModules = modules.filter((module) => Boolean(module.href));
  const pendingModules = modules.filter((module) => !module.href);
  const media = teamVisualForCategory(site.categorySlug);
  const scheduleUrl = publicModules.find((module) => module.key === "schedule")?.href ?? "/horaires?team=feminin";
  const galleryUrl = publicModules.find((module) => module.key === "gallery")?.href ?? "/galerie/hockey-feminin-2026-2027";
  const officialSchedule = publicTeamLinktWidgetFor(site.teamLinktPublicWidgets, "schedule");
  const officialScores = publicTeamLinktWidgetFor(site.teamLinktPublicWidgets, "scores");
  const officialStandings = publicTeamLinktWidgetFor(site.teamLinktPublicWidgets, "standings");

  return (
    <section data-ahmv-team-microsite={site.slug} className="min-h-screen bg-[#f4f6f9] pb-[calc(5.5rem+env(safe-area-inset-bottom))] text-[#19233c] md:pb-0">
      <a href="#contenu-equipe" className="sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-5 focus:py-3 focus:not-sr-only">
        {isFr ? "Aller à l’équipe" : "Skip to team"}
      </a>

      {/* A self-contained team app, not another stack of marketing cards. */}
      <header className="sticky top-0 z-40 border-b border-[#dce5ed] bg-white/95 shadow-[0_6px_25px_-20px_rgba(16,27,61,0.4)] backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
          <a href="/equipes" className="inline-flex min-h-11 min-w-0 items-center gap-2 rounded-xl text-sm font-bold text-[#1e3552] hover:text-[#146c86] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#159cad]">
            <ArrowLeft aria-hidden="true" className="size-5 shrink-0" />
            <span className="hidden sm:inline">{isFr ? "Équipes AHMV" : "AHMV teams"}</span>
            <span className="sm:hidden">{isFr ? "Retour" : "Back"}</span>
          </a>
          <a href="#contenu-equipe" className="inline-flex min-h-11 min-w-0 items-center gap-2 text-[#1b2441] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#159cad]">
            <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-[#d3e9ec] bg-[#e1e7ec]">
              {site.logoUrl && !crestFailed
                ? <img src={site.logoUrl} onError={() => setCrestFailed(true)} alt="" className="size-full object-cover" />
                : <span className="font-display text-sm font-bold">{site.level}</span>}
            </span>
            <span className="min-w-0 text-left">
              <span className="block truncate font-display text-xl font-extrabold uppercase leading-none">{teamName}</span>
              <span className="mt-0.5 block text-[11px] font-semibold leading-none text-[#64718a]">AHM Verdun · 2026–2027</span>
            </span>
          </a>
          <button
            type="button"
            onClick={() => setLang(isFr ? "en" : "fr")}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-[#dae2ec] bg-[#f6f8fb] px-3 text-sm font-bold text-[#1e3552] hover:border-[#169ca7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#159cad]"
            aria-label={isFr ? "Switch to English" : "Passer en français"}
          >
            {isFr ? "EN" : "FR"}
          </button>
        </div>
      </header>

        <header className="relative isolate overflow-hidden rounded-[1.75rem] border border-white/15 bg-[#10152e] shadow-[0_40px_100px_-60px_rgba(0,0,0,0.9)] md:rounded-[2.5rem]">
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            {/* Real public imagery is atmosphere only; never claim these are the M12B roster. */}
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
                  ? "Les activités M12B publiées dans l’horaire officiel AHMV sont listées plus bas."
                  : "U12B activities published in the official AHMV schedule are listed below."}
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
                {isFr ? "Parties et pratiques M12B : horaire officiel AHMV." : "U12B games and practices: official AHMV schedule."}
              </p>
            </aside>
          </div>
        </header>

        <TeamOfficialSchedule site={site} lang={lang} />

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

          <div className="relative px-5 pb-6 sm:px-9 sm:pb-8">
            <div className="-mt-12 flex flex-wrap items-end justify-between gap-3 sm:-mt-16">
              <div className="relative z-10 grid size-24 shrink-0 place-items-center overflow-hidden rounded-full border-[5px] border-white bg-[#e4e5e8] text-[#301657] shadow-[0_9px_30px_-10px_rgba(31,33,88,.35)] sm:size-32">
                {site.logoUrl && !crestFailed
                  ? <img src={site.logoUrl} onError={() => setCrestFailed(true)} alt={isFr ? "Emblème officiel fourni des Louves M12B" : "Supplied official Louves U12B crest"} className="size-full object-cover" loading="eager" />
                  : <span className="font-display text-2xl font-bold">{site.level}</span>}
              </div>
              <div className="pb-1">
                <TeamPageShare teamSlug={site.slug} teamName={teamName} lang={lang} surface="light" />
              </div>
            </div>

            <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.13em] text-[#087e92]">{isFr ? "L’espace de votre équipe" : "Your team hub"}</p>
                <h1 id="titre-louves" className="mt-1 font-display text-[clamp(2.9rem,9vw,5.6rem)] font-black uppercase leading-[.94] tracking-[-0.035em] text-[#20163d]">{teamName}</h1>
                <p className="mt-2 max-w-xl text-[15px] font-medium leading-6 text-[#4b566c]">
                  {isFr ? "L’essentiel du hockey, visible en un coup d’œil." : "Your hockey essentials, all in one glance."}
                </p>
              </div>
              <a href="#calendrier" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#1454ad] px-6 text-[15px] font-bold text-white shadow-[0_9px_24px_-12px_rgba(20,84,173,.65)] transition-colors hover:bg-[#0e4088] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#158faf]">
                <CalendarDays aria-hidden="true" className="size-5" />
                {isFr ? "Voir le calendrier" : "View schedule"}
                <ArrowRight aria-hidden="true" className="size-4" />
              </a>
            </div>
          </div>
        </section>

        {/* Actual schedule and actual scores, not fake summary numbers. */}
        <section id="outils-equipe" aria-labelledby="outils-equipe-titre" className="scroll-mt-24 pt-8 sm:pt-11">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#138e91]">{isFr ? "Tableau de bord" : "Team dashboard"}</p>
              <h2 id="outils-equipe-titre" className="mt-1 font-display text-3xl font-black uppercase leading-none text-[#1f2441] sm:text-4xl">
                {isFr ? "La saison en direct." : "Your season."}
              </h2>
            </div>
            <span className="hidden text-xs font-semibold text-[#607086] sm:block">AHMV · {site.level}</span>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <article id="calendrier" className="scroll-mt-24 overflow-hidden rounded-[1.5rem] border border-[#dce3ed] bg-white shadow-[0_15px_45px_-35px_rgba(21,41,83,.28)]">
              <div className="flex items-center gap-3 border-b border-[#e7ebf2] px-5 py-5 sm:px-7">
                <span className="grid size-11 place-items-center rounded-2xl bg-[#ddf6f3] text-[#067b83]"><CalendarDays aria-hidden="true" className="size-6" /></span>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#607086]">{isFr ? "Activités à venir" : "Upcoming activities"}</p>
                  <h3 className="font-display text-2xl font-black uppercase leading-none text-[#202b46]">{isFr ? "Horaire" : "Schedule"}</h3>
                </div>
              </div>
              {officialSchedule
                ? <div className="p-3 sm:p-5"><TeamLinktPublicWidget kind="schedule" title={isFr ? "Horaire officiel TeamLinkt" : "Official TeamLinkt schedule"} widgets={site.teamLinktPublicWidgets} lang={lang} /></div>
                : <div className="px-5 py-7 sm:px-7 sm:py-9">
                    <p className="text-xl font-bold leading-7 text-[#24314d]">
                      {isFr ? "Les prochains rendez-vous des Louves" : "Upcoming Louves activities"}
                    </p>
                    <p className="mt-2 max-w-xl text-[15px] leading-7 text-[#55627b]">
                      {isFr
                        ? "Les heures spécifiques M12B restent à confirmer. En attendant, l’horaire public du hockey féminin AHMV est accessible directement."
                        : "Exact U12B times still need confirmation. The official AHMV girls hockey schedule is available now."}
                    </p>
                    <a href={scheduleUrl} className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#1256a6] px-5 text-[15px] font-bold text-white hover:bg-[#0c3f82] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#099ba8]">
                      {isFr ? "Consulter l’horaire AHMV" : "Open AHMV schedule"}
                      <ArrowUpRight aria-hidden="true" className="size-5" />
                    </a>
                  </div>}
            </article>

            <article id="pointages" className="scroll-mt-24 overflow-hidden rounded-[1.5rem] bg-[#161d43] text-white shadow-[0_15px_45px_-35px_rgba(21,41,83,.3)]">
              <div className="flex items-center gap-3 border-b border-white/15 px-5 py-5 sm:px-7">
                <span className="grid size-11 place-items-center rounded-2xl bg-[#312b72] text-[#b6fffb]"><Trophy aria-hidden="true" className="size-6" /></span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#b0c0df]">{isFr ? "Matchs et classements" : "Games and standings"}</p>
                  <h3 className="font-display text-2xl font-black uppercase leading-none">{isFr ? "Pointages" : "Scores"}</h3>
                </div>
              </div>
              {officialScores
                ? <div className="p-3 sm:p-5"><TeamLinktPublicWidget kind="scores" title={isFr ? "Pointages officiels TeamLinkt" : "Official TeamLinkt scores"} widgets={site.teamLinktPublicWidgets} lang={lang} /></div>
                : <div className="px-5 py-7 sm:px-7 sm:py-9">
                    <p className="text-xl font-bold leading-7">{isFr ? "Place aux résultats." : "The results matter."}</p>
                    <p className="mt-2 text-[15px] leading-7 text-[#c6d1e7]">
                      {isFr
                        ? "Aucun pointage M12B vérifié à afficher pour le moment. Les résultats AHMV publiés restent accessibles."
                        : "No verified U12B score is available to display yet. You can still view published AHMV results."}
                    </p>
                    <a href="/equipes#resultats" className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#8acfcf] bg-[#275b8c] px-5 text-[15px] font-bold text-white hover:bg-[#326fa7] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#b6fffb]">
                      {isFr ? "Voir les résultats AHMV" : "See AHMV results"}
                      <ArrowUpRight aria-hidden="true" className="size-5" />
                    </a>
                  </div>}
            </article>
          </div>

          {officialStandings && (
            <div className="mt-4">
              <TeamLinktPublicWidget kind="standings" title={isFr ? "Classements officiels TeamLinkt" : "Official TeamLinkt standings"} widgets={site.teamLinktPublicWidgets} lang={lang} />
            </div>
          )}
        </section>

        <section id="photos-equipe" aria-labelledby="titre-photos" className="scroll-mt-24 mt-8 overflow-hidden rounded-[1.65rem] bg-[#221943] text-white sm:mt-11">
          <div className="grid md:grid-cols-[1.06fr_0.94fr]">
            <div className="relative min-h-52 overflow-hidden bg-[#304e91] sm:min-h-72">
              {media && <img src={media.url} alt={media.alt[lang]} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />}
              <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(21,26,62,.5))]" />
              <span className="absolute bottom-4 left-4 rounded-full bg-[#101d3e]/75 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
                {isFr ? "Archives publiques · hockey féminin AHMV" : "Public archive · AHMV girls hockey"}
              </span>
            </div>
            <div className="flex flex-col justify-center px-6 py-8 sm:px-9 sm:py-12">
              <Camera aria-hidden="true" className="size-9 text-[#8ce3df]" />
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.13em] text-[#97dadc]">{isFr ? "Sur et hors de la glace" : "On and off the ice"}</p>
              <h2 id="titre-photos" className="mt-2 font-display text-4xl font-black uppercase leading-[0.98] sm:text-5xl">{isFr ? "La vie en images." : "Hockey in pictures."}</h2>
              <p className="mt-4 max-w-md text-[15px] leading-7 text-[#d4d6e5]">
                {isFr ? "Des moments du hockey féminin AHMV, sans attribuer ces photos à l’effectif M12B." : "Moments from AHMV girls hockey, without identifying the pictured players as the U12B roster."}
              </p>
              <a href={galleryUrl} className="mt-5 inline-flex min-h-12 self-start items-center gap-2 rounded-xl bg-white px-5 text-[15px] font-bold text-[#211b42] hover:bg-[#dcf7f4] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#9df4e6]">
                {isFr ? "Explorer les photos" : "Explore photos"} <ArrowRight aria-hidden="true" className="size-5" />
              </a>
            </div>
          </div>
        </section>

        <section id="vie-equipe" className="scroll-mt-24 mt-8 grid gap-4 lg:grid-cols-[1.08fr_0.92fr] sm:mt-11" aria-label={isFr ? "Vie de l’équipe" : "Team life"}>
          <div className="overflow-hidden rounded-[1.6rem] border border-[#dce3ec] bg-white px-6 py-7 sm:px-8 sm:py-9">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-[#e7e8fb] text-[#594b9e]"><Newspaper aria-hidden="true" className="size-6" /></span>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.13em] text-[#6a678b]">{isFr ? "La communauté" : "The community"}</p>
                <h2 className="font-display text-3xl font-black uppercase leading-none">{isFr ? "Nouvelles" : "News"}</h2>
              </div>
            </div>
            <p className="mt-5 text-[15px] leading-7 text-[#526078]">
              {isFr
                ? "Les annonces publiques validées par AHM Verdun sont disponibles dans les nouvelles de l’association. La publication automatique depuis TeamLinkt nécessite un accès officiel."
                : "Approved public AHM Verdun news is available on the association's news page. Automatic TeamLinkt syndication requires authorized access."}
            </p>
            <a href="/nouvelles" className="mt-4 inline-flex min-h-12 items-center gap-2 font-bold text-[#155c9e] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#159cad]">
              {isFr ? "Lire les nouvelles AHMV" : "Read AHMV news"} <ArrowUpRight aria-hidden="true" className="size-5" />
            </a>
          </div>
          <div className="overflow-hidden rounded-[1.6rem] bg-[linear-gradient(145deg,#2b2356,#171d48)] px-6 py-7 text-white sm:px-8 sm:py-9">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-[#51458c] text-[#a2f6ed]"><ShieldCheck aria-hidden="true" className="size-6" /></span>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.13em] text-[#b5d2ec]">TeamLinkt</p>
                <h2 className="font-display text-3xl font-black uppercase leading-none">{isFr ? "L’espace privé" : "Private team hub"}</h2>
              </div>
            </div>
            <p className="mt-5 text-[15px] leading-7 text-[#d6d7e8]">
              {isFr
                ? "Messages, présences, sondages et effectif restent réservés aux membres autorisés. Rien de privé n’est affiché sans connexion approuvée."
                : "Messages, attendance, polls and rosters stay restricted to authorized members. No private information is exposed without an approved connection."}
            </p>
            <a href={`mailto:${SITE.girlsHockeyEmail}?subject=${encodeURIComponent("AHMV — Louves M12B — TeamLinkt")}`} className="mt-4 inline-flex min-h-12 items-center gap-2 font-bold text-[#a1f0e5] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a1f0e5]">
              <Mail aria-hidden="true" className="size-5" /> {isFr ? "Communiquer avec le programme" : "Contact the program"} <ArrowUpRight aria-hidden="true" className="size-4" />
            </a>
          </div>
        </section>

        <section className="mt-8 sm:mt-10" aria-label={isFr ? "Préparation des familles" : "Family preparation"}>
          <TeamIceBagChecklist teamSlug={site.slug} lang={lang} />
        </section>

        <section id="services-equipe" className="scroll-mt-24 pb-9 pt-7 sm:pb-14" aria-label={isFr ? "Autres services" : "Other team services"}>
          <details className="group overflow-hidden rounded-[1.5rem] border border-[#d8e2ec] bg-white shadow-[0_15px_40px_-35px_rgba(21,41,83,.26)]">
            <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-left marker:hidden hover:bg-[#f4f8fa] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#168a99] [&::-webkit-details-marker]:hidden sm:px-7">
              <span>
                <span className="block font-display text-xl font-extrabold uppercase text-[#25304a]">{isFr ? "Tous les services de l’équipe" : "All team services"}</span>
                <span className="mt-1 block text-[13px] leading-5 text-[#627086]">
                  {isFr ? "Documents, messages, membres, sondages et plus — selon les accès autorisés" : "Documents, messages, members, polls and more — based on authorized access"}
                </span>
              </span>
              <ChevronDown aria-hidden="true" className="size-6 shrink-0 text-[#247e89] transition-transform group-open:rotate-180 motion-reduce:transition-none" />
            </summary>
            <div className="grid gap-2 border-t border-[#e1e7ee] p-3 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
              {pendingModules.map((module) => {
                const Icon = ICONS[module.key];
                const isPrivate = module.access === "private-provider";
                return (
                  <article key={module.key} className="rounded-xl border border-[#e1e5ec] bg-[#f7f9fc] p-4">
                    <div className="flex items-center gap-3">
                      <Icon aria-hidden="true" className="size-5 shrink-0 text-[#2a8794]" />
                      <h3 className="font-display text-lg font-bold uppercase text-[#28324b]">{module.title[lang]}</h3>
                    </div>
                    <p className="mt-2 text-[13px] leading-6 text-[#56637a]">{module.description[lang]}</p>
                    <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#53617a]">
                      {isPrivate && <LockKeyhole aria-hidden="true" className="size-4" />}
                      {isPrivate ? (isFr ? "Accès privé" : "Private access") : (isFr ? "En préparation" : "In preparation")}
                    </p>
                  </article>
                );
              })}
            </div>
          </details>
        </section>
      </div>

      <footer className="border-t border-[#dfe6ef] bg-white px-5 py-6 text-center text-[13px] text-[#5e6b80]">
        <span className="font-bold text-[#253251]">AHM Verdun · {teamName}</span>
        <span className="mx-2" aria-hidden="true">·</span>
        <a href="/arenas" className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-[#155b9d] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#159cad]">
          <MapPin aria-hidden="true" className="size-4" />{isFr ? "Arénas" : "Arenas"}
        </a>
      </footer>

      <nav aria-label={isFr ? "Navigation de l’équipe" : "Team navigation"} className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 border-t border-[#d8e1eb] bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_30px_-18px_rgba(21,41,83,.3)] backdrop-blur-xl md:hidden">
        {[
          { label: isFr ? "Équipe" : "Team", href: "#contenu-equipe", Icon: Users },
          { label: isFr ? "Horaire" : "Schedule", href: "#calendrier", Icon: CalendarDays },
          { label: isFr ? "Pointages" : "Scores", href: "#pointages", Icon: Trophy },
          { label: isFr ? "Photos" : "Photos", href: "#photos-equipe", Icon: Camera },
        ].map(({ label, href, Icon }) => (
          <a key={href} href={href} className="flex min-h-[68px] flex-col items-center justify-center gap-1 text-[12px] font-semibold text-[#2d3952] transition-colors hover:bg-[#eff8f8] hover:text-[#087d86] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#168c94]">
            <Icon aria-hidden="true" className="size-5 text-[#17858f]" />
            {label}
          </a>
        ))}
      </nav>
    </section>
  );
}
