import { getTranslations, setRequestLocale } from "next-intl/server";

type ScheduleKey = "yogaSchedule" | "hiitSchedule" | "cyclingSchedule" | "boxingSchedule" | "pilatesSchedule" | "zumbaSchedule";

const classes: { name: string; scheduleKey: ScheduleKey; trainer: string; spots: number }[] = [
  { name: "Yoga", scheduleKey: "yogaSchedule", trainer: "Ana M.", spots: 12 },
  { name: "HIIT", scheduleKey: "hiitSchedule", trainer: "Radu P.", spots: 8 },
  { name: "Cycling", scheduleKey: "cyclingSchedule", trainer: "Elena C.", spots: 15 },
  { name: "Boxing", scheduleKey: "boxingSchedule", trainer: "Ion S.", spots: 10 },
  { name: "Pilates", scheduleKey: "pilatesSchedule", trainer: "Mirela D.", spots: 14 },
  { name: "Zumba", scheduleKey: "zumbaSchedule", trainer: "Corina B.", spots: 20 },
];

export default async function ClassesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  setRequestLocale(lang);
  const tNav = await getTranslations("nav");
  const t = await getTranslations("classes");

  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{tNav("classes")}</h1>
          <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => (
            <div
              key={cls.name}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 ring-1 ring-foreground/10"
            >
              <h3 className="text-base font-semibold text-foreground">{cls.name}</h3>
              <p className="text-sm text-muted-foreground">{t(cls.scheduleKey)}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{t("trainerLabel")}: <strong className="text-foreground">{cls.trainer}</strong></span>
                <span>{cls.spots} {t("spotsLabel")}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
