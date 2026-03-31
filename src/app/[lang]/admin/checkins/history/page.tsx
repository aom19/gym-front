import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getUser } from "@/utils/auth";
import { CheckinsHistoryTable } from "@/components/admin/checkins-history-table";

export default async function CheckinsHistoryPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  setRequestLocale(lang);

  const user = await getUser();
  if (!user || !["ADMIN", "FRONT_DESK"].includes(user.role)) {
    redirect(`/${lang}/login`);
  }

  return (
    <div className="space-y-6">
      <CheckinsHistoryTable />
    </div>
  );
}
