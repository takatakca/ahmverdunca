import type { PhoneLanguage } from "../../../lib/ahmv-phone.ts";

export const PHONE_LANGUAGE_CONFIG = {
  fr: {
    locale: "fr-CA",
    voice: "Polly.Chantal",
  },
  en: {
    locale: "en-US",
    voice: "Polly.Joanna",
  },
  es: {
    locale: "es-MX",
    voice: "Polly.Mia",
  },
} as const satisfies Record<
  PhoneLanguage,
  { locale: string; voice: string }
>;

export function phoneText(
  lang: PhoneLanguage,
  values: Record<PhoneLanguage, string>,
) {
  return values[lang];
}

export function phoneLanguageFromQuery(value: string | null): PhoneLanguage {
  return value === "en" || value === "es" ? value : "fr";
}
