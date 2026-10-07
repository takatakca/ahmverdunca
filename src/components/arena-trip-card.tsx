import { Building2, ChevronRight, MapPin, Navigation } from "lucide-react";
import { getArenaForVenue, arenaDirectionsTargetForVenue } from "@/data/arenas";
import { mapsDirectionsUrl } from "@/lib/site";
import { useI18n } from "@/lib/i18n";
import { useContentOverlayRegistry } from "@/lib/community-content";

export function ArenaTripCard({ venue }: { venue: string }) {
  const { lang } = useI18n();
  const registry = useContentOverlayRegistry();
  const original = getArenaForVenue(venue);
  const arena = original
    ? registry.apply(
        "arena",
        `arena:${original.slug}`,
        original as unknown as Record<string, unknown>,
      )
    : undefined;
  const photo =
    typeof arena?.["photoUrl"] === "string" && arena["photoUrl"].startsWith("https://")
      ? arena["photoUrl"]
      : original?.photoUrl;
  const address = arenaDirectionsTargetForVenue(venue);
  const target = encodeURIComponent(address);
  const photoSource = original?.officialPhotoPage;
  return (
    <div className="overflow-hidden rounded-xl border border-white/12 bg-white/[0.035]">
      <a
        href={original ? `/arenas/${original.slug}` : mapsDirectionsUrl(address)}
        target={original ? undefined : "_blank"}
        rel={original ? undefined : "noopener noreferrer"}
        className="group flex min-h-24 items-center gap-3 p-3"
      >
        <span className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-navy to-competition">
          {photo ? (
            <img
              src={photo}
              alt={original?.photoAlt?.[lang] ?? original?.name ?? venue}
              loading="lazy"
              className="size-full object-cover"
            />
          ) : (
            <Building2 className="size-8 text-white/35" aria-hidden />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-semibold text-sport-foreground">{venue}</span>
          <span className="mt-1 block text-xs leading-relaxed text-white/65">
            {original?.address ?? venue}
          </span>
          <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-white">
            {lang === "fr" ? "Fiche aréna" : "Arena details"}
            <ChevronRight className="size-3" />
          </span>
        </span>
      </a>
      <div className="grid grid-cols-3 gap-px border-t border-white/10 bg-white/10">
        {[
          { label: "Google Maps", href: mapsDirectionsUrl(address), icon: MapPin },
          {
            label: "Waze",
            href: `https://www.waze.com/ul?q=${target}&navigate=yes`,
            icon: Navigation,
          },
          { label: "Apple Plans", href: `https://maps.apple.com/?daddr=${target}`, icon: MapPin },
        ].map(({ label, href, icon: Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-12 items-center justify-center gap-1.5 bg-navy-deep px-1 text-[10px] font-semibold text-white hover:bg-navy"
          >
            <Icon className="size-3.5 shrink-0 text-sport-foreground" aria-hidden />
            {label === "Apple Plans" && lang === "en" ? "Apple Maps" : label}
          </a>
        ))}
      </div>
      {!photo && photoSource && (
        <a
          href={photoSource}
          target="_blank"
          rel="noopener noreferrer"
          className="block border-t border-white/10 px-3 py-2 text-[11px] text-white/55 hover:text-white"
        >
          {lang === "fr" ? "Photos de l’aréna" : "Arena photos"} ↗
        </a>
      )}
    </div>
  );
}
