import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getUser } from "@/utils/auth";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const user = await getUser();

  if (!user || user.role !== "ADMIN") {
    redirect(`/${lang}/login`);
  }

  const t = await getTranslations("dashboard");
  const tNav = await getTranslations("nav");

  return (
    <main className="min-h-screen bg-background px-4 py-12 sm:px-8">
      <section className="mx-auto max-w-3xl space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-foreground">{t("title")}</h1>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeSwitcher />
            <form action="/auth/logout" method="POST">
              <button
                type="submit"
                className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground transition hover:bg-accent hover:text-accent-foreground"
              >
                {tNav("logout")}
              </button>
            </form>
          </div>
        </div>

        {/* User card */}
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="grid gap-4 rounded-xl bg-muted p-5 text-sm sm:text-base">
            <p>
              <span className="font-semibold text-muted-foreground">{t("email")}:</span>{" "}
              <span className="text-foreground">{user.email}</span>
            </p>
            <p>
              <span className="font-semibold text-muted-foreground">{t("role")}:</span>{" "}
              <span className="text-foreground">{user.role}</span>
            </p>
            <p>
              <span className="font-semibold text-muted-foreground">{t("location")}:</span>{" "}
              <span className="text-foreground">{user.location?.name ?? "N/A"}</span>
            </p>
          </div>
        </div>

        {/* Quick links */}
        <div className="flex gap-3">
          <Link
            href={`/${lang}/settings/preferences`}
            className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-accent hover:text-accent-foreground"
          >
            Preferences
          </Link>
        </div>
      </section>
    </main>
  );
}
