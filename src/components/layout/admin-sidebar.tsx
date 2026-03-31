"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebar";
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
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
  ClipboardList,
  Calendar,
  Clock,
  TrendingUp,
  Activity,
} from "lucide-react";

interface NavItem {
  key: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "main",
    items: [
      { key: "dashboard", icon: LayoutDashboard, href: "dashboard" },
      { key: "trainerDashboard", icon: Activity, href: "trainer-dashboard" },
      { key: "members", icon: Users, href: "members" },
      { key: "checkins", icon: CheckSquare, href: "checkins" },
    ],
  },
  {
    label: "management",
    items: [
      { key: "subscriptions", icon: CreditCard, href: "subscriptions" },
      { key: "payments", icon: DollarSign, href: "payments" },
      { key: "locations", icon: MapPin, href: "locations" },
      { key: "schedule", icon: Clock, href: "schedule" },
    ],
  },
  {
    label: "training",
    items: [
      { key: "exercises", icon: Dumbbell, href: "exercises" },
      { key: "workouts", icon: ClipboardList, href: "workouts" },
      { key: "classes", icon: Calendar, href: "classes" },
      { key: "progress", icon: TrendingUp, href: "progress" },
    ],
  },
  {
    label: "system",
    items: [
      { key: "users", icon: UserCog, href: "users" },
      { key: "roles", icon: ShieldCheck, href: "roles" },
      { key: "reports", icon: BarChart3, href: "reports" },
      { key: "settings", icon: Settings, href: "settings" },
    ],
  },
];

export function AdminSidebar() {
  const t = useTranslations("sidebar");
  const lang = useLocale();
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebarStore();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ease-out",
        collapsed ? "w-[60px]" : "w-56",
      )}
    >
      {/* Logo area */}
      <div className="flex h-14 items-center border-b border-sidebar-border px-3">
        <Link
          href={`/${lang}/admin/dashboard`}
          className={cn(
            "flex items-center gap-2.5 rounded-md px-1.5 py-1 transition-colors hover:bg-sidebar-accent",
            collapsed && "justify-center px-0",
          )}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Dumbbell className="size-3.5" />
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">
              GymPro
            </span>
          )}
        </Link>
        <button
          onClick={toggle}
          className={cn(
            "ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
            collapsed && "ml-0 mt-1",
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-3.5" />
          ) : (
            <PanelLeftClose className="size-3.5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-px overflow-y-auto px-2 py-2 scrollbar-none">
        {navGroups.map((group, gi) => (
          <div key={group.label}>
            {!collapsed && gi > 0 && (
              <div className="nav-group-label">{t(group.label)}</div>
            )}
            {collapsed && gi > 0 && (
              <div className="my-2.5 mx-2.5 h-px bg-sidebar-border" />
            )}

            {group.items.map(({ key, icon: Icon, href }) => {
              const fullHref = `/${lang}/admin/${href}`;
              const isActive =
                pathname === fullHref ||
                (href === "dashboard" && pathname.endsWith("/admin/dashboard"));

              return (
                <Link
                  key={key}
                  href={fullHref}
                  title={collapsed ? t(key) : undefined}
                  className={cn(
                    "group/item relative flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors duration-100",
                    collapsed && "justify-center px-0",
                    isActive
                      ? "bg-primary/8 text-primary"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r-full bg-primary" />
                  )}
                  <Icon className="size-4 shrink-0" />
                  {!collapsed && <span className="flex-1 truncate">{t(key)}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-sidebar-border px-2 py-2">
        {collapsed ? (
          <button
            onClick={toggle}
            className="flex w-full items-center justify-center rounded-md py-1.5 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <PanelLeftOpen className="size-3.5" />
          </button>
        ) : (
          <div className="flex items-center gap-2.5 rounded-md px-2.5 py-1.5">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">
              G
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-sidebar-foreground">GymPro</p>
              <p className="text-[10px] text-muted-foreground">v1.0.0</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
