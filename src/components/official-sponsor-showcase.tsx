import { ExternalLink, Handshake } from "lucide-react";
import { SPONSORS } from "@/data/sponsors";
import { useI18n } from "@/lib/i18n";
import { ContentContributionButton } from "@/components/content-contribution-button";
import { useContentOverlayRegistry } from "@/lib/community-content";

function sponsorResourceKey(name: string) {
  return "sponsor:" + name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function OfficialSponsorShowcase({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { lang } = useI18n();
  const contentRegistry = useContentOverlayRegistry();

  return (
    <div className={compact
      ? "scrollbar-none flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:gap-px sm:overflow-hidden sm:border sm:border-white/12 sm:bg-white/12 lg:grid-cols-4"
      : "scrollbar-none flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:gap-px sm:overflow-hidden sm:border sm:border-white/12 sm:bg-white/10 lg:grid-cols-3 xl:grid-cols-4"
    }>
      {SPONSORS.map((baseSponsor, index) => {
        const resourceKey = sponsorResourceKey(baseSponsor.name);
        const overlay = contentRegistry.get("sponsor", resourceKey);
        const sponsor = contentRegistry.apply(
          "sponsor",
          resourceKey,
          baseSponsor as unknown as Record<string, unknown>,
        ) as unknown as typeof baseSponsor;
        const overlayLogoApproved =
          typeof overlay?.patch["logoUrl"] === "string" && overlay.patch["logoUrl"].startsWith("https://");
        const hasOfficialLogo = Boolean(sponsor.logoUrl) && (sponsor.logoApproved || overlayLogoApproved);
        const fields = [
          { key: "website", label: { fr: "Site officiel", en: "Official website" }, kind: "url" as const, current: sponsor.website },
          { key: "logoUrl", label: { fr: "Logo officiel", en: "Official logo" }, kind: "image-url" as const, current: sponsor.logoUrl },
        ];
        const inner = (
          <>
            <div className="flex items-start justify-between gap-4">
              <div className={compact
                ? "flex min-h-16 min-w-0 flex-1 items-center border border-white/12 bg-white/[0.035] px-4 py-3"
                : "flex min-h-20 min-w-0 flex-1 items-center border border-white/12 bg-white/[0.035] px-4 py-3"
              }>
                {hasOfficialLogo ? (
                  <img
                    src={sponsor.logoUrl}
                    alt={sponsor.name}
                    loading="lazy"
                    decoding="async"
                    className={compact ? "max-h-10 max-w-full object-contain" : "max-h-12 max-w-full object-contain"}
                  />
                ) : (
                  <span className={compact
                    ? "font-display text-lg font-extrabold uppercase leading-[0.92] text-white"
                    : "font-display text-xl font-extrabold uppercase leading-[0.92] text-white"
                  }>
                    {sponsor.name}
                  </span>
                )}
              </div>
              <span className={compact
                ? "font-display text-sm font-bold text-white/22"
                : "font-display text-sm font-bold text-white/20"
              }>
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>

            <div className={compact ? "mt-5" : "mt-6"}>
              <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-sport-foreground">
                {lang === "fr" ? "Partenaire AHMV" : "AHMV partner"}
              </p>
              <p className={compact
                ? "mt-2 text-[10px] font-semibold leading-relaxed text-white/58"
                : "mt-2 text-xs font-semibold leading-relaxed text-white/52"
              }>
                {hasOfficialLogo
                  ? (lang === "fr" ? "Un partenaire de l’association" : "An association partner")
                  : (lang === "fr"
                      ? "Découvrez ce partenaire de l’association."
                      : "Discover this association partner.")}
              </p>
            </div>

            <div className={compact
              ? "mt-5 flex items-center justify-between border-t border-white/10 pt-3 text-[9px] font-bold uppercase tracking-[0.12em] text-sport-foreground"
              : "mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-[9px] font-bold uppercase tracking-[0.12em] text-sport-foreground"
            }>
              <span>
                {sponsor.website
                  ? (lang === "fr" ? "Site officiel" : "Official website")
                  : (lang === "fr" ? "Lien à confirmer" : "Link to confirm")}
              </span>
              {sponsor.website && <ExternalLink className="size-3.5" aria-hidden />}
            </div>
          </>
        );

        const classes = compact
          ? "interactive-surface flex min-h-48 flex-col justify-between bg-competition p-4 transition-colors hover:bg-white/[0.05]"
          : "interactive-surface flex min-h-64 flex-col justify-between bg-competition p-5 text-white transition-colors hover:bg-white/[0.05]";

        const card = sponsor.website ? (
          <a
            href={sponsor.website}
            target="_blank"
            rel="noopener noreferrer"
            className={classes}
            aria-label={`${sponsor.name} · ${lang === "fr" ? "site officiel" : "official website"}`}
          >
            {inner}
          </a>
        ) : (
          <article className={classes}>{inner}</article>
        );

        return (
          <div key={sponsor.name} className="relative w-[78vw] max-w-[19rem] shrink-0 snap-start overflow-hidden border border-white/12 sm:w-auto sm:max-w-none sm:border-0">
            <ContentContributionButton
              resourceType="sponsor"
              resourceKey={resourceKey}
              title={sponsor.name}
              snapshot={sponsor as unknown as Record<string, unknown>}
              fields={fields}
              appearance="menu"
              className="absolute right-2 top-2 z-20"
            />
            {card}
          </div>
        );
      })}
    </div>
  );
}

export function SponsorIdentityNotice() {
  const { lang } = useI18n();
  return (
    <div className="flex items-start gap-3 border border-white/12 bg-competition p-4 text-white">
      <span className="flex size-9 shrink-0 items-center justify-center border border-white/12 bg-white/[0.04]">
        <Handshake className="size-4 text-sport" aria-hidden />
      </span>
      <div>
        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white">
          {lang === "fr" ? "Partenaires de l’association" : "Association partners"}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-white/52">
          {lang === "fr"
            ? "Découvrez les partenaires d’AHM Verdun. Les liens disponibles vous donnent accès à leurs sites pour en savoir plus."
            : "Meet AHM Verdun’s partners. Use the available links to visit their websites and learn more."}
        </p>
      </div>
    </div>
  );
}
