"use client";

import { useTranslations } from "next-intl";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import type { FitnessProgress } from "@/services/fitness-progress";

interface Props {
    data: FitnessProgress[];
}

export function FitnessProgressCharts({ data }: Props) {
    const t = useTranslations("fitnessProgress");

    if (data.length < 2) return null;

    // Sort by date ascending for charts
    const sorted = [...data].sort(
        (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
    );

    const chartData = sorted.map((p) => ({
        date: new Date(p.recordedAt).toLocaleDateString(),
        weight: p.weight ? parseFloat(p.weight) : null,
        bodyFat: p.bodyFat ? parseFloat(p.bodyFat) : null,
    }));

    const hasWeight = chartData.some((d) => d.weight !== null);
    const hasBodyFat = chartData.some((d) => d.bodyFat !== null);

    if (!hasWeight && !hasBodyFat) return null;

    return (
        <div className="grid gap-4 lg:grid-cols-2">
            {hasWeight && (
                <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="text-sm font-medium text-foreground mb-3">{t("weightTrend")}</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 11 }}
                                className="text-muted-foreground"
                            />
                            <YAxis
                                tick={{ fontSize: 11 }}
                                className="text-muted-foreground"
                                domain={["dataMin - 2", "dataMax + 2"]}
                                unit=" kg"
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--card))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "0.75rem",
                                    fontSize: 12,
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="weight"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                dot={{ r: 3 }}
                                connectNulls
                                name={t("weightLabel")}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {hasBodyFat && (
                <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="text-sm font-medium text-foreground mb-3">{t("bodyFatTrend")}</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 11 }}
                                className="text-muted-foreground"
                            />
                            <YAxis
                                tick={{ fontSize: 11 }}
                                className="text-muted-foreground"
                                domain={["dataMin - 1", "dataMax + 1"]}
                                unit="%"
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--card))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "0.75rem",
                                    fontSize: 12,
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="bodyFat"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                dot={{ r: 3 }}
                                connectNulls
                                name={t("bodyFatLabel")}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
