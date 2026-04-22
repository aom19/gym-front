"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
    MenuIcon,
    Dumbbell,
    Activity,
    Calendar,
    CalendarDays,
    ClipboardList,
    LogOut,
} from "lucide-react";

const memberLinks = [
    { key: "myClasses", href: "/member/my-classes", Icon: Calendar },
    { key: "calendar", href: "/member/calendar", Icon: CalendarDays },
    { key: "myProgress", href: "/member/progress", Icon: Activity },
    { key: "myWorkouts", href: "/member/workouts", Icon: ClipboardList },
] as const;

export function MemberNavbar() {
    const t = useTranslations("memberPortal");
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    function isActive(href: string) {
        return pathname === href || pathname.startsWith(`${href}/`);
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-backdrop-filter:backdrop-blur-md">
            <div className="mx-auto flex h-14 max-w-5xl items-center px-4 sm:px-6">
                {/* Logo */}
                <Link href="/member/my-classes" className="flex items-center gap-2 mr-6">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Dumbbell className="size-4" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">GymPro</span>
                </Link>

                {/* Desktop nav */}
                <nav className="hidden md:flex items-center gap-1 flex-1">
                    {memberLinks.map(({ key, href, Icon }) => (
                        <Link
                            key={key}
                            href={href}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                isActive(href)
                                    ? "bg-muted text-foreground"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            }`}
                        >
                            <Icon className="size-3.5 shrink-0" />
                            {t(key)}
                        </Link>
                    ))}
                </nav>

                {/* Right side */}
                <div className="hidden md:flex items-center gap-2 ml-auto">
                    <LanguageSwitcher />
                    <ThemeSwitcher />
                    <LogoutButton className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                        <LogOut className="size-3.5" />
                        {t("logout" as never)}
                    </LogoutButton>
                </div>

                {/* Mobile hamburger */}
                <div className="flex md:hidden items-center gap-2 ml-auto">
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger
                            render={
                                <Button variant="ghost" size="icon" aria-label="Open menu" />
                            }
                        >
                            <MenuIcon className="size-5" />
                        </SheetTrigger>
                        <SheetContent side="right" className="w-64 pt-10">
                            <nav className="mt-6 flex flex-col gap-1">
                                {memberLinks.map(({ key, href, Icon }) => (
                                    <Link
                                        key={key}
                                        href={href}
                                        onClick={() => setOpen(false)}
                                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                            isActive(href)
                                                ? "bg-muted text-foreground"
                                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                        }`}
                                    >
                                        <Icon className="size-4 shrink-0" />
                                        {t(key)}
                                    </Link>
                                ))}
                            </nav>
                            <Separator className="my-4" />
                            <div className="flex items-center gap-2">
                                <LanguageSwitcher />
                                <ThemeSwitcher />
                            </div>
                            <div className="mt-4">
                                <LogoutButton className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors w-full">
                                    <LogOut className="size-4" />
                                    Logout
                                </LogoutButton>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
