"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import {
    Dumbbell,
    Calendar,
    ChevronDown,
    ChevronRight,
    User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getMyMemberProfile } from "@/services/members";
import { getWorkoutsByMember, type Workout } from "@/services/workouts";

export function MemberWorkoutsContent() {
    const t = useTranslations("memberPortal");

    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const member = await getMyMemberProfile();
            const data = await getWorkoutsByMember(member.id);
            setWorkouts(data);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error loading workouts");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const toggleExpand = (id: string) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

    const muscleGroupColors: Record<string, string> = {
        CHEST: "bg-red-500/10 text-red-600",
        BACK: "bg-blue-500/10 text-blue-600",
        SHOULDERS: "bg-orange-500/10 text-orange-600",
        BICEPS: "bg-emerald-500/10 text-emerald-600",
        TRICEPS: "bg-teal-500/10 text-teal-600",
        LEGS: "bg-violet-500/10 text-violet-600",
        CORE: "bg-yellow-500/10 text-yellow-600",
        GLUTES: "bg-pink-500/10 text-pink-600",
        CARDIO: "bg-cyan-500/10 text-cyan-600",
        FULL_BODY: "bg-indigo-500/10 text-indigo-600",
        OTHER: "bg-gray-500/10 text-gray-600",
    };

    return (
        <>
            {/* Header */}
            <div>
                <h1 className="text-xl font-semibold tracking-tight text-foreground">{t("workoutsTitle")}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{t("workoutsSubtitle")}</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 ring-1 ring-foreground/10">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Dumbbell className="size-4" />
                        <p className="text-xs">{t("totalWorkouts")}</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                        {loading ? "—" : workouts.length}
                    </p>
                </div>
                <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 ring-1 ring-foreground/10">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="size-4" />
                        <p className="text-xs">{t("lastWorkout")}</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                        {loading
                            ? "—"
                            : workouts.length > 0
                              ? new Date(workouts[0].date).toLocaleDateString()
                              : "—"}
                    </p>
                </div>
            </div>

            {/* Workouts list */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="border-b border-border/60 bg-muted/30 px-4 py-3">
                    <h2 className="text-sm font-medium text-foreground">{t("workoutHistory")}</h2>
                </div>
                {loading ? (
                    <div className="p-4 space-y-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-14 rounded-lg skeleton-shimmer" />
                        ))}
                    </div>
                ) : workouts.length === 0 ? (
                    <div className="px-4 py-10 text-center">
                        <Dumbbell className="mx-auto mb-3 size-8 text-muted-foreground/40" />
                        <p className="text-sm text-muted-foreground">{t("noWorkouts")}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {workouts.map((workout) => {
                            const isExpanded = expandedId === workout.id;

                            return (
                                <div key={workout.id}>
                                    <button
                                        onClick={() => toggleExpand(workout.id)}
                                        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors"
                                    >
                                        <div className="flex flex-col gap-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-foreground truncate">
                                                    {workout.title}
                                                </span>
                                                <Badge variant="secondary" className="border-0">
                                                    {workout.exercises.length} {t("exercises")}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="size-3" />
                                                    {new Date(workout.date).toLocaleDateString()}
                                                </span>
                                                {workout.trainer && (
                                                    <span className="flex items-center gap-1">
                                                        <User className="size-3" />
                                                        {workout.trainer.email}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {isExpanded ? (
                                            <ChevronDown className="size-4 text-muted-foreground shrink-0" />
                                        ) : (
                                            <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                                        )}
                                    </button>

                                    {isExpanded && (
                                        <div className="px-4 pb-3">
                                            {workout.notes && (
                                                <p className="text-xs text-muted-foreground mb-3 italic">
                                                    {workout.notes}
                                                </p>
                                            )}
                                            <div className="rounded-lg border border-border overflow-hidden">
                                                <table className="w-full text-xs">
                                                    <thead>
                                                        <tr className="bg-muted/40 text-left text-muted-foreground">
                                                            <th className="px-3 py-1.5">{t("exerciseName")}</th>
                                                            <th className="px-3 py-1.5">{t("muscleGroup")}</th>
                                                            <th className="px-3 py-1.5">{t("sets")}</th>
                                                            <th className="px-3 py-1.5">{t("reps")}</th>
                                                            <th className="px-3 py-1.5">{t("weightKg")}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-border">
                                                        {workout.exercises.map((ex) => (
                                                            <tr key={ex.id} className="text-foreground">
                                                                <td className="px-3 py-1.5 font-medium">
                                                                    {ex.exercise.name}
                                                                </td>
                                                                <td className="px-3 py-1.5">
                                                                    <Badge
                                                                        className={`${muscleGroupColors[ex.exercise.muscleGroup] ?? muscleGroupColors.OTHER} border-0 text-[10px]`}
                                                                    >
                                                                        {ex.exercise.muscleGroup}
                                                                    </Badge>
                                                                </td>
                                                                <td className="px-3 py-1.5 tabular-nums">{ex.sets}</td>
                                                                <td className="px-3 py-1.5 tabular-nums">{ex.reps}</td>
                                                                <td className="px-3 py-1.5 tabular-nums">
                                                                    {ex.weight ? parseFloat(ex.weight) : "—"}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}
