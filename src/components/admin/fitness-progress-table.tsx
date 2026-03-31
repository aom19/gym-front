"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { Trash2, Plus, TrendingUp, Search } from "lucide-react";
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
    getFitnessProgress,
    createFitnessProgress,
    deleteFitnessProgress,
    type FitnessProgress,
} from "@/services/fitness-progress";
import { getMembers, type Member } from "@/services/members";
import { FitnessProgressCharts } from "@/components/admin/fitness-progress-charts";
import { useServerTable, PaginationParams } from "@/hooks/useServerTable";
import { TablePagination } from "@/components/ui/table-pagination";
import { SortableHeader } from "@/components/ui/sortable-header";

interface FormState {
    memberId: string;
    recordedAt: string;
    weight: string;
    bodyFat: string;
    notes: string;
}

const emptyForm: FormState = { memberId: "", recordedAt: "", weight: "", bodyFat: "", notes: "" };

export function FitnessProgressTable({ userRole }: { userRole: string }) {
    const t = useTranslations("fitnessProgress");

    const [members, setMembers] = useState<Member[]>([]);
    const [selectedMemberId, setSelectedMemberId] = useState<string>("");

    const [createOpen, setCreateOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<FitnessProgress | null>(null);

    const [form, setForm] = useState<FormState>(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const fetchProgress = useCallback(
        (params: PaginationParams) => {
            if (!selectedMemberId) {
                return Promise.resolve({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });
            }
            return getFitnessProgress(selectedMemberId, params);
        },
        [selectedMemberId]
    );

    const table = useServerTable<FitnessProgress>({
        fetchFn: fetchProgress,
        pageSize: 10,
        defaultSort: "recordedAt",
    });

    useEffect(() => {
        table.setPage(1);
    }, [selectedMemberId]);

    useEffect(() => {
        getMembers({ limit: 0 })
            .then((r) => {
                setMembers(r.data);
                if (r.data.length > 0) setSelectedMemberId(r.data[0].id);
            })
            .catch(() => {});
    }, []);

    const closeSheet = () => {
        setCreateOpen(false);
        setForm(emptyForm);
        setFormError(null);
    };

    const handleCreate = async () => {
        const memberId = form.memberId || selectedMemberId;
        if (!memberId) { setFormError(t("validationRequired")); return; }
        setSubmitting(true);
        setFormError(null);
        try {
            const created = await createFitnessProgress({
                memberId,
                ...(form.recordedAt ? { recordedAt: form.recordedAt } : {}),
                ...(form.weight ? { weight: Number(form.weight) } : {}),
                ...(form.bodyFat ? { bodyFat: Number(form.bodyFat) } : {}),
                ...(form.notes ? { notes: form.notes } : {}),
            });
            if (memberId === selectedMemberId) {
                table.refetch();
            }
            toast.success(t("createSuccess"));
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
            await deleteFitnessProgress(deleteTarget.id);
            table.refetch();
            toast.success(t("deleteSuccess"));
            setDeleteTarget(null);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : t("errors.generic"));
        } finally {
            setSubmitting(false);
        }
    };

    const selectedMember = members.find((m) => m.id === selectedMemberId);

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
                    <select
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                        value={selectedMemberId}
                        onChange={(e) => setSelectedMemberId(e.target.value)}
                    >
                        {members.map((m) => (
                            <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                        ))}
                    </select>
                    <Button
                        onClick={() => {
                            setForm({ ...emptyForm, memberId: selectedMemberId });
                            setFormError(null);
                            setCreateOpen(true);
                        }}
                        className="gap-1.5"
                    >
                        <Plus className="size-4" /> {t("addEntry")}
                    </Button>
                </div>
            </div>

            {/* Charts */}
            {!table.loading && table.items.length >= 2 && (
                <FitnessProgressCharts data={table.items} />
            )}

            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border/60 bg-muted/30">
                            <SortableHeader label={t("date")} sortKey="recordedAt" currentSort={table.sort} onToggle={table.toggleSort} />
                            <SortableHeader label={t("weightCol")} sortKey="weight" currentSort={table.sort} onToggle={table.toggleSort} />
                            <SortableHeader label={t("bodyFat")} sortKey="bodyFat" currentSort={table.sort} onToggle={table.toggleSort} className="hidden sm:table-cell" />
                            <SortableHeader label={t("notes")} sortKey="notes" currentSort={table.sort} onToggle={table.toggleSort} className="hidden md:table-cell" />
                            <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("actions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {table.loading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <tr key={i} className="border-b border-border last:border-0">
                                    <td className="px-4 py-3"><div className="h-4 w-24 rounded-md skeleton-shimmer" /></td>
                                    <td className="px-4 py-3"><div className="h-4 w-14 rounded-md skeleton-shimmer" /></td>
                                    <td className="px-4 py-3 hidden sm:table-cell"><div className="h-4 w-14 rounded-md skeleton-shimmer" /></td>
                                    <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 w-32 rounded-md skeleton-shimmer" /></td>
                                    <td className="px-4 py-3"><div className="h-4 w-8 ml-auto rounded-md skeleton-shimmer" /></td>
                                </tr>
                            ))
                        ) : table.items.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-16 text-center">
                                    <TrendingUp className="mx-auto mb-3 size-8 text-muted-foreground/40" />
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {selectedMember
                                            ? t("noProgress", { name: `${selectedMember.firstName} ${selectedMember.lastName}` })
                                            : t("noProgressGeneric")}
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            table.items.map((p) => (
                                <tr key={p.id} className="group table-row-hover border-b border-border last:border-0">
                                    <td className="px-4 py-3 text-foreground">{new Date(p.recordedAt).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 text-foreground">{p.weight ? `${p.weight} kg` : "—"}</td>
                                    <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{p.bodyFat ? `${p.bodyFat}%` : "—"}</td>
                                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground truncate max-w-xs">{p.notes ?? "—"}</td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end opacity-0 transition-opacity group-hover:opacity-100">
                                            <Button variant="destructive" size="icon-sm" onClick={() => setDeleteTarget(p)}>
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

            <Sheet open={createOpen} onOpenChange={(open) => { if (!open) closeSheet(); }}>
                <SheetContent side="right" className="w-full sm:max-w-md flex flex-col gap-0 p-0">
                    <SheetHeader className="border-b border-border">
                        <SheetTitle>{t("addEntry")}</SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <div className="grid gap-1.5">
                            <label className="text-sm font-medium text-foreground">{t("member")}</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background text-foreground [&>option]:bg-background [&>option]:text-foreground px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                                value={form.memberId}
                                onChange={(e) => setForm((f) => ({ ...f, memberId: e.target.value }))}
                            >
                                {members.map((m) => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
                            </select>
                        </div>
                        <div className="grid gap-1.5">
                            <label className="text-sm font-medium text-foreground">{t("dateLabel")}</label>
                            <Input type="date" value={form.recordedAt} onChange={(e) => setForm((f) => ({ ...f, recordedAt: e.target.value }))} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-1.5">
                                <label className="text-sm font-medium text-foreground">{t("weightLabel")}</label>
                                <Input type="number" step="0.1" placeholder="kg" value={form.weight} onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))} />
                            </div>
                            <div className="grid gap-1.5">
                                <label className="text-sm font-medium text-foreground">{t("bodyFatLabel")}</label>
                                <Input type="number" step="0.1" placeholder="%" value={form.bodyFat} onChange={(e) => setForm((f) => ({ ...f, bodyFat: e.target.value }))} />
                            </div>
                        </div>
                        <div className="grid gap-1.5">
                            <label className="text-sm font-medium text-foreground">{t("notesLabel")}</label>
                            <Input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
                        </div>
                        {formError && <p className="text-sm text-destructive">{formError}</p>}
                    </div>
                    <SheetFooter className="border-t border-border">
                        <Button variant="outline" onClick={closeSheet} disabled={submitting}>{t("cancel")}</Button>
                        <Button onClick={handleCreate} disabled={submitting}>
                            {submitting ? t("saving") : t("save")}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="rounded-xl border border-border bg-card p-5 shadow-lg w-full max-w-sm mx-4">
                        <h2 className="text-base font-semibold text-foreground">{t("deleteEntry")}</h2>
                        <p className="mt-2 text-sm text-muted-foreground">{t("deleteConfirm")}</p>
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
