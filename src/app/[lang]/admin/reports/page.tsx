import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getUser } from "@/utils/auth";
import { ReportsContent } from "@/components/admin/reports-content";

export default async function ReportsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  setRequestLocale(lang);

  const user = await getUser();
  if (!user || user.role !== "ADMIN") {
    redirect(`/${lang}/login`);
  }

  return (
    <div className="space-y-6">
      <ReportsContent />
    </div>
  );
}
