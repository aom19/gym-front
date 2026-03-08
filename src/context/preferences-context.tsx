"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useTheme } from "next-themes";
import { useParams, usePathname, useRouter } from "next/navigation";

interface UserPreferences {
  language: string;
  theme: string;
}

interface PreferencesContextValue {
  language: string;
  theme: string;
  changeLanguage: (lang: string) => void;
  changeTheme: (theme: string) => void;
}

const PreferencesContext = createContext<PreferencesContextValue>({
  language: "ro",
  theme: "light",
  changeLanguage: () => undefined,
  changeTheme: () => undefined,
});

export function usePreferences() {
  return useContext(PreferencesContext);
}

export function PreferencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, setTheme } = useTheme();
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const lang = (params?.lang as string) ?? "ro";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // On mount, if user is logged in sync preferences from API
  useEffect(() => {
    if (!mounted) return;

    async function syncFromApi() {
      try {
        const res = await fetch("/users/preferences", { credentials: "include" });
        if (!res.ok) return;

        const data = (await res.json()) as UserPreferences;

        if (data.theme && ["light", "dark", "forest"].includes(data.theme)) {
          setTheme(data.theme);
        }
      } catch {
        // Not logged in or network error — silent
      }
    }

    syncFromApi();
  }, [mounted, setTheme]);

  const changeLanguage = useCallback(
    (newLang: string) => {
      const locales = ["ro", "en", "ru"];
      if (!locales.includes(newLang)) return;

      // Swap the locale segment in the current pathname
      const newPath = pathname.replace(/^\/(?:ro|en|ru)(?=\/|$)/, `/${newLang}`);
      router.push(newPath);
    },
    [pathname, router],
  );

  const changeTheme = useCallback(
    (newTheme: string) => {
      setTheme(newTheme);
      // Sync with API (fire and forget)
      fetch("/users/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ theme: newTheme }),
      }).catch(() => undefined);
    },
    [setTheme],
  );

  return (
    <PreferencesContext.Provider
      value={{
        language: lang,
        theme: theme ?? "light",
        changeLanguage,
        changeTheme,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}
