import type { PhoneLanguage } from "../../lib/ahmv-phone.ts";

export interface PhoneLocalizedText {
  fr: string;
  en: string;
  es: string;
}

export function phoneText(
  lang: PhoneLanguage,
  text: PhoneLocalizedText,
) {
  return text[lang];
}

export function phoneLocale(lang: PhoneLanguage) {
  if (lang === "fr") return "fr-CA" as const;
  if (lang === "es") return "es-US" as const;
  return "en-US" as const;
}

export function phoneVoice(lang: PhoneLanguage) {
  if (lang === "fr") return "Polly.Chantal" as const;
  if (lang === "es") return "Polly.Lupe-Neural" as const;
  return "Polly.Joanna" as const;
}

export function phoneDateLocale(lang: PhoneLanguage) {
  if (lang === "fr") return "fr-CA";
  if (lang === "es") return "es-US";
  return "en-CA";
}

export function phoneLanguagePrefix(lang: PhoneLanguage) {
  return lang.toUpperCase();
}
