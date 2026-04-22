import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getUser } from "@/utils/auth";
import { MemberWorkoutsContent } from "@/components/member/member-workouts-content";

export default async function MemberWorkoutsPage({
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
            <MemberWorkoutsContent />
        </div>
    );
}
