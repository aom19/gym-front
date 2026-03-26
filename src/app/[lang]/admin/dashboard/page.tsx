import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getUser } from "@/utils/auth";
import {
  Users,
  CreditCard,
  CheckSquare,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  Activity,
  Calendar,
} from "lucide-react";

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  setRequestLocale(lang);
  const user = await getUser();

  if (!user || user.role !== "ADMIN") {
    redirect(`/${lang}/login`);
  }

  const t = await getTranslations("dashboard");

  const stats = [
    {
      labelKey: "totalMembers",
      value: "1,248",
      icon: Users,
      delta: "+12",
      deltaLabel: "this month",
      trend: "up" as const,
      iconBg: "bg-blue-500/8 dark:bg-blue-500/12",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      labelKey: "activeSubscriptions",
      value: "984",
      icon: CreditCard,
      delta: "+8",
      deltaLabel: "this week",
      trend: "up" as const,
      iconBg: "bg-violet-500/8 dark:bg-violet-500/12",
      iconColor: "text-violet-600 dark:text-violet-400",
    },
    {
      labelKey: "todayCheckins",
      value: "73",
      icon: CheckSquare,
      delta: "of 89",
      deltaLabel: "expected",
      trend: "neutral" as const,
      iconBg: "bg-emerald-500/8 dark:bg-emerald-500/12",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      labelKey: "monthlyRevenue",
      value: "€48,320",
      icon: DollarSign,
      delta: "+6.3%",
      deltaLabel: "vs last month",
      trend: "up" as const,
      iconBg: "bg-amber-500/8 dark:bg-amber-500/12",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
  ];

  const revenueData = [32000, 36000, 34500, 39000, 42000, 45500, 48320];
  const maxRevenue = Math.max(...revenueData);
  const months = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            {t("title")}
          </h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">{t("overview")}</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-md border border-primary/15 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary">
          <Activity className="size-3" />
          Live
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-40" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(
          ({ labelKey, value, icon: Icon, delta, deltaLabel, trend, iconBg, iconColor }) => (
            <div
              key={labelKey}
              className="card-hover rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-start justify-between">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {t(labelKey)}
                </p>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBg}`}
                >
                  <Icon className={`size-3.5 ${iconColor}`} />
                </div>
              </div>

              <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">
                {value}
              </p>

              <div className="mt-1.5 flex items-center gap-1">
                {trend === "up" && (
                  <span className="flex items-center gap-0.5 rounded-md bg-emerald-500/8 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:bg-emerald-500/12 dark:text-emerald-400">
                    <ArrowUpRight className="size-2.5" />
                    {delta}
                  </span>
                )}
                {trend === "neutral" && (
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {delta}
                  </span>
                )}
                <span className="text-[11px] text-muted-foreground">{deltaLabel}</span>
              </div>
            </div>
          ),
        )}
      </div>

      {/* Revenue chart + Recent activity */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Revenue chart */}
        <div className="lg:col-span-3 rounded-xl border border-border bg-card p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-[13px] font-semibold text-foreground">
                Monthly Revenue
              </h2>
              <p className="text-[11px] text-muted-foreground">Last 7 months</p>
            </div>
            <span className="flex items-center gap-1 rounded-md bg-emerald-500/8 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:bg-emerald-500/12 dark:text-emerald-400">
              <TrendingUp className="size-2.5" />
              +6.3%
            </span>
          </div>

          <div className="flex h-36 items-end gap-1.5">
            {revenueData.map((v, i) => {
              const heightPct = Math.round((v / maxRevenue) * 100);
              const isLast = i === revenueData.length - 1;
              return (
                <div
                  key={i}
                  className="group/bar flex flex-1 flex-col items-center gap-1"
                >
                  <span className="text-[9px] font-medium tabular-nums text-muted-foreground opacity-0 transition-opacity group-hover/bar:opacity-100">
                    €{(v / 1000).toFixed(1)}k
                  </span>
                  <div
                    className={`w-full rounded-sm transition-colors duration-150 ${
                      isLast
                        ? "bg-primary"
                        : "bg-primary/15 group-hover/bar:bg-primary/30"
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
            {months.map((m) => (
              <span key={m} className="flex-1 text-center">
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-foreground">
              {t("recentActivity")}
            </h2>
            <Calendar className="size-3.5 text-muted-foreground" />
          </div>

          <div className="flex flex-col gap-0.5">
            {[
              {
                name: "Ion Popa",
                action: "Checked in",
                initials: "IP",
                color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                time: "2m ago",
              },
              {
                name: "Maria Ionescu",
                action: "Started Premium",
                initials: "MI",
                color: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
                time: "15m ago",
              },
              {
                name: "Alexandru Rusu",
                action: "Checked in — Botanica",
                initials: "AR",
                color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                time: "32m ago",
              },
              {
                name: "Elena Cojocaru",
                action: "Renewed Basic",
                initials: "EC",
                color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                time: "1h ago",
              },
              {
                name: "Andrei Mihail",
                action: "Checked in — Central",
                initials: "AM",
                color: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
                time: "1h ago",
              },
            ].map((item) => (
              <div
                key={item.name}
                className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] transition-colors hover:bg-accent"
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[10px] font-bold ${item.color}`}
                >
                  {item.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium leading-snug text-foreground">
                    {item.name}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {item.action}
                  </p>
                </div>
                <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
