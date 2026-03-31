"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import toast from "react-hot-toast";
import Link from "next/link";
import { ArrowLeft, Plus, X, Users, Calendar } from "lucide-react";
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
    getGroupClassById,
    getClassBookings,
    bookClass,
    cancelBooking,
    type GroupClass,
    type ClassBooking,
} from "@/services/group-classes";
import { getMembers, type Member } from "@/services/members";

interface Props {
    classId: string;
}

export function ClassBookingsManager({ classId }: Props) {
    const t = useTranslations("classBookings");
    const lang = useLocale();

    const [groupClass, setGroupClass] = useState<GroupClass | null>(null);
    const [bookings, setBookings] = useState<ClassBooking[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);

    const [addOpen, setAddOpen] = useState(false);
    const [selectedMemberId, setSelectedMemberId] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [cls, bks, memsResult] = await Promise.all([
                getGroupClassById(classId),
                getClassBookings(classId),
                getMembers({ limit: 0 }),
            ]);
            setGroupClass(cls);
            setBookings(bks);
            setMembers(memsResult.data);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error loading data");
        } finally {
            setLoading(false);
        }
    }, [classId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleBook = async () => {
        if (!selectedMemberId) {
            setFormError(t("selectMemberRequired"));
            return;
        }
        setSubmitting(true);
        setFormError(null);
        try {
            const booking = await bookClass(classId, selectedMemberId);
            setBookings((prev) => [booking, ...prev]);
            toast.success(t("bookSuccess"));
            setAddOpen(false);
            setSelectedMemberId("");
        } catch (err) {
            setFormError(err instanceof Error ? err.message : "Error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = async (memberId: string) => {
        try {
            await cancelBooking(classId, memberId);
            setBookings((prev) =>
                prev.map((b) => (b.memberId === memberId ? { ...b, status: "CANCELLED" as const } : b))
            );
            toast.success(t("cancelSuccess"));
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error");
        }
    };

    const statusColor = (s: string) => {
        switch (s) {
            case "CONFIRMED": return "bg-emerald-500/10 text-emerald-600 border-0";
            case "CANCELLED": return "bg-gray-500/10 text-gray-600 border-0";
            case "ATTENDED": return "bg-blue-500/10 text-blue-600 border-0";
            default: return "";
        }
    };

    const confirmedCount = bookings.filter((b) => b.status === "CONFIRMED").length;
    const bookedMemberIds = new Set(bookings.filter((b) => b.status === "CONFIRMED").map((b) => b.memberId));
    const availableMembers = members.filter((m) => !bookedMemberIds.has(m.id));

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href={`/${lang}/admin/classes`}>
                        <Button variant="ghost" size="icon-sm">
                            <ArrowLeft className="size-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-foreground">
                            {t("title")}
                        </h1>
                        {groupClass && (
                            <p className="mt-1 text-sm text-muted-foreground">
                                {groupClass.title} — {new Date(groupClass.scheduledAt).toLocaleDateString()} {new Date(groupClass.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                        )}
                    </div>
                </div>
                <Button onClick={() => { setAddOpen(true); setFormError(null); setSelectedMemberId(""); }} className="gap-1.5">
                    <Plus className="size-4" />
                    {t("addBooking")}
                </Button>
            </div>

            {/* Stats Cards */}
            {groupClass && (
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 ring-1 ring-foreground/10">
                        <p className="text-xs text-muted-foreground">{t("confirmed")}</p>
                        <p className="text-2xl font-bold text-foreground">{confirmedCount}</p>
                    </div>
                    <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 ring-1 ring-foreground/10">
                        <p className="text-xs text-muted-foreground">{t("capacity")}</p>
                        <p className="text-2xl font-bold text-foreground">{confirmedCount}/{groupClass.maxParticipants}</p>
                    </div>
                    <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 ring-1 ring-foreground/10">
                        <p className="text-xs text-muted-foreground">{t("spotsLeft")}</p>
                        <p className="text-2xl font-bold text-foreground">{groupClass.maxParticipants - confirmedCount}</p>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border/60 bg-muted/30">
                            <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t("member")}</th>
                            <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground hidden sm:table-cell">{t("email")}</th>
                            <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t("bookedAt")}</th>
                            <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t("status")}</th>
                            <th className="px-4 py-3 text-right text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t("actions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="border-b border-border last:border-0">
                                    <td className="px-4 py-3"><div className="h-4 w-28 rounded-md skeleton-shimmer" /></td>
                                    <td className="px-4 py-3 hidden sm:table-cell"><div className="h-4 w-36 rounded-md skeleton-shimmer" /></td>
                                    <td className="px-4 py-3"><div className="h-4 w-20 rounded-md skeleton-shimmer" /></td>
                                    <td className="px-4 py-3"><div className="h-5 w-16 rounded-full skeleton-shimmer" /></td>
                                    <td className="px-4 py-3"><div className="h-4 w-14 ml-auto rounded-md skeleton-shimmer" /></td>
                                </tr>
                            ))
                        ) : bookings.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-16 text-center">
                                    <Users className="mx-auto mb-3 size-8 text-muted-foreground/40" />
                                    <p className="text-sm font-medium text-muted-foreground">{t("noBookings")}</p>
                                </td>
                            </tr>
                        ) : (
                            bookings.map((booking) => (
                                <tr
                                    key={booking.id}
                                    className="group table-row-hover border-b border-border last:border-0"
                                >
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/8 text-[11px] font-semibold text-primary">
                                                {booking.member.firstName[0]}
                                            </div>
                                            <span className="font-medium text-foreground">
                                                {booking.member.firstName} {booking.member.lastName}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">
                                        {booking.member.email ?? "—"}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground tabular-nums">
                                        {new Date(booking.bookedAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className={statusColor(booking.status)}>{booking.status}</Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {booking.status === "CONFIRMED" && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleCancel(booking.memberId)}
                                                className="gap-1 opacity-0 transition-opacity group-hover:opacity-100 text-destructive hover:text-destructive"
                                            >
                                                <X className="size-3.5" />
                                                {t("cancelBooking")}
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Booking Sheet */}
            <Sheet open={addOpen} onOpenChange={(open) => { if (!open) { setAddOpen(false); setFormError(null); } }}>
                <SheetContent side="right" className="w-full sm:max-w-md flex flex-col gap-0 p-0">
                    <SheetHeader className="border-b border-border">
                        <SheetTitle>{t("addBooking")}</SheetTitle>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <div className="grid gap-1.5">
                            <label className="text-sm font-medium text-foreground">{t("member")}</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background text-foreground [&>option]:bg-background [&>option]:text-foreground px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                                value={selectedMemberId}
                                onChange={(e) => setSelectedMemberId(e.target.value)}
                            >
                                <option value="">{t("selectMember")}</option>
                                {availableMembers.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.firstName} {m.lastName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {formError && <p className="text-sm text-destructive">{formError}</p>}
                    </div>

                    <SheetFooter className="border-t border-border">
                        <Button variant="outline" onClick={() => setAddOpen(false)} disabled={submitting}>
                            {t("cancel")}
                        </Button>
                        <Button onClick={handleBook} disabled={submitting}>
                            {submitting ? t("saving") : t("book")}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </>
    );
}
