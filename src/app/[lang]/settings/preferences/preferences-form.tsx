"use client";

import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";
import toast from "react-hot-toast";
import { useTheme } from "next-themes";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

export function PreferencesForm() {
  const t = useTranslations("preferences");
  const { theme } = useTheme();
  const locale = useLocale();

  async function handleSave() {
    try {
      const res = await fetch("/users/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ language: locale, theme }),
      });

      if (!res.ok) {
        toast.error("Failed to save preferences");
        return;
      }

      toast.success(t("savedMessage"));
    } catch {
      toast.error("Unexpected error");
    }
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <p className="text-sm font-medium text-foreground">{t("language")}</p>
        <LanguageSwitcher />
      </div>

      <div className="grid gap-2">
        <p className="text-sm font-medium text-foreground">{t("theme")}</p>
        <ThemeSwitcher />
      </div>

      <button
        onClick={handleSave}
        className="mt-2 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
      >
        {t("saveButton")}
      </button>
    </div>
  );
}
