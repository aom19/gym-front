import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type FeatureKey = "featureAccess" | "featureLocker" | "feature2Classes" | "featureUnlimitedClasses" | "featureTrainer";

const plans: { name: string; price: string; duration: number; featureKeys: FeatureKey[] }[] = [
  { name: "Basic", price: "€29", duration: 30, featureKeys: ["featureAccess", "featureLocker"] },
  { name: "Standard", price: "€49", duration: 30, featureKeys: ["featureAccess", "featureLocker", "feature2Classes"] },
  { name: "Premium", price: "€79", duration: 30, featureKeys: ["featureAccess", "featureLocker", "featureUnlimitedClasses", "featureTrainer"] },
];

export default async function MembershipsPage() {
  const tSubs = await getTranslations("subscriptions");
  const t = await getTranslations("memberships");

  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{tSubs("title")}</h1>
          <p className="mt-3 text-muted-foreground">{tSubs("subtitle")}</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className={`flex flex-col rounded-xl border p-6 ring-1 ${
                i === 1
                  ? "border-primary bg-primary/5 ring-primary/30"
                  : "border-border bg-card ring-foreground/10"
              }`}
            >
              {i === 1 && (
                <span className="mb-4 self-start rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
                  {t("popular")}
                </span>
              )}
              <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
              <p className="mt-1 text-3xl font-bold text-foreground">
                {plan.price}
                <span className="text-sm font-normal text-muted-foreground">/{plan.duration} {tSubs("days")}</span>
              </p>
              <ul className="mt-6 flex flex-1 flex-col gap-2 text-sm text-muted-foreground">
                {plan.featureKeys.map((key) => (
                  <li key={key} className="flex items-center gap-2">
                    <span className="text-primary">✓</span> {t(key)}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className={`mt-8 inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition ${
                  i === 1
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border border-border bg-background text-foreground hover:bg-muted"
                }`}
              >
                {t("getStarted")}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
