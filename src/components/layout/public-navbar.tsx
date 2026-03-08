"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { MenuIcon, Dumbbell } from "lucide-react";

const publicLinks = [
  "home",
  "memberships",
  "classes",
  "locations",
  "about",
  "contact",
] as const;

export function PublicNavbar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function hrefFor(key: string) {
    return key === "home" ? "/" : `/${key}`;
  }

  function isActive(key: string) {
    const href = key === "home" ? "/" : `/${key}`;
    return pathname === href || (key !== "home" && pathname.startsWith(`/${key}`));
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-backdrop-filter:backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mr-6">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Dumbbell className="size-4" />
          </div>
          <span className="text-sm font-semibold text-foreground">GymPro</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {publicLinks.map((key) => (
            <Link
              key={key}
              href={hrefFor(key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(key)
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {t(key)}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-2 ml-auto">
          <LanguageSwitcher />
          <ThemeSwitcher />
          <Button variant="default" size="sm" render={<Link href="/login" />}>
            {t("login")}
          </Button>
        </div>

        {/* Mobile hamburger */}
        <div className="flex md:hidden items-center gap-2 ml-auto">
          <LanguageSwitcher />
          <ThemeSwitcher />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="Open menu" />
              }
            >
              <MenuIcon className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-64 pt-10">
              <nav className="flex flex-col gap-1 p-4">
                {publicLinks.map((key) => (
                  <Link
                    key={key}
                    href={hrefFor(key)}
                    onClick={() => setOpen(false)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(key)
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {t(key)}
                  </Link>
                ))}
                <Separator className="my-2" />
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground text-center"
                >
                  {t("login")}
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
