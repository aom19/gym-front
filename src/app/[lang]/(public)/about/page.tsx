import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { Users, MapPin, Star } from "lucide-react";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  setRequestLocale(lang);
  const tNav = await getTranslations("nav");
  const t = await getTranslations("about");

  const stats = [
    { value: t("stat1Value"), label: t("stat1Label"), Icon: Users },
    { value: t("stat2Value"), label: t("stat2Label"), Icon: MapPin },
    { value: t("stat3Value"), label: t("stat3Label"), Icon: Star },
  ];

  return (
    <>
      {/* Hero banner */}
      <section className="relative h-64 sm:h-80 overflow-hidden">
        <Image
          src="https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg?auto=compress&cs=tinysrgb&w=1920&h=600&dpr=1"
          alt="About GymPro"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-4xl font-extrabold text-white drop-shadow sm:text-5xl">{tNav("about")}</h1>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            {/* Text */}
            <div className="space-y-4">
              <p className="text-base leading-relaxed text-muted-foreground">{t("desc1")}</p>
              <p className="text-base leading-relaxed text-muted-foreground">{t("desc2")}</p>
            </div>
            {/* Side image */}
            <div className="relative h-64 overflow-hidden rounded-2xl shadow-lg lg:h-80">
              <Image
                src="https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg?auto=compress&cs=tinysrgb&w=640"
                alt="Trainer"
                fill
                className="object-cover"
                sizes="(max-width:1024px) 100vw, 50vw"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {stats.map(({ value, label, Icon }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 text-center ring-1 ring-foreground/10 transition duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <p className="text-3xl font-extrabold text-primary">{value}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
