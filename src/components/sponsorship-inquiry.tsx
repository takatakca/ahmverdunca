import { useState, type FormEvent } from "react";
import { ArrowRight, Building2, Check, Download, Mail, Megaphone, Send, Users } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { trackMarketingEvent } from "@/lib/marketing";

const OPTIONS = [
  ["arena", "Affichage dans l’aréna", "Arena signage"],
  ["boards", "Bandes et bancs des joueurs", "Rink boards and player benches"],
  ["ice", "Visibilité sur la glace", "Ice visibility"],
  ["stands", "Kiosques et activation sur place", "Booths and on-site activation"],
  ["seating", "Gradins et sièges", "Stands and seating"],
  ["transport", "Autobus et transport des équipes", "Team buses and transport"],
  ["jerseys", "Chandails et vêtements d’équipe", "Team jerseys and apparel"],
  ["equipment", "Équipement et matériel sportif", "Sports equipment and supplies"],
  ["tournament", "Tournois et événements", "Tournaments and events"],
  ["scholarships", "Bourses et aide aux familles", "Scholarships and family assistance"],
  ["web", "Site et pages d’équipes", "Website and team pages"],
  ["tablet", "Affichage numérique et tablettes", "Digital screens and tablets"],
  ["newsletter", "Infolettre", "Newsletter"],
  ["social", "Réseaux sociaux", "Social media"],
  ["hospitality", "Repas et services aux équipes", "Team meals and services"],
  ["other", "Autre proposition", "Other proposal"],
] as const;

const PLACEMENT_GROUPS = [
  {
    Icon: Building2,
    fr: "À l’aréna",
    en: "At the arena",
    options: ["arena", "boards", "ice", "stands", "seating"],
  },
  {
    Icon: Users,
    fr: "Équipes et communauté",
    en: "Teams and community",
    options: [
      "transport",
      "jerseys",
      "equipment",
      "tournament",
      "scholarships",
      "hospitality",
      "other",
    ],
  },
  {
    Icon: Megaphone,
    fr: "Visibilité numérique",
    en: "Digital visibility",
    options: ["web", "tablet", "newsletter", "social"],
  },
] as const;

