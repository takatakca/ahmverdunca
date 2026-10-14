import { ArrowUpRight } from "lucide-react";
import {
  publicTeamLinktWidgetFor,
  type TeamLinktPublicWidgetKind,
  type TeamLinktPublicWidgets,
} from "@/lib/teamlinkt-public-widgets";

type Lang = "fr" | "en";

/** Public widget only; never use this for TeamLinkt chat, roster or budgets. */
export function TeamLinktPublicWidget({
  kind,
  title,
  widgets,
  lang,
}: {
  kind: TeamLinktPublicWidgetKind;
  title: string;
  widgets?: TeamLinktPublicWidgets | undefined;
  lang: Lang;
}) {
  const src = publicTeamLinktWidgetFor(widgets, kind);
  if (!src) return null;

  return (
    <div data-teamlinkt-public-widget={kind} className="overflow-hidden rounded-[1.5rem] border border-[#e3e6f0] bg-white shadow-[0_18px_50px_-36px_rgba(27,34,68,0.2)]">
      <div className="flex items-center justify-between gap-3 border-b border-[#e3e6f0] px-5 py-4">
        <p className="text-sm font-bold text-[#1c2445]">{title}</p>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-1.5 text-xs font-bold text-[#275ca7] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#228f97]"
        >
          {lang === "fr" ? "Ouvrir la source" : "Open source"}
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </a>
      </div>
      <iframe
        title={title}
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        className="block min-h-[350px] w-full border-0 bg-white sm:min-h-[450px]"
      />
      <p className="border-t border-[#e3e6f0] px-5 py-3 text-xs leading-5 text-[#59637a]">
        {lang === "fr"
          ? "Données publiques publiées par TeamLinkt. L’affichage dépend des réglages du fournisseur."
          : "Public data published by TeamLinkt. Display depends on provider settings."}
      </p>
    </div>
  );
}
