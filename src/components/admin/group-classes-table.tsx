"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { Pencil, Trash2, Plus, Calendar, Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useServerTable } from "@/hooks/useServerTable";
import { TablePagination } from "@/components/ui/table-pagination";
import { SortableHeader } from "@/components/ui/sortable-header";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet";
import {
    getGroupClasses,
    createGroupClass,
    updateGroupClass,
    deleteGroupClass,
    getClassBookings,
    CLASS_TYPES,
    type GroupClass,
    type ClassType,
    type ClassBooking,
} from "@/services/group-classes";
import { getLocations, type Location } from "@/services/locations";
import { getUsers, type User } from "@/services/users";

interface FormState {
    title: string;
    type: ClassType | "";
    instructorId: string;
    locationId: string;
    maxParticipants: number;
    scheduledAt: string;
    durationMinutes: number;
    isActive: boolean;
}

const emptyForm: FormState = {
    title: "", type: "", instructorId: "", locationId: "",
    maxParticipants: 20, scheduledAt: "", durationMinutes: 60, isActive: true,
};

export function GroupClassesTable({ userRole }: { userRole: string }) {
    const t = useTranslations("groupClasses");

    const [locations, setLocations] = useState<Location[]>([]);
    const [instructors, setInstructors] = useState<User[]>([]);

    const table = useServerTable<GroupClass>({
        fetchFn: getGroupClasses,
        pageSize: 10,
        defaultSort: "scheduledAt",
    });

    const [createOpen, setCreateOpen] = useState(false);
    const [editClass, setEditClass] = useState<GroupClass | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<GroupClass | null>(null);

    const [bookingsClass, setBookingsClass] = useState<GroupClass | null>(null);
    const [bookings, setBookings] = useState<ClassBooking[]>([]);
    const [bookingsLoading, setBookingsLoading] = useState(false);

    const [form, setForm] = useState<FormState>(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        getLocations({ limit: 0 }).then((r) => setLocations(r.data)).catch(() => {});
        getUsers({ limit: 0 }).then((r) => setInstructors(r.data.filter((u) => u.role.name === "TRAINER" || u.role.name === "ADMIN"))).catch(() => {});
    }, []);

    const openEdit = (c: GroupClass) => {
        setEditClass(c);
        setForm({
            title: c.title,
            type: c.type,
            instructorId: c.instructor?.id ?? "",
            locationId: c.location.id,
            maxParticipants: c.maxParticipants,
            scheduledAt: c.scheduledAt.slice(0, 16),
            durationMinutes: c.durationMinutes,
            isActive: c.isActive,
        });
        setFormError(null);
    };

    const closeSheet = () => {
        setCreateOpen(false);
        setEditClass(null);
        setForm(emptyForm);
        setFormError(null);
    };

    const openBookings = async (c: GroupClass) => {
        setBookingsClass(c);
        setBookingsLoading(true);
        try {
            const data = await getClassBookings(c.id);
            setBookings(data);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : t("errors.generic"));
        } finally {
            setBookingsLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!form.title || !form.type || !form.locationId || !form.scheduledAt) {
            setFormError(t("validationRequired"));
            return;
        }
        setSubmitting(true);
        setFormError(null);
        try {
            await createGroupClass({
                title: form.title,
                type: form.type as ClassType,
                locationId: form.locationId,
                maxParticipants: form.maxParticipants,
                scheduledAt: form.scheduledAt,
                durationMinutes: form.durationMinutes,
                isActive: form.isActive,
                ...(form.instructorId ? { instructorId: form.instructorId } : {}),
            });
            table.refetch();
            toast.success(t("createSuccess"));
            closeSheet();
        } catch (err) {
            setFormError(err instanceof Error ? err.message : t("errors.generic"));
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdate = async () => {
        if (!editClass) return;
        setSubmitting(true);
        setFormError(null);
        try {
            await updateGroupClass(editClass.id, {
                title: form.title,
                type: form.type as ClassType,
                locationId: form.locationId,
                maxParticipants: form.maxParticipants,
                scheduledAt: form.scheduledAt,
                durationMinutes: form.durationMinutes,
                isActive: form.isActive,
                ...(form.instructorId ? { instructorId: form.instructorId } : {}),
            });
            table.refetch();
            toast.success(t("updateSuccess"));
            closeSheet();
        } catch (err) {
            setFormError(err instanceof Error ? err.message : t("errors.generic"));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setSubmitting(true);
        try {
            await deleteGroupClass(deleteTarget.id);
            table.refetch();
            toast.success(t("deleteSuccess"));
            setDeleteTarget(null);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : t("errors.generic"));
        } finally {
            setSubmitting(false);
        }
    };

    const isSheetOpen = createOpen || editClass !== null;
    const sheetTitle = editClass ? t("editClass") : t("addClass");

    return (
        <>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight text-foreground">{t("title")}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                        <Input
                            placeholder={t("search")}
                            value={table.search}
                            onChange={(e) => table.setSearch(e.target.value)}
                            className="pl-8 w-48 h-9 text-sm"
                        />
                    </div>
                    <Button onClick={() => { setForm(emptyForm); setFormError(null); setCreateOpen(true); }} className="gap-1.5">
                        <Plus className="size-4" /> {t("addClass")}
                    </Button>
                </div>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border/60 bg-muted/30">
                            <SortableHeader label={t("classTitle")} sortKey="title" currentSort={table.sort} onToggle={table.toggleSort} />
                            <SortableHeader label={t("type")} sortKey="type" currentSort={table.sort} onToggle={table.toggleSort} className="hidden sm:table-cell" />
                            <SortableHeader label={t("location")} sortKey="location" currentSort={table.sort} onToggle={table.toggleSort} className="hidden md:table-cell" />
                            <SortableHeader label={t("scheduledAt")} sortKey="scheduledAt" currentSort={table.sort} onToggle={table.toggleSort} className="hidden md:table-cell" />
                            <SortableHeader label={t("participants")} sortKey="maxParticipants" currentSort={table.sort} onToggle={table.toggleSort} className="hidden lg:table-cell" />
                            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">{t("status")}</th>
                            <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("actions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {table.loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="border-b border-border last:border-0">
                                    <td className="px-4 py-3"><div className="h-4 w-28 rounded-md skeleton-shimmer" /></td>
                                    <td className="px-4 py-3 hidden sm:table-cell"><div className="h-5 w-16 rounded-full skeleton-shimmer" /></td>
                                    <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 w-20 rounded-md skeleton-shimmer" /></td>
                                    <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 w-28 rounded-md skeleton-shimmer" /></td>
                                    <td className="px-4 py-3 hidden lg:table-cell"><div className="h-4 w-14 rounded-md skeleton-shimmer" /></td>
                                    <td className="px-4 py-3 hidden lg:table-cell"><div className="h-5 w-14 rounded-full skeleton-shimmer" /></td>
                                    <td className="px-4 py-3"><div className="h-4 w-14 ml-auto rounded-md skeleton-shimmer" /></td>
                                </tr>
                            ))
                        ) : table.items.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-16 text-center">
                                    <Calendar className="mx-auto mb-3 size-8 text-muted-foreground/40" />
                                    <p className="text-sm font-medium text-muted-foreground">{t("noClasses")}</p>
                                </td>
                            </tr>
                        ) : (
                            table.items.map((c) => (
                                <tr key={c.id} className="group table-row-hover border-b border-border last:border-0">
                                    <td className="px-4 py-3"><span className="font-medium text-foreground">{c.title}</span></td>
                                    <td className="px-4 py-3 hidden sm:table-cell"><Badge variant="secondary">{c.type}</Badge></td>
                                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{c.location.name}</td>
                                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{new Date(c.scheduledAt).toLocaleString()}</td>
                                    <td className="px-4 py-3 hidden lg:table-cell">
                                        <button onClick={() => openBookings(c)} className="text-muted-foreground hover:text-foreground transition-colors underline decoration-dotted">
                                            {c._count.bookings}/{c.maxParticipants}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 hidden lg:table-cell">
                                        <Badge variant={c.isActive ? "default" : "secondary"}>
                                            {c.isActive ? t("active") : t("inactive")}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                            <Button variant="ghost" size="icon-sm" onClick={() => openEdit(c)}><Pencil className="size-3.5" /></Button>
                                            <Button variant="destructive" size="icon-sm" onClick={() => setDeleteTarget(c)}><Trash2 className="size-3.5" /></Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                {!table.loading && table.items.length > 0 && (
                    <TablePagination
                        page={table.page}
                        totalPages={table.totalPages}
                        totalItems={table.totalItems}
                        pageSize={table.pageSize}
                        onPageChange={table.setPage}
                    />
                )}
            </div>

            {/* Create/Edit Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={(open) => { if (!open) closeSheet(); }}>
                <SheetContent side="right" className="w-full sm:max-w-md flex flex-col gap-0 p-0">
                    <SheetHeader className="border-b border-border">
                        <SheetTitle>{sheetTitle}</SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <div className="grid gap-1.5">
                            <label className="text-sm font-medium text-foreground">{t("titleLabel")}</label>
                            <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-1.5">
                                <label className="text-sm font-medium text-foreground">{t("typeLabel")}</label>
                                <select className="flex h-10 w-full rounded-md border border-input bg-background text-foreground [&>option]:bg-background [&>option]:text-foreground px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as ClassType }))}>
                                    <option value="">{t("selectType")}</option>
                                    {CLASS_TYPES.map((ct) => <option key={ct} value={ct}>{ct}</option>)}
                                </select>
                            </div>
                            <div className="grid gap-1.5">
                                <label className="text-sm font-medium text-foreground">{t("locationLabel")}</label>
                                <select className="flex h-10 w-full rounded-md border border-input bg-background text-foreground [&>option]:bg-background [&>option]:text-foreground px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50" value={form.locationId} onChange={(e) => setForm((f) => ({ ...f, locationId: e.target.value }))}>
                                    <option value="">{t("selectLocation")}</option>
                                    {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid gap-1.5">
                            <label className="text-sm font-medium text-foreground">{t("instructorLabel")}</label>
                            <select className="flex h-10 w-full rounded-md border border-input bg-background text-foreground [&>option]:bg-background [&>option]:text-foreground px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50" value={form.instructorId} onChange={(e) => setForm((f) => ({ ...f, instructorId: e.target.value }))}>
                                <option value="">{t("selectInstructor")}</option>
                                {instructors.map((u) => <option key={u.id} value={u.id}>{u.email}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-1.5">
                                <label className="text-sm font-medium text-foreground">{t("scheduledAtLabel")}</label>
                                <Input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))} />
                            </div>
                            <div className="grid gap-1.5">
                                <label className="text-sm font-medium text-foreground">{t("durationLabel")}</label>
                                <Input type="number" min={15} step={15} value={form.durationMinutes} onChange={(e) => setForm((f) => ({ ...f, durationMinutes: Number(e.target.value) || 60 }))} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-1.5">
                                <label className="text-sm font-medium text-foreground">{t("maxParticipantsLabel")}</label>
                                <Input type="number" min={1} value={form.maxParticipants} onChange={(e) => setForm((f) => ({ ...f, maxParticipants: Number(e.target.value) || 1 }))} />
                            </div>
                            <div className="grid gap-1.5">
                                <label className="text-sm font-medium text-foreground">{t("activeLabel")}</label>
                                <select className="flex h-10 w-full rounded-md border border-input bg-background text-foreground [&>option]:bg-background [&>option]:text-foreground px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50" value={form.isActive ? "true" : "false"} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.value === "true" }))}>
                                    <option value="true">{t("active")}</option>
                                    <option value="false">{t("inactive")}</option>
                                </select>
                            </div>
                        </div>
                        {formError && <p className="text-sm text-destructive">{formError}</p>}
                    </div>
                    <SheetFooter className="border-t border-border">
                        <Button variant="outline" onClick={closeSheet} disabled={submitting}>{t("cancel")}</Button>
                        <Button onClick={editClass ? handleUpdate : handleCreate} disabled={submitting}>
                            {submitting ? t("saving") : t("save")}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {/* Bookings Sheet */}
            <Sheet open={bookingsClass !== null} onOpenChange={(open) => { if (!open) setBookingsClass(null); }}>
                <SheetContent side="right" className="w-full sm:max-w-md flex flex-col gap-0 p-0">
                    <SheetHeader className="border-b border-border">
                        <SheetTitle>{bookingsClass?.title} — {t("bookings")}</SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto p-4">
                        {bookingsLoading ? (
                            <div className="space-y-3">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="h-12 rounded-lg skeleton-shimmer" />
                                ))}
                            </div>
                        ) : bookings.length === 0 ? (
                            <div className="py-12 text-center">
                                <Users className="mx-auto mb-3 size-8 text-muted-foreground/40" />
                                <p className="text-sm text-muted-foreground">{t("noBookings")}</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {bookings.map((b) => (
                                    <div key={b.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{b.member.firstName} {b.member.lastName}</p>
                                            <p className="text-xs text-muted-foreground">{b.member.email}</p>
                                        </div>
                                        <Badge variant={b.status === "CONFIRMED" ? "default" : b.status === "ATTENDED" ? "secondary" : "destructive"}>
                                            {b.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            {/* Delete Confirm */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="rounded-xl border border-border bg-card p-5 shadow-lg w-full max-w-sm mx-4">
                        <h2 className="text-base font-semibold text-foreground">{t("deleteClass")}</h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {t("deleteConfirm")} <span className="font-medium text-foreground">{deleteTarget.title}</span>?
                        </p>
                        <div className="mt-5 flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={submitting}>{t("cancel")}</Button>
                            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
                                {submitting ? t("deleting") : t("delete")}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
