import { Check, Copy, Share2 } from "lucide-react";
import { useState } from "react";
import type { PublicTeamDirectoryEntry } from "@/data/team-directory";

export function TeamShareTools({
  team,
  lang,
}: {
  team: PublicTeamDirectoryEntry;
  lang: "fr" | "en";
}) {
  const [copied, setCopied] = useState(false);

  const shareTitle = `${team.name} · AHM Verdun`;
  const shareText = lang === "fr"
    ? `Mini-site de ${team.name} — horaire, résultats, arénas et nouvelles.`
    : `${team.name} mini-site — schedule, results, arenas and news.`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const share = async () => {
    if (navigator.share) {
      await navigator.share({
        title: shareTitle,
        text: shareText,
        url: window.location.href,
      }).catch(() => undefined);
      return;
    }
    await copyLink();
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border border-navy/10 bg-ice px-4 py-3">
      <div className="min-w-0">
        <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
          {lang === "fr" ? "Partager le mini-site" : "Share team mini-site"}
        </p>
        <p className="mt-1 truncate font-display text-lg font-extrabold uppercase text-navy">
          {team.name}
        </p>
      </div>

      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={copyLink}
          className="premium-control inline-flex min-h-10 items-center gap-2 border border-navy/12 bg-background px-3 text-[9px] font-bold uppercase tracking-[0.11em] text-navy hover:border-sport"
        >
          {copied ? <Check className="size-3.5 text-sport" /> : <Copy className="size-3.5 text-sport" />}
          {copied
            ? (lang === "fr" ? "Copié" : "Copied")
            : (lang === "fr" ? "Copier" : "Copy")}
        </button>
        <button
          type="button"
          onClick={share}
          className="premium-control inline-flex min-h-10 items-center gap-2 bg-navy px-3 text-[9px] font-bold uppercase tracking-[0.11em] text-white"
        >
          <Share2 className="size-3.5 text-sport-foreground" />
          {lang === "fr" ? "Partager" : "Share"}
        </button>
      </div>
    </div>
  );
}
