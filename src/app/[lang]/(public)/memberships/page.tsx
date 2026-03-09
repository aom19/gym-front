import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Check, Zap, Crown, Leaf } from "lucide-react";

type FeatureKey = "featureAccess" | "featureLocker" | "feature2Classes" | "featureUnlimitedClasses" | "featureTrainer";

const plans: {
  name: string;
  price: string;
  duration: number;
  featureKeys: FeatureKey[];
  image: string;
  Icon: React.ElementType;
}[] = [
  {
    name: "Basic",
    price: "€29",
    duration: 30,
    featureKeys: ["featureAccess", "featureLocker"],
    image: "https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg?auto=compress&cs=tinysrgb&w=640",
    Icon: Leaf,
  },
  {
    name: "Standard",
    price: "€49",
    duration: 30,
    featureKeys: ["featureAccess", "featureLocker", "feature2Classes"],
    image: "https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg?auto=compress&cs=tinysrgb&w=640",
    Icon: Zap,
  },
  {
    name: "Premium",
    price: "€79",
    duration: 30,
    featureKeys: ["featureAccess", "featureLocker", "featureUnlimitedClasses", "featureTrainer"],
    image: "https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=640",
    Icon: Crown,
  },
];

import type React from "react";

export default async function MembershipsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  setRequestLocale(lang);
  const tSubs = await getTranslations("subscriptions");
  const t = await getTranslations("memberships");
  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{tSubs("title")}</h1>
          <p className="mt-3 text-muted-foreground">{tSubs("subtitle")}</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {plans.map((plan, i) => {
            const PlanIcon = plan.Icon;
            return (
              <div
                key={plan.name}
                className={`group flex flex-col overflow-hidden rounded-2xl border ring-1 transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  i === 1
                    ? "border-primary bg-card ring-primary/40 shadow-lg"
                    : "border-border bg-card ring-foreground/10"
                }`}
              >
                {/* Card image */}
                <div className="relative h-40 overflow-hidden">
                  <Image
                    src={plan.image}
                    alt={plan.name}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width:640px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-black/30" />
                  {i === 1 && (
                    <span className="absolute top-3 right-3 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground shadow">
                      {t("popular")}
                    </span>
                  )}
                  <div className="absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm text-white">
                    <PlanIcon className="size-5" />
                  </div>
                </div>

                {/* Card body */}
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                  <p className="mt-1 text-3xl font-extrabold text-foreground">
                    {plan.price}
                    <span className="text-sm font-normal text-muted-foreground">/{plan.duration} {tSubs("days")}</span>
                  </p>
                  <ul className="mt-5 flex flex-1 flex-col gap-2 text-sm text-muted-foreground">
                    {plan.featureKeys.map((key) => (
                      <li key={key} className="flex items-center gap-2">
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                          <Check className="size-2.5" />
                        </span>
                        {t(key)}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/login"
                    className={`mt-8 inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold transition hover:scale-105 ${
                      i === 1
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "border border-border bg-background text-foreground hover:bg-muted"
                    }`}
                  >
                    {t("getStarted")}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
