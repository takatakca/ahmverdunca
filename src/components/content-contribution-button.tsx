import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, MoreHorizontal, Pencil, Send, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

const CONTRIBUTIONS_VISIBLE =
  import.meta.env["VITE_TAKATAK_CONTENT_CONTRIBUTIONS_VISIBLE"] === "true";

export type ContributionFieldKind =
  | "text"
  | "textarea"
  | "url"
  | "image-url"
  | "number"
  | "date"
  | "time"
  | "string-list"
  | "json";

export type ContributionField = {
  key: string;
  label: { fr: string; en: string };
  kind: ContributionFieldKind;
  current?: unknown;
  placeholder?: { fr: string; en: string };
};

type ContributionResponse = {
  ok?: boolean;
  id?: string;
  priority?: string;
  sla?: string;
  reviewDueAt?: string;
  machineScreening?: string;
  error?: string;
};

function currentToInput(field: ContributionField | undefined) {
  if (!field || field.current == null) return "";
  if (field.kind === "string-list" && Array.isArray(field.current)) {
    return field.current.map((item) =>
      typeof item === "string"
        ? item
        : JSON.stringify(item),
    ).join("\n");
  }
  if (field.kind === "json" || typeof field.current === "object") {
    try {
      return JSON.stringify(field.current, null, 2);
    } catch {
      return "";
    }
  }
  return String(field.current);
}

function parseFieldValue(field: ContributionField, value: string): unknown {
  const clean = value.trim();
  if (field.kind === "number") {
    const number = Number(clean);
    if (!Number.isFinite(number)) throw new Error("invalid_number");
    return number;
  }
  if (field.kind === "string-list") {
    return clean.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  }
  if (field.kind === "json") {
    return JSON.parse(clean);
  }
  return clean;
}

