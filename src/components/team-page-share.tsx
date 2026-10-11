import { Check, Copy, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  publicTeamShareUrl,
  sharePublicTeamPage,
  type TeamShareOutcome,
} from "@/lib/team-page-share";

type Lang = "fr" | "en";

export function TeamPageShare({
  teamSlug,
  teamName,
  lang,
}: {
  teamSlug: string;
  teamName: string;
  lang: Lang;
}) {
  const [outcome, setOutcome] = useState<TeamShareOutcome | null>(null);
  // SSR markup cannot react to taps until hydration wires the handler.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);
  const [manualLink, setManualLink] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isFr = lang === "fr";

  const onShare = async () => {
    const url = publicTeamShareUrl(window.location.origin, teamSlug);
    if (!url) {
      setOutcome("manual");
      setManualLink(null);
      return;
    }
    const next = await sharePublicTeamPage(window.navigator, {
      title: `${teamName} — AHM Verdun`,
      text: isFr ? `Découvrez l’espace public de l’équipe ${teamName}.` : `Explore the public ${teamName} team hub.`,
      url,
    });
    if (next === "cancelled") return;
    setOutcome(next);
    setManualLink(next === "manual" ? url : null);
    if (next === "manual") {
      window.requestAnimationFrame(() => inputRef.current?.select());
    }
  };

  return (
    <div className="mt-3 max-w-lg" data-ahmv-team-share>
      <button
        type="button"
        onClick={onShare}
        disabled={!hydrated}
        data-ahmv-share-ready={hydrated ? "true" : "false"}
        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#91f3e7]/25 bg-white/[0.055] px-4 text-xs font-bold text-[#c8fff8] transition-colors hover:border-[#91f3e7]/60 hover:bg-white/[0.1] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#a3fff5] disabled:cursor-wait disabled:opacity-50"
        aria-label={isFr ? `Partager la page publique de ${teamName}` : `Share the public ${teamName} page`}
      >
        <Share2 aria-hidden="true" className="size-4" />
        {isFr ? "Partager l’équipe" : "Share this team"}
      </button>
      <span role="status" aria-live="polite" className="ml-3 inline-flex items-center gap-1.5 text-[11px] text-[#b0f5ed]" data-ahmv-share-status>
        {outcome === "copied" && <><Check aria-hidden="true" className="size-3.5" />{isFr ? "Lien copié" : "Link copied"}</>}
        {outcome === "shared" && <><Check aria-hidden="true" className="size-3.5" />{isFr ? "Partage ouvert" : "Share completed"}</>}
        {outcome === "manual" && (isFr ? "Copiez le lien ci-dessous" : "Copy the link below")}
      </span>
      {manualLink && (
        <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/20 bg-[#070e25] p-2">
          <Copy aria-hidden="true" className="size-4 shrink-0 text-[#95f5ea]" />
          <input
            ref={inputRef}
            readOnly
            aria-label={isFr ? "Lien public à copier" : "Public link to copy"}
            value={manualLink}
            onFocus={(event) => event.target.select()}
            className="min-h-10 min-w-0 flex-1 bg-transparent px-1 text-xs text-white outline-none focus-visible:ring-2 focus-visible:ring-[#95f5ea]"
          />
        </div>
      )}
    </div>
  );
}
