import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { Users, Clock } from "lucide-react";
import { UpcomingClassesList } from "@/components/public/upcoming-classes-list";

type ScheduleKey = "yogaSchedule" | "hiitSchedule" | "cyclingSchedule" | "boxingSchedule" | "pilatesSchedule" | "zumbaSchedule";

const classes: {
  name: string;
  scheduleKey: ScheduleKey;
  trainer: string;
  spots: number;
  image: string;
  color: string;
}[] = [
  {
    name: "Yoga",
    scheduleKey: "yogaSchedule",
    trainer: "Ana M.",
    spots: 12,
    image: "https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=640",
    color: "from-violet-500/80",
  },
  {
    name: "HIIT",
    scheduleKey: "hiitSchedule",
    trainer: "Radu P.",
    spots: 8,
    image: "https://images.pexels.com/photos/416778/pexels-photo-416778.jpeg?auto=compress&cs=tinysrgb&w=640",
    color: "from-orange-500/80",
  },
  {
    name: "Cycling",
    scheduleKey: "cyclingSchedule",
    trainer: "Elena C.",
    spots: 15,
    image: "https://images.pexels.com/photos/3771836/pexels-photo-3771836.jpeg?auto=compress&cs=tinysrgb&w=640",
    color: "from-cyan-500/80",
  },
  {
    name: "Boxing",
    scheduleKey: "boxingSchedule",
    trainer: "Ion S.",
    spots: 10,
    image: "https://images.pexels.com/photos/4920754/pexels-photo-4920754.jpeg?auto=compress&cs=tinysrgb&w=640",
    color: "from-red-500/80",
  },
  {
    name: "Pilates",
    scheduleKey: "pilatesSchedule",
    trainer: "Mirela D.",
    spots: 14,
    image: "https://images.pexels.com/photos/3076509/pexels-photo-3076509.jpeg?auto=compress&cs=tinysrgb&w=640",
    color: "from-pink-500/80",
  },
  {
    name: "Zumba",
    scheduleKey: "zumbaSchedule",
    trainer: "Corina B.",
    spots: 20,
    image: "https://images.pexels.com/photos/3985346/pexels-photo-3985346.jpeg?auto=compress&cs=tinysrgb&w=640",
    color: "from-yellow-500/80",
  },
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

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => (
            <div
              key={cls.name}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card ring-1 ring-foreground/10 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              {/* Image with gradient overlay */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={cls.image}
                  alt={cls.name}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-110"
                  sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${cls.color} to-transparent`} />
                <h3 className="absolute bottom-3 left-4 text-xl font-bold text-white drop-shadow">
                  {cls.name}
                </h3>
              </div>

              {/* Card body */}
              <div className="flex flex-col gap-3 p-5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="size-3.5 shrink-0 text-primary" />
                  {t(cls.scheduleKey)}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground font-medium">{cls.trainer}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="size-3.5" />
                    {cls.spots} {t("spotsLabel")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic upcoming classes with booking */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">{t("upcomingTitle")}</h2>
          <UpcomingClassesList />
        </div>
      </div>
    </section>
  );
}
