import { createHash } from "node:crypto";
import type { PhoneLanguage } from "../../../lib/ahmv-phone.ts";

export const TWILIO_ROOT = "/api/ahmv/twilio";
export const TWILIO_ROUTES = new Set([
  `${TWILIO_ROOT}/sms`,
  `${TWILIO_ROOT}/voice`,
  `${TWILIO_ROOT}/status`,
]);
export const TWILIO_HEADERS = {
  "cache-control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
};

export type TwilioSettings = Record<string, string | undefined>;
export type TwilioLog = (outcome: string) => void;

export function xmlResponse(value: string) {
  return new Response(value, {
    headers: {
      ...TWILIO_HEADERS,
      "content-type": "text/xml; charset=utf-8",
    },
  });
}

export function webhookFailure(status: number) {
  return new Response("Webhook unavailable", {
    status,
    headers: TWILIO_HEADERS,
  });
}

export function teamAliases(settings: TwilioSettings): Record<string, string> {
  if (!settings["AHMV_TEAM_ALIASES_JSON"]) return {};
  const value: unknown = JSON.parse(settings["AHMV_TEAM_ALIASES_JSON"]);
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.values(value).some((item) => typeof item !== "string")
  ) {
    throw new Error("Invalid team aliases");
  }
  return value as Record<string, string>;
}

export function urgentBulletin(settings: TwilioSettings, lang: PhoneLanguage) {
  const until = Date.parse(settings["AHMV_URGENT_UNTIL"] ?? "");
  if (!Number.isFinite(until) || until <= Date.now()) return "";
  const key = lang === "fr" ? "AHMV_URGENT_FR" : lang === "es" ? "AHMV_URGENT_ES" : "AHMV_URGENT_EN";
  return (settings[key] ?? "").slice(0, 1000);
}

export function twilioReferenceHash(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

export function spokenScheduleAnswer(text: string, lang: PhoneLanguage) {
  return text.replace(
    /https:\/\/\S+/g,
    lang === "fr"
      ? "Consultez ahmverdun point c a pour les détails."
      : lang === "es"
        ? "Consulte ahmverdun punto c a para más detalles."
        : "Visit ahmverdun dot c a for details.",
  );
}

export function compactSmsFallback(lang: PhoneLanguage) {
  return lang === "fr"
    ? "AHMV: répondez à ce texto avec votre équipe ou groupe (ex. M11 groupe 5). Aide: AIDE. https://ahmverdun.ca/horaires"
    : lang === "es"
      ? "AHMV: responda con su equipo o grupo (ej. M11 grupo 5). Ayuda: AYUDA. https://ahmverdun.ca/horaires"
      : "AHMV: reply with your team or group (e.g. M11 group 5). Help: HELP. https://ahmverdun.ca/horaires";
}
