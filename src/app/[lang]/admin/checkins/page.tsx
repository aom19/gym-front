import { getTranslations, setRequestLocale } from "next-intl/server";

const mockCheckins = [
  { id: 1, member: "Ion Popa", time: "09:14", location: "GymPro Central" },
  { id: 2, member: "Maria Ionescu", time: "09:22", location: "GymPro Botanica" },
  { id: 3, member: "Andrei Mihail", time: "09:35", location: "GymPro Central" },
  { id: 4, member: "Elena Cojocaru", time: "10:01", location: "GymPro Central" },
  { id: 5, member: "Vasile Moraru", time: "10:18", location: "GymPro Râșcani" },
  { id: 6, member: "Corina Balan", time: "10:45", location: "GymPro Botanica" },
  { id: 7, member: "Radu Popescu", time: "11:03", location: "GymPro Central" },
  { id: 8, member: "Mihai Ursachi", time: "11:22", location: "GymPro Central" },
];

const locationCounts: Record<string, number> = {};
for (const c of mockCheckins) {
  locationCounts[c.location] = (locationCounts[c.location] ?? 0) + 1;
}

export default async function CheckinsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  setRequestLocale(lang);
  const t = await getTranslations("checkins");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Summary by location */}
      <div className="grid gap-4 sm:grid-cols-3">
        {Object.entries(locationCounts).map(([loc, count]) => (
          <div
            key={loc}
            className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 ring-1 ring-foreground/10"
          >
            <p className="text-xs text-muted-foreground">{loc}</p>
            <p className="text-2xl font-bold text-foreground">{count}</p>
            <p className="text-xs text-muted-foreground">check-ins today</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card ring-1 ring-foreground/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("member")}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("time")}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">{t("location")}</th>
            </tr>
          </thead>
          <tbody>
            {mockCheckins.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                  {t("noCheckins")}
                </td>
              </tr>
            ) : (
              mockCheckins.map((item, i) => (
                <tr
                  key={item.id}
                  className={`border-b border-border last:border-0 hover:bg-muted/40 transition-colors ${
                    i % 2 === 0 ? "" : "bg-muted/20"
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-foreground">{item.member}</td>
                  <td className="px-4 py-3 text-muted-foreground tabular-nums">{item.time}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{item.location}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
