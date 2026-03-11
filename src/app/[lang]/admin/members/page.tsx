import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getUser } from "@/utils/auth";
import { MembersTable } from "@/components/admin/members-table";

export default async function MembersPage({
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
      <MembersTable userRole={user.role} />
    </div>
  );
}
