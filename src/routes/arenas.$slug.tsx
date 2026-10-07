import { canonicalLink } from "@/lib/seo";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  Accessibility,
  ArrowLeft,
  CalendarDays,
  Camera,
  Car,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Navigation,
  Phone,
} from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { getArena } from "@/data/arenas";
import { OFFICIAL_MEDIA } from "@/data/official-media";
import { mapsDirectionsUrl } from "@/lib/site";
import { useI18n } from "@/lib/i18n";
import { HouseSponsorSlot } from "@/components/house-sponsor-slot";
import { ArenaMemberTools } from "@/components/arena-member-tools";
import { NewsletterInterest } from "@/components/newsletter-interest";
import { ContentContributionButton } from "@/components/content-contribution-button";
import { useContentOverlay } from "@/lib/community-content";

export const Route = createFileRoute("/arenas/$slug")({
  loader: ({ params }) => {
    const arena = getArena(params.slug);
    if (!arena) throw notFound();
    return { slug: arena.slug };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Aréna introuvable — AHM Verdun" },
          { name: "robots", content: "noindex" },
        ],
      };
    }

    const arena = getArena(loaderData.slug)!;
    const title = `${arena.name} — AHM Verdun`;
    const description = `Adresse, itinéraires, services et informations pratiques pour ${arena.name} (${arena.borough.fr}).`;

    return {
      links: canonicalLink(`/arenas/${loaderData.slug}`),
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: ArenaPage,
});

function directionProviders(address: string) {
  const target = encodeURIComponent(address);
  return {
    google: mapsDirectionsUrl(address),
    waze: `https://www.waze.com/ul?q=${target}&navigate=yes`,
    apple: `https://maps.apple.com/?daddr=${target}`,
  };
}

