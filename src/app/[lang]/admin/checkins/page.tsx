import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getUser } from "@/utils/auth";
import { CheckinsTable } from "@/components/admin/checkins-table";

export default async function CheckinsPage({
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
      <CheckinsTable />
    </div>
  );
}
