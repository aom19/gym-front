import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getUser } from "@/utils/auth";
import { WeeklyClassCalendar } from "@/components/member/weekly-class-calendar";

export default async function MemberCalendarPage({
    params,
}: {
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    setRequestLocale(lang);

    const user = await getUser();
    if (!user) {
        redirect(`/${lang}/login`);
    }

    return (
        <div className="space-y-6">
            <WeeklyClassCalendar />
        </div>
    );
}
