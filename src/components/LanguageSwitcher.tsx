"use client";

import { useLocale } from "@/components/LocaleProvider";
import { LOCALES } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="flex gap-2">
      {LOCALES.map((l) => (
        <button
          key={l.code}
          onClick={() => setLocale(l.code)}
          className={`rounded-full border px-3 py-1.5 text-xs ${
            locale === l.code
              ? "border-ink-50 bg-ink-50 text-ink-950"
              : "border-ink-600 text-ink-300"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
