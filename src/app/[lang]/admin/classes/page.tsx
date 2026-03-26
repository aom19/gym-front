import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getUser } from "@/utils/auth";
import { GroupClassesTable } from "@/components/admin/group-classes-table";

export default async function ClassesPage({
    params,
}: {
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    setRequestLocale(lang);

    const user = await getUser();
    if (!user || !["ADMIN", "FRONT_DESK", "TRAINER"].includes(user.role)) {
        redirect(`/${lang}/login`);
    }

    return (
        <div className="space-y-6">
            <GroupClassesTable userRole={user.role} />
        </div>
    );
}
