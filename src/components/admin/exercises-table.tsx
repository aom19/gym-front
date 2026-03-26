"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { Pencil, Trash2, Plus, Dumbbell } from "lucide-react";
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
    getExercises,
    createExercise,
    updateExercise,
    deleteExercise,
    MUSCLE_GROUPS,
    type Exercise,
    type MuscleGroup,
} from "@/services/exercises";

interface FormState {
    name: string;
    description: string;
    muscleGroup: MuscleGroup | "";
    videoUrl: string;
    imageUrl: string;
}

const emptyForm: FormState = { name: "", description: "", muscleGroup: "", videoUrl: "", imageUrl: "" };

export function ExercisesTable() {
    const t = useTranslations("exercises");

    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterGroup, setFilterGroup] = useState<MuscleGroup | "">("");

    const [createOpen, setCreateOpen] = useState(false);
    const [editExercise, setEditExercise] = useState<Exercise | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Exercise | null>(null);

    const [form, setForm] = useState<FormState>(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const loadExercises = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getExercises(filterGroup || undefined);
            setExercises(data);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : t("errors.generic"));
        } finally {
            setLoading(false);
        }
    }, [filterGroup, t]);

    useEffect(() => { loadExercises(); }, [loadExercises]);

    const openEdit = (ex: Exercise) => {
        setEditExercise(ex);
        setForm({
            name: ex.name,
            description: ex.description ?? "",
            muscleGroup: ex.muscleGroup,
            videoUrl: ex.videoUrl ?? "",
            imageUrl: ex.imageUrl ?? "",
        });
        setFormError(null);
    };

    const closeSheet = () => {
        setCreateOpen(false);
        setEditExercise(null);
        setForm(emptyForm);
        setFormError(null);
    };

    const handleCreate = async () => {
        if (!form.name || !form.muscleGroup) {
            setFormError(t("validationRequired"));
            return;
        }
        setSubmitting(true);
        setFormError(null);
        try {
            const created = await createExercise({
                name: form.name,
                muscleGroup: form.muscleGroup as MuscleGroup,
                ...(form.description ? { description: form.description } : {}),
                ...(form.videoUrl ? { videoUrl: form.videoUrl } : {}),
                ...(form.imageUrl ? { imageUrl: form.imageUrl } : {}),
            });
            setExercises((prev) => [created, ...prev]);
            toast.success(t("createSuccess"));
            closeSheet();
        } catch (err) {
            setFormError(err instanceof Error ? err.message : t("errors.generic"));
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdate = async () => {
        if (!editExercise) return;
        setSubmitting(true);
        setFormError(null);
        try {
            const payload: Parameters<typeof updateExercise>[1] = {};
            if (form.name !== editExercise.name) payload.name = form.name;
            if (form.description !== (editExercise.description ?? "")) payload.description = form.description || undefined;
            if (form.muscleGroup !== editExercise.muscleGroup) payload.muscleGroup = form.muscleGroup as MuscleGroup;
            if (form.videoUrl !== (editExercise.videoUrl ?? "")) payload.videoUrl = form.videoUrl || undefined;
            if (form.imageUrl !== (editExercise.imageUrl ?? "")) payload.imageUrl = form.imageUrl || undefined;

            const updated = await updateExercise(editExercise.id, payload);
            setExercises((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
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
            await deleteExercise(deleteTarget.id);
            setExercises((prev) => prev.filter((e) => e.id !== deleteTarget.id));
            toast.success(t("deleteSuccess"));
            setDeleteTarget(null);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : t("errors.generic"));
        } finally {
            setSubmitting(false);
        }
    };

    const isSheetOpen = createOpen || editExercise !== null;
    const sheetTitle = editExercise ? t("editExercise") : t("addExercise");

    return (
        <>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight text-foreground">{t("title")}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                        value={filterGroup}
                        onChange={(e) => setFilterGroup(e.target.value as MuscleGroup | "")}
                    >
                        <option value="">{t("allMuscleGroups")}</option>
                        {MUSCLE_GROUPS.map((g) => (
                            <option key={g} value={g}>{g}</option>
                        ))}
                    </select>
                    <Button
                        onClick={() => {
                            setForm(emptyForm);
                            setFormError(null);
                            setCreateOpen(true);
                        }}
                        className="gap-1.5"
                    >
                        <Plus className="size-4" />
                        {t("addExercise")}
                    </Button>
                </div>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border/60 bg-muted/30">
                            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("name")}</th>
                            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">{t("muscleGroup")}</th>
                            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">{t("description")}</th>
                            <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("actions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="border-b border-border last:border-0">
                                    <td className="px-4 py-3"><div className="h-4 w-32 rounded-md skeleton-shimmer" /></td>
                                    <td className="px-4 py-3 hidden sm:table-cell"><div className="h-5 w-20 rounded-full skeleton-shimmer" /></td>
                                    <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 w-48 rounded-md skeleton-shimmer" /></td>
                                    <td className="px-4 py-3"><div className="h-4 w-14 ml-auto rounded-md skeleton-shimmer" /></td>
                                </tr>
                            ))
                        ) : exercises.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-16 text-center">
                                    <Dumbbell className="mx-auto mb-3 size-8 text-muted-foreground/40" />
                                    <p className="text-sm font-medium text-muted-foreground">{t("noExercises")}</p>
                                </td>
                            </tr>
                        ) : (
                            exercises.map((ex) => (
                                <tr key={ex.id} className="group table-row-hover border-b border-border last:border-0">
                                    <td className="px-4 py-3">
                                        <span className="font-medium text-foreground">{ex.name}</span>
                                    </td>
                                    <td className="px-4 py-3 hidden sm:table-cell">
                                        <Badge variant="secondary">{ex.muscleGroup}</Badge>
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground truncate max-w-xs">
                                        {ex.description ?? "—"}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                            <Button variant="ghost" size="icon-sm" onClick={() => openEdit(ex)} aria-label="Edit">
                                                <Pencil className="size-3.5" />
                                            </Button>
                                            <Button variant="destructive" size="icon-sm" onClick={() => setDeleteTarget(ex)} aria-label="Delete">
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

            <Sheet open={isSheetOpen} onOpenChange={(open) => { if (!open) closeSheet(); }}>
                <SheetContent side="right" className="w-full sm:max-w-md flex flex-col gap-0 p-0">
                    <SheetHeader className="border-b border-border">
                        <SheetTitle>{sheetTitle}</SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <div className="grid gap-1.5">
                            <label className="text-sm font-medium text-foreground">{t("nameLabel")}</label>
                            <Input placeholder="Bench Press" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                        </div>
                        <div className="grid gap-1.5">
                            <label className="text-sm font-medium text-foreground">{t("muscleGroupLabel")}</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background text-foreground [&>option]:bg-background [&>option]:text-foreground px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                                value={form.muscleGroup}
                                onChange={(e) => setForm((f) => ({ ...f, muscleGroup: e.target.value as MuscleGroup }))}
                            >
                                <option value="">{t("selectMuscleGroup")}</option>
                                {MUSCLE_GROUPS.map((g) => (
                                    <option key={g} value={g}>{g}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid gap-1.5">
                            <label className="text-sm font-medium text-foreground">{t("descriptionLabel")}</label>
                            <Input placeholder={t("descriptionPlaceholder")} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
                        </div>
                        <div className="grid gap-1.5">
                            <label className="text-sm font-medium text-foreground">{t("videoUrlLabel")}</label>
                            <Input placeholder="https://youtube.com/..." value={form.videoUrl} onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))} />
                        </div>
                        <div className="grid gap-1.5">
                            <label className="text-sm font-medium text-foreground">{t("imageUrlLabel")}</label>
                            <Input placeholder="https://..." value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} />
                        </div>
                        {formError && <p className="text-sm text-destructive">{formError}</p>}
                    </div>
                    <SheetFooter className="border-t border-border">
                        <Button variant="outline" onClick={closeSheet} disabled={submitting}>{t("cancel")}</Button>
                        <Button onClick={editExercise ? handleUpdate : handleCreate} disabled={submitting}>
                            {submitting ? t("saving") : t("save")}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="rounded-xl border border-border bg-card p-5 shadow-lg w-full max-w-sm mx-4">
                        <h2 className="text-base font-semibold text-foreground">{t("deleteExercise")}</h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {t("deleteConfirm")} <span className="font-medium text-foreground">{deleteTarget.name}</span>?
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
