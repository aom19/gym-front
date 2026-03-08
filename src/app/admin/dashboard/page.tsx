import { redirect } from "next/navigation";
import { getUser } from "@/utils/auth";

export default async function AdminDashboardPage() {
  const user = await getUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 sm:px-8">
      <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Admin Dashboard</h1>
        <div className="mt-6 grid gap-4 rounded-xl bg-slate-100 p-5 text-sm sm:text-base">
          <p>
            <span className="font-semibold text-slate-700">Email:</span> {user.email}
          </p>
          <p>
            <span className="font-semibold text-slate-700">Role:</span> {user.role}
          </p>
          <p>
            <span className="font-semibold text-slate-700">Gym Location:</span>{" "}
            {user.location?.name ?? "N/A"}
          </p>
        </div>
      </section>
    </main>
  );
}
