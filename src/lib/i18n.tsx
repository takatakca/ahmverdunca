import { readBrowserPreference, writeBrowserPreference } from "./browser-preferences";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { translations, type TranslationKey } from "./translations";

export type Lang = "fr" | "en";
export type Localized = { fr: string; en: string };

const STORAGE_KEY = "ahmv-lang";

interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
  /** Picks the current language from a localized object; falls back to FR. */
  l: (value: Localized | string | undefined) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  // French by default; read the persisted choice after hydration to avoid mismatches.
  const [lang, setLangState] = useState<Lang>("fr");

  useEffect(() => {
    const stored = readBrowserPreference(STORAGE_KEY);
    if (stored === "en" || stored === "fr") setLangState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    writeBrowserPreference(STORAGE_KEY, l);
  }, []);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      setLang,
      t: (key) => translations[key]?.[lang] ?? translations[key]?.fr ?? key,
      l: (v) => (typeof v === "string" ? v : v ? (v[lang] || v.fr) : ""),
    }),
    [lang, setLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export function formatDate(iso: string, lang: Lang, opts: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long", year: "numeric" }) {
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
  return new Intl.DateTimeFormat(lang === "fr" ? "fr-CA" : "en-CA", opts).format(d);
}

export function formatShortDate(iso: string, lang: Lang) {
  return formatDate(iso, lang, { day: "numeric", month: "short", year: "numeric" });
}
