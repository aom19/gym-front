import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { getTranslations } from "next-intl/server";
import { getLocale } from "next-intl/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("nav");
  const lang = await getLocale();

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <div className="flex flex-1 flex-col pl-60">
        {/* Top navbar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-end gap-3 border-b border-border bg-card/80 px-6 backdrop-blur">
          <LanguageSwitcher />
          <ThemeSwitcher />
          <form action="/auth/logout" method="POST">
            <button
              type="submit"
              className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition hover:bg-accent hover:text-accent-foreground"
            >
              {t("logout")}
            </button>
          </form>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
