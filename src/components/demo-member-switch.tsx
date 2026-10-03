import { Eye, ShieldCheck, Sparkles } from "lucide-react";
import { useDemoMemberMode } from "@/lib/demo-member-mode";
import { useI18n } from "@/lib/i18n";

export function DemoMemberSwitch({ className = "" }: { className?: string }) {
  const { lang } = useI18n();
  const { mode, setMode } = useDemoMemberMode();

  return (
    <section className={`overflow-hidden border border-sport/30 bg-background ${className}`} aria-label={lang === "fr" ? "Aperçu des modes visiteur et membre" : "Visitor and member mode preview"}>
      <div className="flex flex-col gap-4 bg-competition p-5 text-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-sport-foreground" />
            <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Aperçu interactif" : "Interactive preview"}</p>
          </div>
          <h2 className="mt-2 font-display text-3xl font-extrabold uppercase leading-[0.9]">
            {lang === "fr" ? "Voir les deux expériences" : "Preview both experiences"}
          </h2>
          <p className="mt-2 max-w-xl text-xs leading-relaxed text-white/55">
            {lang === "fr"
              ? "Ce sélecteur ne crée aucun compte et ne facture rien. Il change seulement l’apparence locale de cet aperçu."
              : "This switch creates no account and charges nothing. It only changes the local appearance of this preview."}
          </p>
        </div>
        <span className="shrink-0 border border-white/14 bg-white/[0.04] px-3 py-2 text-[9px] font-bold uppercase tracking-[0.15em] text-white/52">
          FRONT-END ONLY
        </span>
      </div>

      <div className="grid gap-px bg-navy/10 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setMode("visitor")}
          className={`group flex min-h-28 items-center gap-4 p-5 text-left transition-colors ${mode === "visitor" ? "bg-sport/8" : "bg-background hover:bg-ice"}`}
          aria-pressed={mode === "visitor"}
        >
          <span className={`flex size-11 shrink-0 items-center justify-center border ${mode === "visitor" ? "border-sport bg-sport text-sport-foreground" : "border-navy/12 bg-ice text-navy"}`}>
            <Eye className="size-5" />
          </span>
          <span>
            <span className="block font-display text-2xl font-extrabold uppercase leading-none text-navy">
              {lang === "fr" ? "Visiteur" : "Visitor"}
            </span>
            <span className="mt-2 block text-xs leading-relaxed text-muted-foreground">
              {lang === "fr" ? "Commandites maison ou AdSense visibles." : "House sponsors or AdSense visible."}
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => setMode("member")}
          className={`group flex min-h-28 items-center gap-4 p-5 text-left transition-colors ${mode === "member" ? "bg-sport/8" : "bg-background hover:bg-ice"}`}
          aria-pressed={mode === "member"}
        >
          <span className={`flex size-11 shrink-0 items-center justify-center border ${mode === "member" ? "border-sport bg-sport text-sport-foreground" : "border-navy/12 bg-ice text-navy"}`}>
            <ShieldCheck className="size-5" />
          </span>
          <span>
            <span className="block font-display text-2xl font-extrabold uppercase leading-none text-navy">
              AHMV Member
            </span>
            <span className="mt-2 block text-xs leading-relaxed text-muted-foreground">
              {lang === "fr" ? "Les espaces promotionnels disparaissent dans cet aperçu." : "Promotional placements disappear in this preview."}
            </span>
          </span>
        </button>
      </div>
    </section>
  );
}
