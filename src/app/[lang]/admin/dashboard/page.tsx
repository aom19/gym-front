import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getUser } from "@/utils/auth";
import { Users, CreditCard, CheckSquare, DollarSign, TrendingUp, ArrowUpRight, Activity } from "lucide-react";

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
      trend: "up",
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      labelKey: "activeSubscriptions",
      value: "984",
      icon: CreditCard,
      delta: "+8",
      deltaLabel: "this week",
      trend: "up",
      color: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    },
    {
      labelKey: "todayCheckins",
      value: "73",
      icon: CheckSquare,
      delta: "of 89",
      deltaLabel: "expected",
      trend: "neutral",
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      labelKey: "monthlyRevenue",
      value: "€48,320",
      icon: DollarSign,
      delta: "+6.3%",
      deltaLabel: "vs last month",
      trend: "up",
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
  ] as const;

  // Revenue sparkline data (last 7 months, purely visual)
  const revenueData = [32000, 36000, 34500, 39000, 42000, 45500, 48320];
  const maxRevenue = Math.max(...revenueData);

  return (
    <div className="space-y-8">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("overview")}</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs text-muted-foreground">
          <Activity className="size-3.5 text-primary" />
          Live
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ labelKey, value, icon: Icon, delta, deltaLabel, trend, color }) => (
          <div
            key={labelKey}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 ring-1 ring-foreground/10 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            {/* Decorative blob */}
            <div className="pointer-events-none absolute -top-6 -right-6 h-20 w-20 rounded-full opacity-30 blur-xl" />
            <div className="flex items-start justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t(labelKey)}
              </p>
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${color}`}>
                <Icon className="size-4" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-foreground">{value}</p>
            <div className="mt-2 flex items-center gap-1">
              {trend === "up" && <TrendingUp className="size-3.5 text-emerald-500" />}
              {trend === "up" && <ArrowUpRight className="size-3 text-emerald-500" />}
              <span className={`text-xs font-medium ${trend === "up" ? "text-emerald-500" : "text-muted-foreground"}`}>
                {delta}
              </span>
              <span className="text-xs text-muted-foreground">{deltaLabel}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue chart + Recent activity */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Revenue sparkline */}
        <div className="lg:col-span-3 rounded-2xl border border-border bg-card p-6 ring-1 ring-foreground/10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Monthly Revenue</h2>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600">
              +6.3% ↑
            </span>
          </div>
          {/* Bar chart */}
          <div className="flex h-32 items-end gap-2">
            {revenueData.map((v, i) => {
              const heightPct = Math.round((v / maxRevenue) * 100);
              const isLast = i === revenueData.length - 1;
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-t-md transition-all duration-500 ${
                      isLast ? "bg-primary" : "bg-primary/30"
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            {["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"].map((m) => (
              <span key={m} className="flex-1 text-center">{m}</span>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 ring-1 ring-foreground/10">
          <h2 className="mb-4 text-sm font-semibold text-foreground">{t("recentActivity")}</h2>
          <div className="flex flex-col gap-3">
            {[
              { name: "Ion Popa",         action: "Checked in",              initials: "IP", color: "bg-blue-500/20 text-blue-600",  time: "2m ago" },
              { name: "Maria Ionescu",    action: "Started Premium",         initials: "MI", color: "bg-violet-500/20 text-violet-600", time: "15m ago" },
              { name: "Alexandru Rusu",   action: "Checked in — Botanica",   initials: "AR", color: "bg-emerald-500/20 text-emerald-600", time: "32m ago" },
              { name: "Elena Cojocaru",   action: "Renewed Basic",           initials: "EC", color: "bg-amber-500/20 text-amber-600",  time: "1h ago" },
              { name: "Andrei Mihail",    action: "Checked in — Central",    initials: "AM", color: "bg-red-500/20 text-red-600",     time: "1h ago" },
            ].map((item) => (
              <div
                key={item.name}
                className="flex items-center gap-3 rounded-xl px-2 py-1.5 text-sm transition hover:bg-muted"
              >
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${item.color}`}>
                  {item.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground leading-tight">{item.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{item.action}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
