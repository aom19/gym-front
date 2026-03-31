import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getUser } from "@/utils/auth";
import { ClassBookingsManager } from "@/components/admin/class-bookings-manager";

export default async function ClassBookingsPage({
  params,
}: {
  params: Promise<{ lang: string; classId: string }>;
}) {
  const { lang, classId } = await params;
  setRequestLocale(lang);

  const user = await getUser();
  if (!user || !["ADMIN", "TRAINER"].includes(user.role)) {
    redirect(`/${lang}/login`);
  }

  return (
    <div className="space-y-6">
      <ClassBookingsManager classId={classId} />
    </div>
  );
}
