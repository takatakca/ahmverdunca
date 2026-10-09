import { ExternalLink, Handshake } from "lucide-react";
import { SPONSORS } from "@/data/sponsors";
import { useI18n } from "@/lib/i18n";
import { ContentContributionButton } from "@/components/content-contribution-button";
import { useContentOverlayRegistry } from "@/lib/community-content";

function sponsorResourceKey(name: string) {
  return (
    "sponsor:" +
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  );
}

export function OfficialSponsorShowcase({ compact = false }: { compact?: boolean }) {
  const { lang } = useI18n();
  const contentRegistry = useContentOverlayRegistry();
  const fr = lang === "fr";

  return (
    <div
      className={
        compact
          ? "scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4"
          : "grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      }
    >
      {SPONSORS.map((baseSponsor) => {
        const resourceKey = sponsorResourceKey(baseSponsor.name);
        const overlay = contentRegistry.get("sponsor", resourceKey);
        const sponsor = contentRegistry.apply(
          "sponsor",
          resourceKey,
          baseSponsor as unknown as Record<string, unknown>,
        ) as unknown as typeof baseSponsor;
        const overlayLogoApproved =
          typeof overlay?.patch["logoUrl"] === "string" &&
          overlay.patch["logoUrl"].startsWith("https://");
        const hasOfficialLogo =
          Boolean(sponsor.logoUrl) && (sponsor.logoApproved || overlayLogoApproved);
        const fields = [
          {
            key: "website",
            label: { fr: "Site officiel", en: "Official website" },
            kind: "url" as const,
            current: sponsor.website,
          },
          {
            key: "logoUrl",
            label: { fr: "Logo officiel", en: "Official logo" },
            kind: "image-url" as const,
            current: sponsor.logoUrl,
          },
        ];
        const inner = (
          <>
            <div>
              <p className="flex min-h-8 items-center gap-2 pr-10 text-[11px] font-semibold text-white/60">
                <Handshake className="size-4 shrink-0 text-white/55" aria-hidden />
                {fr ? "Partenaire AHM Verdun" : "AHM Verdun partner"}
              </p>
              {hasOfficialLogo && (
                <div className="mt-3 flex h-20 items-center justify-center rounded-xl bg-white px-5 py-3">
                  <img
                    src={sponsor.logoUrl}
                    alt={sponsor.name}
                    loading="lazy"
                    decoding="async"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              )}
              <h3 className="mt-3 break-words font-display text-xl font-bold leading-[1.12] text-white sm:text-[1.4rem]">
                {sponsor.name}
              </h3>
            </div>
            <div className="mt-4 flex min-h-11 items-center justify-between gap-3 border-t border-white/10 pt-3 text-sm font-semibold text-white/80">
              <span>
                {sponsor.website
                  ? fr
                    ? "Découvrir"
                    : "Discover"
                  : fr
                    ? "Merci pour votre soutien"
                    : "Thank you for your support"}
              </span>
              {sponsor.website && (
                <ExternalLink className="size-4 shrink-0 text-white/60" aria-hidden />
              )}
            </div>
          </>
        );
        const classes =
          "flex h-full min-h-44 flex-col justify-between rounded-2xl bg-gradient-to-br from-white/[0.065] to-white/[0.015] p-4 text-white transition-colors sm:p-5";
        const card = sponsor.website ? (
          <a
            href={sponsor.website}
            target="_blank"
            rel="noopener noreferrer"
            className={`${classes} hover:bg-white/5 focus-visible:outline-white`}
            aria-label={`${sponsor.name} · ${fr ? "site officiel" : "official website"}`}
          >
            {inner}
          </a>
        ) : (
          <article className={classes}>{inner}</article>
        );
        return (
          <div
            key={baseSponsor.name}
            className={`relative overflow-hidden rounded-2xl border border-white/12 ${compact ? "w-[76vw] max-w-[19rem] shrink-0 snap-start sm:w-auto sm:max-w-none" : "min-w-0"}`}
          >
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
    <p className="max-w-3xl text-base leading-relaxed text-white/70">
      {lang === "fr"
        ? "Ces entreprises et organismes soutiennent le hockey à Verdun. Découvrez-les grâce aux liens disponibles."
        : "These businesses and organizations support hockey in Verdun. Discover them through the available links."}
    </p>
  );
}
