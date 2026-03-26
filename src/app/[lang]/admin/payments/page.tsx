import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getUser } from "@/utils/auth";
import { PaymentsTable } from "@/components/admin/payments-table";

export default async function PaymentsPage({
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
      <PaymentsTable userRole={user.role} />
    </div>
  );
}
