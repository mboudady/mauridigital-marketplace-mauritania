"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { LOCALES, translations, type Locale, type TranslationKey } from "@/lib/i18n";

const LOCALE_COOKIE = "souq_locale";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TranslationKey) => string;
  dir: "ltr" | "rtl";
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readCookieLocale(): Locale {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(new RegExp(`${LOCALE_COOKIE}=(en|fr|ar)`));
  return (match?.[1] as Locale) ?? "en";
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    setLocaleState(readCookieLocale());
  }, []);

  const dir = LOCALES.find((l) => l.code === locale)?.dir ?? "ltr";

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;
  }, [dir, locale]);

  function setLocale(l: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000`;
    setLocaleState(l);
  }

  function t(key: TranslationKey): string {
    return translations[locale][key] ?? translations.en[key];
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, dir }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
