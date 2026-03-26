"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { LogIn, LogOut, Plus, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet";
import {
    getTodayCheckins,
    createCheckin,
    checkoutCheckin,
    type Checkin,
    type CreateCheckinPayload,
} from "@/services/checkins";
import { getMembers, type Member } from "@/services/members";
import { getLocations, type UserLocation } from "@/services/users";

export function CheckinsTable() {
    const t = useTranslations("checkins");

    const [checkins, setCheckins] = useState<Checkin[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [locations, setLocations] = useState<UserLocation[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterLocation, setFilterLocation] = useState("");

    const [createOpen, setCreateOpen] = useState(false);
    const [form, setForm] = useState({ memberId: "", locationId: "" });
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const loadCheckins = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getTodayCheckins(filterLocation || undefined);
            setCheckins(data);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error loading check-ins");
        } finally {
            setLoading(false);
        }
    }, [filterLocation]);

    useEffect(() => {
        loadCheckins();
    }, [loadCheckins]);

    useEffect(() => {
        getMembers().then(setMembers);
        getLocations().then(setLocations);
    }, []);

    const closeSheet = () => {
        setCreateOpen(false);
        setForm({ memberId: "", locationId: "" });
        setFormError(null);
    };

    const handleCreate = async () => {
        if (!form.memberId || !form.locationId) {
            setFormError(t("validationRequired"));
            return;
        }
        setSubmitting(true);
        setFormError(null);
        try {
            const payload: CreateCheckinPayload = {
                memberId: form.memberId,
                locationId: form.locationId,
            };
            const created = await createCheckin(payload);
            setCheckins((prev) => [created, ...prev]);
            toast.success(t("checkInSuccess"));
            closeSheet();
        } catch (err) {
            setFormError(err instanceof Error ? err.message : "Error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCheckout = async (id: string) => {
        try {
            const updated = await checkoutCheckin(id);
            setCheckins((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
            toast.success(t("checkOutSuccess"));
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error");
        }
    };

    // Compute location counts
    const locationCounts: Record<string, number> = {};
    for (const c of checkins) {
        locationCounts[c.location.name] = (locationCounts[c.location.name] ?? 0) + 1;
    }

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight text-foreground">{t("title")}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
                </div>
                <Button
                    onClick={() => {
                        setForm({ memberId: "", locationId: "" });
                        setFormError(null);
                        setCreateOpen(true);
                    }}
                    className="gap-1.5"
                >
                    <Plus className="size-4" />
                    {t("checkIn")}
                </Button>
            </div>

            {/* Summary cards by location */}
            {Object.keys(locationCounts).length > 0 && (
                <div className="grid gap-4 sm:grid-cols-3">
                    {Object.entries(locationCounts).map(([loc, count]) => (
                        <div
                            key={loc}
                            className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 ring-1 ring-foreground/10"
                        >
                            <p className="text-xs text-muted-foreground">{loc}</p>
                            <p className="text-2xl font-bold text-foreground">{count}</p>
                            <p className="text-xs text-muted-foreground">{t("todayCheckins").toLowerCase()}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Filter */}
            <div className="flex gap-2">
                <select
                    className="flex h-9 rounded-md border border-input bg-background text-foreground [&>option]:bg-background [&>option]:text-foreground px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                >
                    <option value="">{t("filterByLocation")}</option>
                    {locations.map((l) => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border/60 bg-muted/30">
                            <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t("member")}</th>
                            <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t("time")}</th>
                            <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground hidden sm:table-cell">{t("checkout")}</th>
                            <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground hidden md:table-cell">{t("location")}</th>
                            <th className="px-4 py-3 text-right text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t("actions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="border-b border-border last:border-0">
                                    <td className="px-4 py-3"><div className="h-4 w-28 rounded-md skeleton-shimmer" /></td>
                                    <td className="px-4 py-3"><div className="h-4 w-16 rounded-md skeleton-shimmer" /></td>
                                    <td className="px-4 py-3 hidden sm:table-cell"><div className="h-4 w-16 rounded-md skeleton-shimmer" /></td>
                                    <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 w-20 rounded-md skeleton-shimmer" /></td>
                                    <td className="px-4 py-3"><div className="h-4 w-14 ml-auto rounded-md skeleton-shimmer" /></td>
                                </tr>
                            ))
                        ) : checkins.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-16 text-center">
                                    <CheckSquare className="mx-auto mb-3 size-8 text-muted-foreground/40" />
                                    <p className="text-sm font-medium text-muted-foreground">{t("noCheckins")}</p>
                                </td>
                            </tr>
                        ) : (
                            checkins.map((checkin) => (
                                <tr
                                    key={checkin.id}
                                    className="group table-row-hover border-b border-border last:border-0"
                                >
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/8 text-[11px] font-semibold text-primary">
                                                {checkin.member.firstName[0]}
                                            </div>
                                            <span className="font-medium text-foreground">
                                                {checkin.member.firstName} {checkin.member.lastName}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground tabular-nums">
                                        <div className="flex items-center gap-1.5">
                                            <LogIn className="size-3.5 text-emerald-500" />
                                            {new Date(checkin.checkInAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground tabular-nums">
                                        {checkin.checkOutAt ? (
                                            <div className="flex items-center gap-1.5">
                                                <LogOut className="size-3.5 text-blue-500" />
                                                {new Date(checkin.checkOutAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </div>
                                        ) : (
                                            <Badge variant="secondary" className="text-xs">—</Badge>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                                        {checkin.location.name}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {!checkin.checkOutAt && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleCheckout(checkin.id)}
                                                className="gap-1 opacity-0 transition-opacity group-hover:opacity-100"
                                            >
                                                <LogOut className="size-3.5" />
                                                {t("checkOut")}
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Check-in Sheet */}
            <Sheet open={createOpen} onOpenChange={(open) => { if (!open) closeSheet(); }}>
                <SheetContent side="right" className="w-full sm:max-w-md flex flex-col gap-0 p-0">
                    <SheetHeader className="border-b border-border">
                        <SheetTitle>{t("checkIn")}</SheetTitle>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <div className="grid gap-1.5">
                            <label className="text-sm font-medium text-foreground">{t("member")}</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background text-foreground [&>option]:bg-background [&>option]:text-foreground px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                                value={form.memberId}
                                onChange={(e) => setForm((f) => ({ ...f, memberId: e.target.value }))}
                            >
                                <option value="">{t("selectMember")}</option>
                                {members.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.firstName} {m.lastName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid gap-1.5">
                            <label className="text-sm font-medium text-foreground">{t("location")}</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background text-foreground [&>option]:bg-background [&>option]:text-foreground px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                                value={form.locationId}
                                onChange={(e) => setForm((f) => ({ ...f, locationId: e.target.value }))}
                            >
                                <option value="">{t("selectLocation")}</option>
                                {locations.map((l) => (
                                    <option key={l.id} value={l.id}>{l.name}</option>
                                ))}
                            </select>
                        </div>

                        {formError ? (
                            <p className="text-sm text-destructive">{formError}</p>
                        ) : null}
                    </div>

                    <SheetFooter className="border-t border-border">
                        <Button variant="outline" onClick={closeSheet} disabled={submitting}>
                            {t("cancel")}
                        </Button>
                        <Button onClick={handleCreate} disabled={submitting}>
                            {submitting ? t("saving") : t("checkIn")}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </>
    );
}
