"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { Calendar, Clock, Users, MapPin, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    getUpcomingClasses,
    bookClass,
    type GroupClass,
} from "@/services/group-classes";

interface Props {
    memberId?: string;
}

export function UpcomingClassesList({ memberId }: Props) {
    const t = useTranslations("publicClasses");

    const [classes, setClasses] = useState<GroupClass[]>([]);
    const [loading, setLoading] = useState(true);
    const [bookingId, setBookingId] = useState<string | null>(null);
    const [bookedIds, setBoostedIds] = useState<Set<string>>(new Set());

    const loadClasses = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getUpcomingClasses();
            setClasses(data);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadClasses();
    }, [loadClasses]);

    const handleBook = async (classId: string) => {
        if (!memberId) {
            toast.error(t("loginRequired"));
            return;
        }
        setBookingId(classId);
        try {
            await bookClass(classId, memberId);
            setBoostedIds((prev) => new Set(prev).add(classId));
            toast.success(t("bookSuccess"));
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error");
        } finally {
            setBookingId(null);
        }
    };

    const classTypeBg: Record<string, string> = {
        YOGA: "bg-violet-500/10 text-violet-600",
        ZUMBA: "bg-yellow-500/10 text-yellow-600",
        CROSSFIT: "bg-orange-500/10 text-orange-600",
        SPINNING: "bg-cyan-500/10 text-cyan-600",
        PILATES: "bg-pink-500/10 text-pink-600",
        BOXING: "bg-red-500/10 text-red-600",
        OTHER: "bg-gray-500/10 text-gray-600",
    };

    if (loading) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-48 rounded-xl skeleton-shimmer" />
                ))}
            </div>
        );
    }

    if (classes.length === 0) {
        return (
            <div className="text-center py-12">
                <Calendar className="mx-auto mb-3 size-10 text-muted-foreground/40" />
                <p className="text-muted-foreground">{t("noClasses")}</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((cls) => {
                const scheduledDate = new Date(cls.scheduledAt);
                const spotsLeft = cls.maxParticipants - cls._count.bookings;
                const isFull = spotsLeft <= 0;
                const isBooked = bookedIds.has(cls.id);

                return (
                    <div
                        key={cls.id}
                        className="flex flex-col rounded-xl border border-border bg-card p-5 ring-1 ring-foreground/10 transition hover:shadow-md"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h3 className="font-semibold text-foreground">{cls.title}</h3>
                                <Badge className={`${classTypeBg[cls.type] ?? classTypeBg.OTHER} border-0 mt-1`}>
                                    {cls.type}
                                </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">{cls.durationMinutes} min</span>
                        </div>

                        <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="size-3.5" />
                                {scheduledDate.toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="size-3.5" />
                                {scheduledDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="size-3.5" />
                                {cls.location.name}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Users className="size-3.5" />
                                {cls._count.bookings}/{cls.maxParticipants} {t("participants")}
                            </div>
                        </div>

                        <div className="mt-4">
                            {isBooked ? (
                                <Button variant="outline" className="w-full gap-1.5 text-emerald-600" disabled>
                                    <CheckCircle className="size-4" />
                                    {t("booked")}
                                </Button>
                            ) : isFull ? (
                                <Button variant="outline" className="w-full" disabled>
                                    {t("full")}
                                </Button>
                            ) : (
                                <Button
                                    className="w-full"
                                    onClick={() => handleBook(cls.id)}
                                    disabled={bookingId === cls.id || !memberId}
                                >
                                    {bookingId === cls.id ? t("booking") : t("reserve")}
                                </Button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
