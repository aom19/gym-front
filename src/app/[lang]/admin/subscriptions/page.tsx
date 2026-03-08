import { getTranslations } from "next-intl/server";

const plans = [
  { name: "Basic", duration: 30, price: "€29", activeMembers: 312 },
  { name: "Standard", duration: 30, price: "€49", activeMembers: 487 },
  { name: "Premium", duration: 30, price: "€79", activeMembers: 185 },
  { name: "Annual Basic", duration: 365, price: "€299", activeMembers: 64 },
  { name: "Annual Premium", duration: 365, price: "€699", activeMembers: 42 },
];

export default async function SubscriptionsPage() {
  const t = await getTranslations("subscriptions");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 ring-1 ring-foreground/10"
          >
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-foreground">{plan.name}</h3>
              <span className="text-lg font-bold text-primary">{plan.price}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {plan.duration} {t("days")}
            </p>
            <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
              <span className="text-xs text-muted-foreground">{t("members")}</span>
              <span className="text-sm font-semibold text-foreground">{plan.activeMembers}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue summary */}
      <div className="rounded-xl border border-border bg-card p-6 ring-1 ring-foreground/10">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Monthly Revenue Breakdown</h2>
        <div className="flex flex-col gap-3">
          {plans.map((plan) => {
            const price = parseInt(plan.price.replace("€", ""));
            const revenue = price * plan.activeMembers;
            const maxRevenue = 487 * 49;
            const pct = Math.round((revenue / maxRevenue) * 100);
            return (
              <div key={plan.name} className="flex items-center gap-3 text-sm">
                <span className="w-32 shrink-0 text-muted-foreground">{plan.name}</span>
                <div className="flex-1 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <span className="w-20 text-right font-medium text-foreground">
                  €{revenue.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
