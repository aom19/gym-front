"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useParams, usePathname, useRouter } from "next/navigation";
import { usePathname as useI18nPathname, useRouter as useI18nRouter } from "@/i18n/navigation";
import { useRouter as useNextRouter } from "next/navigation";
import { useSidebarStore } from "@/store/sidebar";
import { useTheme } from "next-themes";
import { logout } from "@/utils/auth";
import { cn } from "@/lib/utils";
import {
  LogOut,
  Bell,
  ChevronRight,
  ChevronDown,
  User,
  Sun,
  Moon,
  Trees,
  Globe,
} from "lucide-react";
import { useState, useRef, useEffect, useTransition } from "react";

const LANGUAGES = [
  { code: "ro", flag: "🇷🇴", label: "Română" },
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "ru", flag: "🇷🇺", label: "Русский" },
] as const;

const THEMES = [
  { value: "light", Icon: Sun },
  { value: "dark", Icon: Moon },
  { value: "forest", Icon: Trees },
] as const;

export function AdminTopbar() {
  const t = useTranslations("nav");
  const st = useTranslations("sidebar");
  const pt = useTranslations("preferences");
  const locale = useLocale();
  const { collapsed } = useSidebarStore();
  const router = useRouter();
  const i18nRouter = useI18nRouter();
  const nextRouter = useNextRouter();
  const i18nPathname = useI18nPathname();
  const params = useParams();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const lang = (params?.lang as string) ?? "ro";
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    router.replace(`/${lang}/login`);
  };

  function handleLangChange(newLocale: string) {
    if (newLocale === locale) return;
    setLangOpen(false);
    startTransition(() => {
      i18nRouter.replace(i18nPathname, { locale: newLocale });
      nextRouter.refresh();
    });
  }

  function handleThemeChange(value: string) {
    setTheme(value);
    fetch("/users/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ theme: value }),
    }).catch(() => undefined);
  }

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  // Close lang submenu when main menu closes
  useEffect(() => {
    if (!menuOpen) setLangOpen(false);
  }, [menuOpen]);

  const segments = pathname
    .replace(`/${lang}/admin`, "")
    .split("/")
    .filter(Boolean);

  const currentLang = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 flex h-12 items-center border-b border-border bg-background/85 px-5 backdrop-blur-sm transition-[left] duration-200 ease-out",
        collapsed ? "left-[60px]" : "left-56",
      )}
    >
      {/* Breadcrumbs */}
      <nav className="hidden items-center gap-1 text-[13px] md:flex">
        <span className="text-muted-foreground/50">Admin</span>
        {segments.map((seg, i) => (
          <span key={seg} className="flex items-center gap-1">
            <ChevronRight className="size-3 text-muted-foreground/30" />
            <span
              className={cn(
                i === segments.length - 1
                  ? "font-medium text-foreground"
                  : "text-muted-foreground/50",
              )}
            >
              {st(seg) ?? seg}
            </span>
          </span>
        ))}
      </nav>

      <div className="flex-1" />

      {/* Notifications */}
      <button
        className="relative flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        aria-label="Notifications"
      >
        <Bell className="size-3.5" />
        <span className="notification-dot absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-semibold text-primary-foreground">
          3
        </span>
      </button>

      <div className="hidden h-5 w-px bg-border sm:block" />

      {/* User menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={cn(
            "flex items-center gap-2 rounded-lg px-2 py-1 transition-all duration-100",
            menuOpen ? "bg-accent" : "hover:bg-accent",
          )}
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
            <User className="size-3" />
          </div>
          <span className="hidden text-[13px] font-medium text-foreground sm:block">
            Admin
          </span>
          <ChevronDown
            className={cn(
              "hidden size-3 text-muted-foreground transition-transform duration-150 sm:block",
              menuOpen && "rotate-180",
            )}
          />
        </button>

        {/* Dropdown */}
        {menuOpen && (
          <div
            className="absolute right-0 top-full z-50 mt-1.5 w-56 origin-top-right animate-in fade-in-0 zoom-in-95 rounded-xl border border-border bg-popover shadow-lg"
          >
            {/* User info */}
            <div className="px-3 py-2.5 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <User className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-foreground">Admin</p>
                  <p className="truncate text-[11px] text-muted-foreground">admin@gympro.md</p>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="p-1">
              {/* Language selector */}
              <div className="relative">
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] text-foreground transition-colors hover:bg-accent"
                >
                  <Globe className="size-3.5 text-muted-foreground" />
                  <span className="flex-1 text-left">{pt("language")}</span>
                  <span className="flex items-center gap-1 text-[12px] text-muted-foreground">
                    <span>{currentLang.flag}</span>
                    <span>{currentLang.code.toUpperCase()}</span>
                  </span>
                  <ChevronRight
                    className={cn(
                      "size-3 text-muted-foreground/50 transition-transform duration-100",
                      langOpen && "rotate-90",
                    )}
                  />
                </button>

                {/* Language submenu */}
                {langOpen && (
                  <div className={cn("mt-0.5 space-y-px rounded-md border border-border bg-background p-1", isPending && "opacity-60")}>
                    {LANGUAGES.map(({ code, flag, label }) => (
                      <button
                        key={code}
                        onClick={() => handleLangChange(code)}
                        disabled={isPending}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors",
                          locale === code
                            ? "bg-primary/8 text-primary font-medium"
                            : "text-foreground hover:bg-accent",
                        )}
                      >
                        <span className="text-base leading-none">{flag}</span>
                        <span className="flex-1 text-left">{label}</span>
                        {locale === code && (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Theme selector */}
              {mounted && (
                <div className="flex items-center gap-2.5 rounded-md px-2.5 py-1.5">
                  <Sun className="size-3.5 text-muted-foreground" />
                  <span className="flex-1 text-[13px] text-foreground">{pt("theme")}</span>
                  <div className="flex items-center gap-0.5 rounded-md border border-border bg-background p-0.5">
                    {THEMES.map(({ value, Icon }) => (
                      <button
                        key={value}
                        onClick={() => handleThemeChange(value)}
                        title={pt(value as "light" | "dark" | "forest")}
                        className={cn(
                          "rounded p-1 transition-colors duration-100",
                          theme === value
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                        )}
                      >
                        <Icon className="size-3" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Divider + Logout */}
            <div className="border-t border-border p-1">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <LogOut className="size-3.5" />
                {t("logout")}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
