"use client";

import { useSidebarStore } from "@/store/sidebar";
import { cn } from "@/lib/utils";

export function AdminContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebarStore();

  return (
    <main
      className={cn(
        "flex-1 pt-12 transition-[padding-left] duration-200 ease-out",
        collapsed ? "pl-[60px]" : "pl-56",
      )}
    >
      <div className="page-enter p-5">{children}</div>
    </main>
  );
}
