"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useTheme } from "next-themes";
import toast from "react-hot-toast";
import "temporal-polyfill/global";
import { useNextCalendarApp, ScheduleXCalendar } from "@schedule-x/react";
import { createViewWeek, createViewDay } from "@schedule-x/calendar";
import { createEventsServicePlugin } from "@schedule-x/events-service";
import { createEventModalPlugin } from "@schedule-x/event-modal";
import { createCurrentTimePlugin } from "@schedule-x/current-time";
import "@schedule-x/theme-default/dist/index.css";
import { MapPin, Users, Clock, Dumbbell } from "lucide-react";
import { getGroupClasses, type GroupClass } from "@/services/group-classes";
import { getWorkouts, type Workout } from "@/services/workouts";

const CALENDAR_IDS = {
    CLASS: "class",
    WORKOUT: "workout",
};

const calendars = {
    [CALENDAR_IDS.CLASS]: {
        colorName: "class",
        lightColors: {
            main: "#3b82f6",
            container: "#dbeafe",
            onContainer: "#1e40af",
        },
        darkColors: {
            main: "#60a5fa",
            container: "#1e3a5f",
            onContainer: "#bfdbfe",
        },
    },
    [CALENDAR_IDS.WORKOUT]: {
        colorName: "workout",
        lightColors: {
            main: "#22c55e",
            container: "#dcfce7",
            onContainer: "#166534",
        },
        darkColors: {
            main: "#4ade80",
            container: "#14532d",
            onContainer: "#bbf7d0",
        },
    },
};

function pad(n: number) {
    return String(n).padStart(2, "0");
}

function toIso(d: Date) {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
}

function toTemporal(d: Date) {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return Temporal.ZonedDateTime.from(`${toIso(d)}[${tz}]`);
}

type EventCustomData =
    | { kind: "class"; spotsLeft: number; maxSpots: number; booked: number; location: string; duration: number; type: string }
    | { kind: "workout"; memberName: string; notes: string };

const eventCustomData = new Map<string, EventCustomData>();

function classToEvent(gc: GroupClass) {
    const start = new Date(gc.scheduledAt);
    const end = new Date(start.getTime() + gc.durationMinutes * 60_000);
    const spotsLeft = gc.maxParticipants - gc._count.bookings;
    const id = `class-${gc.id}`;

    eventCustomData.set(id, {
        kind: "class",
        spotsLeft,
        maxSpots: gc.maxParticipants,
        booked: gc._count.bookings,
        location: gc.location.name,
        duration: gc.durationMinutes,
        type: gc.type,
    });

    return {
        id,
        title: `🏋️ ${gc.title}`,
        start: toTemporal(start),
        end: toTemporal(end),
        location: gc.location.name,
        calendarId: CALENDAR_IDS.CLASS,
    };
}

function workoutToEvent(w: Workout) {
    const start = new Date(w.date);
    const end = new Date(start.getTime() + 60 * 60_000);
    const memberName = w.member
        ? `${w.member.firstName} ${w.member.lastName}`
        : "";
    const id = `workout-${w.id}`;

    eventCustomData.set(id, {
        kind: "workout",
        memberName,
        notes: w.notes ?? "",
    });

    return {
        id,
        title: `💪 ${w.title}`,
        start: toTemporal(start),
        end: toTemporal(end),
        people: memberName ? [memberName] : [],
        calendarId: CALENDAR_IDS.WORKOUT,
    };
}

