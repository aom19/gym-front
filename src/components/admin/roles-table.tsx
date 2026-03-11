"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { Pencil, Trash2, Plus, ShieldCheck, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet";
import {
    getRoles,
    createRole,
    updateRole,
    deleteRole,
    getRoleById,
    type Role,
    type RoleWithPermissions,
} from "@/services/roles";
import {
    assignPermission,
    revokePermission,
    PERMISSION_ENTITIES,
    PERMISSION_ACTIONS,
    type PermissionEntity,
    type PermissionAction,
} from "@/services/permissions";

interface FormState {
    name: string;
    description: string;
}

const emptyForm: FormState = { name: "", description: "" };

export function RolesTable() {
    const t = useTranslations("roles");

    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);

    const [createOpen, setCreateOpen] = useState(false);
    const [editRole, setEditRole] = useState<Role | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);

    // Permissions panel
    const [permRole, setPermRole] = useState<RoleWithPermissions | null>(null);
    const [permLoading, setPermLoading] = useState(false);
    const [permToggles, setPermToggles] = useState<Record<string, boolean>>({});

    const [form, setForm] = useState<FormState>(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const loadRoles = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getRoles();
            setRoles(data);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error loading roles");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadRoles();
    }, [loadRoles]);

    const openEdit = (role: Role) => {
        setEditRole(role);
        setForm({ name: role.name, description: role.description ?? "" });
        setFormError(null);
    };

    const closeSheet = () => {
        setCreateOpen(false);
        setEditRole(null);
        setForm(emptyForm);
        setFormError(null);
    };

    const handleCreate = async () => {
        if (!form.name.trim()) {
            setFormError(t("validationRequired"));
            return;
        }
        setSubmitting(true);
        setFormError(null);
        try {
            const created = await createRole({
                name: form.name.trim(),
                description: form.description.trim() || undefined,
            });
            setRoles((prev) => [...prev, created]);
            toast.success(t("createSuccess"));
            closeSheet();
        } catch (err) {
            setFormError(err instanceof Error ? err.message : "Error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdate = async () => {
        if (!editRole) return;
        setSubmitting(true);
        setFormError(null);
        try {
            const payload: Parameters<typeof updateRole>[1] = {};
            if (form.name.trim() !== editRole.name) payload.name = form.name.trim();
            if ((form.description.trim() || null) !== (editRole.description ?? null)) {
                payload.description = form.description.trim() || undefined;
            }
            const updated = await updateRole(editRole.id, payload);
            setRoles((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
            toast.success(t("updateSuccess"));
            closeSheet();
        } catch (err) {
            setFormError(err instanceof Error ? err.message : "Error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setSubmitting(true);
        try {
            await deleteRole(deleteTarget.id);
            setRoles((prev) => prev.filter((r) => r.id !== deleteTarget.id));
            toast.success(t("deleteSuccess"));
            setDeleteTarget(null);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error");
        } finally {
            setSubmitting(false);
        }
    };

    // ── Permissions panel ──────────────────────────────────────────────────
    const openPermissions = async (role: Role) => {
        setPermLoading(true);
        try {
            const data = await getRoleById(role.id);
            setPermRole(data);
            const map: Record<string, boolean> = {};
            data.rolePermissions.forEach((rp) => {
                map[`${rp.permission.entity}:${rp.permission.action}`] = true;
            });
            setPermToggles(map);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error loading permissions");
        } finally {
            setPermLoading(false);
        }
    };

    const handlePermToggle = async (entity: PermissionEntity, action: PermissionAction) => {
        if (!permRole) return;
        const key = `${entity}:${action}`;
        const isGranted = !!permToggles[key];

        setPermToggles((prev) => ({ ...prev, [key]: !isGranted }));

        try {
            if (isGranted) {
                await revokePermission({ roleId: permRole.id, entity, action });
            } else {
                await assignPermission({ roleId: permRole.id, entity, action });
            }
        } catch (err) {
            // revert on failure
            setPermToggles((prev) => ({ ...prev, [key]: isGranted }));
            toast.error(err instanceof Error ? err.message : "Error toggling permission");
        }
    };

    const isSheetOpen = createOpen || editRole !== null;
    const sheetTitle = editRole ? t("editRole") : t("addRole");

    return (
        <>
            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
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
                    {t("addRole")}
                </Button>
            </div>

            {/* ── Table ───────────────────────────────────────────────────── */}
            <div className="rounded-xl border border-border bg-card ring-1 ring-foreground/10 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border bg-muted/50">
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("name")}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">{t("description")}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">{t("users")}</th>
                            <th className="px-4 py-3 text-right font-medium text-muted-foreground">{t("actions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                                    {t("loading")}
                                </td>
                            </tr>
                        ) : roles.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                                    {t("noRoles")}
                                </td>
                            </tr>
                        ) : (
                            roles.map((role) => (
                                <tr key={role.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                                    <td className="px-4 py-3">
                                        <Badge variant="secondary" className="font-mono text-xs">{role.name}</Badge>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                                        {role.description ?? <span className="opacity-40">—</span>}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                                        {role._count?.users ?? 0}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-8"
                                                title={t("managePermissions")}
                                                onClick={() => openPermissions(role)}
                                            >
                                                <ShieldCheck className="size-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(role)}>
                                                <Pencil className="size-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-8 text-destructive hover:text-destructive"
                                                onClick={() => setDeleteTarget(role)}
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

            {/* ── Create / Edit Sheet ─────────────────────────────────────── */}
            <Sheet open={isSheetOpen} onOpenChange={(open) => { if (!open) closeSheet(); }}>
                <SheetContent side="right" className="w-full sm:max-w-md flex flex-col gap-0">
                    <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
                        <SheetTitle>{sheetTitle}</SheetTitle>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">{t("name")} *</label>
                            <Input
                                value={form.name}
                                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                placeholder={t("namePlaceholder")}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">{t("description")}</label>
                            <Input
                                value={form.description}
                                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                placeholder={t("descriptionPlaceholder")}
                            />
                        </div>

                        {formError && (
                            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{formError}</p>
                        )}
                    </div>

                    <SheetFooter className="px-6 py-4 border-t border-border gap-2">
                        <Button variant="outline" onClick={closeSheet} disabled={submitting}>
                            {t("cancel")}
                        </Button>
                        <Button onClick={editRole ? handleUpdate : handleCreate} disabled={submitting}>
                            {submitting ? t("saving") : t("save")}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {/* ── Permissions Panel ────────────────────────────────────────── */}
            {permRole && (
                <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/50 backdrop-blur-sm">
                    <div className="h-full w-full max-w-lg bg-card border-l border-border shadow-xl flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                            <div>
                                <h2 className="text-lg font-semibold text-foreground">{t("permissions")}</h2>
                                <p className="text-sm text-muted-foreground">
                                    {t("permissionsFor")} <span className="font-mono font-medium">{permRole.name}</span>
                                </p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setPermRole(null)}>
                                ✕
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-5">
                            {permLoading ? (
                                <p className="text-sm text-muted-foreground">{t("loading")}</p>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="py-2 text-left font-medium text-muted-foreground">{t("entity")}</th>
                                            {PERMISSION_ACTIONS.map((action) => (
                                                <th key={action} className="py-2 text-center font-medium text-muted-foreground capitalize">
                                                    {action}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {PERMISSION_ENTITIES.map((entity) => (
                                            <tr key={entity} className="border-b border-border last:border-0">
                                                <td className="py-2.5 font-medium text-foreground">{entity}</td>
                                                {PERMISSION_ACTIONS.map((action) => {
                                                    const key = `${entity}:${action}`;
                                                    const granted = !!permToggles[key];
                                                    return (
                                                        <td key={action} className="py-2.5 text-center">
                                                            <button
                                                                onClick={() => handlePermToggle(entity as PermissionEntity, action as PermissionAction)}
                                                                className={`size-6 rounded transition-colors flex items-center justify-center mx-auto text-xs font-bold ${
                                                                    granted
                                                                        ? "bg-primary text-primary-foreground"
                                                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                                                }`}
                                                                title={granted ? t("revoke") : t("grant")}
                                                            >
                                                                {granted ? "✓" : "–"}
                                                            </button>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete Confirm Overlay ───────────────────────────────────── */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="rounded-xl border border-border bg-card shadow-xl p-6 max-w-md w-full space-y-4">
                        <h2 className="text-lg font-semibold text-foreground">{t("deleteRole")}</h2>
                        <p className="text-sm text-muted-foreground">
                            {t("deleteConfirm")} <strong>{deleteTarget.name}</strong>?
                        </p>
                        <p className="text-xs text-muted-foreground">{t("deleteWarning")}</p>
                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={submitting}>
                                {t("cancel")}
                            </Button>
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
