import { getTranslations } from "next-intl/server";
import { getLocale } from "next-intl/server";
import Link from "next/link";
import { getUser } from "@/utils/auth";
import {
  Users,
  CalendarCheck,
  CreditCard,
  BarChart3,
} from "lucide-react";

export default async function HomePage() {
  const t = await getTranslations("home");
  const tNav = await getTranslations("nav");
  const lang = await getLocale();
  const user = await getUser();

  const features = [
    { titleKey: "feature1Title", descKey: "feature1Desc", Icon: Users },
    { titleKey: "feature2Title", descKey: "feature2Desc", Icon: CalendarCheck },
    { titleKey: "feature3Title", descKey: "feature3Desc", Icon: CreditCard },
    { titleKey: "feature4Title", descKey: "feature4Desc", Icon: BarChart3 },
  ] as const;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="mb-4 inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            All-in-one gym management
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            {t("heroTitle")}
          </h1>
          <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
            {t("heroSubtitle")}
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            {user?.role === "ADMIN" ? (
              <Link
                href={`/${lang}/admin/dashboard`}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                {tNav("dashboard")} →
              </Link>
            ) : (
              <>
                <Link
                  href={`/${lang}/login`}
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                >
                  {t("heroCta")}
                </Link>
                <Link
                  href={`/${lang}/memberships`}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-6 text-sm font-medium text-foreground transition hover:bg-muted"
                >
                  {t("heroSecondary")}
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="mb-12 text-center text-2xl font-bold text-foreground sm:text-3xl">
            {t("featuresTitle")}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ titleKey, descKey, Icon }) => (
              <div
                key={titleKey}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6 text-sm ring-1 ring-foreground/10 transition hover:ring-primary/30"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <h3 className="font-semibold text-foreground">{t(titleKey)}</h3>
                <p className="text-muted-foreground leading-relaxed">{t(descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="bg-primary py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-bold text-primary-foreground sm:text-3xl">
            {t("heroCta")}
          </h2>
          <p className="mt-3 text-primary-foreground/80">{t("heroSubtitle")}</p>
          <Link
            href={`/${lang}/login`}
            className="mt-8 inline-flex h-10 items-center justify-center rounded-lg border border-primary-foreground/30 bg-primary-foreground/10 px-6 text-sm font-medium text-primary-foreground transition hover:bg-primary-foreground/20"
          >
            {t("heroCta")} →
          </Link>
        </div>
      </section>
    </>
  );
}
