"use client";

import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TablePaginationProps {
    page: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
}

export function TablePagination({ page, totalPages, totalItems, pageSize, onPageChange }: TablePaginationProps) {
    const t = useTranslations("table");

    if (totalPages <= 1) return null;

    const from = (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, totalItems);

    return (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-xs text-muted-foreground">
                {t("showing", { from, to, total: totalItems })}
            </span>
            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onPageChange(1)}
                    disabled={page <= 1}
                    aria-label={t("firstPage")}
                >
                    <ChevronsLeft className="size-3.5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onPageChange(page - 1)}
                    disabled={page <= 1}
                    aria-label={t("previousPage")}
                >
                    <ChevronLeft className="size-3.5" />
                </Button>
                <span className="px-2 text-xs font-medium text-foreground">
                    {page} / {totalPages}
                </span>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= totalPages}
                    aria-label={t("nextPage")}
                >
                    <ChevronRight className="size-3.5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onPageChange(totalPages)}
                    disabled={page >= totalPages}
                    aria-label={t("lastPage")}
                >
                    <ChevronsRight className="size-3.5" />
                </Button>
            </div>
        </div>
    );
}
