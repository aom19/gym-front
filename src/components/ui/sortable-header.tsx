"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

interface SortableHeaderProps {
    label: string;
    sortKey: string;
    currentSort: { key: string; direction: "asc" | "desc" };
    onToggle: (key: string) => void;
    className?: string;
}

export function SortableHeader({ label, sortKey, currentSort, onToggle, className = "" }: SortableHeaderProps) {
    const isActive = currentSort.key === sortKey;
    return (
        <th
            className={`px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors ${className}`}
            onClick={() => onToggle(sortKey)}
        >
            <span className="inline-flex items-center gap-1">
                {label}
                {isActive ? (
                    currentSort.direction === "asc" ? (
                        <ArrowUp className="size-3" />
                    ) : (
                        <ArrowDown className="size-3" />
                    )
                ) : (
                    <ArrowUpDown className="size-3 opacity-40" />
                )}
            </span>
        </th>
    );
}
