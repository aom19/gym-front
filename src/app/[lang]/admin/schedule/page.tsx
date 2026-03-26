import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getUser } from "@/utils/auth";
import { LocationScheduleManager } from "@/components/admin/location-schedule-manager";

export default async function SchedulePage({
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
            <LocationScheduleManager userRole={user.role} />
        </div>
    );
}
