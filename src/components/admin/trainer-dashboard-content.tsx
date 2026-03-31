"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import toast from "react-hot-toast";
import { Calendar, ClipboardList, Users, Dumbbell, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getGroupClasses, type GroupClass } from "@/services/group-classes";
import { getWorkouts, type Workout } from "@/services/workouts";

export function TrainerDashboardContent({ userId }: { userId: string }) {
    const t = useTranslations("trainerDashboard");
    const lang = useLocale();

    const [todayClasses, setTodayClasses] = useState<GroupClass[]>([]);
    const [upcomingClasses, setUpcomingClasses] = useState<GroupClass[]>([]);
    const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [classes, workouts] = await Promise.all([
                getGroupClasses(),
                getWorkouts(),
            ]);

            const now = new Date();
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const todayEnd = new Date(todayStart.getTime() + 86400000);

            // Filter classes where this user is instructor
            const myClasses = classes.filter((c) => c.instructor?.id === userId && c.isActive);
            setTodayClasses(myClasses.filter((c) => {
                const d = new Date(c.scheduledAt);
                return d >= todayStart && d < todayEnd;
            }));
            setUpcomingClasses(myClasses.filter((c) => new Date(c.scheduledAt) >= now).slice(0, 5));

            // Filter workouts by this trainer
            const myWorkouts = workouts.filter((w) => {
                const trainer = w.trainer;
                return trainer && trainer.id === userId;
            });
            setRecentWorkouts(myWorkouts.slice(0, 5));
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error loading data");
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const classTypeBg: Record<string, string> = {
        YOGA: "bg-violet-500/10 text-violet-600",
        ZUMBA: "bg-yellow-500/10 text-yellow-600",
        CROSSFIT: "bg-orange-500/10 text-orange-600",
        SPINNING: "bg-cyan-500/10 text-cyan-600",
        PILATES: "bg-pink-500/10 text-pink-600",
        BOXING: "bg-red-500/10 text-red-600",
        OTHER: "bg-gray-500/10 text-gray-600",
    };

    return (
        <>
            {/* Header */}
            <div>
                <h1 className="text-xl font-semibold tracking-tight text-foreground">{t("title")}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 ring-1 ring-foreground/10">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="size-4" />
                        <p className="text-xs">{t("todayClasses")}</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{loading ? "—" : todayClasses.length}</p>
                </div>
                <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 ring-1 ring-foreground/10">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <ClipboardList className="size-4" />
                        <p className="text-xs">{t("upcomingClasses")}</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{loading ? "—" : upcomingClasses.length}</p>
                </div>
                <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 ring-1 ring-foreground/10">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Dumbbell className="size-4" />
                        <p className="text-xs">{t("recentWorkouts")}</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{loading ? "—" : recentWorkouts.length}</p>
                </div>
            </div>

            {/* Today's Classes */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="border-b border-border/60 bg-muted/30 px-4 py-3">
                    <h2 className="text-sm font-medium text-foreground">{t("todaySchedule")}</h2>
                </div>
                {loading ? (
                    <div className="p-4 space-y-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-14 rounded-lg skeleton-shimmer" />
                        ))}
                    </div>
                ) : todayClasses.length === 0 ? (
                    <div className="px-4 py-10 text-center">
                        <Calendar className="mx-auto mb-3 size-8 text-muted-foreground/40" />
                        <p className="text-sm text-muted-foreground">{t("noClassesToday")}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {todayClasses.map((cls) => (
                            <div key={cls.id} className="flex items-center justify-between px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5 text-muted-foreground tabular-nums">
                                        <Clock className="size-3.5" />
                                        {new Date(cls.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    </div>
                                    <span className="font-medium text-foreground">{cls.title}</span>
                                    <Badge className={`${classTypeBg[cls.type] ?? classTypeBg.OTHER} border-0`}>{cls.type}</Badge>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-muted-foreground">
                                        <Users className="inline size-3.5 mr-1" />
                                        {cls._count.bookings}/{cls.maxParticipants}
                                    </span>
                                    <Link href={`/${lang}/admin/classes/${cls.id}/bookings`}>
                                        <Button variant="outline" size="sm">{t("viewBookings")}</Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Upcoming Classes */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="border-b border-border/60 bg-muted/30 px-4 py-3 flex items-center justify-between">
                    <h2 className="text-sm font-medium text-foreground">{t("upcoming")}</h2>
                    <Link href={`/${lang}/admin/classes`}>
                        <Button variant="ghost" size="sm">{t("viewAll")}</Button>
                    </Link>
                </div>
                {loading ? (
                    <div className="p-4 space-y-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-14 rounded-lg skeleton-shimmer" />
                        ))}
                    </div>
                ) : upcomingClasses.length === 0 ? (
                    <div className="px-4 py-10 text-center">
                        <p className="text-sm text-muted-foreground">{t("noUpcomingClasses")}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {upcomingClasses.map((cls) => (
                            <div key={cls.id} className="flex items-center justify-between px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <div className="text-sm text-muted-foreground tabular-nums">
                                        {new Date(cls.scheduledAt).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-muted-foreground tabular-nums">
                                        <Clock className="size-3.5" />
                                        {new Date(cls.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    </div>
                                    <span className="font-medium text-foreground">{cls.title}</span>
                                    <Badge className={`${classTypeBg[cls.type] ?? classTypeBg.OTHER} border-0`}>{cls.type}</Badge>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    {cls.location.name}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Recent Workouts */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="border-b border-border/60 bg-muted/30 px-4 py-3 flex items-center justify-between">
                    <h2 className="text-sm font-medium text-foreground">{t("latestWorkouts")}</h2>
                    <Link href={`/${lang}/admin/workouts`}>
                        <Button variant="ghost" size="sm">{t("viewAll")}</Button>
                    </Link>
                </div>
                {loading ? (
                    <div className="p-4 space-y-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-14 rounded-lg skeleton-shimmer" />
                        ))}
                    </div>
                ) : recentWorkouts.length === 0 ? (
                    <div className="px-4 py-10 text-center">
                        <Dumbbell className="mx-auto mb-3 size-8 text-muted-foreground/40" />
                        <p className="text-sm text-muted-foreground">{t("noWorkouts")}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {recentWorkouts.map((w) => (
                            <div key={w.id} className="flex items-center justify-between px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <span className="font-medium text-foreground">{w.title}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(w.date).toLocaleDateString()}
                                    </span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    {w.exercises?.length ?? 0} {t("exercises")}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
