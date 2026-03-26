import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";

export default async function AdminSettingsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  setRequestLocale(lang);
  const t = await getTranslations("sidebar");
  const tPref = await getTranslations("preferences");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("settings")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account and system settings.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href={`/${lang}/settings/preferences`}
          className="flex flex-col gap-2 rounded-xl border border-border bg-card p-6 ring-1 ring-foreground/10 transition hover:ring-primary/30 hover:border-primary/30"
        >
          <h2 className="font-semibold text-foreground">{tPref("title")}</h2>
          <p className="text-sm text-muted-foreground">{tPref("subtitle")}</p>
        </Link>

        <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-6 ring-1 ring-foreground/10 opacity-60">
          <h2 className="font-semibold text-foreground">Notifications</h2>
          <p className="text-sm text-muted-foreground">Configure email and push alerts.</p>
          <span className="mt-2 self-start rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Coming soon</span>
        </div>

        <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-6 ring-1 ring-foreground/10 opacity-60">
          <h2 className="font-semibold text-foreground">Integrations</h2>
          <p className="text-sm text-muted-foreground">Connect payment providers and tools.</p>
          <span className="mt-2 self-start rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Coming soon</span>
        </div>
      </div>
    </div>
  );
}
