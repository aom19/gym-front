"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { Pencil, Trash2, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet";
import {
    getMembers,
    createMember,
    updateMember,
    deleteMember,
    type Member,
    type CreateMemberPayload,
} from "@/services/members";
import { getLocations, type UserLocation } from "@/services/users";

interface FormState {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    locationId: string;
}

const emptyForm: FormState = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    locationId: "",
};

function getMemberActiveSub(member: Member) {
    if (!member.subscriptions || member.subscriptions.length === 0) return null;
    return member.subscriptions[0] ?? null;
}

export function MembersTable({ userRole }: { userRole: string }) {
    const t = useTranslations("members");

    const [members, setMembers] = useState<Member[]>([]);
    const [locations, setLocations] = useState<UserLocation[]>([]);
    const [loading, setLoading] = useState(true);

    const [createOpen, setCreateOpen] = useState(false);
    const [editMember, setEditMember] = useState<Member | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);

    const [form, setForm] = useState<FormState>(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const loadMembers = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getMembers();
            setMembers(data);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error loading members");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadMembers();
        getLocations().then(setLocations);
    }, [loadMembers]);

    // ── Open edit sheet ──────────────────────────────────────────────────────
    const openEdit = (member: Member) => {
        setEditMember(member);
        setForm({
            firstName: member.firstName,
            lastName: member.lastName,
            email: member.email ?? "",
            phone: member.phone ?? "",
            dateOfBirth: member.dateOfBirth ? member.dateOfBirth.slice(0, 10) : "",
            locationId: member.location.id,
        });
        setFormError(null);
    };

    const closeSheet = () => {
        setCreateOpen(false);
        setEditMember(null);
        setForm(emptyForm);
        setFormError(null);
    };

    // ── Create ───────────────────────────────────────────────────────────────
    const handleCreate = async () => {
        if (!form.firstName || !form.lastName || !form.locationId) {
            setFormError(t("validationRequired"));
            return;
        }
        setSubmitting(true);
        setFormError(null);
        try {
            const payload: CreateMemberPayload = {
                firstName: form.firstName,
                lastName: form.lastName,
                locationId: form.locationId,
                ...(form.email ? { email: form.email } : {}),
                ...(form.phone ? { phone: form.phone } : {}),
                ...(form.dateOfBirth ? { dateOfBirth: form.dateOfBirth } : {}),
            };
            const created = await createMember(payload);
            setMembers((prev) => [created, ...prev]);
            toast.success(t("createSuccess"));
            closeSheet();
        } catch (err) {
            setFormError(err instanceof Error ? err.message : "Error");
        } finally {
            setSubmitting(false);
        }
    };

    // ── Update ───────────────────────────────────────────────────────────────
    const handleUpdate = async () => {
        if (!editMember) return;
        setSubmitting(true);
        setFormError(null);
        try {
            const payload: Parameters<typeof updateMember>[1] = {};
            if (form.firstName !== editMember.firstName) payload.firstName = form.firstName;
            if (form.lastName !== editMember.lastName) payload.lastName = form.lastName;
            if (form.email !== (editMember.email ?? "")) payload.email = form.email || undefined;
            if (form.phone !== (editMember.phone ?? "")) payload.phone = form.phone || undefined;
            if (form.locationId !== editMember.location.id) payload.locationId = form.locationId;
            const newDob = form.dateOfBirth || undefined;
            const oldDob = editMember.dateOfBirth ? editMember.dateOfBirth.slice(0, 10) : undefined;
            if (newDob !== oldDob) payload.dateOfBirth = newDob;

            const updated = await updateMember(editMember.id, payload);
            setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
            toast.success(t("updateSuccess"));
            closeSheet();
        } catch (err) {
            setFormError(err instanceof Error ? err.message : "Error");
        } finally {
            setSubmitting(false);
        }
    };

    // ── Delete ───────────────────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!deleteTarget) return;
        setSubmitting(true);
        try {
            await deleteMember(deleteTarget.id);
            setMembers((prev) => prev.filter((m) => m.id !== deleteTarget.id));
            toast.success(t("deleteSuccess"));
            setDeleteTarget(null);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error");
        } finally {
            setSubmitting(false);
        }
    };

    const isSheetOpen = createOpen || editMember !== null;
    const sheetTitle = editMember ? t("editMember") : t("addMember");

    return (
        <>
            {/* ── Header ────────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight text-foreground">{t("title")}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
                </div>
                <Button
                    onClick={() => {
                        setForm(emptyForm);
                        setFormError(null);
                        setCreateOpen(true);
                    }}
                    className="gap-1.5"
                >
                    <Plus className="size-4" />
                    {t("addMember")}
                </Button>
            </div>

            {/* ── Table ─────────────────────────────────────────────────────── */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border/60 bg-muted/30">
                            <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t("name")}</th>
                            <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground hidden sm:table-cell">{t("email")}</th>
                            <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground hidden md:table-cell">{t("phone")}</th>
                            <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground hidden lg:table-cell">{t("location")}</th>
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
                                    <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 w-24 rounded-md skeleton-shimmer" /></td>
                                    <td className="px-4 py-3 hidden lg:table-cell"><div className="h-4 w-20 rounded-md skeleton-shimmer" /></td>
                                    <td className="px-4 py-3"><div className="h-5 w-16 rounded-full skeleton-shimmer" /></td>
                                    <td className="px-4 py-3"><div className="h-4 w-14 ml-auto rounded-md skeleton-shimmer" /></td>
                                </tr>
                            ))
                        ) : members.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-16 text-center">
                                    <Users className="mx-auto mb-3 size-8 text-muted-foreground/40" />
                                    <p className="text-sm font-medium text-muted-foreground">{t("noMembers")}</p>
                                </td>
                            </tr>
                        ) : (
                            members.map((member) => {
                                const sub = getMemberActiveSub(member);
                                const isActive = !!sub;
                                return (
                                    <tr
                                        key={member.id}
                                        className="group table-row-hover border-b border-border last:border-0"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/8 text-[11px] font-semibold text-primary">
                                                    {member.firstName[0]}
                                                </div>
                                                <span className="font-medium text-foreground">
                                                    {member.firstName} {member.lastName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">
                                            {member.email ?? "—"}
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                                            {member.phone ?? "—"}
                                        </td>
                                        <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                                            {member.location.name}
                                        </td>
                                        <td className="px-4 py-3">
                                            {isActive ? (
                                                <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 border-0">
                                                    {sub?.plan.name ?? t("active")}
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">{t("inactive")}</Badge>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    onClick={() => openEdit(member)}
                                                    aria-label="Edit member"
                                                >
                                                    <Pencil className="size-3.5" />
                                                </Button>
                                                {userRole === "ADMIN" && (
                                                    <Button
                                                        variant="destructive"
                                                        size="icon-sm"
                                                        onClick={() => setDeleteTarget(member)}
                                                        aria-label="Delete member"
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Create / Edit Sheet ───────────────────────────────────────── */}
            <Sheet open={isSheetOpen} onOpenChange={(open) => { if (!open) closeSheet(); }}>
                <SheetContent side="right" className="w-full sm:max-w-md flex flex-col gap-0 p-0">
                    <SheetHeader className="border-b border-border">
                        <SheetTitle>{sheetTitle}</SheetTitle>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-1.5">
                                <label className="text-sm font-medium text-foreground">{t("firstName")}</label>
                                <Input
                                    placeholder="Ion"
                                    value={form.firstName}
                                    onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                                />
                            </div>
                            <div className="grid gap-1.5">
                                <label className="text-sm font-medium text-foreground">{t("lastName")}</label>
                                <Input
                                    placeholder="Popa"
                                    value={form.lastName}
                                    onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="grid gap-1.5">
                            <label className="text-sm font-medium text-foreground">{t("email")}</label>
                            <Input
                                type="email"
                                placeholder="member@example.com"
                                value={form.email}
                                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                            />
                        </div>

                        <div className="grid gap-1.5">
                            <label className="text-sm font-medium text-foreground">{t("phone")}</label>
                            <Input
                                type="tel"
                                placeholder="+373 69 000 001"
                                value={form.phone}
                                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                            />
                        </div>

                        <div className="grid gap-1.5">
                            <label className="text-sm font-medium text-foreground">{t("dateOfBirth")}</label>
                            <Input
                                type="date"
                                value={form.dateOfBirth}
                                onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
                            />
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
                        <Button onClick={editMember ? handleUpdate : handleCreate} disabled={submitting}>
                            {submitting ? t("saving") : t("save")}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {/* ── Delete confirmation overlay ────────────────────────────────── */}
            {deleteTarget ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="rounded-xl border border-border bg-card p-5 shadow-lg w-full max-w-sm mx-4">
                        <h2 className="text-base font-semibold text-foreground">{t("deleteMember")}</h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {t("deleteConfirm")}{" "}
                            <span className="font-medium text-foreground">
                                {deleteTarget.firstName} {deleteTarget.lastName}
                            </span>?
                        </p>
                        <p className="mt-1 text-xs text-amber-600">{t("deleteWarning")}</p>
                        <div className="mt-5 flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={submitting}>
                                {t("cancel")}
                            </Button>
                            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
                                {submitting ? t("deleting") : t("delete")}
                            </Button>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
}
