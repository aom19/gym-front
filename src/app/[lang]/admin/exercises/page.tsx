import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getUser } from "@/utils/auth";
import { ExercisesTable } from "@/components/admin/exercises-table";

export default async function ExercisesPage({
    params,
}: {
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    setRequestLocale(lang);

    const user = await getUser();
    if (!user || !["ADMIN", "TRAINER"].includes(user.role)) {
        redirect(`/${lang}/login`);
    }

    return (
        <div className="space-y-6">
            <ExercisesTable />
        </div>
    );
}
