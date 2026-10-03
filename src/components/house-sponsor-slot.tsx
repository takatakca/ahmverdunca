import { ExternalLink, Megaphone, Sparkles } from "lucide-react";
import { houseSponsorsForPlacement } from "@/data/house-sponsors";
import { useI18n } from "@/lib/i18n";
import { useDemoMemberMode } from "@/lib/demo-member-mode";

export function HouseSponsorSlot({
  placement,
  className = "",
  count = 2,
  compact = false,
}: {
  placement: string;
  className?: string;
  count?: number;
  compact?: boolean;
}) {
  const { lang } = useI18n();
  const { isDemoMember } = useDemoMemberMode();
  const sponsors = houseSponsorsForPlacement(placement, count);

  if (isDemoMember) return null;

  return (
    <aside
      className={`overflow-hidden border border-navy/10 bg-background ${className}`}
      aria-label={lang === "fr" ? "Commandites" : "Sponsors"}
    >
      <div className="flex items-center justify-between gap-3 border-b border-navy/10 bg-ice px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Megaphone className="size-3.5 text-sport" aria-hidden />
          <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            {lang === "fr" ? "Espace partenaire · Démo" : "Partner space · Demo"}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-[8px] font-bold uppercase tracking-[0.14em] text-sport">
          <Sparkles className="size-3" />
          {lang === "fr" ? "Rotation locale" : "Local rotation"}
        </span>
      </div>

      <div className={compact ? "grid gap-px bg-navy/10 sm:grid-cols-2" : "grid gap-px bg-navy/10 md:grid-cols-2"}>
        {sponsors.map((sponsor) => {
          const card = sponsor.creative ? (
            <div className="premium-depth group relative overflow-hidden bg-competition">
              <img
                src={sponsor.creative}
                alt={`${sponsor.name} — ${sponsor.tagline[lang]}`}
                loading="lazy"
                decoding="async"
                className={`premium-depth-media w-full object-cover ${compact ? "aspect-[12/4.4]" : "aspect-[12/5.2]"}`}
              />
              {sponsor.href && (
                <span className="absolute bottom-3 right-3 flex size-9 items-center justify-center border border-white/20 bg-navy-deep/72 text-white backdrop-blur">
                  <ExternalLink className="size-4" aria-hidden />
                </span>
              )}
            </div>
          ) : (
            <div className={`group flex min-w-0 items-center gap-4 bg-background ${compact ? "p-3" : "p-4 md:p-5"}`}>
              <div className={`flex shrink-0 items-center justify-center border border-sport/25 bg-competition font-display font-extrabold uppercase text-sport-foreground ${compact ? "size-10 text-sm" : "size-14 text-lg"}`}>
                {sponsor.short}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`truncate font-display font-extrabold uppercase leading-none text-navy ${compact ? "text-lg" : "text-2xl"}`}>
                  {sponsor.name}
                </p>
                <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                  {sponsor.tagline[lang]}
                </p>
              </div>
              {sponsor.href && <ExternalLink className="size-3.5 shrink-0 text-sport" aria-hidden />}
            </div>
          );

          return sponsor.href ? (
            <a key={sponsor.id} href={sponsor.href} target="_blank" rel="noopener noreferrer" className="block">
              {card}
            </a>
          ) : (
            <div key={sponsor.id}>{card}</div>
          );
        })}
      </div>

      <div className="border-t border-navy/10 px-4 py-2">
        <p className="text-[8px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
          {lang === "fr"
            ? "Affichage temporaire maison · remplaçable par AdSense ou commanditaire officiel sans changer le layout."
            : "Temporary house placement · replaceable by AdSense or an official sponsor without changing the layout."}
        </p>
      </div>
    </aside>
  );
}
