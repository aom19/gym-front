"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface PaginationParams {
    page?: number;
    limit?: number;
    sort?: string;
    order?: "asc" | "desc";
    search?: string;
}

export interface PaginatedResult<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

interface UseServerTableOptions<T> {
    fetchFn: (params: PaginationParams) => Promise<PaginatedResult<T>>;
    pageSize?: number;
    defaultSort?: string;
    defaultOrder?: "asc" | "desc";
}

export function useServerTable<T>({
    fetchFn,
    pageSize = 10,
    defaultSort = "",
    defaultOrder = "asc",
}: UseServerTableOptions<T>) {
    const [items, setItems] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearchRaw] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [sortKey, setSortKey] = useState(defaultSort);
    const [sortDir, setSortDir] = useState<"asc" | "desc">(defaultOrder);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [version, setVersion] = useState(0);

    const fetchRef = useRef(fetchFn);
    fetchRef.current = fetchFn;

    // Debounce search
    useEffect(() => {
        if (search === debouncedSearch) return;
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [search, debouncedSearch]);

    // Main fetch effect
    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        fetchRef.current({
            page,
            limit: pageSize,
            ...(sortKey ? { sort: sortKey, order: sortDir } : {}),
            ...(debouncedSearch ? { search: debouncedSearch } : {}),
        })
            .then((result) => {
                if (cancelled) return;
                if (!result?.data || !result?.meta) {
                    console.error("[useServerTable] unexpected response shape:", result);
                    setItems([]);
                    setTotalPages(1);
                    setTotalItems(0);
                    return;
                }
                setItems(result.data);
                setTotalPages(result.meta.totalPages);
                setTotalItems(result.meta.total);
            })
            .catch(() => {
                if (cancelled) return;
                setItems([]);
                setTotalPages(1);
                setTotalItems(0);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [page, pageSize, sortKey, sortDir, debouncedSearch, version]);

    const setSearch = useCallback((value: string) => {
        setSearchRaw(value);
    }, []);

    const toggleSort = useCallback((key: string) => {
        setSortKey((prevKey) => {
            if (prevKey === key) {
                setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                return key;
            }
            setSortDir("asc");
            return key;
        });
        setPage(1);
    }, []);

    const refetch = useCallback(() => {
        setVersion((v) => v + 1);
    }, []);

    return {
        items,
        loading,
        search,
        setSearch,
        sort: { key: sortKey, direction: sortDir },
        toggleSort,
        page,
        setPage,
        totalPages,
        totalItems,
        refetch,
        pageSize,
    };
}
