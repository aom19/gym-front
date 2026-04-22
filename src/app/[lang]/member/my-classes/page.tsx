import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getUser } from "@/utils/auth";
import { MemberClassesContent } from "@/components/member/member-classes-content";

export default async function MemberClassesPage({
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
            <MemberClassesContent />
        </div>
    );
}
