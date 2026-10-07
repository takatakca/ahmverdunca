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
    ? `${team.name} — parties, résultats, arénas et nouvelles AHMV.`
    : `${team.name} — games, results, arenas and AHMV news.`;

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
    <div className="flex flex-wrap items-center justify-between gap-3 border border-white/10 bg-competition px-4 py-3 text-white">
      <div className="min-w-0">
        <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/38">
          {lang === "fr" ? "Partager l’équipe" : "Share team"}
        </p>
        <p className="mt-1 truncate font-display text-lg font-extrabold uppercase text-white">
          {team.name}
        </p>
      </div>

      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={copyLink}
          className="premium-control inline-flex min-h-10 items-center gap-2 border border-white/12 bg-white/[0.035] px-3 text-[9px] font-bold uppercase tracking-[0.11em] text-white/72 hover:border-sport hover:text-white"
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