export function ContentContributionButton({
  resourceType,
  resourceKey,
  title,
  snapshot,
  fields,
  evidenceRequired = false,
  appearance = "pencil",
  className,
}: {
  resourceType: string;
  resourceKey: string;
  title: string;
  snapshot: Record<string, unknown>;
  fields: readonly ContributionField[];
  evidenceRequired?: boolean;
  appearance?: "pencil" | "menu";
  className?: string;
}) {
  const { lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [fieldKey, setFieldKey] = useState(fields[0]?.key ?? "");
  const selected = useMemo(
    () => fields.find((field) => field.key === fieldKey) ?? fields[0],
    [fieldKey, fields],
  );
  const [value, setValue] = useState(() => currentToInput(selected));
  const [reason, setReason] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<ContributionResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setValue(currentToInput(selected));
  }, [selected]);

  if (!CONTRIBUTIONS_VISIBLE || !selected || fields.length === 0) return null;

  async function submit() {
    const activeField = selected;
    if (!activeField) return;
    setError("");
    setResult(null);
    if (!reason.trim()) {
      setError(lang === "fr" ? "Expliquez brièvement pourquoi cette information doit changer." : "Briefly explain why this information should change.");
      return;
    }
    if (evidenceRequired && !evidenceUrl.trim()) {
      setError(lang === "fr" ? "Une source officielle est obligatoire pour cette correction." : "An official source is required for this correction.");
      return;
    }

    let parsed: unknown;
    try {
      parsed = parseFieldValue(activeField, value);
    } catch {
      setError(lang === "fr" ? "La nouvelle valeur n’est pas dans un format valide." : "The new value is not in a valid format.");
      return;
    }

    setSending(true);
    try {
      const attachmentUrls =
        activeField.kind === "image-url" && typeof parsed === "string" && parsed.startsWith("https://")
          ? [parsed]
          : [];
      const response = await fetch("/api/ahmv/contributions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          idempotencyKey: crypto.randomUUID(),
          resourceType,
          resourceKey,
          action:
            activeField.kind === "image-url"
              ? "replace_media"
              : resourceType === "schedule"
                ? "correct_fact"
                : "update",
          originalSnapshot: snapshot,
          proposedPatch: { [activeField.key]: parsed },
          reason: reason.trim(),
          evidenceUrls: evidenceUrl.trim() ? [evidenceUrl.trim()] : [],
          attachmentUrls,
          targetUrl: window.location.href,
        }),
      });
      const payload = await response.json() as ContributionResponse;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "submission_failed");
      }
      setResult(payload);
    } catch {
      setError(
        lang === "fr"
          ? "La suggestion n’a pas pu être envoyée. Réessayez plus tard."
          : "The suggestion could not be sent. Please try again later.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => {
      setOpen(next);
      if (!next) {
        setResult(null);
        setError("");
        setReason("");
        setEvidenceUrl("");
      }
    }}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            "premium-control inline-flex size-9 items-center justify-center border border-white/16 bg-black/25 text-white/75 backdrop-blur hover:border-sport hover:text-sport-foreground",
            className,
          )}
          aria-label={lang === "fr" ? `Suggérer une correction — ${title}` : `Suggest a correction — ${title}`}
          title={lang === "fr" ? "Suggérer une correction" : "Suggest a correction"}
        >
          {appearance === "menu" ? <MoreHorizontal className="size-4" /> : <Pencil className="size-3.5" />}
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[88vh] overflow-y-auto border-white/12 bg-navy-deep text-white sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-extrabold uppercase">
            {lang === "fr" ? "Suggérer une correction" : "Suggest a correction"}
          </DialogTitle>
          <DialogDescription className="text-white/55">
            {title} · {lang === "fr"
              ? "TAKATAK vérifie la suggestion avant toute publication."
              : "TAKATAK reviews the suggestion before anything is published."}
          </DialogDescription>
        </DialogHeader>

        {result?.ok ? (
          <div className="border border-status-confirmed/35 bg-status-confirmed-soft p-5 text-navy">
            <CheckCircle2 className="size-6" />
            <p className="mt-3 font-display text-xl font-extrabold uppercase">
              {lang === "fr" ? "Suggestion reçue" : "Suggestion received"}
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              {lang === "fr"
                ? `Délai de vérification : ${result.sla ?? "1–7 jours"}. Aucun changement n’est publié sans modération.`
                : `Review target: ${result.sla ?? "1–7 days"}. Nothing is published without moderation.`}
            </p>
            <p className="mt-2 text-xs opacity-65">ID {result.id}</p>
          </div>
        ) : (
          <>
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/55">
                {lang === "fr" ? "Information à corriger" : "Information to correct"}
              </span>
              <select
                value={selected.key}
                onChange={(event) => setFieldKey(event.target.value)}
                className="mt-2 h-11 w-full border border-white/15 bg-competition px-3 text-sm text-white outline-none focus:border-sport"
              >
                {fields.map((field) => (
                  <option key={field.key} value={field.key}>
                    {field.label[lang]}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/55">
                {lang === "fr" ? "Nouvelle valeur proposée" : "Proposed new value"}
              </span>
              {selected.kind === "textarea" || selected.kind === "json" || selected.kind === "string-list" ? (
                <textarea
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  rows={selected.kind === "json" ? 8 : 5}
                  className="mt-2 w-full border border-white/15 bg-competition p-3 font-mono text-sm text-white outline-none focus:border-sport"
                  placeholder={selected.placeholder?.[lang]}
                />
              ) : (
                <input
                  type={selected.kind === "url" || selected.kind === "image-url" ? "url" : selected.kind === "number" ? "number" : selected.kind}
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  className="mt-2 h-11 w-full border border-white/15 bg-competition px-3 text-sm text-white outline-none focus:border-sport"
                  placeholder={selected.placeholder?.[lang]}
                />
              )}
            </label>

            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/55">
                {lang === "fr" ? "Pourquoi?" : "Why?"}
              </span>
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value.slice(0, 2000))}
                rows={3}
                className="mt-2 w-full border border-white/15 bg-competition p-3 text-sm text-white outline-none focus:border-sport"
                placeholder={lang === "fr" ? "Ex. La photo est ancienne; l’entrée est maintenant du côté de…" : "Example: The photo is outdated; the entrance is now on…"}
              />
            </label>

            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/55">
                {lang === "fr"
                  ? evidenceRequired
                    ? "Source officielle · obligatoire"
                    : "Source ou preuve · recommandée"
                  : evidenceRequired
                    ? "Official source · required"
                    : "Source or evidence · recommended"}
              </span>
              <input
                type="url"
                value={evidenceUrl}
                onChange={(event) => setEvidenceUrl(event.target.value.slice(0, 1200))}
                className="mt-2 h-11 w-full border border-white/15 bg-competition px-3 text-sm text-white outline-none focus:border-sport"
                placeholder="https://…"
              />
            </label>

            {error ? <p className="text-sm font-semibold text-red-300">{error}</p> : null}

            <div className="border border-white/10 bg-white/[0.025] p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-sport-foreground" />
                <p className="text-xs leading-relaxed text-white/52">
                  {lang === "fr"
                    ? "Les membres payants authentifiés obtiennent une priorité de vérification de 48 h. Les autres suggestions visent 1 à 7 jours. Le statut membre ne donne jamais le droit de publier directement."
                    : "Authenticated paid members receive a 48-hour review priority. Other suggestions target 1–7 days. Membership never grants direct publishing rights."}
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={sending}
              onClick={() => void submit()}
              className="premium-control inline-flex min-h-12 items-center justify-center gap-2 bg-sport px-5 text-xs font-extrabold uppercase tracking-[0.12em] text-sport-foreground disabled:opacity-50"
            >
              <Send className="size-4" />
              {sending
                ? (lang === "fr" ? "Envoi…" : "Sending…")
                : (lang === "fr" ? "Envoyer à la modération" : "Send for moderation")}
            </button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
