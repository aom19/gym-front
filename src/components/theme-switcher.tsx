"use client";

import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { Sun, Moon, Trees } from "lucide-react";
import { useEffect, useState } from "react";

const THEMES = [
  { value: "light", Icon: Sun },
  { value: "dark", Icon: Moon },
  { value: "forest", Icon: Trees },
] as const;

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const t = useTranslations("preferences");
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch — only render after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-8 w-28 rounded-lg border border-border bg-card" />;
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
      {THEMES.map(({ value, Icon }) => (
        <button
          key={value}
          onClick={() => {
            setTheme(value);
            // Sync with API (fire and forget)
            fetch("/users/preferences", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ theme: value }),
            }).catch(() => undefined);
          }}
          title={t(value as "light" | "dark" | "forest")}
          aria-pressed={theme === value}
          className={`rounded-md p-1.5 transition ${
            theme === value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          <Icon className="h-3.5 w-3.5" />
          <span className="sr-only">{t(value as "light" | "dark" | "forest")}</span>
        </button>
      ))}
    </div>
  );
}
