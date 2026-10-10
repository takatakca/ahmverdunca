import { useState } from "react";
import { ArrowRight, CalendarDays, Check, Clipboard, Mail, ShieldCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { PilotTeamMicrosite } from "@/data/team-microsite-pilots";
import { teamVisualForCategory } from "@/data/team-visuals";
import { OFFICIAL_MEDIA } from "@/data/official-media";
import { SITE } from "@/lib/site";
import { useI18n } from "@/lib/i18n";

const tabs = [
  ["calendrier", "Calendrier", "Schedule"],
  ["nouvelles", "Nouvelles", "News"],
  ["photos", "Photos", "Photos"],
  ["familles", "Familles", "Families"],
] as const;

export function TeamPilotMicrosite({ team }: { team: PilotTeamMicrosite }) {
  const { lang } = useI18n();
  const fr = lang === "fr";
  const [copied, setCopied] = useState(false);
  const photo = teamVisualForCategory(team.categorySlug) ?? OFFICIAL_MEDIA.practiceGroup;
  const contactHref = "mailto:" + SITE.girlsHockeyEmail + "?subject=" +
    encodeURIComponent("AHMV - " + team.name + " " + team.level);
  const share = async () => {
    if (typeof window === "undefined" || !navigator.clipboard?.writeText) return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch { setCopied(false); }
  };
  const blocks = [
    {
      id: "calendrier",
      eyebrow: fr ? "Sur la glace" : "On the ice",
      title: fr ? "Matchs et pratiques" : "Games and practices",
      text: fr
        ? "Aucun horaire M12B vérifié. Les événements et résultats paraîtront après validation de la source officielle. L’identifiant M12A ne sera pas réutilisé."
        : "No verified U12B schedule. Events and results require an official source. The U12A identifier will not be reused.",
    },
    {
      id: "nouvelles",
      eyebrow: fr ? "Vie de l’équipe" : "Team life",
      title: fr ? "Journal des Louves" : "Louves journal",
      text: fr
        ? "Les nouvelles de cette équipe seront ajoutées après révision. Aucune publication d’une autre formation n’est attribuée aux Louves M12B."
        : "Team news will appear after review. Posts from other squads will not be attributed to Louves U12B.",
    },
    {
      id: "photos",
      eyebrow: fr ? "Souvenirs" : "Memories",
      title: fr ? "Photos et moments forts" : "Photos and highlights",
      text: fr
        ? "Galerie en préparation. Chaque photo devra être autorisée, sourcée et associée à la bonne équipe avant publication."
        : "Gallery in preparation. Every photo requires permission, provenance and accurate team attribution before publication.",
    },
  ];

  return (
    <main className="bg-navy-deep pb-16 text-white">
      <div className="container-site pt-5">
        <Link to="/equipes/$slug" params={{ slug: team.categorySlug }} className="mb-4 inline-flex min-h-11 items-center gap-2 text-xs font-bold uppercase tracking-wide text-white/70 hover:text-white">
          <ArrowRight className="size-4 rotate-180" aria-hidden />
          {fr ? "Retour au hockey féminin" : "Back to girls hockey"}
        </Link>
        <section className="relative isolate overflow-hidden border border-white/15 bg-competition" aria-labelledby="pilot-team-title">
          <img src={photo.url} alt="" className="absolute inset-0 -z-20 size-full object-cover opacity-25" loading="eager" decoding="async" />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(110deg,rgba(5,13,38,0.98),rgba(5,13,38,0.62))]" aria-hidden />
          <div className="grid min-h-[440px] items-center gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_0.45fr] lg:p-14">
            <div>
              <span className="border border-sport/40 bg-sport/10 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-sport-foreground">
                {fr ? "Microsite pilote · à confirmer" : "Pilot microsite · pending verification"}
              </span>
              <p className="mt-8 font-display text-xl font-bold uppercase tracking-[0.2em] text-white/70">{team.level} · {SITE.season}</p>
              <h1 id="pilot-team-title" className="mt-3 max-w-[12ch] font-display text-[clamp(3.5rem,9vw,7rem)] font-extrabold uppercase leading-[0.85] tracking-[-0.055em]">{team.name}</h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
                {fr ? "Leur saison. Leur univers. Un espace simple et vivant pour les familles, avec uniquement des informations confirmées." : "Their season. Their world. A simple, vibrant home for families, with verified information only."}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#calendrier" className="inline-flex min-h-12 items-center gap-2 bg-sport px-5 font-display text-sm font-bold uppercase text-sport-foreground hover:brightness-95">
                  <CalendarDays className="size-4" aria-hidden />{fr ? "Calendrier" : "Schedule"}
                </a>
                <button type="button" onClick={share} className="inline-flex min-h-12 items-center gap-2 border border-white/30 bg-white/10 px-5 font-display text-sm font-bold uppercase hover:bg-white/20">
                  {copied ? <Check className="size-4" aria-hidden /> : <Clipboard className="size-4" aria-hidden />}
                  {copied ? (fr ? "Lien copié" : "Link copied") : (fr ? "Partager" : "Share")}
                </button>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="flex size-48 items-center justify-center rounded-[2rem] border border-white/25 bg-white p-5 shadow-2xl sm:size-64 lg:size-72">
                <img src={team.crestSrc} width={224} height={224} alt={fr ? "Emblème des Louves M12B" : "Louves U12B crest"} className="size-full object-contain" loading="eager" />
              </div>
            </div>
          </div>
          <p className="border-t border-white/15 bg-navy-deep/80 px-6 py-3 text-xs text-white/60">
            {fr ? "Visuel d’ambiance AHMV : il ne représente pas nécessairement cette équipe." : "AHMV atmosphere image: not necessarily this specific team."}
          </p>
        </section>
        <nav aria-label={fr ? "Sections des Louves" : "Louves sections"} className="scrollbar-none my-6 flex gap-2 overflow-x-auto border-y border-white/10 py-3">
          {tabs.map(([id, labelFr, labelEn]) => (
            <a key={id} href={"#" + id} className="shrink-0 rounded-full border border-white/20 px-4 py-3 text-xs font-bold uppercase tracking-wide text-white/80 hover:border-sport hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-sport">
              {fr ? labelFr : labelEn}
            </a>
          ))}
        </nav>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            [fr ? "Catégorie" : "Category", team.level],
            [fr ? "Saison" : "Season", SITE.season],
            [fr ? "Association" : "Association", "AHMV"],
          ].map(([label, value]) => (
            <div key={label} className="border border-white/12 bg-competition p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">{label}</p>
              <p className="mt-2 font-display text-2xl font-extrabold uppercase">{value}</p>
            </div>
          ))}
        </div>
        {blocks.map((block) => (
          <section key={block.id} id={block.id} className="scroll-mt-24 border-b border-white/15 py-10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-sport-foreground">{block.eyebrow}</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold uppercase sm:text-4xl">{block.title}</h2>
            <div className="mt-5 border border-white/15 bg-white/[0.04] p-6">
              <p className="flex items-center gap-2 text-xs font-bold uppercase text-sport-foreground"><ShieldCheck className="size-4" aria-hidden />{fr ? "En attente de validation" : "Awaiting verification"}</p>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/75">{block.text}</p>
            </div>
            {block.id === "calendrier" && <Link to="/horaires" className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-sport-foreground hover:underline">{fr ? "Horaires généraux AHMV" : "General AHMV schedules"} <ArrowRight className="size-4" aria-hidden /></Link>}
            {block.id === "nouvelles" && <a href={contactHref} className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-sport-foreground hover:underline"><Mail className="size-4" aria-hidden />{fr ? "Proposer une nouvelle" : "Suggest a story"}</a>}
          </section>
        ))}
        <section id="familles" className="scroll-mt-24 py-10">
          <h2 className="font-display text-3xl font-extrabold uppercase">{fr ? "Pour les familles" : "For families"}</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ["/inscriptions", fr ? "Inscriptions" : "Registration"],
              ["/arenas", fr ? "Arénas" : "Arenas"],
              ["/faq", fr ? "Questions fréquentes" : "FAQ"],
            ].map(([href, label]) => <a key={href} href={href} className="flex min-h-24 items-end justify-between border border-white/15 bg-competition p-5 font-display text-lg font-bold uppercase hover:border-sport">{label}<ArrowRight className="size-5 text-sport-foreground" aria-hidden /></a>)}
          </div>
        </section>
        <p className="border-t border-white/15 py-6 text-xs leading-relaxed text-white/60">{fr ? "Aucun effectif personnel, horaire non approuvé ou résultat non vérifié n’est affiché sur ce microsite pilote." : "No personal roster, unapproved schedule or unverified result is displayed on this pilot microsite."}</p>
      </div>
    </main>
  );
}