export function SponsorshipInquiry() {
  const { lang } = useI18n();
  const fr = lang === "fr";
  const [selected, setSelected] = useState<string[]>([]);
  const [brief, setBrief] = useState("");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const email = import.meta.env["VITE_SPONSORSHIP_EMAIL"]?.trim() || "ahmverdun.ca@gmail.com";
  const inputClass =
    "mt-2 min-h-12 min-w-0 w-full rounded-xl border border-white/15 bg-navy-deep px-3.5 py-3 text-base text-white outline-none [color-scheme:dark] focus:border-sport focus:ring-2 focus:ring-sport/20 md:text-sm";
  const field = (name: string, label: string, type = "text", required = false) => (
    <label className="block min-w-0 text-sm font-medium text-white/80">
      {label}
      {required ? " *" : ""}
      <input
        name={name}
        type={type}
        required={required}
        maxLength={type === "text" ? 140 : undefined}
        className={inputClass}
        autoComplete={
          name === "email"
            ? "email"
            : name === "phone"
              ? "tel"
              : name === "company"
                ? "organization"
                : name === "name"
                  ? "name"
                  : undefined
        }
      />
    </label>
  );
  const prepare = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    if (!selected.length) {
      setError(
        fr
          ? "Choisissez au moins un type de commandite."
          : "Choose at least one sponsorship option.",
      );
      return;
    }
    const start = String(data.get("start") || "");
    const end = String(data.get("end") || "");
    if (start && end && end < start) {
      setError(
        fr
          ? "La date de fin doit suivre la date de début."
          : "The end date must follow the start date.",
      );
      return;
    }
    const value = (key: string) => String(data.get(key) || "—").trim();
    const lines = [
      fr ? "DEMANDE DE COMMANDITE — AHM VERDUN" : "SPONSORSHIP INQUIRY — AHM VERDUN",
      "",
      `${fr ? "Entreprise / franchise" : "Business / franchise"} : ${value("company")}`,
      `${fr ? "Secteur" : "Industry"} : ${value("industry")}`,
      `${fr ? "Territoire / succursales" : "Area / locations"} : ${value("area")}`,
      `${fr ? "Personne responsable" : "Contact person"} : ${value("name")}`,
      `${fr ? "Fonction" : "Role"} : ${value("role")}`,
      `${fr ? "Courriel" : "Email"} : ${value("email")}`,
      `${fr ? "Téléphone" : "Phone"} : ${value("phone")}`,
      `Site : ${value("website")}`,
      "",
      `${fr ? "Options souhaitées" : "Requested options"} :`,
      ...OPTIONS.filter(([id]) => selected.includes(id)).map(
        ([, frLabel, enLabel]) => `- ${fr ? frLabel : enLabel}`,
      ),
      "",
      `${fr ? "Budget indicatif (CAD)" : "Indicative budget (CAD)"} : ${value("budget")}`,
      `${fr ? "Contribution" : "Contribution"} : ${value("contribution")}`,
      `${fr ? "Période" : "Period"} : ${start || "—"} → ${end || "—"}`,
      `${fr ? "Équipes / événements ciblés" : "Target teams / events"} : ${value("scope")}`,
      `${fr ? "Objectifs et résultats attendus" : "Goals and expected results"} : ${value("goals")}`,
      `${fr ? "Proposition / matériel disponible" : "Proposal / available materials"} : ${value("details")}`,
      "",
      fr
        ? "Consentement : j’accepte d’être contacté au sujet de cette demande."
        : "Consent: I agree to be contacted about this inquiry.",
      fr
        ? "Emplacements, droits d’affichage et modalités à confirmer avec l’association et les installations."
        : "Placements, display rights and terms to be confirmed with the association and facilities.",
    ];
    setError("");
    setBrief(lines.join("\n"));
    trackMarketingEvent("sponsorship_prepare", { section: "partners" });
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([brief], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "demande-commandite-ahmv.txt";
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <section
      id="commandite"
      data-ahmv-attention-surface={editing ? "sponsorship-form" : undefined}
      onFocusCapture={() => setEditing(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setEditing(false);
      }}
      className="scroll-mt-28 overflow-hidden rounded-3xl border border-white/15 bg-navy-deep text-white"
    >
      <div className="border-b border-white/10 bg-competition p-5 sm:p-7 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-sport-foreground">
          {fr ? "Entreprises · Franchises · Partenaires" : "Businesses · Franchises · Partners"}
        </p>
        <h2 className="mt-3 max-w-2xl font-display text-3xl font-extrabold uppercase leading-tight md:text-4xl">
          {fr ? "Votre projet de commandite" : "Your sponsorship proposal"}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
          {fr
            ? "Préparez votre dossier, puis envoyez-le par courriel à l’association. Les emplacements et les modalités seront confirmés avec vous."
            : "Prepare your proposal, then email it to the association. Placements and terms will be confirmed with you."}
        </p>
        <nav
          aria-label={fr ? "Sections de la demande de commandite" : "Sponsorship inquiry sections"}
          className="mt-5 grid grid-cols-3 gap-2"
        >
          {[
            ["entreprise", fr ? "Entreprise" : "Business"],
            ["espaces", fr ? "Visibilité" : "Placements"],
            ["projet", fr ? "Projet" : "Proposal"],
          ].map(([id, label], index) => (
            <a
              key={id}
              href={`#commandite-${id}`}
              onClick={(event) => {
                event.preventDefault();
                // Move within the form without changing its safe public campaign URL.
                document.getElementById(`commandite-${id}`)?.scrollIntoView({ block: "start" });
              }}
              className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-2 text-xs font-semibold text-white/80 transition-colors hover:border-white/25 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sport sm:text-sm"
            >
              <span className="text-sport-foreground">{index + 1}</span>
              {label}
            </a>
          ))}
        </nav>
      </div>
      <form
        onSubmit={prepare}
        onChange={() => {
          setBrief("");
          setError("");
        }}
        className="space-y-8 p-5 sm:p-7 md:p-8"
      >
        <fieldset id="commandite-entreprise" className="min-w-0 scroll-mt-28">
          <legend className="flex items-center gap-3 font-display text-xl font-bold uppercase">
            <span
              className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.07] text-sm text-sport-foreground"
              aria-hidden
            >
              1
            </span>
            {fr ? "Votre entreprise" : "Your business"}
          </legend>
          <p className="mb-5 mt-2 text-xs text-white/55">
            {fr ? "Les champs marqués d’un * sont requis." : "Fields marked with * are required."}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {field(
              "company",
              fr ? "Entreprise ou franchise" : "Business or franchise",
              "text",
              true,
            )}
            {field("industry", fr ? "Secteur d’activité" : "Industry")}
            {field("area", fr ? "Territoire et succursales" : "Area and locations")}
            {field("website", fr ? "Site web" : "Website", "url")}
            {field("name", fr ? "Personne responsable" : "Contact person", "text", true)}
            {field("role", fr ? "Fonction" : "Role")}
            {field("email", fr ? "Courriel professionnel" : "Business email", "email", true)}
            {field("phone", fr ? "Téléphone" : "Phone", "tel")}
          </div>
        </fieldset>
        <fieldset
          id="commandite-espaces"
          className="min-w-0 scroll-mt-28 border-t border-white/10 pt-6"
        >
          <legend className="flex items-center gap-3 font-display text-xl font-bold uppercase">
            <span
              className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.07] text-sm text-sport-foreground"
              aria-hidden
            >
              2
            </span>
            {fr ? "Les espaces qui vous intéressent" : "Your preferred placements"}
          </legend>
          <p className="mt-2 text-sm leading-relaxed text-white/65">
            {fr
              ? "Plusieurs choix possibles · disponibilités à confirmer"
              : "Multiple choices · availability to be confirmed"}
          </p>
          <p
            aria-live="polite"
            aria-atomic
            className="mt-3 inline-flex min-h-8 items-center gap-2 rounded-full bg-white/[0.06] px-3 text-xs font-semibold text-white/80"
          >
            <Check className="size-3.5 text-sport-foreground" aria-hidden />
            {fr
              ? `${selected.length} emplacement${selected.length > 1 ? "s" : ""} sélectionné${selected.length > 1 ? "s" : ""}`
              : `${selected.length} placement${selected.length === 1 ? "" : "s"} selected`}
          </p>
          <div className="mt-5 space-y-5">
            {PLACEMENT_GROUPS.map(({ Icon, fr: frTitle, en: enTitle, options }) => (
              <div key={enTitle}>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/80">
                  <Icon className="size-4 text-sport-foreground" aria-hidden />
                  {fr ? frTitle : enTitle}
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {OPTIONS.filter(([id]) => (options as readonly string[]).includes(id)).map(
                    ([id, frLabel, enLabel]) => (
                      <label
                        key={id}
                        className="flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border border-white/12 bg-white/[0.025] px-3.5 py-3 text-sm leading-snug transition-colors hover:bg-white/[0.05] has-[:checked]:border-sport/60 has-[:checked]:bg-sport/10 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sport"
                      >
                        <input
                          type="checkbox"
                          name="placement"
                          value={id}
                          checked={selected.includes(id)}
                          onChange={() =>
                            setSelected((current) =>
                              current.includes(id)
                                ? current.filter((x) => x !== id)
                                : [...current, id],
                            )
                          }
                          className="size-5 shrink-0 accent-sport"
                        />
                        <span>{fr ? frLabel : enLabel}</span>
                      </label>
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>
        </fieldset>
        <fieldset
          id="commandite-projet"
          className="min-w-0 scroll-mt-28 border-t border-white/10 pt-6"
        >
          <legend className="mb-5 flex items-center gap-3 font-display text-xl font-bold uppercase">
            <span
              className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.07] text-sm text-sport-foreground"
              aria-hidden
            >
              3
            </span>
            {fr ? "Votre investissement" : "Your investment"}
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block min-w-0 text-sm font-medium text-white/80">
              {fr ? "Budget indicatif (CAD)" : "Indicative budget (CAD)"}
              <select name="budget" className={inputClass}>
                <option>{fr ? "À discuter" : "To discuss"}</option>
                {[
                  "Moins de 500 $ / Under $500",
                  "500–1 500 $",
                  "1 500–5 000 $",
                  "5 000–10 000 $",
                  "10 000–25 000 $",
                  "25 000 $ et plus / $25,000 or more",
                ].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
            <label className="block min-w-0 text-sm font-medium text-white/80">
              {fr ? "Type de contribution" : "Contribution type"}
              <select name="contribution" className={inputClass}>
                {(fr
                  ? ["Financière", "Biens ou équipement", "Services", "Mixte"]
                  : ["Financial", "Goods or equipment", "Services", "Mixed"]
                ).map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
            {field("start", fr ? "Début souhaité" : "Preferred start", "date")}
            {field("end", fr ? "Fin souhaitée" : "Preferred end", "date")}
            {field(
              "scope",
              fr ? "Équipes, catégories ou événements" : "Teams, categories or events",
            )}
            {field(
              "goals",
              fr ? "Objectifs de visibilité ou d’engagement" : "Visibility or engagement goals",
            )}
          </div>
          <label className="mt-4 block text-sm font-medium text-white/80">
            {fr
              ? "Votre proposition, vos besoins et le matériel disponible"
              : "Your proposal, needs and available materials"}
            <textarea name="details" rows={4} maxLength={2000} className={inputClass} />
          </label>
        </fieldset>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.025] p-4 text-sm leading-relaxed text-white/75">
          <input type="checkbox" required className="mt-0.5 size-5 shrink-0 accent-sport" />
          {fr
            ? "J’accepte d’être contacté au sujet de cette demande de commandite. Aucune réservation ni aucun paiement n’est effectué par ce formulaire."
            : "I agree to be contacted about this sponsorship inquiry. This form makes no reservation or payment."}
        </label>
        {error && (
          <p
            role="alert"
            className="rounded-xl border border-red-300/25 bg-red-300/10 p-4 text-sm leading-relaxed text-red-200"
          >
            {error}
          </p>
        )}
        <button
          type="submit"
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-sport px-5 font-semibold text-sport-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sport focus-visible:ring-offset-2 focus-visible:ring-offset-navy-deep sm:w-auto"
        >
          <Send className="size-4" />
          {fr ? "Préparer ma demande" : "Prepare my inquiry"}
          <ArrowRight className="size-4" />
        </button>
      </form>
      {brief && (
        <div role="status" className="border-t border-white/12 bg-competition p-5 sm:p-7 md:p-8">
          <h3 className="flex items-center gap-3 font-display text-xl font-bold uppercase">
            <Check className="size-5 shrink-0 text-sport-foreground" aria-hidden />
            {fr ? "Votre demande est prête" : "Your inquiry is ready"}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            {fr
              ? `Ouvrez votre courriel pour l’envoyer à ${email}, ou téléchargez votre dossier. La demande n’est pas encore envoyée.`
              : `Open your email to send it to ${email}, or download your proposal. The inquiry has not been sent yet.`}
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href={`mailto:${email}?subject=${encodeURIComponent("Commandite AHM Verdun")}&body=${encodeURIComponent(brief)}`}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-sport px-4 text-sm font-semibold text-sport-foreground"
            >
              <Mail className="size-4" />
              {fr ? "Ouvrir mon courriel" : "Open my email"}
            </a>
            <button
              type="button"
              onClick={download}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 px-4 text-sm font-semibold"
            >
              <Download className="size-4" />
              {fr ? "Télécharger le dossier" : "Download proposal"}
            </button>
          </div>
          <details className="mt-5 rounded-xl border border-white/10 px-4 text-sm text-white/75">
            <summary className="cursor-pointer py-3 font-medium">
              {fr ? "Relire ma demande" : "Review my inquiry"}
            </summary>
            <pre className="mt-2 whitespace-pre-wrap break-words rounded-xl bg-navy-deep p-4 font-sans leading-relaxed">
              {brief}
            </pre>
          </details>
        </div>
      )}
    </section>
  );
}
