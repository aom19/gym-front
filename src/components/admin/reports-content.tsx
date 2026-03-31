"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Legend,
} from "recharts";
import {
    Users,
    CreditCard,
    DoorOpen,
    TrendingUp,
    CalendarDays,
    Activity,
} from "lucide-react";
import { getMembers } from "@/services/members";
import { getPayments } from "@/services/payments";
import { getCheckins } from "@/services/checkins";
import { getSubscriptionPlans } from "@/services/subscription-plans";
import { getGroupClasses } from "@/services/group-classes";
import type { Member } from "@/services/members";
import type { Payment } from "@/services/payments";
import type { Checkin } from "@/services/checkins";
import type { SubscriptionPlan } from "@/services/subscription-plans";
import type { GroupClass } from "@/services/group-classes";
import { SkeletonCard } from "@/components/ui/skeleton";
import toast from "react-hot-toast";

const PIE_COLORS = [
    "hsl(var(--primary))",
    "hsl(217, 91%, 60%)",
    "hsl(142, 71%, 45%)",
    "hsl(38, 92%, 50%)",
    "hsl(0, 84%, 60%)",
    "hsl(280, 67%, 55%)",
];

interface KpiCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
}

function KpiCard({ title, value, subtitle, icon }: KpiCardProps) {
    return (
        <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between">
                <span className="text-xs font-medium text-muted-foreground">{title}</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {icon}
                </div>
            </div>
            <p className="mt-2 text-2xl font-bold">{value}</p>
            {subtitle && (
                <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
            )}
        </div>
    );
}

const tooltipStyle = {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "0.75rem",
    fontSize: 12,
};

