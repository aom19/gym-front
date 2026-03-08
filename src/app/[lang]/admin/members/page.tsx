import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";

const mockMembers = [
  { id: 1, name: "Ion Popa", email: "ion.popa@example.com", phone: "+373 69 000 001", membership: "Premium", active: true },
  { id: 2, name: "Maria Ionescu", email: "maria.i@example.com", phone: "+373 69 000 002", membership: "Standard", active: true },
  { id: 3, name: "Alexandru Rusu", email: "alex.r@example.com", phone: "+373 69 000 003", membership: "Basic", active: false },
  { id: 4, name: "Elena Cojocaru", email: "elena.c@example.com", phone: "+373 69 000 004", membership: "Premium", active: true },
  { id: 5, name: "Andrei Mihail", email: "andrei.m@example.com", phone: "+373 69 000 005", membership: "Standard", active: true },
  { id: 6, name: "Olga Botnaru", email: "olga.b@example.com", phone: "+373 69 000 006", membership: "Basic", active: false },
  { id: 7, name: "Vasile Moraru", email: "vasile.m@example.com", phone: "+373 69 000 007", membership: "Premium", active: true },
];

export default async function MembersPage() {
  const t = await getTranslations("members");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <button className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90">
          + {t("addMember")}
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card ring-1 ring-foreground/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("name")}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">{t("email")}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">{t("phone")}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("membership")}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("status")}</th>
            </tr>
          </thead>
          <tbody>
            {mockMembers.map((member, i) => (
              <tr
                key={member.id}
                className={`border-b border-border last:border-0 hover:bg-muted/40 transition-colors ${
                  i % 2 === 0 ? "" : "bg-muted/20"
                }`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                      {member.name[0]}
                    </div>
                    <span className="font-medium text-foreground">{member.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{member.email}</td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{member.phone}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full border border-border px-2 py-0.5 text-xs font-medium text-foreground">
                    {member.membership}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={member.active ? "default" : "secondary"}>
                    {member.active ? t("active") : t("inactive")}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
