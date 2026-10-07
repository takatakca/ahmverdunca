import { readBrowserPreference, writeBrowserPreference } from "./browser-preferences";
export type AssistantLanguageCode =
  | "fr"
  | "en"
  | "es"
  | "pt"
  | "ar"
  | "zh"
  | "pa"
  | "it"
  | "ht";

export const ASSISTANT_LANGUAGE_STORAGE_KEY = "ahmv-assistant-language";

export const ASSISTANT_LANGUAGE_OPTIONS: ReadonlyArray<{
  code: AssistantLanguageCode;
  label: string;
  nativeLabel: string;
  speechLocale: string;
  fullSite: boolean;
}> = [
  { code: "fr", label: "Français", nativeLabel: "Français", speechLocale: "fr-CA", fullSite: true },
  { code: "en", label: "English", nativeLabel: "English", speechLocale: "en-CA", fullSite: true },
  { code: "es", label: "Spanish", nativeLabel: "Español", speechLocale: "es-CA", fullSite: false },
  { code: "pt", label: "Portuguese", nativeLabel: "Português", speechLocale: "pt-PT", fullSite: false },
  { code: "ar", label: "Arabic", nativeLabel: "العربية", speechLocale: "ar-CA", fullSite: false },
  { code: "zh", label: "Chinese", nativeLabel: "中文", speechLocale: "zh-CN", fullSite: false },
  { code: "pa", label: "Punjabi", nativeLabel: "ਪੰਜਾਬੀ", speechLocale: "pa-IN", fullSite: false },
  { code: "it", label: "Italian", nativeLabel: "Italiano", speechLocale: "it-IT", fullSite: false },
  { code: "ht", label: "Haitian Creole", nativeLabel: "Kreyòl ayisyen", speechLocale: "fr-CA", fullSite: false },
] as const;

export function isAssistantLanguageCode(value: unknown): value is AssistantLanguageCode {
  return ASSISTANT_LANGUAGE_OPTIONS.some((option) => option.code === value);
}

export function assistantUiLanguage(code: AssistantLanguageCode): "fr" | "en" | "es" {
  if (code === "fr" || code === "es") return code;
  return "en";
}

export function speechLocaleForAssistant(code: AssistantLanguageCode) {
  return ASSISTANT_LANGUAGE_OPTIONS.find((option) => option.code === code)?.speechLocale ?? "fr-CA";
}

export function saveAssistantLanguage(code: AssistantLanguageCode) {
  writeBrowserPreference(ASSISTANT_LANGUAGE_STORAGE_KEY, code);
}

export function readAssistantLanguage(fallback: AssistantLanguageCode = "fr"): AssistantLanguageCode {
  const stored = readBrowserPreference(ASSISTANT_LANGUAGE_STORAGE_KEY);
  return isAssistantLanguageCode(stored) ? stored : fallback;
}
