import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getUser } from "@/utils/auth";
import { MemberProgressContent } from "@/components/member/member-progress-content";

export default async function MemberProgressPage({
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
            <MemberProgressContent />
        </div>
    );
}
