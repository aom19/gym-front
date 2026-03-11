"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  UserCog,
  CreditCard,
  DollarSign,
  CheckSquare,
  Dumbbell,
  MapPin,
  BarChart3,
  Settings,
  Dumbbell as GymLogo,
  ShieldCheck,
} from "lucide-react";

const navItems = [
  { key: "dashboard", icon: LayoutDashboard, href: "dashboard" },
  { key: "members", icon: Users, href: "members" },
  { key: "users", icon: UserCog, href: "users" },
  { key: "subscriptions", icon: CreditCard, href: "subscriptions" },
  { key: "payments", icon: DollarSign, href: "payments" },
  { key: "checkins", icon: CheckSquare, href: "checkins" },
  { key: "workouts", icon: Dumbbell, href: "workouts" },
  { key: "locations", icon: MapPin, href: "locations" },
  { key: "roles", icon: ShieldCheck, href: "roles" },
  { key: "reports", icon: BarChart3, href: "reports" },
  { key: "settings", icon: Settings, href: "settings" },
] as const;

export function AdminSidebar() {
  const t = useTranslations("sidebar");
  const lang = useLocale();
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-border px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <GymLogo className="size-4" />
        </div>
        <span className="text-sm font-semibold text-foreground">GymPro</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
        {navItems.map(({ key, icon: Icon, href }) => {
          const fullHref = `/${lang}/admin/${href}`;
          const isActive =
            pathname === fullHref ||
            (href === "dashboard" && pathname.endsWith("/admin/dashboard"));

          return (
            <Link
              key={key}
              href={fullHref}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {t(key)}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
