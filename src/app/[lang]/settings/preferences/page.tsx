import { getTranslations } from "next-intl/server";
import { PreferencesForm } from "./preferences-form";
import Link from "next/link";

export default async function PreferencesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const t = await getTranslations("preferences");
  const tNav = await getTranslations("nav");

  return (
    <main className="min-h-screen bg-background px-4 py-12 sm:px-8">
      <section className="mx-auto max-w-lg space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
          <Link
            href={`/${lang}/admin/dashboard`}
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            {tNav("dashboard")}
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <PreferencesForm />
        </div>
      </section>
    </main>
  );
}
