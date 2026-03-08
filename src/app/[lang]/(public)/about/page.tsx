import { getTranslations } from "next-intl/server";

export default async function AboutPage() {
  const tNav = await getTranslations("nav");
  const t = await getTranslations("about");

  const stats = [
    { value: t("stat1Value"), label: t("stat1Label") },
    { value: t("stat2Value"), label: t("stat2Label") },
    { value: t("stat3Value"), label: t("stat3Label") },
  ];

  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{tNav("about")}</h1>
        </div>
        <div className="max-w-none">
          <p className="text-base leading-relaxed text-muted-foreground">
            {t("desc1")}
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            {t("desc2")}
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {stats.map(({ value, label }) => (
              <div key={label} className="rounded-xl border border-border bg-card p-6 text-center ring-1 ring-foreground/10">
                <p className="text-3xl font-bold text-primary">{value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
