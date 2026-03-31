"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { Pencil, Trash2, Plus, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
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

    const table = useServerTable<Location>({
        fetchFn: getLocations,
        pageSize: 10,
        defaultSort: "createdAt",
    });

    const [createOpen, setCreateOpen] = useState(false);
    const [editLocation, setEditLocation] = useState<Location | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Location | null>(null);

    const [form, setForm] = useState<FormState>(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

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
            table.refetch();
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
            table.refetch();
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
            table.refetch();
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
            </div>

            {/* ── Table ───────────────────────────────────────────────────── */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border/60 bg-muted/30">
                            <SortableHeader label={t("name")} sortKey="name" currentSort={table.sort} onToggle={table.toggleSort} />
                            <SortableHeader label={t("address")} sortKey="address" currentSort={table.sort} onToggle={table.toggleSort} className="hidden md:table-cell" />
                            <SortableHeader label={t("createdAt")} sortKey="createdAt" currentSort={table.sort} onToggle={table.toggleSort} className="hidden xl:table-cell" />
                            <th className="px-4 py-3 text-right text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t("actions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {table.loading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <tr key={i} className="border-b border-border last:border-0">
                                    <td className="px-4 py-3"><div className="h-4 w-28 rounded-md skeleton-shimmer" /></td>
                                    <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 w-40 rounded-md skeleton-shimmer" /></td>
                                    <td className="px-4 py-3 hidden xl:table-cell"><div className="h-4 w-20 rounded-md skeleton-shimmer" /></td>
                                    <td className="px-4 py-3"><div className="h-4 w-14 ml-auto rounded-md skeleton-shimmer" /></td>
                                </tr>
                            ))
                        ) : table.items.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-16 text-center">
                                    <MapPin className="mx-auto mb-3 size-8 text-muted-foreground/40" />
                                    <p className="text-sm font-medium text-muted-foreground">{t("noLocations")}</p>
                                </td>
                            </tr>
                        ) : (
                            table.items.map((loc) => (
                                <tr key={loc.id} className="group table-row-hover border-b border-border last:border-0">
                                    <td className="px-4 py-3 font-medium text-foreground">{loc.name}</td>
                                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                                        {loc.address ?? <span className="opacity-40">—</span>}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground hidden xl:table-cell">
                                        {new Date(loc.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
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
