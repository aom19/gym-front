import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getUser } from "@/utils/auth";
import { TrainerCalendar } from "@/components/admin/trainer-calendar";

export default async function TrainerCalendarPage({
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
            <TrainerCalendar userId={user.id} />
        </div>
    );
}
