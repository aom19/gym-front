"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { Pencil, Trash2, Plus } from "lucide-react";
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
    getPayments,
    createPayment,
    updatePayment,
    deletePayment,
    type Payment,
    type CreatePaymentPayload,
} from "@/services/payments";
import { getMembers, type Member } from "@/services/members";
import { getSubscriptionsByMember, type Subscription } from "@/services/subscriptions";

interface FormState {
    memberId: string;
    subscriptionId: string;
    amount: string;
    method: string;
    status: string;
    notes: string;
}

const emptyForm: FormState = {
    memberId: "",
    subscriptionId: "",
    amount: "",
    method: "CASH",
    status: "PAID",
    notes: "",
};

const STATUS_COLORS: Record<string, string> = {
    PAID: "bg-emerald-500/10 text-emerald-600 border-0",
    PENDING: "bg-amber-500/10 text-amber-600 border-0",
    REFUNDED: "bg-blue-500/10 text-blue-600 border-0",
};

export function PaymentsTable({ userRole }: { userRole: string }) {
    const t = useTranslations("payments");

    const [payments, setPayments] = useState<Payment[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [memberSubscriptions, setMemberSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);

    const [createOpen, setCreateOpen] = useState(false);
    const [editPayment, setEditPayment] = useState<Payment | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Payment | null>(null);

    const [form, setForm] = useState<FormState>(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const loadPayments = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getPayments();
            setPayments(data);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error loading payments");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPayments();
        getMembers().then(setMembers);
    }, [loadPayments]);

    // Load subscriptions when member changes in form
    useEffect(() => {
        if (form.memberId) {
            getSubscriptionsByMember(form.memberId)
                .then(setMemberSubscriptions)
                .catch(() => setMemberSubscriptions([]));
        } else {
            setMemberSubscriptions([]);
        }
    }, [form.memberId]);

    const openEdit = (payment: Payment) => {
        setEditPayment(payment);
        setForm({
            memberId: payment.memberId,
            subscriptionId: payment.subscriptionId,
            amount: String(payment.amount),
            method: payment.method,
            status: payment.status,
            notes: payment.notes ?? "",
        });
        setFormError(null);
    };

    const closeSheet = () => {
        setCreateOpen(false);
        setEditPayment(null);
        setForm(emptyForm);
        setFormError(null);
    };

    const handleCreate = async () => {
        if (!form.memberId || !form.subscriptionId || !form.amount) {
            setFormError(t("validationRequired"));
            return;
        }
        setSubmitting(true);
        setFormError(null);
        try {
            const payload: CreatePaymentPayload = {
                memberId: form.memberId,
                subscriptionId: form.subscriptionId,
                amount: parseFloat(form.amount),
                method: form.method as CreatePaymentPayload["method"],
                status: form.status as CreatePaymentPayload["status"],
                ...(form.notes ? { notes: form.notes } : {}),
            };
            const created = await createPayment(payload);
            setPayments((prev) => [created, ...prev]);
            toast.success(t("createSuccess"));
            closeSheet();
        } catch (err) {
            setFormError(err instanceof Error ? err.message : "Error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdate = async () => {
        if (!editPayment) return;
        setSubmitting(true);
        setFormError(null);
        try {
            const payload: Parameters<typeof updatePayment>[1] = {};
            if (form.status !== editPayment.status) payload.status = form.status as Payment["status"];
            if (form.notes !== (editPayment.notes ?? "")) payload.notes = form.notes || undefined;

            const updated = await updatePayment(editPayment.id, payload);
            setPayments((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
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
            await deletePayment(deleteTarget.id);
            setPayments((prev) => prev.filter((p) => p.id !== deleteTarget.id));
            toast.success(t("deleteSuccess"));
            setDeleteTarget(null);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error");
        } finally {
            setSubmitting(false);
        }
    };

    const isSheetOpen = createOpen || editPayment !== null;
    const sheetTitle = editPayment ? t("editPayment") : t("addPayment");

    return (
        <>
            {/* Header */}
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
                    {t("addPayment")}
                </Button>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-border bg-card ring-1 ring-foreground/10 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border bg-muted/50">
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("member")}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">{t("subscription")}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("amount")}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">{t("method")}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("status")}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">{t("date")}</th>
                            <th className="px-4 py-3 text-right font-medium text-muted-foreground">{t("actions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                                    {t("loading")}
                                </td>
                            </tr>
                        ) : payments.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                                    {t("noPayments")}
                                </td>
                            </tr>
                        ) : (
                            payments.map((payment, i) => (
                                <tr
                                    key={payment.id}
                                    className={`border-b border-border last:border-0 hover:bg-muted/40 transition-colors ${i % 2 !== 0 ? "bg-muted/20" : ""}`}
                                >
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                                                {payment.member.firstName[0]}
                                            </div>
                                            <span className="font-medium text-foreground">
                                                {payment.member.firstName} {payment.member.lastName}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">
                                        {payment.subscription.plan.name}
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-foreground">
                                        €{payment.amount}
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                                        {t(payment.method)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant="default" className={STATUS_COLORS[payment.status] ?? ""}>
                                            {t(payment.status)}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">
                                        {new Date(payment.paidAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button variant="ghost" size="icon-sm" onClick={() => openEdit(payment)} aria-label="Edit payment">
                                                <Pencil className="size-3.5" />
                                            </Button>
                                            {userRole === "ADMIN" && (
                                                <Button variant="destructive" size="icon-sm" onClick={() => setDeleteTarget(payment)} aria-label="Delete payment">
                                                    <Trash2 className="size-3.5" />
                                                </Button>
                                            )}
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
                        {!editPayment && (
                            <>
                                <div className="grid gap-1.5">
                                    <label className="text-sm font-medium text-foreground">{t("memberLabel")}</label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background text-foreground [&>option]:bg-background [&>option]:text-foreground px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                                        value={form.memberId}
                                        onChange={(e) => setForm((f) => ({ ...f, memberId: e.target.value, subscriptionId: "" }))}
                                    >
                                        <option value="">{t("selectMember")}</option>
                                        {members.map((m) => (
                                            <option key={m.id} value={m.id}>
                                                {m.firstName} {m.lastName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid gap-1.5">
                                    <label className="text-sm font-medium text-foreground">{t("subscriptionLabel")}</label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background text-foreground [&>option]:bg-background [&>option]:text-foreground px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                                        value={form.subscriptionId}
                                        onChange={(e) => setForm((f) => ({ ...f, subscriptionId: e.target.value }))}
                                        disabled={!form.memberId}
                                    >
                                        <option value="">{t("selectSubscription")}</option>
                                        {memberSubscriptions.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.plan.name} ({s.status})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid gap-1.5">
                                    <label className="text-sm font-medium text-foreground">{t("amountLabel")}</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="29.99"
                                        value={form.amount}
                                        onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                                    />
                                </div>
                            </>
                        )}

                        <div className="grid gap-1.5">
                            <label className="text-sm font-medium text-foreground">{t("methodLabel")}</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background text-foreground [&>option]:bg-background [&>option]:text-foreground px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                                value={form.method}
                                onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))}
                                disabled={!!editPayment}
                            >
                                <option value="CASH">{t("CASH")}</option>
                                <option value="CARD">{t("CARD")}</option>
                                <option value="TRANSFER">{t("TRANSFER")}</option>
                            </select>
                        </div>

                        <div className="grid gap-1.5">
                            <label className="text-sm font-medium text-foreground">{t("statusLabel")}</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background text-foreground [&>option]:bg-background [&>option]:text-foreground px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                                value={form.status}
                                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                            >
                                <option value="PENDING">{t("PENDING")}</option>
                                <option value="PAID">{t("PAID")}</option>
                                <option value="REFUNDED">{t("REFUNDED")}</option>
                            </select>
                        </div>

                        <div className="grid gap-1.5">
                            <label className="text-sm font-medium text-foreground">{t("notesLabel")}</label>
                            <Input
                                placeholder=""
                                value={form.notes}
                                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                            />
                        </div>

                        {formError ? (
                            <p className="text-sm text-destructive">{formError}</p>
                        ) : null}
                    </div>

                    <SheetFooter className="border-t border-border">
                        <Button variant="outline" onClick={closeSheet} disabled={submitting}>
                            {t("cancel")}
                        </Button>
                        <Button onClick={editPayment ? handleUpdate : handleCreate} disabled={submitting}>
                            {submitting ? t("saving") : t("save")}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {/* Delete confirmation */}
            {deleteTarget ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="rounded-2xl border border-border bg-card p-6 shadow-xl w-full max-w-sm mx-4">
                        <h2 className="text-base font-semibold text-foreground">{t("deletePayment")}</h2>
                        <p className="mt-2 text-sm text-muted-foreground">{t("deleteConfirm")}</p>
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
