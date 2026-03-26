"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { Pencil, Trash2, Plus, CreditCard } from "lucide-react";
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
    getSubscriptionPlans,
    createSubscriptionPlan,
    updateSubscriptionPlan,
    deleteSubscriptionPlan,
    type SubscriptionPlan,
    type CreateSubscriptionPlanPayload,
} from "@/services/subscription-plans";

interface FormState {
    name: string;
    description: string;
    price: string;
    durationInDays: string;
    maxEntries: string;
    isActive: boolean;
}

const emptyForm: FormState = {
    name: "",
    description: "",
    price: "",
    durationInDays: "",
    maxEntries: "",
    isActive: true,
};

export function SubscriptionPlansTable() {
    const t = useTranslations("subscriptions");

    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);

    const [createOpen, setCreateOpen] = useState(false);
    const [editPlan, setEditPlan] = useState<SubscriptionPlan | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<SubscriptionPlan | null>(null);

    const [form, setForm] = useState<FormState>(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const loadPlans = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getSubscriptionPlans();
            setPlans(data);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error loading plans");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPlans();
    }, [loadPlans]);

    const openEdit = (plan: SubscriptionPlan) => {
        setEditPlan(plan);
        setForm({
            name: plan.name,
            description: plan.description ?? "",
            price: String(plan.price),
            durationInDays: String(plan.durationInDays),
            maxEntries: plan.maxEntries != null ? String(plan.maxEntries) : "",
            isActive: plan.isActive,
        });
        setFormError(null);
    };

    const closeSheet = () => {
        setCreateOpen(false);
        setEditPlan(null);
        setForm(emptyForm);
        setFormError(null);
    };

    const handleCreate = async () => {
        if (!form.name || !form.price || !form.durationInDays) {
            setFormError(t("validationRequired"));
            return;
        }
        setSubmitting(true);
        setFormError(null);
        try {
            const payload: CreateSubscriptionPlanPayload = {
                name: form.name,
                price: parseFloat(form.price),
                durationInDays: parseInt(form.durationInDays),
                ...(form.description ? { description: form.description } : {}),
                ...(form.maxEntries ? { maxEntries: parseInt(form.maxEntries) } : {}),
                isActive: form.isActive,
            };
            const created = await createSubscriptionPlan(payload);
            setPlans((prev) => [created, ...prev]);
            toast.success(t("createSuccess"));
            closeSheet();
        } catch (err) {
            setFormError(err instanceof Error ? err.message : "Error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdate = async () => {
        if (!editPlan) return;
        setSubmitting(true);
        setFormError(null);
        try {
            const payload: Parameters<typeof updateSubscriptionPlan>[1] = {};
            if (form.name !== editPlan.name) payload.name = form.name;
            if (form.description !== (editPlan.description ?? "")) payload.description = form.description || undefined;
            if (form.price !== String(editPlan.price)) payload.price = parseFloat(form.price);
            if (form.durationInDays !== String(editPlan.durationInDays)) payload.durationInDays = parseInt(form.durationInDays);
            if (form.maxEntries !== (editPlan.maxEntries != null ? String(editPlan.maxEntries) : "")) {
                payload.maxEntries = form.maxEntries ? parseInt(form.maxEntries) : undefined;
            }
            if (form.isActive !== editPlan.isActive) payload.isActive = form.isActive;

            const updated = await updateSubscriptionPlan(editPlan.id, payload);
            setPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
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
            await deleteSubscriptionPlan(deleteTarget.id);
            setPlans((prev) => prev.filter((p) => p.id !== deleteTarget.id));
            toast.success(t("deleteSuccess"));
            setDeleteTarget(null);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error");
        } finally {
            setSubmitting(false);
        }
    };

    const isSheetOpen = createOpen || editPlan !== null;
    const sheetTitle = editPlan ? t("editPlan") : t("addPlan");

    return (
        <>
            {/* Header */}
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
                    {t("addPlan")}
                </Button>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border/60 bg-muted/30">
                            <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t("plan")}</th>
                            <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground hidden sm:table-cell">{t("price")}</th>
                            <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground hidden md:table-cell">{t("duration")}</th>
                            <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground hidden lg:table-cell">{t("maxEntries")}</th>
                            <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground hidden lg:table-cell">{t("members")}</th>
                            <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t("status")}</th>
                            <th className="px-4 py-3 text-right text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t("actions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <tr key={i} className="border-b border-border last:border-0">
                                    <td className="px-4 py-3"><div className="h-4 w-28 rounded-md skeleton-shimmer" /></td>
                                    <td className="px-4 py-3 hidden sm:table-cell"><div className="h-4 w-12 rounded-md skeleton-shimmer" /></td>
                                    <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 w-16 rounded-md skeleton-shimmer" /></td>
                                    <td className="px-4 py-3 hidden lg:table-cell"><div className="h-4 w-10 rounded-md skeleton-shimmer" /></td>
                                    <td className="px-4 py-3 hidden lg:table-cell"><div className="h-4 w-8 rounded-md skeleton-shimmer" /></td>
                                    <td className="px-4 py-3"><div className="h-5 w-14 rounded-full skeleton-shimmer" /></td>
                                    <td className="px-4 py-3"><div className="h-4 w-14 ml-auto rounded-md skeleton-shimmer" /></td>
                                </tr>
                            ))
                        ) : plans.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-16 text-center">
                                    <CreditCard className="mx-auto mb-3 size-8 text-muted-foreground/40" />
                                    <p className="text-sm font-medium text-muted-foreground">{t("noPlans")}</p>
                                </td>
                            </tr>
                        ) : (
                            plans.map((plan) => (
                                <tr
                                    key={plan.id}
                                    className="group table-row-hover border-b border-border last:border-0"
                                >
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="font-medium text-foreground">{plan.name}</p>
                                            {plan.description && (
                                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">{plan.description}</p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 hidden sm:table-cell font-semibold text-foreground">
                                        €{plan.price}
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                                        {plan.durationInDays} {t("days")}
                                    </td>
                                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                                        {plan.maxEntries ?? t("unlimited")}
                                    </td>
                                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                                        {plan._count?.subscriptions ?? 0}
                                    </td>
                                    <td className="px-4 py-3">
                                        {plan.isActive ? (
                                            <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 border-0">
                                                {t("active")}
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary">{t("inactive")}</Badge>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                            <Button variant="ghost" size="icon-sm" onClick={() => openEdit(plan)} aria-label="Edit plan">
                                                <Pencil className="size-3.5" />
                                            </Button>
                                            <Button variant="destructive" size="icon-sm" onClick={() => setDeleteTarget(plan)} aria-label="Delete plan">
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

            {/* Create / Edit Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={(open) => { if (!open) closeSheet(); }}>
                <SheetContent side="right" className="w-full sm:max-w-md flex flex-col gap-0 p-0">
                    <SheetHeader className="border-b border-border">
                        <SheetTitle>{sheetTitle}</SheetTitle>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <div className="grid gap-1.5">
                            <label className="text-sm font-medium text-foreground">{t("nameLabel")}</label>
                            <Input
                                placeholder="Basic Monthly"
                                value={form.name}
                                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                            />
                        </div>

                        <div className="grid gap-1.5">
                            <label className="text-sm font-medium text-foreground">{t("descriptionLabel")}</label>
                            <Input
                                placeholder="Basic gym access"
                                value={form.description}
                                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-1.5">
                                <label className="text-sm font-medium text-foreground">{t("priceLabel")}</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="29.99"
                                    value={form.price}
                                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                                />
                            </div>
                            <div className="grid gap-1.5">
                                <label className="text-sm font-medium text-foreground">{t("durationLabel")}</label>
                                <Input
                                    type="number"
                                    min="1"
                                    placeholder="30"
                                    value={form.durationInDays}
                                    onChange={(e) => setForm((f) => ({ ...f, durationInDays: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="grid gap-1.5">
                            <label className="text-sm font-medium text-foreground">{t("maxEntriesLabel")}</label>
                            <Input
                                type="number"
                                min="1"
                                placeholder="20"
                                value={form.maxEntries}
                                onChange={(e) => setForm((f) => ({ ...f, maxEntries: e.target.value }))}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={form.isActive}
                                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                                className="h-4 w-4 rounded border-input"
                            />
                            <label htmlFor="isActive" className="text-sm font-medium text-foreground">
                                {t("isActiveLabel")}
                            </label>
                        </div>

                        {formError ? (
                            <p className="text-sm text-destructive">{formError}</p>
                        ) : null}
                    </div>

                    <SheetFooter className="border-t border-border">
                        <Button variant="outline" onClick={closeSheet} disabled={submitting}>
                            {t("cancel")}
                        </Button>
                        <Button onClick={editPlan ? handleUpdate : handleCreate} disabled={submitting}>
                            {submitting ? t("saving") : t("save")}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {/* Delete confirmation */}
            {deleteTarget ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="rounded-xl border border-border bg-card p-5 shadow-lg w-full max-w-sm mx-4">
                        <h2 className="text-base font-semibold text-foreground">{t("deletePlan")}</h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {t("deleteConfirm")}{" "}
                            <span className="font-medium text-foreground">{deleteTarget.name}</span>?
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
