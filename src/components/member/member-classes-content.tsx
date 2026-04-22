"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import {
    Calendar,
    Clock,
    MapPin,
    XCircle,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMyMemberProfile } from "@/services/members";
import {
    getMemberBookings,
    cancelBooking,
    type ClassBooking,
} from "@/services/group-classes";

type Tab = "active" | "history";

const statusConfig = {
    CONFIRMED: { icon: CheckCircle2, className: "bg-emerald-500/10 text-emerald-600 border-0" },
    CANCELLED: { icon: XCircle, className: "bg-muted text-muted-foreground border-0" },
    ATTENDED: { icon: CheckCircle2, className: "bg-blue-500/10 text-blue-600 border-0" },
} as const;

export function MemberClassesContent() {
    const t = useTranslations("memberPortal");

    const [bookings, setBookings] = useState<ClassBooking[]>([]);
    const [memberId, setMemberId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [tab, setTab] = useState<Tab>("active");

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const member = await getMyMemberProfile();
            setMemberId(member.id);
            const data = await getMemberBookings(member.id);
            setBookings(data);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error loading bookings");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleCancel = async (booking: ClassBooking) => {
        if (!memberId) return;
        setCancellingId(booking.id);
        try {
            await cancelBooking(booking.classId, memberId);
            toast.success(t("bookingCancelled"));
            loadData();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error cancelling booking");
        } finally {
            setCancellingId(null);
        }
    };

    const now = new Date();
    const activeBookings = bookings.filter(
        (b) => b.status === "CONFIRMED" && new Date(b.groupClass.scheduledAt) >= now
    );
    const historyBookings = bookings.filter(
        (b) => b.status !== "CONFIRMED" || new Date(b.groupClass.scheduledAt) < now
    );
    const displayedBookings = tab === "active" ? activeBookings : historyBookings;

    return (
        <>
            {/* Header */}
            <div>
                <h1 className="text-xl font-semibold tracking-tight text-foreground">{t("classesTitle")}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{t("classesSubtitle")}</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 ring-1 ring-foreground/10">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="size-4" />
                        <p className="text-xs">{t("activeBookings")}</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                        {loading ? "—" : activeBookings.length}
                    </p>
                </div>
                <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 ring-1 ring-foreground/10">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="size-4" />
                        <p className="text-xs">{t("totalBooked")}</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                        {loading ? "—" : bookings.length}
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
                <button
                    onClick={() => setTab("active")}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                        tab === "active"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                    {t("activeTab")} ({loading ? "—" : activeBookings.length})
                </button>
                <button
                    onClick={() => setTab("history")}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                        tab === "history"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                    {t("historyTab")} ({loading ? "—" : historyBookings.length})
                </button>
            </div>

            {/* Bookings list */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                {loading ? (
                    <div className="p-4 space-y-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-16 rounded-lg skeleton-shimmer" />
                        ))}
                    </div>
                ) : displayedBookings.length === 0 ? (
                    <div className="px-4 py-10 text-center">
                        <Calendar className="mx-auto mb-3 size-8 text-muted-foreground/40" />
                        <p className="text-sm text-muted-foreground">
                            {tab === "active" ? t("noActiveBookings") : t("noHistoryBookings")}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {displayedBookings
                            .sort((a, b) => new Date(b.groupClass.scheduledAt).getTime() - new Date(a.groupClass.scheduledAt).getTime())
                            .map((booking) => {
                                const sc = statusConfig[booking.status];
                                const StatusIcon = sc.icon;
                                const scheduledAt = new Date(booking.groupClass.scheduledAt);
                                const isFuture = scheduledAt >= now;
                                const canCancel = booking.status === "CONFIRMED" && isFuture;

                                return (
                                    <div
                                        key={booking.id}
                                        className="flex items-center justify-between px-4 py-3 gap-4"
                                    >
                                        <div className="flex flex-col gap-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-foreground truncate">
                                                    {booking.groupClass.title}
                                                </span>
                                                <Badge className={sc.className}>
                                                    <StatusIcon className="size-3 mr-0.5" />
                                                    {t(`status_${booking.status}`)}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="size-3" />
                                                    {scheduledAt.toLocaleDateString()}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="size-3" />
                                                    {scheduledAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="size-3" />
                                                    {booking.groupClass.location.name}
                                                </span>
                                            </div>
                                        </div>
                                        {canCancel && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleCancel(booking)}
                                                disabled={cancellingId === booking.id}
                                                className="shrink-0 text-destructive hover:text-destructive"
                                            >
                                                <XCircle className="size-3.5 mr-1" />
                                                {cancellingId === booking.id ? "..." : t("cancelBooking")}
                                            </Button>
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
