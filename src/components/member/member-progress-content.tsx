"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { Activity, TrendingUp, Scale } from "lucide-react";
import { FitnessProgressCharts } from "@/components/admin/fitness-progress-charts";
import { getMyMemberProfile } from "@/services/members";
import { getFitnessProgress, type FitnessProgress } from "@/services/fitness-progress";

export function MemberProgressContent() {
    const t = useTranslations("memberPortal");

    const [progress, setProgress] = useState<FitnessProgress[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const member = await getMyMemberProfile();
            const result = await getFitnessProgress(member.id, { limit: 0 });
            setProgress(result.data);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error loading progress");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const latest = progress.length > 0
        ? [...progress].sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())[0]
        : null;

    return (
        <>
            {/* Header */}
            <div>
                <h1 className="text-xl font-semibold tracking-tight text-foreground">{t("progressTitle")}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{t("progressSubtitle")}</p>
            </div>

            {/* Stats cards */}
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 ring-1 ring-foreground/10">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Scale className="size-4" />
                        <p className="text-xs">{t("latestWeight")}</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                        {loading ? "—" : latest?.weight ? `${parseFloat(latest.weight)} kg` : "—"}
                    </p>
                </div>
                <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 ring-1 ring-foreground/10">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <TrendingUp className="size-4" />
                        <p className="text-xs">{t("latestBodyFat")}</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                        {loading ? "—" : latest?.bodyFat ? `${parseFloat(latest.bodyFat)}%` : "—"}
                    </p>
                </div>
                <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 ring-1 ring-foreground/10">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Activity className="size-4" />
                        <p className="text-xs">{t("totalRecords")}</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                        {loading ? "—" : progress.length}
                    </p>
                </div>
            </div>

            {/* Charts */}
            {loading ? (
                <div className="grid gap-4 lg:grid-cols-2">
                    <div className="h-[280px] rounded-xl border border-border bg-card skeleton-shimmer" />
                    <div className="h-[280px] rounded-xl border border-border bg-card skeleton-shimmer" />
                </div>
            ) : progress.length < 2 ? (
                <div className="rounded-xl border border-border bg-card px-4 py-10 text-center">
                    <Activity className="mx-auto mb-3 size-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">{t("notEnoughData")}</p>
                </div>
            ) : (
                <FitnessProgressCharts data={progress} />
            )}

            {/* History table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="border-b border-border/60 bg-muted/30 px-4 py-3">
                    <h2 className="text-sm font-medium text-foreground">{t("progressHistory")}</h2>
                </div>
                {loading ? (
                    <div className="p-4 space-y-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-10 rounded-lg skeleton-shimmer" />
                        ))}
                    </div>
                ) : progress.length === 0 ? (
                    <div className="px-4 py-10 text-center">
                        <p className="text-sm text-muted-foreground">{t("noProgressRecords")}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border/60 text-left text-xs text-muted-foreground">
                                    <th className="px-4 py-2">{t("date")}</th>
                                    <th className="px-4 py-2">{t("weight")}</th>
                                    <th className="px-4 py-2">{t("bodyFat")}</th>
                                    <th className="px-4 py-2">{t("notes")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {[...progress]
                                    .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
                                    .map((p) => (
                                        <tr key={p.id} className="text-foreground">
                                            <td className="px-4 py-2 tabular-nums">
                                                {new Date(p.recordedAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-2 tabular-nums">
                                                {p.weight ? `${parseFloat(p.weight)} kg` : "—"}
                                            </td>
                                            <td className="px-4 py-2 tabular-nums">
                                                {p.bodyFat ? `${parseFloat(p.bodyFat)}%` : "—"}
                                            </td>
                                            <td className="px-4 py-2 text-muted-foreground">
                                                {p.notes || "—"}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}