export function ReportsContent() {
    const t = useTranslations("reports");

    const [loading, setLoading] = useState(true);
    const [members, setMembers] = useState<Member[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [checkins, setCheckins] = useState<Checkin[]>([]);
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [classes, setClasses] = useState<GroupClass[]>([]);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [m, p, c, sp, gc] = await Promise.all([
                getMembers(),
                getPayments(),
                getCheckins(),
                getSubscriptionPlans(),
                getGroupClasses(),
            ]);
            setMembers(m);
            setPayments(p);
            setCheckins(c);
            setPlans(sp);
            setClasses(gc);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : t("loadError"));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // —— KPI computations ——
    const totalMembers = members.length;

    const paidPayments = payments.filter((p) => p.status === "PAID");
    const totalRevenue = paidPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const totalCheckins = checkins.length;

    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const monthPayments = paidPayments.filter((p) => p.paidAt?.startsWith(thisMonth));
    const monthRevenue = monthPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const monthCheckins = checkins.filter((c) => c.checkInAt?.startsWith(thisMonth)).length;

    const upcomingClasses = classes.filter(
        (c) => c.isActive && new Date(c.scheduledAt) >= now
    ).length;

    // —— Revenue by month (last 6 months) ——
    const revenueByMonth = (() => {
        const months: { key: string; label: string }[] = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({
                key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
                label: d.toLocaleDateString(undefined, { month: "short", year: "2-digit" }),
            });
        }
        return months.map((m) => ({
            month: m.label,
            revenue: paidPayments
                .filter((p) => p.paidAt?.startsWith(m.key))
                .reduce((s, p) => s + parseFloat(p.amount), 0),
        }));
    })();

    // —— Check-ins by month (last 6 months) ——
    const checkinsByMonth = (() => {
        const months: { key: string; label: string }[] = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({
                key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
                label: d.toLocaleDateString(undefined, { month: "short", year: "2-digit" }),
            });
        }
        return months.map((m) => ({
            month: m.label,
            checkins: checkins.filter((c) => c.checkInAt?.startsWith(m.key)).length,
        }));
    })();

    // —— Payment method distribution ——
    const paymentMethodData = (() => {
        const counts: Record<string, number> = {};
        paidPayments.forEach((p) => {
            counts[p.method] = (counts[p.method] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    })();

    // —— Subscription plans popularity ——
    const planPopularity = plans
        .filter((p) => p._count && p._count.subscriptions > 0)
        .map((p) => ({
            name: p.name,
            value: p._count?.subscriptions ?? 0,
        }))
        .sort((a, b) => b.value - a.value);

    // —— New members by month (last 6 months) ——
    const membersByMonth = (() => {
        const months: { key: string; label: string }[] = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({
                key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
                label: d.toLocaleDateString(undefined, { month: "short", year: "2-digit" }),
            });
        }
        return months.map((m) => ({
            month: m.label,
            members: members.filter((mb) => mb.createdAt?.startsWith(m.key)).length,
        }));
    })();

    // —— Class type distribution ——
    const classTypeData = (() => {
        const counts: Record<string, number> = {};
        classes.forEach((c) => {
            counts[c.type] = (counts[c.type] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    })();

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-xl font-semibold">{t("title")}</h1>
                    <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-xl font-semibold">{t("title")}</h1>
                <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <KpiCard
                    title={t("totalMembers")}
                    value={totalMembers}
                    icon={<Users className="h-4 w-4" />}
                />
                <KpiCard
                    title={t("totalRevenue")}
                    value={`${totalRevenue.toFixed(2)} RON`}
                    icon={<CreditCard className="h-4 w-4" />}
                />
                <KpiCard
                    title={t("totalCheckins")}
                    value={totalCheckins}
                    icon={<DoorOpen className="h-4 w-4" />}
                />
                <KpiCard
                    title={t("monthRevenue")}
                    value={`${monthRevenue.toFixed(2)} RON`}
                    subtitle={thisMonth}
                    icon={<TrendingUp className="h-4 w-4" />}
                />
                <KpiCard
                    title={t("monthCheckins")}
                    value={monthCheckins}
                    subtitle={thisMonth}
                    icon={<Activity className="h-4 w-4" />}
                />
                <KpiCard
                    title={t("upcomingClasses")}
                    value={upcomingClasses}
                    icon={<CalendarDays className="h-4 w-4" />}
                />
            </div>

            {/* Charts Row 1: Revenue + Check-ins */}
            <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="text-sm font-medium text-foreground mb-3">{t("revenueChart")}</h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={revenueByMonth}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                            <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name={t("revenue")} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="text-sm font-medium text-foreground mb-3">{t("checkinsChart")}</h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={checkinsByMonth}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                            <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Line
                                type="monotone"
                                dataKey="checkins"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                dot={{ r: 3 }}
                                name={t("checkins")}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Charts Row 2: Payment Methods + Plan Popularity */}
            <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="text-sm font-medium text-foreground mb-3">{t("paymentMethods")}</h3>
                    {paymentMethodData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie
                                    data={paymentMethodData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={90}
                                    dataKey="value"
                                    label={({ name, percent }: { name?: string; percent?: number }) =>
                                        `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`
                                    }
                                    labelLine={false}
                                >
                                    {paymentMethodData.map((_, i) => (
                                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={tooltipStyle} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="py-12 text-center text-sm text-muted-foreground">{t("noData")}</p>
                    )}
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="text-sm font-medium text-foreground mb-3">{t("planPopularity")}</h3>
                    {planPopularity.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={planPopularity} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                                <XAxis type="number" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    tick={{ fontSize: 11 }}
                                    className="text-muted-foreground"
                                    width={100}
                                />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Bar dataKey="value" fill="hsl(217, 91%, 60%)" radius={[0, 4, 4, 0]} name={t("subscriptions")} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="py-12 text-center text-sm text-muted-foreground">{t("noData")}</p>
                    )}
                </div>
            </div>

            {/* Charts Row 3: New Members + Class Types */}
            <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="text-sm font-medium text-foreground mb-3">{t("newMembersChart")}</h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={membersByMonth}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                            <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" allowDecimals={false} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Bar dataKey="members" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} name={t("members")} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="text-sm font-medium text-foreground mb-3">{t("classTypes")}</h3>
                    {classTypeData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie
                                    data={classTypeData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={90}
                                    dataKey="value"
                                    label={({ name, percent }: { name?: string; percent?: number }) =>
                                        `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`
                                    }
                                    labelLine={false}
                                >
                                    {classTypeData.map((_, i) => (
                                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={tooltipStyle} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="py-12 text-center text-sm text-muted-foreground">{t("noData")}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
