import { getTranslations } from "next-intl/server";
import { MapPin, Clock, Phone } from "lucide-react";

export default async function LocationsPage() {
  const tNav = await getTranslations("nav");
  const t = await getTranslations("locations");

  const locations = [
    {
      name: "GymPro Central",
      address: "Str. Ștefan cel Mare 1, Chișinău",
      hours: t("loc1Hours"),
      phone: "+373 22 000 111",
    },
    {
      name: "GymPro Botanica",
      address: "Str. Dacia 15, Chișinău",
      hours: t("loc2Hours"),
      phone: "+373 22 000 222",
    },
    {
      name: "GymPro Râșcani",
      address: "Bd. Moscovei 8, Chișinău",
      hours: t("loc3Hours"),
      phone: "+373 22 000 333",
    },
  ];

  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{tNav("locations")}</h1>
          <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((loc) => (
            <div
              key={loc.name}
              className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 ring-1 ring-foreground/10"
            >
              <h3 className="font-semibold text-foreground">{loc.name}</h3>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                {loc.address}
              </div>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
                {loc.hours}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="size-4 shrink-0 text-primary" />
                {loc.phone}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
