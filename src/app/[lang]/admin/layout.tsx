import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { LogoutButton } from "@/components/logout-button";
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  setRequestLocale(lang);
  const t = await getTranslations("nav");

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <div className="flex flex-1 flex-col pl-60">
        {/* Top navbar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-end gap-3 border-b border-border bg-card/80 px-6 backdrop-blur">
          <LanguageSwitcher />
          <ThemeSwitcher />
          <LogoutButton className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition hover:bg-accent hover:text-accent-foreground">
            {t("logout")}
          </LogoutButton>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
