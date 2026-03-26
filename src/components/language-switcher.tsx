"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useRouter as useNextRouter } from "next/navigation";
import { Globe } from "lucide-react";

const LOCALES = [
  { code: "ro", label: "RO" },
  { code: "en", label: "EN" },
  { code: "ru", label: "RU" },
] as const;

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const nextRouter = useNextRouter();
  const [isPending, startTransition] = useTransition();

  function handleChange(newLocale: string) {
    if (newLocale === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
      nextRouter.refresh();
    });
  }

  return (
    <div className={`flex items-center gap-0.5 rounded-md border border-border bg-card p-0.5 transition-opacity ${isPending ? "opacity-60" : ""}`}>
      <Globe className="ml-1 h-3 w-3 text-muted-foreground" />
      {LOCALES.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => handleChange(code)}
          disabled={isPending}
          className={`rounded px-1.5 py-0.5 text-[11px] font-medium transition ${
            locale === code
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          }`}
          aria-pressed={locale === code}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

