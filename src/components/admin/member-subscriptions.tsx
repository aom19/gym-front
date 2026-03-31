"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { CreditCard, Plus, X, Clock, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import {
    getSubscriptionsByMember,
    getSubscriptionStatus,
    createSubscription,
    cancelSubscription,
    type Subscription,
    type SubscriptionStatus,
    type CreateSubscriptionPayload,
} from "@/services/subscriptions";
import { getSubscriptionPlans, type SubscriptionPlan } from "@/services/subscription-plans";

interface Props {
    memberId: string;
    memberName: string;
    open: boolean;
    onClose: () => void;
}

export function MemberSubscriptions({ memberId, memberName, open, onClose }: Props) {
    const t = useTranslations("memberSubscriptions");

    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [status, setStatus] = useState<SubscriptionStatus | null>(null);
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);

    const [activateOpen, setActivateOpen] = useState(false);
    const [activateForm, setActivateForm] = useState({ planId: "", startDate: "" });
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [subs, st, plansResult] = await Promise.all([
                getSubscriptionsByMember(memberId),
                getSubscriptionStatus(memberId),
                getSubscriptionPlans({ limit: 0 }),
            ]);
            setSubscriptions(subs);
            setStatus(st);
            setPlans(plansResult.data.filter((p) => p.isActive));
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error loading subscriptions");
        } finally {
            setLoading(false);
        }
    }, [memberId]);

    useEffect(() => {
        if (open) loadData();
    }, [open, loadData]);

    const handleActivate = async () => {
        if (!activateForm.planId) {
            setFormError(t("selectPlanRequired"));
            return;
        }
        setSubmitting(true);
        setFormError(null);
        try {
            const payload: CreateSubscriptionPayload = {
                memberId,
                planId: activateForm.planId,
                ...(activateForm.startDate ? { startDate: activateForm.startDate } : {}),
            };
            const created = await createSubscription(payload);
            setSubscriptions((prev) => [created, ...prev]);
            toast.success(t("activateSuccess"));
            setActivateOpen(false);
            setActivateForm({ planId: "", startDate: "" });
            loadData();
        } catch (err) {
            setFormError(err instanceof Error ? err.message : "Error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = async (subId: string) => {
        try {
            const updated = await cancelSubscription(subId);
            setSubscriptions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
            toast.success(t("cancelSuccess"));
            loadData();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error");
        }
    };

    const statusColor = (s: string) => {
        switch (s) {
            case "ACTIVE": return "bg-emerald-500/10 text-emerald-600 border-0";
            case "EXPIRED": return "bg-red-500/10 text-red-600 border-0";
            case "CANCELLED": return "bg-gray-500/10 text-gray-600 border-0";
            default: return "";
        }
    };

    return (
        <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
            <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col gap-0 p-0">
                <SheetHeader className="border-b border-border">
                    <SheetTitle className="flex items-center gap-2">
                        <CreditCard className="size-4" />
                        {t("title")} — {memberName}
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-4 space-y-5">
                    {/* Current Status Card */}
                    {status && !loading && (
                        <div className="rounded-xl border border-border bg-muted/30 p-4">
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                                {t("currentStatus")}
                            </p>
                            {status.hasActiveSubscription && status.subscription ? (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-foreground">{status.subscription.plan.name}</span>
                                        <Badge className={statusColor("ACTIVE")}>{t("active")}</Badge>
                                    </div>
                                    <div className="flex gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Clock className="size-3.5" />
                                            {status.daysRemaining} {t("daysLeft")}
                                        </div>
                                        {status.entriesRemaining !== null && (
                                            <div className="flex items-center gap-1">
                                                <Hash className="size-3.5" />
                                                {status.entriesRemaining} {t("entriesLeft")}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {t("expires")}: {new Date(status.subscription.endDate).toLocaleDateString()}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">{t("noActiveSubscription")}</p>
                            )}
                        </div>
                    )}

                    {/* Activate Button */}
                    <Button onClick={() => setActivateOpen(true)} className="gap-1.5 w-full">
                        <Plus className="size-4" />
                        {t("activateNew")}
                    </Button>

                    {/* Activate Form */}
                    {activateOpen && (
                        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">{t("activateSubscription")}</p>
                                <Button variant="ghost" size="icon-sm" onClick={() => { setActivateOpen(false); setFormError(null); }}>
                                    <X className="size-3.5" />
                                </Button>
                            </div>
                            <div className="grid gap-1.5">
                                <label className="text-sm font-medium text-foreground">{t("selectPlan")}</label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background text-foreground [&>option]:bg-background [&>option]:text-foreground px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                                    value={activateForm.planId}
                                    onChange={(e) => setActivateForm((f) => ({ ...f, planId: e.target.value }))}
                                >
                                    <option value="">{t("choosePlan")}</option>
                                    {plans.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} — €{p.price} / {p.durationInDays} {t("days")}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid gap-1.5">
                                <label className="text-sm font-medium text-foreground">{t("startDate")}</label>
                                <Input
                                    type="date"
                                    value={activateForm.startDate}
                                    onChange={(e) => setActivateForm((f) => ({ ...f, startDate: e.target.value }))}
                                />
                                <p className="text-xs text-muted-foreground">{t("startDateHint")}</p>
                            </div>
                            {formError && <p className="text-sm text-destructive">{formError}</p>}
                            <Button onClick={handleActivate} disabled={submitting} className="w-full">
                                {submitting ? t("saving") : t("activate")}
                            </Button>
                        </div>
                    )}

                    {/* History */}
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3">
                            {t("history")}
                        </p>
                        {loading ? (
                            <div className="space-y-2">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="h-16 rounded-lg skeleton-shimmer" />
                                ))}
                            </div>
                        ) : subscriptions.length === 0 ? (
                            <p className="text-sm text-muted-foreground">{t("noSubscriptions")}</p>
                        ) : (
                            <div className="space-y-2">
                                {subscriptions.map((sub) => (
                                    <div
                                        key={sub.id}
                                        className="flex items-center justify-between rounded-lg border border-border p-3"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-foreground">{sub.plan.name}</span>
                                                <Badge className={statusColor(sub.status)}>{sub.status}</Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(sub.startDate).toLocaleDateString()} → {new Date(sub.endDate).toLocaleDateString()}
                                                {sub.entriesLeft !== null && ` • ${sub.entriesLeft} ${t("entriesLeft")}`}
                                            </p>
                                        </div>
                                        {sub.status === "ACTIVE" && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleCancel(sub.id)}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                {t("cancel")}
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <SheetFooter className="border-t border-border">
                    <Button variant="outline" onClick={onClose}>{t("close")}</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
