import { useState, type FormEvent } from "react";
import { ArrowRight, Download, Mail, Send } from "lucide-react";
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

export function SponsorshipInquiry() {
  const { lang } = useI18n();
  const fr = lang === "fr";
  const [selected, setSelected] = useState<string[]>([]);
  const [brief, setBrief] = useState("");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const email = import.meta.env["VITE_SPONSORSHIP_EMAIL"]?.trim() || "ahmverdun.ca@gmail.com";
  const inputClass =
    "mt-2 min-h-12 w-full rounded-xl border border-white/15 bg-navy-deep px-3 py-2 text-sm text-white outline-none focus:border-sport focus:ring-2 focus:ring-sport/20";
  const field = (name: string, label: string, type = "text", required = false) => (
    <label className="block text-xs font-semibold text-white/75">
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
      className="scroll-mt-28 overflow-hidden rounded-2xl border border-white/15 bg-navy-deep text-white"
    >
      <div className="border-b border-white/10 bg-competition p-5 md:p-7">
        <p className="text-xs font-semibold text-sport-foreground">
          {fr ? "Entreprises · Franchises · Partenaires" : "Businesses · Franchises · Partners"}
        </p>
        <h2 className="mt-2 font-display text-3xl font-extrabold uppercase md:text-4xl">
          {fr ? "Votre projet de commandite" : "Your sponsorship proposal"}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-white/60">
          {fr
            ? "Présentez votre entreprise, vos objectifs et les espaces qui vous intéressent. Les disponibilités et les droits d’affichage seront confirmés avec vous."
            : "Share your business, goals and preferred placements. Availability and display rights will be confirmed with you."}
        </p>
      </div>
      <form onSubmit={prepare} onChange={() => setBrief("")} className="space-y-6 p-5 md:p-7">
        <fieldset>
          <legend className="mb-4 font-display text-xl font-bold uppercase">
            {fr ? "Votre entreprise" : "Your business"}
          </legend>
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
        <fieldset>
          <legend className="mb-2 font-display text-xl font-bold uppercase">
            {fr ? "Les espaces qui vous intéressent" : "Your preferred placements"}
          </legend>
          <p className="mb-4 text-xs text-white/50">
            {fr
              ? "Plusieurs choix possibles · disponibilités à confirmer"
              : "Multiple choices · availability to be confirmed"}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {OPTIONS.map(([id, frLabel, enLabel]) => (
              <label
                key={id}
                className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-white/12 bg-white/[0.025] p-3 text-sm has-[:checked]:border-sport/50 has-[:checked]:bg-sport/10"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(id)}
                  onChange={() =>
                    setSelected((current) =>
                      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
                    )
                  }
                  className="size-4 accent-sport"
                />
                {fr ? frLabel : enLabel}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-4 font-display text-xl font-bold uppercase">
            {fr ? "Votre investissement" : "Your investment"}
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-xs font-semibold text-white/75">
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
            <label className="text-xs font-semibold text-white/75">
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
          <label className="mt-4 block text-xs font-semibold text-white/75">
            {fr
              ? "Votre proposition, vos besoins et le matériel disponible"
              : "Your proposal, needs and available materials"}
            <textarea name="details" rows={4} maxLength={2000} className={inputClass} />
          </label>
        </fieldset>
        <label className="flex items-start gap-3 text-xs leading-relaxed text-white/65">
          <input type="checkbox" required className="mt-0.5 size-4 shrink-0 accent-sport" />
          {fr
            ? "J’accepte d’être contacté au sujet de cette demande de commandite. Aucune réservation ni aucun paiement n’est effectué par ce formulaire."
            : "I agree to be contacted about this sponsorship inquiry. This form makes no reservation or payment."}
        </label>
        {error && (
          <p role="alert" className="text-sm text-red-300">
            {error}
          </p>
        )}
        <button
          type="submit"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-sport px-5 font-semibold text-sport-foreground"
        >
          <Send className="size-4" />
          {fr ? "Préparer ma demande" : "Prepare my inquiry"}
          <ArrowRight className="size-4" />
        </button>
      </form>
      {brief && (
        <div role="status" className="border-t border-white/12 bg-competition p-5 md:p-7">
          <h3 className="font-display text-xl font-bold uppercase">
            {fr ? "Votre demande est prête" : "Your inquiry is ready"}
          </h3>
          <p className="mt-2 text-sm text-white/65">
            {fr
              ? `Ouvrez votre courriel pour l’envoyer à ${email}, ou téléchargez votre dossier. La demande n’est pas encore envoyée.`
              : `Open your email to send it to ${email}, or download your proposal. The inquiry has not been sent yet.`}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={`mailto:${email}?subject=${encodeURIComponent("Commandite AHM Verdun")}&body=${encodeURIComponent(brief)}`}
              className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-sport px-4 text-sm font-semibold text-sport-foreground"
            >
              <Mail className="size-4" />
              {fr ? "Ouvrir mon courriel" : "Open my email"}
            </a>
            <button
              type="button"
              onClick={download}
              className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/20 px-4 text-sm font-semibold"
            >
              <Download className="size-4" />
              {fr ? "Télécharger le dossier" : "Download proposal"}
            </button>
          </div>
          <details className="mt-4 text-xs text-white/65">
            <summary className="cursor-pointer py-2">
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
