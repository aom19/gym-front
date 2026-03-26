"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { Trash2, Plus, Clock, CalendarOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    getLocationSchedule,
    setLocationSchedule,
    getLocationHolidays,
    addLocationHoliday,
    removeLocationHoliday,
    type ScheduleDay,
    type LocationHoliday,
} from "@/services/location-schedule";
import { getLocations, type Location } from "@/services/locations";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface ScheduleFormDay {
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
}

function buildDefaultSchedule(): ScheduleFormDay[] {
    return Array.from({ length: 7 }, (_, i) => ({
        dayOfWeek: i,
        openTime: "08:00",
        closeTime: "22:00",
        isClosed: i === 0,
    }));
}

export function LocationScheduleManager({ userRole }: { userRole: string }) {
    const t = useTranslations("locationSchedule");

    const [locations, setLocationsState] = useState<Location[]>([]);
    const [selectedLocationId, setSelectedLocationId] = useState<string>("");
    const [schedule, setSchedule] = useState<ScheduleFormDay[]>(buildDefaultSchedule());
    const [holidays, setHolidays] = useState<LocationHoliday[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [holidayName, setHolidayName] = useState("");
    const [holidayDate, setHolidayDate] = useState("");

    useEffect(() => {
        getLocations()
            .then((locs) => {
                setLocationsState(locs);
                if (locs.length > 0) setSelectedLocationId(locs[0].id);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const loadSchedule = useCallback(async () => {
        if (!selectedLocationId) return;
        setLoading(true);
        try {
            const [scheduleData, holidayData] = await Promise.all([
                getLocationSchedule(selectedLocationId),
                getLocationHolidays(selectedLocationId),
            ]);
            if (scheduleData.length > 0) {
                setSchedule(buildDefaultSchedule().map((d) => {
                    const found = scheduleData.find((s) => s.dayOfWeek === d.dayOfWeek);
                    return found ? { ...d, openTime: found.openTime, closeTime: found.closeTime, isClosed: found.isClosed } : d;
                }));
            } else {
                setSchedule(buildDefaultSchedule());
            }
            setHolidays(holidayData);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : t("errors.generic"));
        } finally {
            setLoading(false);
        }
    }, [selectedLocationId, t]);

    useEffect(() => { loadSchedule(); }, [loadSchedule]);

    const handleSaveSchedule = async () => {
        setSaving(true);
        try {
            await setLocationSchedule(selectedLocationId, {
                schedule: schedule.map((d) => ({
                    dayOfWeek: d.dayOfWeek,
                    openTime: d.openTime,
                    closeTime: d.closeTime,
                    isClosed: d.isClosed,
                })),
            });
            toast.success(t("scheduleSaved"));
        } catch (err) {
            toast.error(err instanceof Error ? err.message : t("errors.generic"));
        } finally {
            setSaving(false);
        }
    };

    const handleAddHoliday = async () => {
        if (!holidayDate || !holidayName) return;
        try {
            const created = await addLocationHoliday(selectedLocationId, { date: holidayDate, name: holidayName });
            setHolidays((prev) => [...prev, created]);
            setHolidayDate("");
            setHolidayName("");
            toast.success(t("holidayAdded"));
        } catch (err) {
            toast.error(err instanceof Error ? err.message : t("errors.generic"));
        }
    };

    const handleRemoveHoliday = async (id: string) => {
        try {
            await removeLocationHoliday(id);
            setHolidays((prev) => prev.filter((h) => h.id !== id));
            toast.success(t("holidayRemoved"));
        } catch (err) {
            toast.error(err instanceof Error ? err.message : t("errors.generic"));
        }
    };

    const updateDay = (dayOfWeek: number, patch: Partial<ScheduleFormDay>) => {
        setSchedule((prev) => prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, ...patch } : d)));
    };

    return (
        <>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight text-foreground">{t("title")}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
                </div>
                <select
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                    value={selectedLocationId}
                    onChange={(e) => setSelectedLocationId(e.target.value)}
                >
                    {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className="h-12 rounded-lg skeleton-shimmer" />
                    ))}
                </div>
            ) : (
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Weekly Schedule */}
                    <div className="rounded-xl border border-border bg-card overflow-hidden">
                        <div className="flex items-center gap-2 border-b border-border/60 bg-muted/30 px-4 py-3">
                            <Clock className="size-4 text-muted-foreground" />
                            <h2 className="text-sm font-semibold text-foreground">{t("weeklySchedule")}</h2>
                        </div>
                        <div className="divide-y divide-border">
                            {schedule.map((day) => (
                                <div key={day.dayOfWeek} className="flex items-center gap-3 px-4 py-3">
                                    <span className="w-24 text-sm font-medium text-foreground">{DAY_NAMES[day.dayOfWeek]}</span>
                                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <input
                                            type="checkbox"
                                            checked={day.isClosed}
                                            onChange={(e) => updateDay(day.dayOfWeek, { isClosed: e.target.checked })}
                                            className="rounded border-input"
                                        />
                                        {t("closed")}
                                    </label>
                                    {!day.isClosed && (
                                        <>
                                            <Input
                                                type="time"
                                                className="h-8 w-28 text-xs"
                                                value={day.openTime}
                                                onChange={(e) => updateDay(day.dayOfWeek, { openTime: e.target.value })}
                                            />
                                            <span className="text-xs text-muted-foreground">—</span>
                                            <Input
                                                type="time"
                                                className="h-8 w-28 text-xs"
                                                value={day.closeTime}
                                                onChange={(e) => updateDay(day.dayOfWeek, { closeTime: e.target.value })}
                                            />
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-border p-4">
                            <Button onClick={handleSaveSchedule} disabled={saving} className="w-full">
                                {saving ? t("saving") : t("saveSchedule")}
                            </Button>
                        </div>
                    </div>

                    {/* Holidays */}
                    <div className="rounded-xl border border-border bg-card overflow-hidden">
                        <div className="flex items-center gap-2 border-b border-border/60 bg-muted/30 px-4 py-3">
                            <CalendarOff className="size-4 text-muted-foreground" />
                            <h2 className="text-sm font-semibold text-foreground">{t("holidays")}</h2>
                        </div>
                        <div className="p-4 space-y-3">
                            <div className="flex gap-2">
                                <Input
                                    type="date"
                                    className="h-9"
                                    value={holidayDate}
                                    onChange={(e) => setHolidayDate(e.target.value)}
                                />
                                <Input
                                    className="h-9"
                                    placeholder={t("holidayNamePlaceholder")}
                                    value={holidayName}
                                    onChange={(e) => setHolidayName(e.target.value)}
                                />
                                <Button size="sm" className="h-9 gap-1" onClick={handleAddHoliday}>
                                    <Plus className="size-3.5" /> {t("add")}
                                </Button>
                            </div>
                            {holidays.length === 0 ? (
                                <p className="py-6 text-center text-sm text-muted-foreground">{t("noHolidays")}</p>
                            ) : (
                                <div className="space-y-2">
                                    {holidays.map((h) => (
                                        <div key={h.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                                            <div>
                                                <p className="text-sm font-medium text-foreground">{h.name}</p>
                                                <p className="text-xs text-muted-foreground">{new Date(h.date).toLocaleDateString()}</p>
                                            </div>
                                            <Button variant="destructive" size="icon-sm" onClick={() => handleRemoveHoliday(h.id)}>
                                                <Trash2 className="size-3.5" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
