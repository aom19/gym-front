import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { MapPin, Clock, Phone } from "lucide-react";

const locationImages = [
  "https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=640",
  "https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg?auto=compress&cs=tinysrgb&w=640",
  "https://images.pexels.com/photos/3912953/pexels-photo-3912953.jpeg?auto=compress&cs=tinysrgb&w=640",
];

export default async function LocationsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  setRequestLocale(lang);
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
          {locations.map((loc, i) => (
            <div
              key={loc.name}
              className="group overflow-hidden rounded-2xl border border-border bg-card ring-1 ring-foreground/10 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              {/* Image */}
              <div className="relative h-44 overflow-hidden">
                <Image
                  src={locationImages[i % locationImages.length]}
                  alt={loc.name}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <h3 className="absolute bottom-3 left-4 font-semibold text-white drop-shadow">
                  {loc.name}
                </h3>
              </div>

              {/* Card details */}
              <div className="flex flex-col gap-3 p-5">
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
