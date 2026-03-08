import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getUser } from "@/utils/auth";
import { Users, CreditCard, CheckSquare, DollarSign } from "lucide-react";

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const user = await getUser();

  if (!user || user.role !== "ADMIN") {
    redirect(`/${lang}/login`);
  }

  const t = await getTranslations("dashboard");

  const stats = [
    { labelKey: "totalMembers", value: "1,248", icon: Users, delta: "+12 this month" },
    { labelKey: "activeSubscriptions", value: "984", icon: CreditCard, delta: "+8 this week" },
    { labelKey: "todayCheckins", value: "73", icon: CheckSquare, delta: "of 89 expected" },
    { labelKey: "monthlyRevenue", value: "€48,320", icon: DollarSign, delta: "+6.3% vs last month" },
  ] as const;

  return (
    <div className="space-y-8">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("overview")}</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ labelKey, value, icon: Icon, delta }) => (
          <div
            key={labelKey}
            className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 ring-1 ring-foreground/10"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t(labelKey)}
              </p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{delta}</p>
          </div>
        ))}
      </div>

      {/* Recent activity placeholder */}
      <div className="rounded-xl border border-border bg-card p-6 ring-1 ring-foreground/10">
        <h2 className="mb-4 text-sm font-semibold text-foreground">{t("recentActivity")}</h2>
        <div className="flex flex-col gap-3">
          {[
            { name: "Ion Popa", action: "Checked in at GymPro Central", time: "2 min ago" },
            { name: "Maria Ionescu", action: "Started Premium subscription", time: "15 min ago" },
            { name: "Alexandru Rusu", action: "Checked in at GymPro Botanica", time: "32 min ago" },
            { name: "Elena Cojocaru", action: "Renewed Basic subscription", time: "1 hr ago" },
            { name: "Andrei Mihail", action: "Checked in at GymPro Central", time: "1 hr ago" },
          ].map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-muted"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  {item.name[0]}
                </div>
                <div>
                  <p className="font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.action}</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

