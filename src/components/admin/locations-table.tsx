"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { Pencil, Trash2, Plus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet";
import {
    getLocations,
    createLocation,
    updateLocation,
    deleteLocation,
    type Location,
} from "@/services/locations";

interface FormState {
    name: string;
    address: string;
}

const emptyForm: FormState = { name: "", address: "" };

export function LocationsTable() {
    const t = useTranslations("locations_admin");

    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);

    const [createOpen, setCreateOpen] = useState(false);
    const [editLocation, setEditLocation] = useState<Location | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Location | null>(null);

    const [form, setForm] = useState<FormState>(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const loadLocations = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getLocations();
            setLocations(data);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error loading locations");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadLocations();
    }, [loadLocations]);

    const openEdit = (loc: Location) => {
        setEditLocation(loc);
        setForm({ name: loc.name, address: loc.address ?? "" });
        setFormError(null);
    };

    const closeSheet = () => {
        setCreateOpen(false);
        setEditLocation(null);
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
            const created = await createLocation({
                name: form.name.trim(),
                address: form.address.trim() || undefined,
            });
            setLocations((prev) => [...prev, created]);
            toast.success(t("createSuccess"));
            closeSheet();
        } catch (err) {
            setFormError(err instanceof Error ? err.message : "Error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdate = async () => {
        if (!editLocation) return;
        setSubmitting(true);
        setFormError(null);
        try {
            const payload: Parameters<typeof updateLocation>[1] = {};
            if (form.name.trim() !== editLocation.name) payload.name = form.name.trim();
            if ((form.address.trim() || null) !== (editLocation.address ?? null)) {
                payload.address = form.address.trim() || undefined;
            }
            const updated = await updateLocation(editLocation.id, payload);
            setLocations((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
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
            await deleteLocation(deleteTarget.id);
            setLocations((prev) => prev.filter((l) => l.id !== deleteTarget.id));
            toast.success(t("deleteSuccess"));
            setDeleteTarget(null);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error");
        } finally {
            setSubmitting(false);
        }
    };

    const isSheetOpen = createOpen || editLocation !== null;
    const sheetTitle = editLocation ? t("editLocation") : t("addLocation");

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
                    {t("addLocation")}
                </Button>
            </div>

            {/* ── Table ───────────────────────────────────────────────────── */}
            <div className="rounded-xl border border-border bg-card ring-1 ring-foreground/10 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border bg-muted/50">
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("name")}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">{t("address")}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden xl:table-cell">{t("createdAt")}</th>
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
                        ) : locations.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                                    <MapPin className="mx-auto mb-2 size-6 opacity-40" />
                                    {t("noLocations")}
                                </td>
                            </tr>
                        ) : (
                            locations.map((loc) => (
                                <tr key={loc.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                                    <td className="px-4 py-3 font-medium text-foreground">{loc.name}</td>
                                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                                        {loc.address ?? <span className="opacity-40">—</span>}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground hidden xl:table-cell">
                                        {new Date(loc.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(loc)}>
                                                <Pencil className="size-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-8 text-destructive hover:text-destructive"
                                                onClick={() => setDeleteTarget(loc)}
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
                            <label className="text-sm font-medium text-foreground">{t("address")}</label>
                            <Input
                                value={form.address}
                                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                                placeholder={t("addressPlaceholder")}
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
                        <Button onClick={editLocation ? handleUpdate : handleCreate} disabled={submitting}>
                            {submitting ? t("saving") : t("save")}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {/* ── Delete Confirm Overlay ───────────────────────────────────── */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="rounded-xl border border-border bg-card shadow-xl p-6 max-w-md w-full space-y-4">
                        <h2 className="text-lg font-semibold text-foreground">{t("deleteLocation")}</h2>
                        <p className="text-sm text-muted-foreground">
                            {t("deleteConfirm")} <strong>{deleteTarget.name}</strong>?
                        </p>
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
