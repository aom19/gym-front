"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { LogIn, LogOut, CheckSquare, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useServerTable, type PaginationParams } from "@/hooks/useServerTable";
import { TablePagination } from "@/components/ui/table-pagination";
import { SortableHeader } from "@/components/ui/sortable-header";
import {
    getCheckins,
    type Checkin,
} from "@/services/checkins";
import { getLocations, type UserLocation } from "@/services/users";

export function CheckinsHistoryTable() {
    const t = useTranslations("checkinsHistory");

    const [locations, setLocations] = useState<UserLocation[]>([]);

    const [filterLocation, setFilterLocation] = useState("");
    const [filterDateFrom, setFilterDateFrom] = useState("");
    const [filterDateTo, setFilterDateTo] = useState("");

    const fetchCheckins = useCallback(
        (params: PaginationParams) =>
            getCheckins({
                ...params,
                locationId: filterLocation || undefined,
                dateFrom: filterDateFrom || undefined,
                dateTo: filterDateTo || undefined,
            }),
        [filterLocation, filterDateFrom, filterDateTo]
    );

    const table = useServerTable<Checkin>({
        fetchFn: fetchCheckins,
        pageSize: 10,
        defaultSort: "checkInAt",
    });

    useEffect(() => {
        table.setPage(1);
    }, [filterLocation, filterDateFrom, filterDateTo]);

    useEffect(() => {
        getLocations().then(setLocations);
    }, []);

    const handleExportCSV = () => {
        const headers = [t("member"), t("email"), t("location"), t("checkInTime"), t("checkOutTime")];
        const rows = table.items.map((c) => [
            `${c.member.firstName} ${c.member.lastName}`,
            c.member.email ?? "",
            c.location.name,
            new Date(c.checkInAt).toLocaleString(),
            c.checkOutAt ? new Date(c.checkOutAt).toLocaleString() : "",
        ]);

        const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `checkins-history-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight text-foreground">{t("title")}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
                </div>
                <Button variant="outline" onClick={handleExportCSV} className="gap-1.5" disabled={table.items.length === 0}>
                    <Download className="size-4" />
                    {t("exportCSV")}
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
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
                    className="flex h-9 rounded-md border border-input bg-background text-foreground [&>option]:bg-background [&>option]:text-foreground px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                >
                    <option value="">{t("allLocations")}</option>
                    {locations.map((l) => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                </select>
                <Input
                    type="date"
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                    className="w-40"
                    placeholder={t("dateFrom")}
                />
                <Input
                    type="date"
                    value={filterDateTo}
                    onChange={(e) => setFilterDateTo(e.target.value)}
                    className="w-40"
                    placeholder={t("dateTo")}
                />
                {(filterLocation || filterDateFrom || filterDateTo || table.search) && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setFilterLocation("");
                            setFilterDateFrom("");
                            setFilterDateTo("");
                            table.setSearch("");
                        }}
                    >
                        {t("clearFilters")}
                    </Button>
                )}
            </div>

            {/* Stats */}
            <div className="flex gap-4">
                <Badge variant="secondary" className="text-xs">
                    {table.totalItems} {t("results")}
                </Badge>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border/60 bg-muted/30">
                            <SortableHeader label={t("member")} sortKey="memberName" currentSort={table.sort} onToggle={table.toggleSort} />
                            <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t("date")}</th>
                            <SortableHeader label={t("checkInTime")} sortKey="checkInAt" currentSort={table.sort} onToggle={table.toggleSort} />
                            <SortableHeader label={t("checkOutTime")} sortKey="checkOutAt" currentSort={table.sort} onToggle={table.toggleSort} className="hidden sm:table-cell" />
                            <SortableHeader label={t("location")} sortKey="locationName" currentSort={table.sort} onToggle={table.toggleSort} className="hidden md:table-cell" />
                            <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground hidden lg:table-cell">{t("duration")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {table.loading ? (
                            Array.from({ length: 8 }).map((_, i) => (
                                <tr key={i} className="border-b border-border last:border-0">
                                    <td className="px-4 py-3"><div className="h-4 w-28 rounded-md skeleton-shimmer" /></td>
                                    <td className="px-4 py-3"><div className="h-4 w-20 rounded-md skeleton-shimmer" /></td>
                                    <td className="px-4 py-3"><div className="h-4 w-16 rounded-md skeleton-shimmer" /></td>
                                    <td className="px-4 py-3 hidden sm:table-cell"><div className="h-4 w-16 rounded-md skeleton-shimmer" /></td>
                                    <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 w-20 rounded-md skeleton-shimmer" /></td>
                                    <td className="px-4 py-3 hidden lg:table-cell"><div className="h-4 w-14 rounded-md skeleton-shimmer" /></td>
                                </tr>
                            ))
                        ) : table.items.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-16 text-center">
                                    <CheckSquare className="mx-auto mb-3 size-8 text-muted-foreground/40" />
                                    <p className="text-sm font-medium text-muted-foreground">{t("noCheckins")}</p>
                                </td>
                            </tr>
                        ) : (
                            table.items.map((checkin) => {
                                const checkIn = new Date(checkin.checkInAt);
                                const checkOut = checkin.checkOutAt ? new Date(checkin.checkOutAt) : null;
                                const durationMin = checkOut ? Math.round((checkOut.getTime() - checkIn.getTime()) / 60000) : null;

                                return (
                                    <tr
                                        key={checkin.id}
                                        className="group table-row-hover border-b border-border last:border-0"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/8 text-[11px] font-semibold text-primary">
                                                    {checkin.member.firstName[0]}
                                                </div>
                                                <div>
                                                    <span className="font-medium text-foreground">
                                                        {checkin.member.firstName} {checkin.member.lastName}
                                                    </span>
                                                    {checkin.member.email && (
                                                        <p className="text-xs text-muted-foreground">{checkin.member.email}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground tabular-nums">
                                            {checkIn.toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground tabular-nums">
                                            <div className="flex items-center gap-1.5">
                                                <LogIn className="size-3.5 text-emerald-500" />
                                                {checkIn.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground tabular-nums">
                                            {checkOut ? (
                                                <div className="flex items-center gap-1.5">
                                                    <LogOut className="size-3.5 text-blue-500" />
                                                    {checkOut.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                </div>
                                            ) : (
                                                <Badge variant="secondary" className="text-xs">—</Badge>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                                            {checkin.location.name}
                                        </td>
                                        <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground tabular-nums">
                                            {durationMin !== null ? (
                                                <span>{durationMin} {t("min")}</span>
                                            ) : (
                                                <Badge variant="secondary" className="text-xs">{t("inProgress")}</Badge>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {!table.loading && table.items.length > 0 && (
                <TablePagination
                    page={table.page}
                    totalPages={table.totalPages}
                    totalItems={table.totalItems}
                    pageSize={table.pageSize}
                    onPageChange={table.setPage}
                />
            )}
        </>
    );
}
