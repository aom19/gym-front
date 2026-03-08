import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-100 px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -top-40 -left-24 h-80 w-80 rounded-full bg-cyan-300/35 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-8 h-96 w-96 rounded-full bg-amber-300/35 blur-3xl" />

      <section className="relative mx-auto flex min-h-[85vh] w-full max-w-md items-center">
        <div className="w-full rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-xl shadow-slate-200/50 backdrop-blur sm:p-8">
          <div className="mb-8 space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Admin Login</h1>
            <p className="text-sm text-slate-600">
              Sign in with your gym account to access the admin dashboard.
            </p>
          </div>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
