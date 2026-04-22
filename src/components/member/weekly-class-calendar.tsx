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
import { MapPin, Users, Clock } from "lucide-react";
import { getUpcomingClasses, type GroupClass } from "@/services/group-classes";

const classTypeColors: Record<
    string,
    { main: string; container: string; onContainer: string; darkContainer: string; darkOnContainer: string }
> = {
    YOGA: { main: "#8b5cf6", container: "#ede9fe", onContainer: "#5b21b6", darkContainer: "#3b1f7e", darkOnContainer: "#d4bfff" },
    ZUMBA: { main: "#eab308", container: "#fef9c3", onContainer: "#854d0e", darkContainer: "#713f12", darkOnContainer: "#fde68a" },
    CROSSFIT: { main: "#f97316", container: "#ffedd5", onContainer: "#9a3412", darkContainer: "#7c2d12", darkOnContainer: "#fed7aa" },
    SPINNING: { main: "#06b6d4", container: "#cffafe", onContainer: "#155e75", darkContainer: "#164e63", darkOnContainer: "#a5f3fc" },
    PILATES: { main: "#ec4899", container: "#fce7f3", onContainer: "#9d174d", darkContainer: "#831843", darkOnContainer: "#fbcfe8" },
    BOXING: { main: "#ef4444", container: "#fee2e2", onContainer: "#991b1b", darkContainer: "#7f1d1d", darkOnContainer: "#fca5a5" },
    OTHER: { main: "#6b7280", container: "#f3f4f6", onContainer: "#374151", darkContainer: "#374151", darkOnContainer: "#d1d5db" },
};

const CLASS_TYPE_EMOJI: Record<string, string> = {
    YOGA: "🧘",
    ZUMBA: "💃",
    CROSSFIT: "🏋️",
    SPINNING: "🚴",
    PILATES: "🤸",
    BOXING: "🥊",
    OTHER: "⚡",
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

// Store custom data as a map for retrieval in the custom event component
const eventCustomData = new Map<string, {
    spotsLeft: number;
    maxSpots: number;
    booked: number;
    location: string;
    instructor: string;
    duration: number;
    type: string;
}>();

function groupClassToEvent(gc: GroupClass) {
    const start = new Date(gc.scheduledAt);
    const end = new Date(start.getTime() + gc.durationMinutes * 60_000);
    const spotsLeft = gc.maxParticipants - gc._count.bookings;
    const emoji = CLASS_TYPE_EMOJI[gc.type] ?? "⚡";
    const id = gc.id;

    eventCustomData.set(id, {
        spotsLeft,
        maxSpots: gc.maxParticipants,
        booked: gc._count.bookings,
        location: gc.location.name,
        instructor: gc.instructor?.email ?? "",
        duration: gc.durationMinutes,
        type: gc.type,
    });

    return {
        id,
        title: `${emoji} ${gc.title}`,
        start: toTemporal(start),
        end: toTemporal(end),
        location: gc.location.name,
        people: gc.instructor ? [gc.instructor.email] : [],
        calendarId: gc.type,
    };
}

// Custom time grid event component
function TimeGridEvent({ calendarEvent }: { calendarEvent: { id: string; title: string } }) {
    const custom = eventCustomData.get(calendarEvent.id);

    if (!custom) {
        return <div className="px-1.5 py-1 text-xs font-medium">{calendarEvent.title}</div>;
    }

    const isFull = custom.spotsLeft <= 0;
    const isAlmostFull = custom.spotsLeft <= 3 && custom.spotsLeft > 0;
    const emoji = CLASS_TYPE_EMOJI[custom.type] ?? "⚡";

    return (
        <div className="flex h-full flex-col gap-0.5 px-2.5 py-2 text-[11px] leading-tight">
            {/* Type badge */}
            <div className="flex items-center gap-1.5 mb-0.5">
                <span className="inline-flex items-center gap-1 rounded-md bg-black/10 dark:bg-white/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                    {emoji} {custom.type}
                </span>
            </div>
            {/* Title */}
            <span className="truncate font-bold text-[13px] leading-snug">{calendarEvent.title}</span>
            {/* Instructor */}
            {custom.instructor && (
                <span className="truncate opacity-70 text-[11px] font-medium">{custom.instructor}</span>
            )}
            {/* Details row */}
            <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
                <span className="inline-flex items-center gap-1 text-[11px] opacity-80">
                    <MapPin className="size-3 shrink-0" />
                    <span className="truncate font-medium">{custom.location}</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] opacity-80">
                    <Clock className="size-3 shrink-0" />
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

export function WeeklyClassCalendar() {
    const t = useTranslations("memberPortal");
    const locale = useLocale();
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    const eventsService = useMemo(() => createEventsServicePlugin(), []);
    const eventModal = useMemo(() => createEventModalPlugin(), []);
    const currentTime = useMemo(() => createCurrentTimePlugin({ fullWeekWidth: true }), []);

    const calendars = useMemo(() => {
        const result: Record<string, { colorName: string; lightColors: { main: string; container: string; onContainer: string }; darkColors?: { main: string; container: string; onContainer: string } }> = {};
        for (const [type, colors] of Object.entries(classTypeColors)) {
            result[type] = {
                colorName: type.toLowerCase(),
                lightColors: { main: colors.main, container: colors.container, onContainer: colors.onContainer },
                darkColors: { main: colors.main, container: colors.darkContainer, onContainer: colors.darkOnContainer },
            };
        }
        return result;
    }, []);

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

    const loadClasses = useCallback(async () => {
        try {
            const data = await getUpcomingClasses();
            const events = data.map(groupClassToEvent);
            eventsService.set(events);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error loading classes");
        }
    }, [eventsService]);

    useEffect(() => {
        loadClasses();
    }, [loadClasses]);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("calendarTitle")}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{t("calendarSubtitle")}</p>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 shadow-sm">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1">
                    {t("legend") ?? "Legend"}:
                </span>
                {Object.entries(classTypeColors).map(([type, colors]) => (
                    <div key={type} className="flex items-center gap-1.5">
                        <span
                            className="h-4 w-1 rounded-full"
                            style={{ backgroundColor: colors.main }}
                        />
                        <span
                            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors"
                            style={{
                                backgroundColor: isDark ? `${colors.darkContainer}cc` : `${colors.container}cc`,
                                color: isDark ? colors.darkOnContainer : colors.onContainer,
                            }}
                        >
                            <span className="text-sm">{CLASS_TYPE_EMOJI[type]}</span>
                            {type}
                        </span>
                    </div>
                ))}
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
