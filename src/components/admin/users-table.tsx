"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { Pencil, Trash2, Plus, ShieldCheck, ShieldOff, UserCog } from "lucide-react";
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
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    getLocations,
    type User,
    type UserLocation,
    type UserRole,
} from "@/services/users";
import { api } from "@/services/api";

// Fetches all roles from the API (simple helper, not exported from users.ts to avoid import confusion)
async function fetchRolesFromApi(): Promise<UserRole[]> {
    try {
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
        const { data } = await api.get<UserRole[]>("/roles", {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        return data;
    } catch {
        return [];
    }
}

interface FormState {
    email: string;
    password: string;
    roleId: string;
    locationId: string;
}

const emptyForm: FormState = { email: "", password: "", roleId: "", locationId: "" };

export function UsersTable() {
    const t = useTranslations("users");

    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<UserRole[]>([]);
    const [locations, setLocations] = useState<UserLocation[]>([]);
    const [loading, setLoading] = useState(true);

    const [createOpen, setCreateOpen] = useState(false);
    const [editUser, setEditUser] = useState<User | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

    const [form, setForm] = useState<FormState>(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getUsers();
            setUsers(data);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : t("errors.generic"));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        loadUsers();
        fetchRolesFromApi().then(setRoles);
        getLocations().then(setLocations);
    }, [loadUsers]);

    // ── Open edit sheet ──────────────────────────────────────────────────────
    const openEdit = (user: User) => {
        setEditUser(user);
        setForm({
            email: user.email,
            password: "",
            roleId: user.role.id,
            locationId: user.location.id,
        });
        setFormError(null);
    };

    const closeSheet = () => {
        setCreateOpen(false);
        setEditUser(null);
        setForm(emptyForm);
        setFormError(null);
    };

    // ── Create ───────────────────────────────────────────────────────────────
    const handleCreate = async () => {
        if (!form.email || !form.password || !form.roleId || !form.locationId) {
            setFormError(t("validationRequired"));
            return;
        }
        setSubmitting(true);
        setFormError(null);
        try {
            const created = await createUser({
                email: form.email,
                password: form.password,
                roleId: form.roleId,
                locationId: form.locationId,
            });
            setUsers((prev) => [created, ...prev]);
            toast.success(t("createSuccess"));
            closeSheet();
        } catch (err) {
            setFormError(err instanceof Error ? err.message : t("errors.generic"));
        } finally {
            setSubmitting(false);
        }
    };

    // ── Update ───────────────────────────────────────────────────────────────
    const handleUpdate = async () => {
        if (!editUser) return;
        setSubmitting(true);
        setFormError(null);
        try {
            const payload: Parameters<typeof updateUser>[1] = {};
            if (form.email !== editUser.email) payload.email = form.email;
            if (form.password) payload.password = form.password;
            if (form.roleId !== editUser.role.id) payload.roleId = form.roleId;
            if (form.locationId !== editUser.location.id) payload.locationId = form.locationId;

            const updated = await updateUser(editUser.id, payload);
            setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
            toast.success(t("updateSuccess"));
            closeSheet();
        } catch (err) {
            setFormError(err instanceof Error ? err.message : t("errors.generic"));
        } finally {
            setSubmitting(false);
        }
    };

    // ── Delete ───────────────────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!deleteTarget) return;
        setSubmitting(true);
        try {
            await deleteUser(deleteTarget.id);
            setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
            toast.success(t("deleteSuccess"));
            setDeleteTarget(null);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : t("errors.generic"));
        } finally {
            setSubmitting(false);
        }
    };

    const isSheetOpen = createOpen || editUser !== null;
    const sheetTitle = editUser ? t("editUser") : t("addUser");

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
                    {t("addUser")}
                </Button>
            </div>

            {/* ── Table ─────────────────────────────────────────────────────── */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="border border-border/50 bg-red">
                        <tr className="border-b border-border/60 bg-muted/30">
                            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("email")}</th>
                            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">{t("role")}</th>
                            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">{t("location")}</th>
                            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hidden xl:table-cell">{t("createdAt")}</th>
                            <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("actions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="border-b border-border last:border-0">
                                    <td className="px-4 py-3"><div className="h-4 w-40 rounded-md skeleton-shimmer" /></td>
                                    <td className="px-4 py-3 hidden md:table-cell"><div className="h-5 w-16 rounded-full skeleton-shimmer" /></td>
                                    <td className="px-4 py-3 hidden lg:table-cell"><div className="h-4 w-24 rounded-md skeleton-shimmer" /></td>
                                    <td className="px-4 py-3 hidden xl:table-cell"><div className="h-4 w-20 rounded-md skeleton-shimmer" /></td>
                                    <td className="px-4 py-3"><div className="h-4 w-14 ml-auto rounded-md skeleton-shimmer" /></td>
                                </tr>
                            ))
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-16 text-center">
                                    <UserCog className="mx-auto mb-3 size-8 text-muted-foreground/40" />
                                    <p className="text-sm font-medium text-muted-foreground">{t("noUsers")}</p>
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr
                                    key={user.id}
                                    className="group table-row-hover border-b border-border last:border-0"
                                >
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-xs font-semibold text-primary ring-1 ring-primary/10">
                                                {user.email[0]?.toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground leading-tight">{user.email}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {user.emailVerified ? (
                                                        <span className="flex items-center gap-0.5 text-emerald-600">
                                                            <ShieldCheck className="size-3" /> verified
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-0.5 text-amber-500">
                                                            <ShieldOff className="size-3" /> unverified
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell">
                                        <Badge variant="secondary">{user.role.name}</Badge>
                                    </td>
                                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                                        {user.location.name}
                                    </td>
                                    <td className="px-4 py-3 hidden xl:table-cell text-muted-foreground text-xs">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => openEdit(user)}
                                                aria-label="Edit user"
                                            >
                                                <Pencil className="size-3.5" />
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="icon-sm"
                                                onClick={() => setDeleteTarget(user)}
                                                aria-label="Delete user"
                                            >
                                                <Trash2 className="size-3.5" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
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
                        <div className="grid gap-1.5">
                            <label className="text-sm font-medium text-foreground">{t("emailLabel")}</label>
                            <Input
                                type="email"
                                placeholder="user@example.com"
                                value={form.email}
                                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                            />
                        </div>

                        <div className="grid gap-1.5">
                            <label className="text-sm font-medium text-foreground">
                                {editUser ? t("newPassword") : t("password")}
                            </label>
                            <Input
                                type="password"
                                placeholder={editUser ? t("passwordPlaceholder") : ""}
                                value={form.password}
                                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                            />
                        </div>

                        <div className="grid gap-1.5">
                            <label className="text-sm font-medium text-foreground">{t("roleLabel")}</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background text-foreground [&>option]:bg-background [&>option]:text-foreground px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                                value={form.roleId}
                                onChange={(e) => setForm((f) => ({ ...f, roleId: e.target.value }))}
                            >
                                <option value="">{t("selectRole")}</option>
                                {roles.map((r) => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid gap-1.5">
                            <label className="text-sm font-medium text-foreground">{t("locationLabel")}</label>
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
                        <Button onClick={editUser ? handleUpdate : handleCreate} disabled={submitting}>
                            {submitting ? t("saving") : t("save")}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {/* ── Delete confirmation overlay ────────────────────────────────── */}
            {deleteTarget ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="rounded-xl border border-border bg-card p-5 shadow-lg w-full max-w-sm mx-4">
                        <h2 className="text-base font-semibold text-foreground">{t("deleteUser")}</h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {t("deleteConfirm")} <span className="font-medium text-foreground">{deleteTarget.email}</span>?
                        </p>
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