function TimeGridEvent({ calendarEvent }: { calendarEvent: { id: string; title: string } }) {
    const custom = eventCustomData.get(calendarEvent.id);

    if (!custom) {
        return <div className="px-1.5 py-1 text-xs font-medium">{calendarEvent.title}</div>;
    }

    if (custom.kind === "class") {
        const isFull = custom.spotsLeft <= 0;
        const isAlmostFull = custom.spotsLeft <= 3 && custom.spotsLeft > 0;
        return (
            <div
                className="flex h-full flex-col gap-0.5 px-2.5 py-2 text-[11px] leading-tight"
                data-event-type="class"
            >
                {/* Type badge */}
                <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:bg-blue-400/20 dark:text-blue-300">
                        📋 Clasă
                    </span>
                </div>
                {/* Title */}
                <span className="truncate font-bold text-[13px] leading-snug">{calendarEvent.title}</span>
                {/* Type */}
                <span className="truncate opacity-60 text-[10px] uppercase tracking-wide font-medium">{custom.type}</span>
                {/* Details row */}
                <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
                    {custom.location && (
                        <span className="inline-flex items-center gap-1 text-[11px] opacity-80">
                            <MapPin className="size-3 shrink-0 text-blue-500 dark:text-blue-400" />
                            <span className="truncate font-medium">{custom.location}</span>
                        </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-[11px] opacity-80">
                        <Clock className="size-3 shrink-0 text-blue-500 dark:text-blue-400" />
                        <span className="font-medium">{custom.duration}min</span>
                    </span>
                    <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                            isFull
                                ? "text-red-600 dark:text-red-400"
                                : isAlmostFull
                                    ? "text-amber-600 dark:text-amber-400"
                                    : "opacity-80"
                        }`}
                    >
                        <Users className="size-3 shrink-0" />
                        {custom.booked}/{custom.maxSpots}
                        {isFull && <span className="ml-0.5 text-[9px]">FULL</span>}
                    </span>
                </div>
            </div>
        );
    }

    // Workout
    return (
        <div
            className="flex h-full flex-col gap-0.5 px-2.5 py-2 text-[11px] leading-tight"
            data-event-type="workout"
        >
            {/* Type badge */}
            <div className="flex items-center gap-1.5 mb-0.5">
                <span className="inline-flex items-center gap-1 rounded-md bg-green-500/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-700 dark:bg-green-400/20 dark:text-green-300">
                    💪 Antrenament
                </span>
            </div>
            {/* Title */}
            <span className="truncate font-bold text-[13px] leading-snug">{calendarEvent.title}</span>
            {/* Member info */}
            {custom.memberName && (
                <span className="inline-flex items-center gap-1 truncate text-[11px] opacity-85 mt-0.5">
                    <Dumbbell className="size-3 shrink-0 text-green-500 dark:text-green-400" />
                    <span className="font-medium">{custom.memberName}</span>
                </span>
            )}
            {/* Notes */}
            {custom.notes && (
                <span className="mt-auto truncate opacity-50 italic text-[10px] pt-1 border-t border-current/10">
                    {custom.notes}
                </span>
            )}
        </div>
    );
}

export function TrainerCalendar({ userId }: { userId: string }) {
    const t = useTranslations("trainerDashboard");
    const locale = useLocale();
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    const eventsService = useMemo(() => createEventsServicePlugin(), []);
    const eventModal = useMemo(() => createEventModalPlugin(), []);
    const currentTime = useMemo(() => createCurrentTimePlugin({ fullWeekWidth: true }), []);

    const localeMap: Record<string, string> = { ro: "ro-RO", en: "en-US", ru: "ru-RU" };

    const calendar = useNextCalendarApp({
        views: [createViewWeek(), createViewDay()],
        defaultView: "week",
        events: [],
        calendars,
        locale: localeMap[locale] ?? "en-US",
        dayBoundaries: { start: "06:00", end: "22:00" },
        weekOptions: { gridHeight: 700, nDays: 7 },
        plugins: [eventsService, eventModal, currentTime],
        isDark,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });

    const loadData = useCallback(async () => {
        try {
            const [classesResult, workoutsResult] = await Promise.all([
                getGroupClasses({ limit: 0 }),
                getWorkouts({ limit: 0 }),
            ]);

            const myClasses = classesResult.data.filter(
                (c) => c.instructor?.id === userId && c.isActive
            );
            const myWorkouts = workoutsResult.data.filter(
                (w) => w.trainer?.id === userId
            );

            const events = [
                ...myClasses.map(classToEvent),
                ...myWorkouts.map(workoutToEvent),
            ];
            eventsService.set(events);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error loading calendar");
        }
    }, [userId, eventsService]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("calendarTitle")}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{t("calendarSubtitle")}</p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-3 shadow-sm">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("legend") ?? "Legend"}:
                </span>
                <div className="flex items-center gap-2">
                    <span className="h-5 w-1.5 rounded-full bg-blue-500 dark:bg-blue-400" />
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-700 dark:bg-blue-400/15 dark:text-blue-300">
                        📋 {t("classesLabel")}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="h-5 w-1.5 rounded-full bg-green-500 dark:bg-green-400" />
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-green-500/10 px-3 py-1.5 text-xs font-bold text-green-700 dark:bg-green-400/15 dark:text-green-300">
                        💪 {t("workoutsLabel")}
                    </span>
                </div>
            </div>

            {/* Calendar */}
            <div className="gym-calendar-wrapper rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <ScheduleXCalendar
                    calendarApp={calendar}
                    customComponents={{ timeGridEvent: TimeGridEvent }}
                />
            </div>
        </div>
    );
}
