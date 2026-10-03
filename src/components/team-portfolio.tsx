import {
  Bookmark,
  BookmarkCheck,
  CalendarDays,
  FileText,
  HandHeart,
  Images,
  Newspaper,
  Radio,
  Trophy,
  Users,
} from "lucide-react";
import type { PublicTeamDirectoryEntry } from "@/data/team-directory";
import { officialTeamResultsUrl, legacyTeamScheduleUrl } from "@/data/team-directory";
import { teamPortalServices, type TeamPortalModule } from "@/data/team-portal";
import { usePreferredTeam } from "@/lib/team-preference";
import { OFFICIAL_MEDIA } from "@/data/official-media";

interface TeamPortfolioProps {
  team: PublicTeamDirectoryEntry;
  lang: "fr" | "en";
  newsCount: number;
  albumCount: number;
  approvedSocialCount: number;
}

const icons: Record<TeamPortalModule, typeof Trophy> = {
  schedule: CalendarDays,
  results: Trophy,
  social: Radio,
  news: Newspaper,
  photos: Images,
  volunteers: Users,
  fundraising: HandHeart,
  documents: FileText,
};

export function TeamPortfolio({
  team,
  lang,
  newsCount,
  albumCount,
  approvedSocialCount,
}: TeamPortfolioProps) {
  const { isTeamSelected, toggleSelectedTeam } = usePreferredTeam();
  const selected = isTeamSelected(team.legacyScheduleTeamId);
  const services = teamPortalServices(team);

  const labels: Record<TeamPortalModule, { fr: string; en: string }> = {
    schedule: { fr: "Horaire", en: "Schedule" },
    results: { fr: "Résultats", en: "Results" },
    social: { fr: "Réseaux sociaux", en: "Social feeds" },
    news: { fr: "Mini-blog", en: "Mini-blog" },
    photos: { fr: "Portfolio photos", en: "Photo portfolio" },
    volunteers: { fr: "Bénévoles", en: "Volunteers" },
    fundraising: { fr: "Collecte d’équipe", en: "Team fundraising" },
    documents: { fr: "Documents", en: "Documents" },
  };

  const details = (module: TeamPortalModule) => {
    if (module === "news") {
      return newsCount > 0
        ? (lang === "fr" ? `${newsCount} nouvelle(s) liée(s)` : `${newsCount} linked story/stories`)
        : (lang === "fr" ? "Prêt pour les publications révisées" : "Ready for reviewed posts");
    }
    if (module === "photos") {
      return albumCount > 0
        ? (lang === "fr" ? `${albumCount} album(s) lié(s)` : `${albumCount} linked album(s)`)
        : (lang === "fr" ? "Prêt pour les médias approuvés" : "Ready for approved media");
    }
    if (module === "social") {
      return approvedSocialCount > 0
        ? (lang === "fr" ? `${approvedSocialCount} compte(s) approuvé(s)` : `${approvedSocialCount} approved account(s)`)
        : (lang === "fr" ? "Connexion via GROUPE TAKATAK à venir" : "GROUPE TAKATAK connection upcoming");
    }
    if (module === "fundraising") {
      return lang === "fr"
        ? "Paiement et campagne à activer après validation"
        : "Payments and campaign activate only after approval";
    }
    if (module === "volunteers") {
      return lang === "fr"
        ? "Demandes d’aide et besoins d’équipe"
        : "Help requests and team needs";
    }
    if (module === "documents") {
      return lang === "fr"
        ? "PDF et documents révisés avant publication"
        : "PDFs and documents reviewed before publishing";
    }
    return lang === "fr" ? "Source hockey officielle" : "Official hockey source";
  };

  const statusLabel = (module: TeamPortalModule) => {
    if (module === "schedule" || module === "results") return lang === "fr" ? "OFFICIEL" : "OFFICIAL";
    if (module === "social" && approvedSocialCount > 0) return lang === "fr" ? "APPROUVÉ" : "APPROVED";
    if (module === "social" || module === "fundraising") return lang === "fr" ? "À CONNECTER" : "CONNECT";
    return lang === "fr" ? "PRÊT" : "READY";
  };

  return (
    <section className="overflow-hidden border border-navy/12 bg-background">
      <div className="grid bg-competition text-white lg:grid-cols-[1.2fr_0.8fr]">
        <div className="p-6 md:p-8">
          <p className="eyebrow text-sport-foreground">
            {lang === "fr" ? "Mini-site équipe" : "Team mini-site"}
          </p>
          <h2 className="mt-2 max-w-3xl font-display text-4xl font-extrabold uppercase leading-[0.86] tracking-[-0.035em] md:text-5xl">
            {team.name}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/65">
            {lang === "fr"
              ? "Un portfolio public propre à cette équipe. Les résultats restent officiels; les réseaux, campagnes et automatisations seront servis par GROUPE TAKATAK lorsqu’ils sont connectés et autorisés."
              : "A public portfolio for this exact team. Results remain official; social feeds, campaigns and automations will be served by GROUPE TAKATAK when connected and authorized."}
          </p>
        </div>
        <div className="flex flex-col justify-center border-t border-white/12 p-6 lg:border-l lg:border-t-0 md:p-8">
          <button
            type="button"
            onClick={() => toggleSelectedTeam(team.legacyScheduleTeamId)}
            className={
              selected
                ? "premium-control flex min-h-12 items-center justify-between bg-sport px-4 font-display text-sm font-bold uppercase tracking-[0.1em] text-sport-foreground"
                : "premium-control flex min-h-12 items-center justify-between border border-white/18 px-4 font-display text-sm font-bold uppercase tracking-[0.1em] text-white hover:border-sport"
            }
          >
            <span>{selected
              ? (lang === "fr" ? "Dans mes équipes" : "In my teams")
              : (lang === "fr" ? "Ajouter à mes équipes" : "Add to my teams")}</span>
            {selected ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
          </button>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/38">
            {lang === "fr"
              ? "La sélection est enregistrée sur cet appareil."
              : "Selection is saved on this device."}
          </p>
        </div>
      </div>

      {team.categorySlug === "m11" && (
        <div className="grid h-[260px] grid-cols-2 grid-rows-2 gap-px bg-white/10 sm:h-[340px] lg:grid-cols-[1.25fr_0.75fr]">
          <a
            href={OFFICIAL_MEDIA.tournamentM11Primary.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative row-span-2 overflow-hidden bg-navy"
          >
            <img
              src={OFFICIAL_MEDIA.tournamentM11Primary.url}
              alt={lang === "fr" ? OFFICIAL_MEDIA.tournamentM11Primary.alt.fr : OFFICIAL_MEDIA.tournamentM11Primary.alt.en}
              loading="eager"
              decoding="async"
              className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.035]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_44%,rgba(7,16,43,0.84)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-sport-foreground">
                {lang === "fr" ? "Archives M11 · Verdun" : "U11 archives · Verdun"}
              </p>
              <p className="mt-1 font-display text-2xl font-extrabold uppercase leading-[0.9] text-white sm:text-3xl">
                {lang === "fr" ? "Le tournoi fait partie du mini-site" : "The tournament lives inside the team hub"}
              </p>
            </div>
          </a>

          {[OFFICIAL_MEDIA.tournamentM11Secondary, OFFICIAL_MEDIA.tournamentM11Tertiary].map((media) => (
            <a
              key={media.url}
              href={media.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden bg-navy"
            >
              <img
                src={media.url}
                alt={lang === "fr" ? media.alt.fr : media.alt.en}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-navy/10 transition-colors group-hover:bg-transparent" />
            </a>
          ))}
        </div>
      )}

      <div className="grid gap-px bg-navy/10 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((service) => {
          const Icon = icons[service.module];
          const label = labels[service.module][lang];
          const isOfficial = service.module === "schedule" || service.module === "results";
          const href =
            service.module === "schedule"
              ? legacyTeamScheduleUrl(team)
              : service.module === "results"
                ? officialTeamResultsUrl(team)
                : service.module === "news"
                  ? "#nouvelles-equipe"
                  : service.module === "photos"
                    ? "#photos-equipe"
                    : service.module === "social"
                      ? "#social-equipe"
                      : service.module === "volunteers"
                        ? "#benevolat-equipe"
                        : service.module === "fundraising"
                          ? "#collecte-equipe"
                          : service.module === "documents"
                            ? "#documents-equipe"
                            : undefined;

          const card = (
            <>
              <div className="flex items-start justify-between gap-3">
                <Icon className="size-5 text-sport" aria-hidden />
                <span className="text-[8px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  {statusLabel(service.module)}
                </span>
              </div>
              <div className="mt-9">
                <h3 className="font-display text-2xl font-extrabold uppercase leading-[0.9] text-navy">{label}</h3>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{details(service.module)}</p>
                <p className="mt-4 text-[8px] font-bold uppercase tracking-[0.16em] text-navy/38">
                  {service.provider}
                </p>
              </div>
            </>
          );

          return href ? (
            <a
              key={service.module}
              href={href}
              target={isOfficial ? "_blank" : undefined}
              rel={isOfficial ? "noopener noreferrer" : undefined}
              className="interactive-surface min-h-48 bg-background p-5 hover:bg-ice/55"
            >
              {card}
            </a>
          ) : (
            <div key={service.module} className="min-h-48 bg-background p-5">
              {card}
            </div>
          );
        })}
      </div>
    </section>
  );
}
