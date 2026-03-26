import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminTopbar } from "@/components/layout/admin-topbar";
import { AdminContent } from "@/components/layout/admin-content";
import { setRequestLocale } from "next-intl/server";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  setRequestLocale(lang);

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <AdminTopbar />
      <AdminContent>{children}</AdminContent>
    </div>
  );
}
