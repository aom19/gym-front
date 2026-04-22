import { setRequestLocale } from "next-intl/server";
import { MemberNavbar } from "@/components/layout/member-navbar";

export default async function MemberLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    setRequestLocale(lang);

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <MemberNavbar />
            <main className="flex-1">
                <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