function ArenaPage() {
  const { slug } = Route.useLoaderData();
  const { t, l, lang } = useI18n();
  const baseArena = getArena(slug)!;
  const arena = useContentOverlay(
    "arena",
    `arena:${baseArena.slug}`,
    baseArena as unknown as Record<string, unknown>,
  ) as unknown as typeof baseArena;
  const directions = directionProviders(arena.address);

  const contributionFields = [
    { key: "address", label: { fr: "Adresse", en: "Address" }, kind: "text" as const, current: arena.address },
    { key: "phone", label: { fr: "Téléphone", en: "Phone" }, kind: "text" as const, current: arena.phone },
    { key: "website", label: { fr: "Site officiel", en: "Official website" }, kind: "url" as const, current: arena.website },
    { key: "officialPhotoPage", label: { fr: "Page officielle de photos", en: "Official photo page" }, kind: "url" as const, current: arena.officialPhotoPage },
    { key: "photoUrl", label: { fr: "Photo principale", en: "Main photo" }, kind: "image-url" as const, current: arena.photoUrl },
    { key: `description.${lang}`, label: { fr: "Description", en: "Description" }, kind: "textarea" as const, current: arena.description?.[lang] },
    { key: `directionsNotes.${lang}`, label: { fr: "Conseil d’accès / porte", en: "Access / entrance tip" }, kind: "textarea" as const, current: arena.directionsNotes?.[lang] },
    { key: "parking", label: { fr: "Stationnement", en: "Parking" }, kind: "json" as const, current: arena.parking },
    { key: "accessibility", label: { fr: "Accessibilité", en: "Accessibility" }, kind: "json" as const, current: arena.accessibility },
    { key: "amenities", label: { fr: "Services et commodités", en: "Amenities" }, kind: "json" as const, current: arena.amenities },
    { key: "activities", label: { fr: "Activités offertes", en: "Activities" }, kind: "json" as const, current: arena.activities },
    { key: "publicStatus", label: { fr: "Statut / fermeture", en: "Status / closure" }, kind: "json" as const, current: arena.publicStatus },
    { key: "sourceVerifiedAt", label: { fr: "Date de vérification", en: "Verification date" }, kind: "date" as const, current: arena.sourceVerifiedAt },
  ];

  const parkingLabel = arena.parking
    ? arena.parking.type === "free"
      ? (lang === "fr" ? "Stationnement gratuit" : "Free parking")
      : arena.parking.type === "paid"
        ? (lang === "fr" ? "Stationnement payant" : "Paid parking")
        : arena.parking.type === "mixed"
          ? (lang === "fr" ? "Stationnement mixte" : "Mixed parking")
          : (lang === "fr" ? "Capacité non publiée" : "Capacity not published")
    : undefined;

  return (
    <>
      <PageHeader
        eyebrow={l(arena.borough)}
        title={arena.name}
        description={arena.description ? l(arena.description) : arena.facilities ? l(arena.facilities) : arena.address}
        actions={
          <>
            <ContentContributionButton
              resourceType="arena"
              resourceKey={`arena:${arena.slug}`}
              title={arena.name}
              snapshot={arena as unknown as Record<string, unknown>}
              fields={contributionFields}
              appearance="menu"
            />
            <Button asChild variant="sport">
              <a href={directions.google} target="_blank" rel="noopener noreferrer">
                <Navigation className="size-4" />
                {t("common.directions")}
              </a>
            </Button>
            {arena.website && (
              <Button asChild variant="outline-light">
                <a href={arena.website} target="_blank" rel="noopener noreferrer">
                  {t("common.officialSite")} <ExternalLink className="size-4" />
                </a>
              </Button>
            )}
          </>
        }
      />

      <div className="container-site space-y-10 py-8 md:py-12">
        {arena.publicStatus?.code === "temporarily_closed" && (
          <section className="border border-status-cancelled/35 bg-status-cancelled-soft p-4 text-navy">
            <p className="font-display text-xl font-extrabold uppercase">{l(arena.publicStatus.label)}</p>
            {arena.publicStatus.note && <p className="mt-2 text-sm leading-relaxed">{l(arena.publicStatus.note)}</p>}
          </section>
        )}

        <section className="grid overflow-hidden border border-navy/12 bg-navy text-white lg:grid-cols-[1.3fr_0.7fr]">
          <div className="relative min-h-[280px] overflow-hidden sm:min-h-[350px]">
            <img
              src={arena.photoUrl ?? OFFICIAL_MEDIA.tournamentM11Secondary.url}
              alt={arena.photoAlt?.[lang] ?? (lang === "fr" ? OFFICIAL_MEDIA.tournamentM11Secondary.alt.fr : OFFICIAL_MEDIA.tournamentM11Secondary.alt.en)}
              loading="eager"
              decoding="async"
              className="absolute inset-0 size-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,16,43,0.08),rgba(7,16,43,0.84))]" />
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
              <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Destination hockey" : "Hockey destination"}</p>
              <p className="mt-2 max-w-2xl font-display text-4xl font-extrabold uppercase leading-[0.88] sm:text-5xl">
                {arena.name}
              </p>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/72">
                {arena.photoUrl && arena.photoCredit
                  ? `Photo : ${arena.photoCredit}`
                  : lang === "fr"
                    ? "Photo d’ambiance AHMV. Consultez les photos de l’installation sur la page officielle."
                    : "AHMV atmosphere photo. View facility photos on the official page."}
              </p>
              {arena.officialPhotoPage && (
                <a
                  href={arena.officialPhotoPage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="premium-control mt-4 inline-flex min-h-10 items-center gap-2 border border-white/18 bg-black/20 px-3 text-[9px] font-bold uppercase tracking-[0.1em] text-white"
                >
                  <Camera className="size-4 text-sport-foreground" />
                  {lang === "fr" ? "Photos de l’aréna" : "Arena photos"}
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-center border-t border-white/12 p-6 lg:border-l lg:border-t-0 md:p-8">
            <p className="eyebrow text-sport-foreground">{lang === "fr" ? "À retenir" : "At a glance"}</p>
            <p className="mt-4 font-display text-3xl font-extrabold uppercase leading-[0.9]">{l(arena.borough)}</p>
            <p className="mt-4 text-sm leading-relaxed text-white/68">{arena.address}</p>
            {arena.phone && (
              <a href={`tel:+1${arena.phone.replace(/\D/g, "")}`} className="mt-4 flex items-center gap-2 text-sm font-semibold text-white hover:text-sport-foreground">
                <Phone className="size-4 text-sport-foreground" />
                {arena.phone}{arena.phoneExtension ? ` · poste ${arena.phoneExtension}` : ""}
              </a>
            )}
            {arena.directionsNotes?.[lang] ? (
              <p className="mt-4 border-l-2 border-sport pl-3 text-xs leading-relaxed text-white/62">
                {arena.directionsNotes[lang]}
              </p>
            ) : null}
            <div className="mt-6 grid grid-cols-3 gap-2">
              <a href={directions.google} target="_blank" rel="noopener noreferrer" className="premium-control flex min-h-11 items-center justify-center border border-white/20 px-2 text-[8px] font-bold uppercase tracking-[0.09em] text-white hover:border-sport">Google</a>
              <a href={directions.waze} target="_blank" rel="noopener noreferrer" className="premium-control flex min-h-11 items-center justify-center border border-white/20 px-2 text-[8px] font-bold uppercase tracking-[0.09em] text-white hover:border-sport">Waze</a>
              <a href={directions.apple} target="_blank" rel="noopener noreferrer" className="premium-control flex min-h-11 items-center justify-center bg-sport px-2 text-[8px] font-bold uppercase tracking-[0.09em] text-sport-foreground">Apple</a>
            </div>
          </div>
        </section>

        <Link to="/arenas" className="inline-flex items-center gap-1.5 text-sm font-semibold text-sport hover:underline">
          <ArrowLeft className="size-4" /> {t("common.back")}
        </Link>

        <section className="grid gap-4 lg:grid-cols-3">
          <article className="border border-white/12 bg-navy-deep p-6 text-white">
            <MapPin className="size-5 text-sport-foreground" />
            <p className="eyebrow mt-4 text-sport-foreground">{lang === "fr" ? "Adresse vérifiée" : "Verified address"}</p>
            <p className="mt-3 text-sm leading-relaxed">{arena.address}</p>
            <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-status-confirmed">
              <CheckCircle2 className="size-4" />
              {lang === "fr" ? "Source officielle recoupée" : "Official source cross-checked"}
            </div>
          </article>

          <article className="border border-white/12 bg-navy-deep p-6 text-white">
            <Car className="size-5 text-sport-foreground" />
            <p className="eyebrow mt-4 text-sport-foreground">{lang === "fr" ? "Stationnement" : "Parking"}</p>
            <p className="mt-3 font-display text-2xl font-extrabold uppercase">{parkingLabel ?? (lang === "fr" ? "Détail non publié" : "Detail not published")}</p>
            {arena.parking?.details && <p className="mt-2 text-sm leading-relaxed text-white/55">{l(arena.parking.details)}</p>}
            {arena.parking?.accessible && <p className="mt-3 text-xs font-semibold text-white/70">{lang === "fr" ? "✓ Places accessibles indiquées" : "✓ Accessible parking listed"}</p>}
            {arena.parking?.evCharging && <p className="mt-1 text-xs font-semibold text-white/70">{lang === "fr" ? "✓ Recharge électrique indiquée" : "✓ EV charging listed"}</p>}
          </article>

          <article className="border border-white/12 bg-navy-deep p-6 text-white">
            <Accessibility className="size-5 text-sport-foreground" />
            <p className="eyebrow mt-4 text-sport-foreground">{lang === "fr" ? "Accessibilité" : "Accessibility"}</p>
            {arena.accessibility?.length ? (
              <ul className="mt-3 space-y-2 text-sm text-white/64">
                {arena.accessibility.slice(0, 4).map((item) => <li key={l(item)}>• {l(item)}</li>)}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-white/50">{lang === "fr" ? "Consultez la source officielle pour les détails." : "Check the official source for details."}</p>
            )}
          </article>
        </section>

        {(arena.activities?.length || arena.amenities?.length) && (
          <section className="grid gap-6 lg:grid-cols-2">
            {arena.activities?.length ? (
              <div>
                <SectionHeading eyebrow={lang === "fr" ? "Sur place" : "On site"} title={lang === "fr" ? "Activités" : "Activities"} />
                <div className="mt-4 grid gap-2">
                  {arena.activities.map((item) => (
                    <div key={l(item)} className="flex items-start gap-3 border border-white/12 bg-navy-deep p-4 text-sm text-white">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-sport-foreground" />
                      {l(item)}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {arena.amenities?.length ? (
              <div>
                <SectionHeading eyebrow={lang === "fr" ? "Confort parent" : "Parent comfort"} title={lang === "fr" ? "Services et commodités" : "Services & amenities"} />
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {arena.amenities.map((item) => (
                    <div key={l(item)} className="border border-white/12 bg-navy-deep p-4 text-sm text-white/72">{l(item)}</div>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        )}

        <section className="competition-panel border border-navy/12 p-6 text-navy-foreground">
          <CalendarDays className="size-6 text-sport-foreground" aria-hidden />
          <h2 className="heading-card mt-5">{lang === "fr" ? "Vous jouez ici?" : "Playing here?"}</h2>
          <p className="mt-2 max-w-2xl text-sm text-navy-foreground/70">
            {lang === "fr"
              ? "L’horaire AHMV structuré relie maintenant chaque glace reconnue à sa fiche aréna et aux trois services d’itinéraire."
              : "The structured AHMV schedule now connects recognized rinks to their arena page and all three direction services."}
          </p>
          <Button asChild variant="outline-light" className="mt-5">
            <Link to="/horaires">{lang === "fr" ? "Voir les horaires" : "View schedules"}</Link>
          </Button>
        </section>

        <ArenaMemberTools arena={arena} lang={lang} />

        <NewsletterInterest lang={lang} source="ahmv-arena" arenaSlug={arena.slug} />

        <HouseSponsorSlot placement={`arena-${arena.slug}`} count={1} compact />

        {arena.website && (
          <section>
            <SectionHeading
              eyebrow={lang === "fr" ? "Source municipale / institutionnelle" : "Municipal / institutional source"}
              title={lang === "fr" ? "Informations officielles" : "Official information"}
              description={
                lang === "fr"
                  ? "Les services et détails ci-dessus sont limités aux données vérifiées. Pour les heures, fermetures et changements de dernière minute, la source officielle demeure prioritaire."
                  : "The services and details above are limited to verified data. For hours, closures and last-minute changes, the official source remains authoritative."
              }
            />
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline-light">
                <a href={arena.website} target="_blank" rel="noopener noreferrer">
                  {lang === "fr" ? "Ouvrir la fiche officielle" : "Open official listing"}
                  <ExternalLink className="size-4" />
                </a>
              </Button>
              {arena.officialPhotoPage && arena.officialPhotoPage !== arena.website && (
                <Button asChild variant="outline-light">
                  <a href={arena.officialPhotoPage} target="_blank" rel="noopener noreferrer">
                    {lang === "fr" ? "Photos officielles" : "Official photos"}
                    <Camera className="size-4" />
                  </a>
                </Button>
              )}
            </div>
            {arena.sourceVerifiedAt && (
              <p className="mt-3 text-xs text-muted-foreground">
                {lang === "fr" ? "Données vérifiées le " : "Data verified on "}
                {arena.sourceVerifiedAt}.
              </p>
            )}
          </section>
        )}
      </div>
    </>
  );
}
