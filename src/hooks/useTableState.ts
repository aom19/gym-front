"use client";

import { useMemo, useState } from "react";

type SortDirection = "asc" | "desc";

interface SortState {
    key: string;
    direction: SortDirection;
}

interface UseTableStateOptions<T> {
    /** Items to paginate/sort/filter */
    data: T[];
    /** How many items per page (default 10) */
    pageSize?: number;
    /** Default sort key */
    defaultSort?: string;
    /** Default sort direction */
    defaultDirection?: SortDirection;
    /** Fields to search across — pass dot-notation for nested (e.g. "location.name") */
    searchableFields?: string[];
}

function getNestedValue(obj: unknown, path: string): unknown {
    return path.split(".").reduce<unknown>((acc, key) => {
        if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
            return (acc as Record<string, unknown>)[key];
        }
        return undefined;
    }, obj);
}

export function useTableState<T>({
    data,
    pageSize = 10,
    defaultSort = "",
    defaultDirection = "asc",
    searchableFields = [],
}: UseTableStateOptions<T>) {
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState<SortState>({ key: defaultSort, direction: defaultDirection });
    const [page, setPage] = useState(1);

    // ── Filtering ───────────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        if (!search.trim()) return data;
        const q = search.toLowerCase();
        return data.filter((item) =>
            searchableFields.some((field) => {
                const val = getNestedValue(item, field);
                return val != null && String(val).toLowerCase().includes(q);
            }),
        );
    }, [data, search, searchableFields]);

    // ── Sorting ─────────────────────────────────────────────────────────────
    const sorted = useMemo(() => {
        if (!sort.key) return filtered;
        return [...filtered].sort((a, b) => {
            const aVal = getNestedValue(a, sort.key);
            const bVal = getNestedValue(b, sort.key);
            if (aVal == null && bVal == null) return 0;
            if (aVal == null) return 1;
            if (bVal == null) return -1;

            let cmp: number;
            if (typeof aVal === "number" && typeof bVal === "number") {
                cmp = aVal - bVal;
            } else {
                cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true, sensitivity: "base" });
            }
            return sort.direction === "asc" ? cmp : -cmp;
        });
    }, [filtered, sort]);

    // ── Pagination ──────────────────────────────────────────────────────────
    const totalItems = sorted.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const safePage = Math.min(page, totalPages);

    const paginatedItems = useMemo(() => {
        const start = (safePage - 1) * pageSize;
        return sorted.slice(start, start + pageSize);
    }, [sorted, safePage, pageSize]);

    // ── Helpers ─────────────────────────────────────────────────────────────
    const toggleSort = (key: string) => {
        setSort((prev) => {
            if (prev.key === key) {
                return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
            }
            return { key, direction: "asc" };
        });
        setPage(1);
    };

    const handleSearch = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    return {
        // State
        search,
        sort,
        page: safePage,
        pageSize,
        totalItems,
        totalPages,
        // Data
        items: paginatedItems,
        // Actions
        setSearch: handleSearch,
        setPage,
        toggleSort,
    };
}
