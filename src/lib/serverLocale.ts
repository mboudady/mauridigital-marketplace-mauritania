import { cookies } from "next/headers";
import { translations, type Locale, type TranslationKey } from "@/lib/i18n";

export async function getServerLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get("souq_locale")?.value;
  return value === "fr" || value === "ar" ? value : "en";
}

export async function getServerTranslator() {
  const locale = await getServerLocale();
  return {
    locale,
    dir: locale === "ar" ? ("rtl" as const) : ("ltr" as const),
    t: (key: TranslationKey) => translations[locale][key] ?? translations.en[key],
  };
}
