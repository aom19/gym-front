"use client";

import { Fragment, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { Pencil, Trash2, Plus, ClipboardList, ChevronDown, ChevronUp, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    getWorkouts,
    createWorkout,
    updateWorkout,
    deleteWorkout,
    type Workout,
    type WorkoutExercisePayload,
} from "@/services/workouts";
import { getExercises, type Exercise } from "@/services/exercises";
import { getMembers, type Member } from "@/services/members";
import { getUsers, type User } from "@/services/users";

interface ExerciseRow { exerciseId: string; sets: number; reps: number; weight: string; duration: string; }

interface FormState {
    title: string;
    date: string;
    trainerId: string;
    memberId: string;
    notes: string;
    exercises: ExerciseRow[];
}

const emptyExerciseRow: ExerciseRow = { exerciseId: "", sets: 3, reps: 10, weight: "", duration: "" };
const emptyForm: FormState = { title: "", date: "", trainerId: "", memberId: "", notes: "", exercises: [{ ...emptyExerciseRow }] };

export function WorkoutsTable({ userRole }: { userRole: string }) {
    const t = useTranslations("workouts");

    const table = useServerTable<Workout>({
        fetchFn: getWorkouts,
        pageSize: 10,
        defaultSort: "date",
    });

    const [exercisesList, setExercisesList] = useState<Exercise[]>([]);
    const [membersList, setMembersList] = useState<Member[]>([]);
    const [trainersList, setTrainersList] = useState<User[]>([]);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const [createOpen, setCreateOpen] = useState(false);
    const [editWorkout, setEditWorkout] = useState<Workout | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Workout | null>(null);

    const [form, setForm] = useState<FormState>(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        getExercises({ limit: 0 }).then(r => setExercisesList(r.data)).catch(() => {});
        getMembers({ limit: 0 }).then(r => setMembersList(r.data)).catch(() => {});
        getUsers({ limit: 0 }).then((r) => setTrainersList(r.data.filter((u) => u.role.name === "TRAINER" || u.role.name === "ADMIN"))).catch(() => {});
    }, []);

    const openEdit = (w: Workout) => {
        setEditWorkout(w);
        setForm({
            title: w.title,
            date: w.date.slice(0, 10),
            trainerId: w.trainer?.id ?? "",
            memberId: w.member?.id ?? "",
            notes: w.notes ?? "",
            exercises: w.exercises.length > 0 ? w.exercises.map((e) => ({
                exerciseId: e.exercise.id,
                sets: e.sets,
                reps: e.reps,
                weight: e.weight ?? "",
                duration: e.duration != null ? String(e.duration) : "",
            })) : [{ ...emptyExerciseRow }],
        });
        setFormError(null);
    };

    const closeSheet = () => {
        setCreateOpen(false);
        setEditWorkout(null);
        setForm(emptyForm);
        setFormError(null);
    };

    const buildPayloadExercises = (): WorkoutExercisePayload[] =>
        form.exercises
            .filter((e) => e.exerciseId)
            .map((e, i) => ({
                exerciseId: e.exerciseId,
                sets: e.sets,
                reps: e.reps,
                ...(e.weight ? { weight: Number(e.weight) } : {}),
                ...(e.duration ? { duration: Number(e.duration) } : {}),
                order: i,
            }));

    const handleCreate = async () => {
        if (!form.title || !form.date) { setFormError(t("validationRequired")); return; }
        setSubmitting(true);
        setFormError(null);
        try {
            const created = await createWorkout({
                title: form.title,
                date: form.date,
                ...(form.trainerId ? { trainerId: form.trainerId } : {}),
                ...(form.memberId ? { memberId: form.memberId } : {}),
                ...(form.notes ? { notes: form.notes } : {}),
                exercises: buildPayloadExercises(),
            });
            table.refetch();
            toast.success(t("createSuccess"));
            closeSheet();
        } catch (err) {
            setFormError(err instanceof Error ? err.message : t("errors.generic"));
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdate = async () => {
        if (!editWorkout) return;
        setSubmitting(true);
        setFormError(null);
        try {
            const updated = await updateWorkout(editWorkout.id, {
                title: form.title,
                date: form.date,
                ...(form.trainerId ? { trainerId: form.trainerId } : {}),
                ...(form.memberId ? { memberId: form.memberId } : {}),
                notes: form.notes || undefined,
                exercises: buildPayloadExercises(),
            });
            table.refetch();
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
            await deleteWorkout(deleteTarget.id);
            table.refetch();
            toast.success(t("deleteSuccess"));
            setDeleteTarget(null);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : t("errors.generic"));
        } finally {
            setSubmitting(false);
        }
    };

    const updateExRow = (idx: number, patch: Partial<ExerciseRow>) => {
        setForm((f) => ({ ...f, exercises: f.exercises.map((e, i) => (i === idx ? { ...e, ...patch } : e)) }));
    };

    const isSheetOpen = createOpen || editWorkout !== null;
    const sheetTitle = editWorkout ? t("editWorkout") : t("addWorkout");

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
                    <Button onClick={() => { setForm(emptyForm); setFormError(null); setCreateOpen(true); }} className="gap-1.5">
                        <Plus className="size-4" /> {t("addWorkout")}
                    </Button>
                </div>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border/60 bg-muted/30">
                            <th className="w-8 px-2"></th>
                            <SortableHeader label={t("titleCol")} sortKey="title" currentSort={table.sort} onToggle={table.toggleSort} />
                            <SortableHeader label={t("date")} sortKey="date" currentSort={table.sort} onToggle={table.toggleSort} className="hidden sm:table-cell" />
                            <SortableHeader label={t("member")} sortKey="member" currentSort={table.sort} onToggle={table.toggleSort} className="hidden md:table-cell" />
                            <SortableHeader label={t("trainer")} sortKey="trainer" currentSort={table.sort} onToggle={table.toggleSort} className="hidden lg:table-cell" />
                            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">{t("exercisesCol")}</th>
                            <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("actions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {table.loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="border-b border-border last:border-0">
                                    <td className="px-2 py-3"><div className="size-4 rounded skeleton-shimmer" /></td>
                                    <td className="px-4 py-3"><div className="h-4 w-32 rounded-md skeleton-shimmer" /></td>
                                    <td className="px-4 py-3 hidden sm:table-cell"><div className="h-4 w-20 rounded-md skeleton-shimmer" /></td>
                                    <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 w-24 rounded-md skeleton-shimmer" /></td>
                                    <td className="px-4 py-3 hidden lg:table-cell"><div className="h-4 w-24 rounded-md skeleton-shimmer" /></td>
                                    <td className="px-4 py-3 hidden lg:table-cell"><div className="h-4 w-8 rounded-md skeleton-shimmer" /></td>
                                    <td className="px-4 py-3"><div className="h-4 w-14 ml-auto rounded-md skeleton-shimmer" /></td>
                                </tr>
                            ))
                        ) : table.items.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-16 text-center">
                                    <ClipboardList className="mx-auto mb-3 size-8 text-muted-foreground/40" />
                                    <p className="text-sm font-medium text-muted-foreground">{t("noWorkouts")}</p>
                                </td>
                            </tr>
                        ) : (
                            table.items.map((w) => (
                                <Fragment key={w.id}>
                                    <tr className="group table-row-hover border-b border-border last:border-0">
                                        <td className="px-2 py-3">
                                            <Button variant="ghost" size="icon-sm" onClick={() => setExpandedId(expandedId === w.id ? null : w.id)}>
                                                {expandedId === w.id ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                                            </Button>
                                        </td>
                                        <td className="px-4 py-3"><span className="font-medium text-foreground">{w.title}</span></td>
                                        <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{new Date(w.date).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                                            {w.member ? `${w.member.firstName} ${w.member.lastName}` : "—"}
                                        </td>
                                        <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{w.trainer?.email ?? "—"}</td>
                                        <td className="px-4 py-3 hidden lg:table-cell">
                                            <Badge variant="secondary">{w.exercises.length}</Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                                <Button variant="ghost" size="icon-sm" onClick={() => openEdit(w)}><Pencil className="size-3.5" /></Button>
                                                <Button variant="destructive" size="icon-sm" onClick={() => setDeleteTarget(w)}><Trash2 className="size-3.5" /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                    {expandedId === w.id && w.exercises.length > 0 && (
                                        <tr className="bg-muted/20">
                                            <td colSpan={7} className="px-8 py-3">
                                                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-6 gap-y-1 text-xs">
                                                    <span className="font-semibold text-muted-foreground uppercase">{t("exercise")}</span>
                                                    <span className="font-semibold text-muted-foreground uppercase">{t("sets")}</span>
                                                    <span className="font-semibold text-muted-foreground uppercase">{t("reps")}</span>
                                                    <span className="font-semibold text-muted-foreground uppercase">{t("weight")}</span>
                                                    {w.exercises.sort((a, b) => a.order - b.order).map((ex) => (
                                                        <Fragment key={ex.id}>
                                                            <span className="text-foreground">{ex.exercise.name}</span>
                                                            <span className="text-muted-foreground">{ex.sets}</span>
                                                            <span className="text-muted-foreground">{ex.reps}</span>
                                                            <span className="text-muted-foreground">{ex.weight ?? "—"}</span>
                                                        </Fragment>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
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

            <Sheet open={isSheetOpen} onOpenChange={(open) => { if (!open) closeSheet(); }}>
                <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col gap-0 p-0">
                    <SheetHeader className="border-b border-border">
                        <SheetTitle>{sheetTitle}</SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <div className="grid gap-1.5">
                            <label className="text-sm font-medium text-foreground">{t("titleLabel")}</label>
                            <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
                        </div>
                        <div className="grid gap-1.5">
                            <label className="text-sm font-medium text-foreground">{t("dateLabel")}</label>
                            <Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-1.5">
                                <label className="text-sm font-medium text-foreground">{t("trainerLabel")}</label>
                                <select className="flex h-10 w-full rounded-md border border-input bg-background text-foreground [&>option]:bg-background [&>option]:text-foreground px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50" value={form.trainerId} onChange={(e) => setForm((f) => ({ ...f, trainerId: e.target.value }))}>
                                    <option value="">{t("selectTrainer")}</option>
                                    {trainersList.map((u) => <option key={u.id} value={u.id}>{u.email}</option>)}
                                </select>
                            </div>
                            <div className="grid gap-1.5">
                                <label className="text-sm font-medium text-foreground">{t("memberLabel")}</label>
                                <select className="flex h-10 w-full rounded-md border border-input bg-background text-foreground [&>option]:bg-background [&>option]:text-foreground px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50" value={form.memberId} onChange={(e) => setForm((f) => ({ ...f, memberId: e.target.value }))}>
                                    <option value="">{t("selectMember")}</option>
                                    {membersList.map((m) => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid gap-1.5">
                            <label className="text-sm font-medium text-foreground">{t("notesLabel")}</label>
                            <Input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-foreground">{t("exercisesLabel")}</label>
                                <Button variant="outline" size="sm" onClick={() => setForm((f) => ({ ...f, exercises: [...f.exercises, { ...emptyExerciseRow }] }))}>
                                    <Plus className="size-3.5 mr-1" /> {t("addExerciseRow")}
                                </Button>
                            </div>
                            {form.exercises.map((row, idx) => (
                                <div key={idx} className="grid grid-cols-[1fr_60px_60px_70px] gap-2 items-end">
                                    <select className="flex h-9 w-full rounded-md border border-input bg-background text-foreground [&>option]:bg-background [&>option]:text-foreground px-2 text-xs shadow-xs outline-none focus-visible:border-ring" value={row.exerciseId} onChange={(e) => updateExRow(idx, { exerciseId: e.target.value })}>
                                        <option value="">{t("selectExercise")}</option>
                                        {exercisesList.map((ex) => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
                                    </select>
                                    <Input className="h-9 text-xs" type="number" min={1} placeholder={t("sets")} value={row.sets} onChange={(e) => updateExRow(idx, { sets: Number(e.target.value) || 1 })} />
                                    <Input className="h-9 text-xs" type="number" min={1} placeholder={t("reps")} value={row.reps} onChange={(e) => updateExRow(idx, { reps: Number(e.target.value) || 1 })} />
                                    <div className="flex gap-1">
                                        <Input className="h-9 text-xs" type="number" placeholder="kg" value={row.weight} onChange={(e) => updateExRow(idx, { weight: e.target.value })} />
                                        {form.exercises.length > 1 && (
                                            <Button variant="ghost" size="icon-sm" className="h-9 shrink-0" onClick={() => setForm((f) => ({ ...f, exercises: f.exercises.filter((_, i) => i !== idx) }))}>
                                                <Trash2 className="size-3" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {formError && <p className="text-sm text-destructive">{formError}</p>}
                    </div>
                    <SheetFooter className="border-t border-border">
                        <Button variant="outline" onClick={closeSheet} disabled={submitting}>{t("cancel")}</Button>
                        <Button onClick={editWorkout ? handleUpdate : handleCreate} disabled={submitting}>
                            {submitting ? t("saving") : t("save")}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="rounded-xl border border-border bg-card p-5 shadow-lg w-full max-w-sm mx-4">
                        <h2 className="text-base font-semibold text-foreground">{t("deleteWorkout")}</h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {t("deleteConfirm")} <span className="font-medium text-foreground">{deleteTarget.title}</span>?
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
