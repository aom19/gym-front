import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getUser } from "@/utils/auth";
import { SubscriptionPlansTable } from "@/components/admin/subscription-plans-table";

export default async function SubscriptionsPage({
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
      <SubscriptionPlansTable />
    </div>
  );
}
