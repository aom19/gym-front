import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getUser } from "@/utils/auth";
import {
  Users,
  CalendarCheck,
  CreditCard,
  BarChart3,
  TrendingUp,
  MapPin,
  Dumbbell,
  ArrowRight,
  Star,
} from "lucide-react";

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  setRequestLocale(lang);
  const t = await getTranslations("home");
  const user = await getUser();

  const features = [
    { titleKey: "feature1Title", descKey: "feature1Desc", Icon: Users },
    { titleKey: "feature2Title", descKey: "feature2Desc", Icon: CalendarCheck },
    { titleKey: "feature3Title", descKey: "feature3Desc", Icon: CreditCard },
    { titleKey: "feature4Title", descKey: "feature4Desc", Icon: BarChart3 },
  ] as const;

  const stats = [
    { value: "1,200+", labelKey: "statMembers", Icon: Users },
    { value: "50+",    labelKey: "statClasses",  Icon: Dumbbell },
    { value: "3",      labelKey: "statLocations", Icon: MapPin },
    { value: "98%",    labelKey: "statSatisfaction", Icon: Star },
  ] as const;

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 -z-10">
          <Image
            src="https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=1"
            alt="Gym interior"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/60" />
          {/* Gradient fade to page at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-5xl px-4 py-24 sm:px-6 sm:py-32 text-center">
          <div className="mb-5 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
            <TrendingUp className="mr-1.5 size-3.5" />
            All-in-one gym management
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl drop-shadow-lg">
            {t("heroTitle")}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80 sm:text-xl">
            {t("heroSubtitle")}
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            {user?.role === "ADMIN" ? (
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center gap-2 h-11 rounded-xl bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-lg transition hover:bg-primary/90 hover:scale-105"
              >
                {t("heroCta")} <ArrowRight className="size-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 h-11 rounded-xl bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-lg transition hover:bg-primary/90 hover:scale-105"
                >
                  {t("heroCta")} <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/memberships"
                  className="inline-flex items-center gap-2 h-11 rounded-xl border border-white/30 bg-white/10 px-7 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 hover:scale-105"
                >
                  {t("heroSecondary")}
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Stats band ── */}
      <section className="border-y border-border bg-muted/40 py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map(({ value, labelKey, Icon }) => (
              <div key={labelKey} className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <p className="text-2xl font-extrabold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{t(labelKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              {t("featuresTitle")}
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ titleKey, descKey, Icon }) => (
              <div
                key={titleKey}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6 text-sm ring-1 ring-foreground/10 transition duration-200 hover:shadow-md hover:-translate-y-1 hover:ring-primary/30"
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

      {/* ── CTA strip ── */}
      <section className="relative overflow-hidden bg-primary py-16">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <Image
            src="https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg?auto=compress&cs=tinysrgb&w=1920&h=400&dpr=1"
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-bold text-primary-foreground sm:text-3xl">
            {t("heroCta")}
          </h2>
          <p className="mt-3 text-primary-foreground/80">{t("heroSubtitle")}</p>
          <Link
            href="/login"
            className="mt-8 inline-flex items-center gap-2 h-11 rounded-xl border border-primary-foreground/30 bg-primary-foreground/10 px-7 text-sm font-semibold text-primary-foreground transition hover:bg-primary-foreground/20 hover:scale-105"
          >
            {t("heroCta")} <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
